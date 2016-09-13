'use strict';

//export function applyUserTypingHandler(observableInput, observableUsersTypingCollection, channel, user) {
export function applyUserTypingHandler(view) {
    function trigger(event) {
        view.channel().trigger(event, view.me().publicify());
    }

    function add(data) {
        let found = false;
        view.typing().forEach((item) => {
            if (!found) {
                found = item.id === data.id;
            }
        });

        if (!found) {
            view.typing.push(data);
        }
    }

    function remove(data) {
        view.typing.remove((item) => {
            return item.id === data.id;
        });
    }

    let t;
    view.newMessage.subscribe((value) => {
        clearTimeout(t);
        t = setTimeout(() => {
            if (value.length > 0) {
                trigger('client-started-typing');
            } else {
                trigger('client-stopped-typing');
            }
        }, 500);
    });

    view.channel.subscribe((channel) => {
        channel.bind('client-started-typing', (data) => {
            console.log('Started Typing', data);
            add(data);
        });
        channel.bind('client-stopped-typing', (data) => {
            console.log('Stopped Typing', data);
            remove(data);
        });

        // remove user from our list of users typing when they leave the chat
        channel.bind('pusher:member_removed', (data) => {
            remove(data.info);
        });
    });
}