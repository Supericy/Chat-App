/**
 * Created by Chad on 2016-09-12.
 */

import ko from 'knockout';

class UserListViewModel {
    constructor(params) {
        this.channel = params.channel;
        this.searchQuery = ko.observable("");
        this.users = ko.observableArray([]);

        this.filteredUsers = ko.computed(() => {
            return ko.utils.arrayFilter(this.users(), (user) => {
                return user.name.toLowerCase().indexOf(this.searchQuery()) > -1;
            });
        });

        this.channel.onUserAdded((user) => {
            this.add(user);
        });

        this.channel.onUserRemoved((user) => {
            this.remove(user);
        });
    }

    add(user) {
        console.log('Add User', user);
        if (this.users().indexOf(user) < 0) {
            this.users.push(user);
        }
    }

    remove(user) {
        console.log('Remove User', user);
        this.users.remove(user);
    }
}



export let UserListComponent = {
    viewModel: UserListViewModel,
    template: require('fs').readFileSync(__dirname + '/user-list.html', 'utf8')
};