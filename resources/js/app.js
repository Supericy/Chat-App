(function () {
    'use strict';

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var resizeAndScrollMessages = function () {
        var $messages = $('.messages');

        $messages
            .getNiceScroll(0)
            .resize();
        $messages.getNiceScroll(0)
            .doScrollTop(999999, 999);
    };

    var loadjQueryHandlers = function () {
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

    let appInstance;
    class App {
        constructor() {
            this.user = null;
            this.pusher = null;
        }

        getUser() {
            return this.user;
        }

        getPusher() {
            return this.pusher;
        }

        getApi() {
            return this.user.getApi();
        }

        init(currentUserData) {
            this.user = new User(currentUserData);
            this.pusher = new Pusher('944b0bdac25cd6df507f', {
                authEndpoint: '/api/v1/pusher/auth',
                auth: {
                    headers: {
                        'Authorization': 'API-TOKEN ' + this.user.api_token
                    }
                },
                encrypted: true
            });

            Channel.getAll(this.user.getApi()).then((channels) => {
                let channel = channels[0];

                ko.applyBindings(new ChannelListViewModel(channels), $('#channels')[0]);

                channel.join();
            });
        }

        initAuth() {
            var authModal = new AuthModal();
            authModal.show();

            ko.applyBindings(new LoginViewModel((userData) => {
                authModal.hide();
                this.init(userData);

            }), $('#login')[0]);
        }

        static getInstance() {
            if (!appInstance) {
                appInstance = new App();
            }
            return appInstance;
        }
    }

    var APIv1 = function (currentUser) {
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
                    .done(function(response) {
                        resolve(response);
                    })
                    .fail(function(response) {
                        reject(response);
                    })
                    .always(function (response) {
                        console.log('API Response', url, data, response);
                    });
            });
        };
    };

    class User {
        constructor(parameters) {
            this.id = parameters.id;
            this.name = parameters.name;
            this.created_at = parameters.created_at;
            this.api_token = parameters.api_token;
        }

        getApi() {
            return new APIv1(this);
        }

        publicify() {
            return {
                id: this.id,
                name: this.name,
                created_at: this.created_at
            };
        }
    }

    class Message {
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
    }

    class Channel {
        constructor(parameters) {
            this.id = parameters.id;
            this.name = parameters.name;
            this.display_name = parameters.display_name;
            this.created_at = parameters.created_at;

            // bad... but makes thing cleaner
            let app = App.getInstance();
            this.api = app.getApi();
            this.pusher = app.getPusher();
            this.user = app.getUser();
        }

        join() {
            this.pusher.unsubscribe(this.name);
            this.pChannel = this.pusher.subscribe(this.name);

            ko.cleanNode($('#chat')[0]);
            ko.cleanNode($('#users')[0]);

            loadjQueryHandlers();

            ko.applyBindings(new ChatViewModel(this, this.user), $('#chat')[0]);
            ko.applyBindings(new UserListViewModel(this), $('#users')[0]);
        }

        getUrl() {
            return 'channel/' + this.id;
        }

        getHistory() {
            return new Promise((resolve, reject) => {
                this.api.request('GET', this.getUrl() + '/history').then(
                    (response) => {
                        console.log('Messages', response.data.messages);

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
                this.api.request('POST', this.getUrl() + '/send-message', {
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

        static getAll(api) {
            return new Promise((resolve, reject) => {
                api.request('GET', 'channels').then(
                    (response) => {
                        var channels = response.data.channels.map((data) => {
                            return new Channel(data, api);
                        });

                        resolve(channels);
                    },
                    (response) => {
                        resolve(response);
                    }
                );
            });
        }
    }

    var AuthModal = function () {
        var $login = $('#login');
        var $modal = $('#login-modal');

        this.show = () => {
            $modal.modal({
                backdrop: 'static',
                keyboard: false
            });
        };

        this.hide = () => {
            $modal.modal('hide');
            $modal.on('hidden.bs.modal', function () {
                $login.remove();
            });
        };
    };

    var IsUserTypingHandler = function (observableInput, observableUsersTypingCollection, channel, user) {
        var t;
        observableInput.subscribe(function (value) {
            clearTimeout(t);
            t = setTimeout(function () {
                if (value.length > 0) {
                    channel.trigger('client-started-typing', user.publicify());
                } else {
                    channel.trigger('client-stopped-typing', user.publicify());
                }
            }, 500);
        });

        channel.bind('client-started-typing', function (data) {
            console.log('Started Typing', data);

            var found = false;
            observableUsersTypingCollection().forEach(function (item) {
                if (!found)
                    found = item.id === data.id;
            });

            if (!found) {
                observableUsersTypingCollection.push(data);
            }
        });
        channel.bind('client-stopped-typing', function (data) {
            console.log('Stopped Typing', data);
            observableUsersTypingCollection.remove(function (item) {
                return item.id === data.id;
            });
        });

        // remove user from our list of users typing when they leave the chat
        channel.bind('pusher:member_removed', function (data) {
            self.typing.remove(function (item) {
                return item.id === data.info.id;
            });
        });
    };

    var UserListViewModel = function (channel) {
        var self = this;

        this.searchQuery = ko.observable("");
        this.users = ko.observableArray();

        this.filteredUsers = ko.computed(function () {
            return ko.utils.arrayFilter(self.users(), function (user) {
                return user.name.toLowerCase().indexOf(self.searchQuery()) > -1;
            });
        });

        this.addUser = function (user) {
            console.log('User Added', user);
            if (self.users().indexOf(user) < 0) {
                self.users.push(user);
            }
        };

        this.removeUser = function (user) {
            console.log('User Removed', user);
            self.users.remove(user);
        };

        channel.bind('pusher:subscription_succeeded', function (status) {
            channel.members().each(function (data) {
                self.addUser(data.info);
            });
        });
        channel.bind('pusher:member_added', function (data) {
            self.addUser(data.info);
        });
        channel.bind('pusher:member_removed', function (data) {
            self.removeUser(data.info);
        });
    };

    var ChannelListViewModel = function (channels) {
        this.channels = ko.observableArray(channels);
    };

    var ChatViewModel = function (channel, currentUser) {
        var self = this;

        this.channel = channel;
        this.user = ko.observable(currentUser);
        this.newMessage = ko.observable("");
        this.messages = ko.observableArray([
            //new MessageViewModel(currentUser, currentUser, new Message({
            //    id: -1,
            //    user_id: currentUser.id,
            //    text: 'Test Message (ignore)',
            //    created_at: Date.now(),
            //    user: currentUser
            //}))
        ]);
        this.typing = ko.observableArray();

        this.isUserTypingHandler = new IsUserTypingHandler(this.newMessage, this.typing, channel, currentUser);

        this.confirmMessage = function (confirmedMessage) {
            var returnMessageVM;

            this.messages().some(function (messageVM) {
                returnMessageVM = messageVM;

                return messageVM.confirmMessage(confirmedMessage);
            });

            return returnMessageVM;
        };

        this.receive = function (user, message) {
            // FIXME: compare id instead?
            if (currentUser.name === user.name) {
                return this.confirmMessage(message);
            } else {
                return this.pushMessage(user, message);
            }
        };

        this.pushMessage = function (user, message) {
            var messageVM = self.messages().length > 0 ? self.messages()[self.messages().length - 1] : null;

            if (messageVM !== null && messageVM.name() === user.name) {
                messageVM.attachMessage(message);
            } else {
                messageVM = new MessageViewModel(currentUser, user, message);
                this.messages.push(messageVM);
            }

            resizeAndScrollMessages();

            return messageVM;
        };

        this.send = () => {
            if (self.newMessage().length < 1) {
                return;
            }

            this.channel.sendMessage(self.newMessage());

            //self.pushMessage(currentUser.name, self.newMessage(), Date.now(), false);
            self.pushMessage(currentUser, new Message({
                id: -1,
                user_id: currentUser.id,
                text: self.newMessage(),
                created_at: Date.now(),
                user: currentUser
            }));
            self.newMessage("");
        };

        this.channel.getHistory().then(function (messages) {
            messages.forEach(function (message) {
                self.pushMessage(message.user, message);
            });
        });

        this.channel.onNewMessage((user, message) => {
            this.receive(user, message);
        });
    };

    var MessageBlock = function (message) {
        var self = this;

        console.log(message);

        this.message = ko.observable(message);

        this.text = ko.computed(function () {
            return self.message().text;
        });

        this.confirmed = ko.computed(function () {
            return self.message().isConfirmed();
        });
    };

    var MessageViewModel = function (currentUser, user, message) {
        var self = this;

        this.timestamp = ko.observable(message.created_at);
        this.name = ko.observable(user.name);
        this.messageBlocks = ko.observableArray([
            new MessageBlock(message)
        ]);

        this.confirmMessage = function (confirmedMessage) {
            this.messageBlocks().some(function (block) {
                if (!block.confirmed() && block.text() === confirmedMessage.text) {
                    block.message(confirmedMessage);
                    return true;
                }

                return false;
            });
        };

        this.attachMessage = function (message) {
            this.messageBlocks.push(new MessageBlock(message));
        };

        this.isMessageLocal = ko.computed(function () {
            return user.name === currentUser.name;
        });
    };

    var LoginViewModel = function (onAuthSuccess) {
        var self = this;

        this.name = ko.observable("");
        this.password = ko.observable("");
        this.error = ko.observable("");
        this.authenticating = ko.observable("0");

        this.login = function () {
            self.setAuthenticating(true);

            $.ajax({
                    type: "POST",
                    url: '/api/v1/user/auth',
                    data: {
                        name: this.name(),
                        password: this.password()
                    },
                    dataType: 'json'
                })
                .done(function(currentUser) {
                    console.log('Login Success', currentUser);

                    onAuthSuccess(currentUser);
                })
                .fail(function(data) {
                    var error = data.responseJSON.error;

                    console.log('error', error);

                    self.error(error.message);
                })
                .always(function (data) {
                    self.setAuthenticating(false);
                });
        };

        this.setAuthenticating = function (bool) {
            console.log('Authenticating', bool);
            self.authenticating(bool ? "1" : "0");
        };

        this.isAuthenticating = ko.computed(function () {
            return self.authenticating() === "1";
        });
    };

    $(function () {
        var uri = URI();
        var app = App.getInstance();

        if (!uri.hasQuery('skipAuth')) {
            app.initAuth();
        } else {
            app.init({
                id: 3,
                name: 'Chad',
                api_token: 'yXwSG6DbNCzPhQ=='
            });
        }
    });

}).call(this);