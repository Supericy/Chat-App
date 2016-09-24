/**
 * Created by Chad on 2016-09-13.
 */
import $ from 'jquery';
import ko from 'knockout';
import {User} from '../models';

class LoginViewModel {
    constructor(params) {
        this.$login = $('#login');
        this.$modal = $('#login-modal');

        this.name = ko.observable("");
        this.password = ko.observable("");
        this.error = ko.observable("");
        this.authenticating = ko.observable(false);
        this.onAuthSuccess = params.onAuthSuccess;

        this.isAuthenticating = ko.computed(() => {
            return this.authenticating();
        });

        if (!params.skipAuth) {
            this.showModal();
        }
    }

    setAuthenticating(bool) {
        console.log('Authenticating', bool);
        this.authenticating(bool);
    }

    attemptAuth() {
        this.setAuthenticating(true);

        $.ajax({
                type:     "POST",
                url:      '/chat/api/v1/user/auth',
                data:     {
                    name:     this.name(),
                    password: this.password()
                },
                dataType: 'json'
            })
            .done((userData) => {
                console.log('Login Success', userData);
                this.hideModal();

                this.onAuthSuccess(new User(userData));
            })
            .fail((data) => {
                console.log('Login Error', data);

                this.error(data.responseJSON.error.message);
            })
            .always((data) => {
                this.setAuthenticating(false);
            });
    }

    showModal() {
        this.$modal.modal({
            backdrop: 'static',
            keyboard: false
        });
    }

    hideModal() {
        this.$modal.modal('hide');
        this.$modal.on('hidden.bs.modal', () => {
            this.$login.remove();
        });
    }
}

export let LoginComponent = {
    viewModel: LoginViewModel,
    template: require('fs').readFileSync(__dirname + '/login.html', 'utf8')
};