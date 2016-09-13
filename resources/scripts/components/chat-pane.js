/**
 * Created by Chad on 2016-09-12.
 */

import $ from 'jquery';
import 'jquery.nicescroll'; // jquery plugin

import ko from 'knockout';
import moment from 'moment';

import {Message} from '../models';
import {applyUserTypingHandler} from '../util';

class ChatPaneViewModel {
    constructor(params) {
        this.me = params.me;
        this.channel = params.channel;
        this.newMessage = ko.observable("");
        this.messages = ko.observableArray();
        this.typing = ko.observableArray();
        applyUserTypingHandler(this);

        this.name = ko.computed(() => {
            if (!this.me()) {
                return 'Unknown';
            }

            return this.me().name;
        });

        this.channel.subscribe((channel) => {
            this.messages([]);

            channel.getHistory().then((messages) => {
                messages.forEach((message) => {
                    this.pushMessage(message.user, message);
                });
            });

            channel.onNewMessage((user, message) => {
                // our own message, let's confirm it
                if (this.me().name === user.name) {
                    return this.confirmMessage(message);
                }

                // someone elses message, let's process it
                return this.pushMessage(user, message);
            });
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
        var isMessageLocal = this.me().name === user.name;
        var messageVM = this.previousMessageVM();

        if (messageVM !== null && messageVM.user.name === user.name) {
            messageVM.attachMessage(message);
        } else {
            messageVM = new MessageViewModel(user, message, isMessageLocal);
            this.messages.push(messageVM);
        }

        return messageVM;
    }

    send() {
        let text = this.newMessage();

        if (text.length < 1) {
            return;
        }

        this.channel().sendMessage(text);
        this.pushMessage(this.me(), Message.newLocalMessage(this.me(), text));

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

class MessageViewModel {
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

export let ChatPaneComponent = {
    viewModel: ChatPaneViewModel,
    template:  require('fs').readFileSync(__dirname + '/chat-pane.html', 'utf8')
};