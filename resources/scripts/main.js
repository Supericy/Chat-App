'use strict';

import $ from 'jquery';



import URI from 'urijs';
import ko from 'knockout';
import moment from 'moment';
import {Channel, User, Message} from './models';
import {ChannelListViewModel} from './viewmodels';
import app from './app';

let bootstrap = (currentUser) => {
    Channel.getAll(currentUser).then((channels) => {
        let channel = channels[0];

        console.log(channel);

        ko.applyBindings(new ChannelListViewModel(channels), $('#channels')[0]);

        channel.join();
    });
};


if (!URI().hasQuery('skipAuth')) {
    app.initAuth(bootstrap); // default auth prompt
} else {
    app.init({
        id: 3,
        name: 'Chad',
        api_token: 'yXwSG6DbNCzPhQ=='
    }, bootstrap);
}

