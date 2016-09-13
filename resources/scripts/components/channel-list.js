/**
 * Created by Chad on 2016-09-12.
 */

import ko from 'knockout';

class ChannelListViewModel {
    constructor(params) {
        console.log('params', params);
        this.channels = ko.observableArray(params.channels);
    }
}

export let ChannelListComponent = {
    viewModel: ChannelListViewModel,
    template: require('fs').readFileSync(__dirname + '/channel-list.html', 'utf8')
};