/**
 * Created by Chad on 2016-09-12.
 */

import $ from 'jquery';
import ko from 'knockout';
import moment from 'moment';

import {Message} from './models';

let resizeAndScrollMessages = () => {
    let $messages = $('.messages');

    $messages
        .getNiceScroll(0)
        .resize();
    $messages.getNiceScroll(0)
        .doScrollTop(999999, 999);
};

class IsUserTypingHandler {
    constructor(observableInput, observableUsersTypingCollection, channel, user) {
        var t;
        observableInput.subscribe((value) => {
            clearTimeout(t);
            t = setTimeout(() => {
                if (value.length > 0) {
                    channel.trigger('client-started-typing', user.publicify());
                } else {
                    channel.trigger('client-stopped-typing', user.publicify());
                }
            }, 500);
        });

        channel.bind('client-started-typing', (data) => {
            console.log('Started Typing', data);

            var found = false;
            observableUsersTypingCollection().forEach((item) => {
                if (!found)
                    found = item.id === data.id;
            });

            if (!found) {
                observableUsersTypingCollection.push(data);
            }
        });
        channel.bind('client-stopped-typing', (data) => {
            console.log('Stopped Typing', data);
            observableUsersTypingCollection.remove((item) => {
                return item.id === data.id;
            });
        });

        // remove user from our list of users typing when they leave the chat
        channel.bind('pusher:member_removed', (data) => {
            this.typing.remove((item) => {
                return item.id === data.info.id;
            });
        });
    }
}

export class UserListViewModel {
    constructor(channel) {
        this.channel = channel;
        this.searchQuery = ko.observable("");
        this.users = ko.observableArray([]);

        this.filteredUsers = ko.computed(() => {
            return ko.utils.arrayFilter(this.users(), (user) => {
                return user.name.toLowerCase().indexOf(this.searchQuery()) > -1;
            });
        });

        this.channel.bind('pusher:subscription_succeeded', (status) => {
            this.channel.members().each((data) => {
                this.addUser(data.info);
            });
        });
        this.channel.bind('pusher:member_added', (data) => {
            this.addUser(data.info);
        });
        this.channel.bind('pusher:member_removed', (data) => {
            this.removeUser(data.info);
        });
    }

    addUser(user) {
        console.log('User Added', user);
        if (this.users().indexOf(user) < 0) {
            this.users.push(user);
        }
    }

    removeUser(user) {
        console.log('User Removed', user);
        this.users.remove(user);
    }
}

export class ChannelListViewModel {
    constructor(channels) {
        this.channels = ko.observableArray(channels);
    }
}

export class ChatViewModel {
    constructor(channel, currentUser) {
        this.channel = channel;
        this.currentUser = currentUser;
        this.newMessage = ko.observable("");
        this.messages = ko.observableArray([
            //Message.newLocalMessage(this.user, 'Test Message (ingore)')
        ]);
        this.typing = ko.observableArray();
        this.isUserTypingHandler = new IsUserTypingHandler(this.newMessage, this.typing, channel, currentUser);

        this.name = ko.computed(() => {
            return this.currentUser.name;
        });

        this.channel.getHistory().then((messages) => {
            messages.forEach((message) => {
                this.pushMessage(message.user, message);
            });
        });

        this.channel.onNewMessage((user, message) => {
            this.receive(user, message);
        });
    }

    /**
     * Broadcasts a new message from the server to test functionality
     */
    serverBroadcast() {
        $.get('/broadcast');
    }

    confirmMessage(confirmedMessage) {
        var returnMessageVM = null;

        this.messages().some((messageVM) => {
            returnMessageVM = messageVM;

            return messageVM.confirmMessage(confirmedMessage);
        });

        return returnMessageVM;
    }

    receive(user, message) {
        // FIXME: compare id instead?
        if (this.currentUser.name === user.name) {
            return this.confirmMessage(message);
        } else {
            return this.pushMessage(user, message);
        }
    }

    previousMessageVM() {
        let vm = null;
        let messages = this.messages();
        let length = messages.length;

        if (length > 0) {
            vm = messages[length - 1];
        }

        return vm;
    }

    pushMessage(user, message) {
        var isMessageLocal =  this.currentUser.name === user.name;
        var messageVM = this.previousMessageVM();

        if (messageVM !== null && messageVM.name() === user.name) {
            messageVM.attachMessage(message);
        } else {
            messageVM = new MessageViewModel(user, message, isMessageLocal);
            this.messages.push(messageVM);
        }

        resizeAndScrollMessages();

        return messageVM;
    }

    send() {
        let text = this.newMessage();

        if (text.length < 1) {
            return;
        }

        this.channel.sendMessage(text);
        this.pushMessage(this.currentUser, Message.newLocalMessage(this.currentUser, text));

        this.newMessage("");
    }
}

class MessageBlock {
    constructor(message) {
        this.message = ko.observable(message);

        this.text = ko.computed(() => {
            return this.message().text;
        });

        this.confirmed = ko.computed(() => {
            return this.message().isConfirmed();
        });
    }
}

export class MessageViewModel {
    constructor(user, message, isMessageLocal) {
        //this.currentUser = currentUser;
        this.user = user;
        this.timestamp = ko.observable(moment.utc(this.created_at).local().format('LLL'));
        this.name = ko.observable(user.name);
        this.messageBlocks = ko.observableArray([
            new MessageBlock(message)
        ]);
        this.isMessageLocal = ko.observable(isMessageLocal);
    }

    confirmMessage(confirmedMessage) {
        this.messageBlocks().some((block) => {
            if (!block.confirmed() && block.text() === confirmedMessage.text) {
                block.message(confirmedMessage);
                return true;
            }

            return false;
        });
    }

    attachMessage(message) {
        this.messageBlocks.push(new MessageBlock(message));
    }
}

export class LoginViewModel {
    constructor(onAuthSuccess) {
        this.name = ko.observable("");
        this.password = ko.observable("");
        this.error = ko.observable("");
        this.authenticating = ko.observable("0");
        this.onAuthSuccess = onAuthSuccess;

        this.isAuthenticating = ko.computed(() => {
            return this.authenticating() === "1";
        });
    }

    setAuthenticating(bool) {
        console.log('Authenticating', bool);
        this.authenticating(bool ? "1" : "0");
    }

    login() {
        this.setAuthenticating(true);

        $.ajax({
                type:     "POST",
                url:      '/api/v1/user/auth',
                data:     {
                    name:     this.name(),
                    password: this.password()
                },
                dataType: 'json'
            })
            .done((currentUser) => {
                console.log('Login Success', currentUser);

                this.onAuthSuccess(currentUser);
            })
            .fail((data) => {
                console.log('Login Error', error);

                var error = data.responseJSON.error;
                this.error(error.message);
            })
            .always((data) => {
                this.setAuthenticating(false);
            });
    }
}