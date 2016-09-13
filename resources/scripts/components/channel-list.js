/**
 * Created by Chad on 2016-09-12.
 */

import ko from 'knockout';

class ChannelListViewModel {
    constructor(params) {
        this.channels = params.channels;
        this.channel = params.channel;
    }

    switchChannel(newChannel) {
        console.log('New Channel', newChannel);

        this.channel().leave();

        newChannel.join();
        this.channel(newChannel);
    }
}

export let ChannelListComponent = {
    viewModel: ChannelListViewModel,
    template: require('fs').readFileSync(__dirname + '/channel-list.html', 'utf8')
};