'use strict';

import $ from 'jquery';

import URI from 'urijs';
import ko from './knockout-bootstrapped';
import {Channel, User} from './models';
import {LoginViewModel} from './viewmodels';

class App {
    constructor() {
        this.skipAuth = URI().hasQuery('skipAuth');
        this.channel = ko.observable();
        this.channels = ko.observableArray();
        this.me = ko.observable();
        this.app = this;

        if (this.skipAuth) {
            this.init(new User({
                id:        3,
                name:      'Chad',
                api_token: 'yXwSG6DbNCzPhQ=='
            }));
        }
    }

    init(me) {
        this.me(me);

        Channel.getAll(me).then((channels) => {
            channels.forEach((channel) => {
                this.channels.push(channel);
            });
        });
    }

    switchChannel(newChannel) {
        if (this.channel()) {
            this.channel().leave();
        }

        this.channel(newChannel.join());
    }
}

ko.applyBindings(new App());