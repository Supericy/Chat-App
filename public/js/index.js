(function () {

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

    var ChatViewModel = function (currentUser) {
        var self = this;

        var pusher = new Pusher('944b0bdac25cd6df507f', {
            authEndpoint: '/api/v1/pusher/auth',
            auth: {
                headers: {
                    'Authorization': 'API-TOKEN ' + currentUser.api_token
                }
            },
            encrypted: true
        });

        this.newMessage = ko.observable("");
        this.messages = ko.observableArray([
            new MessageViewModel(currentUser, currentUser.name, "Test Message (ignore)", Date.now())
        ]);
        this.users = ko.observableArray();

        this.receive = function (name, message, timestamp) {
            if (message.length > 0) {
                this.messages.push(new MessageViewModel(currentUser, name, message, timestamp));

                resizeAndScrollMessages();
            }
        };

        this.send = function () {
            var $form = $('#new-message-form input, #new-message-form textarea');

            $form.prop('disabled', true);

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
                    //self.receive(currentUser.name, self.newMessage(), Date.now());
                    self.newMessage("");
                })
                .fail(function(data) {
                    console.log(data);
                    var error = data.responseJSON.error;

                    console.log('error', error);
                    //self.error(error.message);
                    alert(error.message);
                })
                .always(function () {
                    $form.prop('disabled', false);
                    $('#new-message-form textarea').focus();
                });
        };

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

        var channel = pusher.subscribe('presence-general');
        channel.bind('pusher:subscription_error', function (status) {
            console.log(status);
        });
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
        channel.bind('message-new', function (data) {
            self.receive(data.name, data.message, data.timestamp * 1000);
        });
    };

    var MessageViewModel = function (currentUser, name, message, timestamp) {
        var self = this;

        this.timestamp = ko.observable(timestamp);
        this.name = ko.observable(name);
        this.message = ko.observable(message);

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
                url: '/api/v1/auth',
                data: {
                    //'name': 'Chad Kosie2',
                    //'password': '1234asdf'
                    name: this.name(),
                    password: this.password()
                },
                dataType: 'json'
            })
                .done(function(user) {
                    console.log(user);

                    var $login = $('#login');
                    var $modal = $('#login-modal');

                    $modal.modal('hide');
                    $modal.on('hidden.bs.modal', function () {
                        $login.remove();
                    });

                    ko.applyBindings(new ChatViewModel(user), $('#chat')[0]);
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
                $('form').submit();
                e.preventDefault();
            }
        });

        $('#login-modal').modal({
            backdrop: 'static',
            keyboard: false
        });

        ko.applyBindings(new LoginViewModel(), $('#login')[0]);
    });

}).call(this);