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

    show() {
        this.$modal.modal({
            backdrop: 'static',
            keyboard: false
        });
    }

    hide() {
        this.$modal.modal('hide');
        this.$modal.on('hidden.bs.modal', () => {
            this.$login.remove();
        });
    }
}


let instance = null; // singleton instance
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

        //return this.user;
        //this.pusher = new Pusher('944b0bdac25cd6df507f', {
        //    authEndpoint: '/api/v1/pusher/auth',
        //    auth: {
        //        headers: {
        //            'Authorization': 'API-TOKEN ' + this.user.api_token
        //        }
        //    },
        //    encrypted: true
        //});
        initCallback(this.user);
    }

    initAuth(initCallback) {
        var authModal = new AuthModal();
        authModal.show();

        ko.applyBindings(new LoginViewModel((userData) => {
            authModal.hide();
            this.init(userData, initCallback);

        }), $('#login')[0]);
    }

    static getInstance() {
        if (!instance) {
            instance = new App();
        }
        return instance;
    }
}

export default new App();