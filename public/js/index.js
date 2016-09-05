(function () {

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var publicifyUser = function (user) {
        return {
            id: user.id,
            name: user.name
        };
    };

    var App = {
        init: function (currentUser) {
            var pusher = new Pusher('944b0bdac25cd6df507f', {
                authEndpoint: '/api/v1/pusher/auth',
                auth: {
                    headers: {
                        'Authorization': 'API-TOKEN ' + currentUser.api_token
                    }
                },
                encrypted: true
            });

            var channel = pusher.subscribe('presence-general');

            //ko.applyBindings(function () {}, $('#ko-container')[0]);
            ko.applyBindings(new ChannelListViewModel(channel), $('#channels')[0]);
            ko.applyBindings(new ChatViewModel(channel, currentUser), $('#chat')[0]);
            ko.applyBindings(new UserListViewModel(channel), $('#users')[0]);
        }
    };

    var resizeAndScrollMessages = function () {
        var $messages = $('.messages');

        $messages
            .getNiceScroll(0)
            .resize();
        $messages.getNiceScroll(0)
            .doScrollTop(999999, 999);
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
            channel.members.each(function (data) {
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

    var ChannelListViewModel = function (channel) {
        var self = this;

        this.channels = ko.observableArray([
            {name: 'General'}
        ]);
    };

    var ChatViewModel = function (channel, currentUser) {
        var self = this;

        this.newMessage = ko.observable("");
        this.messages = ko.observableArray([
            new MessageViewModel(currentUser, currentUser.name, "Test Message (ignore)", Date.now(), true)
        ]);
        this.typing = ko.observableArray();

        this.confirmMessage = function (confirmedMessage) {
            var returnMessageVM = undefined;

            this.messages().some(function (messageVM) {
                //returnMessageVM = messageVM;
                //
                ////if (!messageVM.isMessageConfirmed() && messageVM.message() === confimedMessage) {
                //if (messageVM.confirmMessage(confirmedMessage)) {
                //    messageVM.setMessageConfirmed(true);
                //    return true;
                //}
                //
                //return false;
                return messageVM.confirmMessage(confirmedMessage);
            });

            return returnMessageVM;
        };

        this.receive = function (name, message, timestamp) {
            if (currentUser.name === name) {
                return this.confirmMessage(message);
            } else {
                return this.pushMessage(name, message, timestamp, true);
            }
        };

        this.pushMessage = function (name, message, timestamp, confirmed) {
            var messageVM = self.messages()[self.messages().length - 1];

            if (messageVM.name() === name) {
                //messageVM.message(messageVM.message() + '\n' + message);
                messageVM.attachMessage(message, confirmed);
            } else {
                messageVM = new MessageViewModel(currentUser, name, message, timestamp, confirmed);
                this.messages.push(messageVM);
            }

            resizeAndScrollMessages();

            return messageVM;
        };

        this.send = function () {
            if (self.newMessage().length < 1) {
                return;
            }

            $.ajax({
                    type: "POST",
                    url: '/api/v1/chat/send',
                    headers: {
                        'Authorization': 'API-TOKEN ' + currentUser.api_token
                    },
                    data: {
                        message: self.newMessage()
                    },
                    dataType: 'json'
                })
                .done(function(data) {
                    console.log(data);
                })
                .fail(function(data) {
                    console.log('Send Failed', data);
                    var error = data.responseJSON.error;

                    console.log('error', error);
                    //self.error(error.message);
                    alert(error.message);

                    // TODO: remove message that was appended locally
                })
                .always(function () {

                });

            self.pushMessage(currentUser.name, self.newMessage(), Date.now(), false);
            self.newMessage("");
        };

        var t;
        this.newMessage.subscribe(function (value) {
            clearTimeout(t);
            t = setTimeout(function () {
                if (value.length > 0) {
                    channel.trigger('client-started-typing', publicifyUser(currentUser));
                } else {
                    channel.trigger('client-stopped-typing', publicifyUser(currentUser));
                }
            }, 500);
        });

        channel.bind('message-new', function (data) {
            self.receive(data.name, data.message, data.timestamp * 1000);
        });
        channel.bind('client-started-typing', function (data) {
            console.log('Started Typing', data);

            var found = false;
            self.typing().forEach(function (item) {
                if (!found)
                    found = item.id === data.id;
            });

            if (!found) {
                self.typing.push(data);
            }
        });
        channel.bind('client-stopped-typing', function (data) {
            console.log('Stopped Typing', data);
            self.typing.remove(function (item) {
                return item.id === data.id;
            });
        });
        channel.bind('pusher:member_removed', function (data) {
            self.typing.remove(function (item) {
                return item.id === data.info.id;
            });
        });
    };

    var MessageBlock = function (text, confirmed) {
        var self = this;

        this.text = ko.observable(text);
        this.confirmed = ko.observable(confirmed ? "1" : "0");

        this.setMessageConfirmed = function (bool) {
            self.confirmed(bool ? "1" : "0");
        };

        this.isMessageConfirmed = ko.computed(function () {
            return self.confirmed() === "1";
        });
    };

    var MessageViewModel = function (currentUser, name, text, timestamp, confirmed) {
        var self = this;

        this.timestamp = ko.observable(timestamp);
        this.name = ko.observable(name);
        this.messageBlocks = ko.observableArray([
            new MessageBlock(text, confirmed)
        ]);

        this.confirmMessage = function (confirmedMessage) {
            this.messageBlocks().some(function (block) {
                if (!block.isMessageConfirmed() && block.text() === confirmedMessage) {
                    block.setMessageConfirmed(true);
                    return true;
                }

                return false;
            });
        };

        this.attachMessage = function (text, confirmed) {
            this.messageBlocks.push(new MessageBlock(text, confirmed));
        };

        this.isMessageLocal = ko.computed(function () {
            return name === currentUser.name;
        });
    };

    var LoginViewModel = function () {
        var self = this;

        this.name = ko.observable("");
        this.password = ko.observable("");
        this.error = ko.observable("");

        this.login = function () {
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

                    var $login = $('#login');
                    var $modal = $('#login-modal');

                    $modal.modal('hide');
                    $modal.on('hidden.bs.modal', function () {
                        $login.remove();
                    });

                    App.init(currentUser);
                })
                .fail(function(data) {
                    var error = data.responseJSON.error;

                    console.log('error', error);
                    self.error(error.message);
                });
        };
    };

    $(function () {
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

        $(".ui .new-message-area").keypress(function (e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                $('#new-message-form').submit();
                e.preventDefault();
            }
        });

        $('#login-modal').modal({
            backdrop: 'static',
            keyboard: false
        });

        ko.applyBindings(new LoginViewModel(), $('#login')[0]);

        //App.init({
        //    id: 3,
        //    name: 'Chad',
        //    api_token: 'yXwSG6DbNCzPhQ=='
        //});
    });

}).call(this);