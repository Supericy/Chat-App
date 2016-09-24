/**
 * Created by Chad on 2016-09-12.
 */

import $ from 'jquery';
import 'jquery.nicescroll'; // jquery plugin
import Pusher from 'pusher-js';
import ko from 'knockout';

//Pusher.logToConsole = true;
const APIv1URL = '/chat/api/v1/';

export class User {
    constructor(parameters) {
        this.id = parameters.id;
        this.name = parameters.name;
        this.created_at = parameters.created_at;
        this.api_token = parameters.api_token;

        if (this.api_token) {
            this.pusher = new Pusher('944b0bdac25cd6df507f', {
                authEndpoint: APIv1URL + 'pusher/auth',
                auth:         {
                    headers: {
                        'Authorization': 'API-TOKEN ' + this.api_token
                    }
                },
                encrypted:    true,
                disableStats: true
            });
        }
    }

    request(method, endpoint, data) {
        if (!this.api_token) {
            throw "User does not have an api token";
        }

        let url = APIv1URL + endpoint;

        return new Promise((resolve, reject) => {
            $.ajax({
                    type:     method,
                    url:      url,
                    headers:  {
                        'Authorization': 'API-TOKEN ' + this.api_token
                    },
                    data:     data,
                    dataType: 'json'
                })
                .done((response) => {
                    resolve(response);
                })
                .fail((response) => {
                    reject(response);
                })
                .always((response) => {
                    console.log('API Response', url, data, response);
                });
        });
    }

    getPusher() {
        return this.pusher;
    }

    publicify() {
        return {
            id:         this.id,
            name:       this.name,
            created_at: this.created_at
        };
    }
}

export class Channel {
    constructor(user, parameters) {
        this.user = user;
        this.me = user;

        this.id = parameters.id;
        this.name = parameters.name;
        this.display_name = parameters.display_name;
        this.created_at = parameters.created_at;

        this.isJoined = ko.observable(false);
    }

    join() {
        let pusher = this.user.getPusher();
        this.pChannel = pusher.subscribe(this.name);

        this.isJoined(true);

        return this;
    }

    leave() {
        let pusher = this.user.getPusher();
        pusher.unsubscribe(this.name);

        this.isJoined(false);

        return this;
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

    onUserAdded(callback) {
        this.pChannel.bind('pusher:subscription_succeeded', (status) => {
            this.pChannel.members.each((data) => {
                callback(new User(data.info));
            });
        });
        this.pChannel.bind('pusher:member_added', (data) => {
            callback(new User(data.info));
        });
    }

    onUserRemoved(callback) {
        this.pChannel.bind('pusher:member_removed', (data) => {
            callback(new User(data.info));
        });
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
                    let channels = response.data.channels.map((data) => {
                        return new Channel(currentUser, data);
                    });

                    resolve(channels);
                },
                (response) => {
                    console.log('Get All Error', response);
                    reject(response);
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
            id:         -1,
            user_id:    user.id,
            text:       text,
            created_at: Date.now(),
            user:       user
        });
    }
}
