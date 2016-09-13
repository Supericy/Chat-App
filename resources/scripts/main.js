'use strict';

import $ from 'jquery';
import 'jquery.nicescroll'; // jquery plugin

import URI from 'urijs';
import ko from 'knockout';
import {Channel, User, Message} from './models';
import {ChannelListViewModel, LoginViewModel, ChatViewModel, UserListViewModel} from './viewmodels';

import {ChannelListComponent} from './components/channel-list';
import {UserListComponent} from './components/user-list';
import {ChatPaneComponent} from './components/chat-pane';

let bindjQueryHandlers = () => {
    $(".ui .new-message-area").keypress(function (e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            $('#new-message-form').submit();
            e.preventDefault();
        }
    });

    $(".ui .list-friends").niceScroll({
        autohidemode: false,
        smoothscroll: false,
        cursorcolor:  "#696c75",
        cursorwidth:  "8px",
        cursorborder: "none"
    });

    $(".messages").niceScroll({
        autohidemode: false,
        smoothscroll: false,
        cursorcolor:  "#cdd2d6",
        cursorwidth:  "8px",
        cursorborder: "none"
    });
};

let bootstrap = (me) => {
    Channel.getAll(me).then((channels) => {
        let channel = channels[0];
        channel.join();

        ko.components.register('channel-list', ChannelListComponent);
        ko.components.register('user-list', UserListComponent);
        ko.components.register('chat-pane', ChatPaneComponent);

        ko.applyBindings({
            channels: channels
        }, $('#channels')[0]);

        ko.applyBindings({
            channel: channel
        }, $('#users')[0]);

        ko.applyBindings({
            channel: channel
        }, $('#chat')[0]);

        bindjQueryHandlers();
    });
};

let login = new LoginViewModel(bootstrap);

if (URI().hasQuery('skipAuth')) {
    login.init({
        id:        3,
        name:      'Chad',
        api_token: 'yXwSG6DbNCzPhQ=='
    });
} else {
    login.prompt();
}

