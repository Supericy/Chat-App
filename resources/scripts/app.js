require('bootstrap');

import $ from 'jquery';
import 'jquery.nicescroll'; // jquery plugin

import ko from 'knockout';

import {User} from './models';
import {LoginViewModel} from './viewmodels';

class AuthModal {
    constructor() {
        this.$login = $('#login');
        this.$modal = $('#login-modal');
    }

    show(onAuthSuccess) {
        this.$modal.modal({
            backdrop: 'static',
            keyboard: false
        });

        ko.applyBindings(new LoginViewModel((data) => {
            this.hide();

            onAuthSuccess(new User(data));
        }), this.$login[0]);
    }

    hide() {
        this.$modal.modal('hide');
        this.$modal.on('hidden.bs.modal', () => {
            this.$login.remove();
        });
    }
}

class App {
    constructor() {
        this.user = null;
        this.pusher = null;
    }

    getUser() {
        return this.user;
    }

    getPusher() {
        return this.pusher;
    }

    getApi() {
        return this.user.getApi();
    }

    init(currentUserData, initCallback) {
        this.user = new User(currentUserData);

        initCallback(this.user);
    }

    initAuth(initCallback) {
        var authModal = new AuthModal();
        authModal.show();


    }
}

export default new App();