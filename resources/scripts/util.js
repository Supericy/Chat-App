'use strict';

export function applyUserTypingHandler(observableInput, observableUsersTypingCollection, channel, user) {
    let t;
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

        let found = false;
        observableUsersTypingCollection().forEach((item) => {
            if (!found) {
                found = item.id === data.id;
            }
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