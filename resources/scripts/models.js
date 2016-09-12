/**
 * Created by Chad on 2016-09-12.
 */

import $ from 'jquery';
import ko from 'knockout';
import Pusher from 'pusher-js';
import {ChatViewModel, UserListViewModel} from './viewmodels';

Pusher.logToConsole = true;

let bindjQueryHandlers = function () {
    $(".ui .new-message-area").keypress(function (e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            $('#new-message-form').submit();
            e.preventDefault();
        }
    });

    $(".ui .list-friends").niceScroll({
        autohidemode: false,
        smoothscroll: false,
        cursorcolor: "#696c75",
        cursorwidth: "8px",
        cursorborder: "none"
    });
    $(".ui .messages").niceScroll({
        autohidemode: false,
        smoothscroll: false,
        cursorcolor: "#cdd2d6",
        cursorwidth: "8px",
        cursorborder: "none"
    });
};

let APIv1 = function (currentUser) {
    this.request = function (method, endpoint, data) {
        var url = '/api/v1/' + endpoint;

        return new Promise(function (resolve, reject) {
            $.ajax({
                    type: method,
                    url: url,
                    headers: {
                        'Authorization': 'API-TOKEN ' + currentUser.api_token
                    },
                    data: data,
                    dataType: 'json'
                })
                .done(function (response) {
                    resolve(response);
                })
                .fail(function (response) {
                    reject(response);
                })
                .always(function (response) {
                    console.log('API Response', url, data, response);
                });
        });
    };
};

export class User {
    constructor(parameters) {
        this.id = parameters.id;
        this.name = parameters.name;
        this.created_at = parameters.created_at;
        this.api_token = parameters.api_token;

        if (this.api_token) {
            this.api = new APIv1(this);
            this.pusher = new Pusher('944b0bdac25cd6df507f', {
                authEndpoint: '/api/v1/pusher/auth',
                auth: {
                    headers: {
                        'Authorization': 'API-TOKEN ' + this.api_token
                    }
                },
                encrypted: true
            });
        }
    }

    request(method, endpoint, data) {
        return this.api.request(method, endpoint, data);
    }

    getApi() {
        return this.api;
    }

    getPusher() {
        return this.pusher;
    }

    publicify() {
        return {
            id: this.id,
            name: this.name,
            created_at: this.created_at
        };
    }
}

export class Channel {
    constructor(user, parameters) {
        this.user = user;

        this.id = parameters.id;
        this.name = parameters.name;
        this.display_name = parameters.display_name;
        this.created_at = parameters.created_at;

        //this.api = this.user.getApi();
        //this.pusher = this.user.getPusher();
    }

    join() {
        console.log(this.user);

        let pusher = this.user.getPusher();
        console.log(pusher);

        // cleanup
        pusher.unsubscribe(this.name);
        ko.cleanNode($('#chat')[0]);
        ko.cleanNode($('#users')[0]);

        // join new channel
        this.pChannel = pusher.subscribe(this.name);

        bindjQueryHandlers();

        ko.applyBindings(new ChatViewModel(this, this.user), $('#chat')[0]);
        ko.applyBindings(new UserListViewModel(this), $('#users')[0]);
    }

    getUrl() {
        return 'channel/' + this.id;
    }

    getHistory() {
        return new Promise((resolve, reject) => {
            this.user.request('GET', this.getUrl() + '/history').then(
                (response) => {
                    //console.log('Messages', response.data.messages);

                    let messages = response.data.messages.map((data) => {
                        return new Message(data);
                    });

                    resolve(messages);
                },
                (response) => {
                    reject(response);
                });
        });
    }

    sendMessage(text) {
        return new Promise((resolve, reject) => {
            this.user.request('POST', this.getUrl() + '/send-message', {
                text: text
            }).then(
                (response) => {
                    resolve(response);
                },
                (response) => {
                    reject(response);
                });
        });
    }

    bind(event, callback) {
        this.pChannel.bind.call(this.pChannel, event, callback);
    }

    trigger(event, data) {
        this.pChannel.trigger.call(this.pChannel, event, data);
    }

    members() {
        return this.pChannel.members;
    }

    onNewMessage(callback) {
        this.pChannel.bind('new-message', function (data) {
            var user = new User(data.message.user);
            var message = new Message(data.message);

            callback(user, message);
        });
    }

    static getAll(currentUser) {
        return new Promise((resolve, reject) => {
            currentUser.request('GET', 'channels').then(
                (response) => {
                    var channels = response.data.channels.map((data) => {
                        return new Channel(currentUser, data);
                    });

                    resolve(channels);
                },
                (response) => {
                    console.log('Get All Error', response);
                    resolve(response);
                }
            );
        });
    }
}

export class Message {
    constructor(parameters) {
        this.id = parameters.id;
        this.user_id = parameters.user_id;
        this.text = parameters.text;
        this.created_at = parameters.created_at;

        this.user = new User(parameters.user);
    }

    isConfirmed() {
        return this.id > -1;
    }

    static newLocalMessage(user, text) {
        return new Message({
            id: -1,
            user_id: user.id,
            text: text,
            created_at: Date.now(),
            user: user
        });
    }
}
