/**
 * Created by Chad on 2016-09-12.
 */

import $ from 'jquery';
require('bootstrap');

import ko from 'knockout';
import moment from 'moment';

import {Message, User} from './models';

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

//export class UserListViewModel {
//    constructor(channel) {
//        this.channel = channel;
//        this.searchQuery = ko.observable("");
//        this.users = ko.observableArray([]);
//
//        this.filteredUsers = ko.computed(() => {
//            return ko.utils.arrayFilter(this.users(), (user) => {
//                return user.name.toLowerCase().indexOf(this.searchQuery()) > -1;
//            });
//        });
//
//        this.channel.onUserAdded((user) => {
//            this.add(user);
//        });
//
//        this.channel.onUserRemoved((user) => {
//            this.remove(user);
//        });
//    }
//
//    add(user) {
//        console.log('Add User', user);
//        if (this.users().indexOf(user) < 0) {
//            this.users.push(user);
//        }
//    }
//
//    remove(user) {
//        console.log('Remove User', user);
//        this.users.remove(user);
//    }
//}

//export class ChannelListViewModel {
//    constructor(channels) {
//        this.channels = ko.observableArray(channels);
//    }
//}

export class ChatViewModel {
    constructor(channel) {
        this.channel = channel;
        this.newMessage = ko.observable("");
        this.messages = ko.observableArray();
        this.typing = ko.observableArray();
        this.isUserTypingHandler = new IsUserTypingHandler(this.newMessage, this.typing, channel, this.channel.me);

        this.name = ko.computed(() => {
            return this.channel.me.name;
        });

        this.channel.getHistory().then((messages) => {
            messages.forEach((message) => {
                this.pushMessage(message.user, message);
            });
        });

        this.channel.onNewMessage((user, message) => {
            // our own message, let's confirm it
            if (this.channel.me.name === user.name) {
                return this.confirmMessage(message);
            }

            // someone elses message, let's process it
            return this.pushMessage(user, message);
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
        var isMessageLocal =  this.channel.me.name === user.name;
        var messageVM = this.previousMessageVM();

        if (messageVM !== null && messageVM.user.name === user.name) {
            messageVM.attachMessage(message);
        } else {
            messageVM = new MessageViewModel(user, message, isMessageLocal);
            this.messages.push(messageVM);
        }

        this.resizeAndScrollMessages();

        return messageVM;
    }

    send() {
        let text = this.newMessage();

        if (text.length < 1) {
            return;
        }

        this.channel.sendMessage(text);
        this.pushMessage(this.channel.me, Message.newLocalMessage(this.channel.me, text));

        this.newMessage("");
    }

    resizeAndScrollMessages() {
        let $messages = $('.messages');

        $messages
            .getNiceScroll(0)
            .resize();
        $messages.getNiceScroll(0)
            .doScrollTop(999999, 999);
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
        this.$login = $('#login');
        this.$modal = $('#login-modal');

        this.name = ko.observable("");
        this.password = ko.observable("");
        this.error = ko.observable("");
        this.authenticating = ko.observable(false);
        this.onAuthSuccess = onAuthSuccess;

        this.isAuthenticating = ko.computed(() => {
            return this.authenticating();
        });

        ko.applyBindings(this, this.$login[0]);
    }

    setAuthenticating(bool) {
        console.log('Authenticating', bool);
        this.authenticating(bool);
    }

    prompt() {
        this.showModal();
    }

    init(userData) {
        this.onAuthSuccess(new User(userData));
    }

    attemptAuth() {
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
            .done((userData) => {
                console.log('Login Success', userData);
                this.hideModal();

                this.init(userData);
            })
            .fail((data) => {
                console.log('Login Error', data);

                this.error(data.responseJSON.error.message);
            })
            .always((data) => {
                this.setAuthenticating(false);
            });
    }

    showModal() {
        this.$modal.modal({
            backdrop: 'static',
            keyboard: false
        });
    }

    hideModal() {
        this.$modal.modal('hide');
        this.$modal.on('hidden.bs.modal', () => {
            this.$login.remove();
        });
    }
}