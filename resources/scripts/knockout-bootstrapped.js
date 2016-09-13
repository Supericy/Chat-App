'use strict';

import $ from 'jquery';
import 'jquery.nicescroll'; // jquery plugin
import ko from 'knockout';

import {ChannelListComponent} from './components/channel-list';
import {UserListComponent} from './components/user-list';
import {ChatPaneComponent} from './components/chat-pane';
import {LoginComponent} from './components/login';

ko.bindingHandlers.niceScroll = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        let $elm = $(element);
        let settings = $.extend({
            autohidemode: false,
            smoothscroll: false,
            cursorcolor:  "#cdd2d6",
            cursorwidth:  "8px",
            cursorborder: "none",
            autoscroll:   false
        }, valueAccessor());

        $elm.niceScroll(settings);

        if (settings.autoscroll) {
            let $scroll = $elm.getNiceScroll(0);
            let observer = new MutationObserver((mutations) => {
                $scroll.resize();
                $scroll.doScrollTop(999999, 999);
            });
            let config = {
                childList: true,
                subtree:   true
            };

            observer.observe(element, config);
        }
    }
};

ko.bindingHandlers.submitOnEnter = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        let $elm = $(element);

        $elm.keypress(function (e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                $elm.closest('form').submit();
                e.preventDefault();
            }
        });
    }
};

ko.components.register('channel-list', ChannelListComponent);
ko.components.register('user-list', UserListComponent);
ko.components.register('chat-pane', ChatPaneComponent);
ko.components.register('login', LoginComponent);

export default ko;