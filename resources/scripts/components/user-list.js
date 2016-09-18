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
            let query = this.searchQuery().toLowerCase();

            return ko.utils.arrayFilter(this.users(), (user) => {
                return user.name.toLowerCase().indexOf(query) > -1;
            });
        });

        this.channel.subscribe((channel) => {
            this.users([]);

            channel.onUserAdded((user) => {
                this.add(user);
            });

            channel.onUserRemoved((user) => {
                this.remove(user);
            });
        });
    }

    add(user) {
        console.log('Add User', user);

        let found = false;
        this.users().forEach((item) => {
            if (!found) {
                found = item.id === user.id;
            }
        });

        if (!found) {
            this.users.push(user);
        }
    }

    remove(user) {
        console.log('Remove User', user);

        this.users.remove((item) => {
            return item.id === user.id;
        });
    }
}



export let UserListComponent = {
    viewModel: UserListViewModel,
    template: require('fs').readFileSync(__dirname + '/user-list.html', 'utf8')
};