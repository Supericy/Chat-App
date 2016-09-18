/**
 * Created by Chad on 2016-09-12.
 */

import ko from 'knockout';

class ChannelListViewModel {
    constructor(params) {
        this.channels = params.channels;
        this.channel = params.channel;
        this.searchQuery = ko.observable('');

        this.filteredChannels = ko.computed(() => {
            let query = this.searchQuery().toLowerCase();

            return ko.utils.arrayFilter(this.channels(), (channel) => {
                return channel.display_name.toLowerCase().indexOf(query) > -1;
            });
        });
    }

    switchChannel(newChannel) {
        console.log('New Channel', newChannel);

        if (this.channel()) {
            this.channel().leave();
        }

        this.channel(newChannel.join());
    }
}

export let ChannelListComponent = {
    viewModel: ChannelListViewModel,
    template: require('fs').readFileSync(__dirname + '/channel-list.html', 'utf8')
};