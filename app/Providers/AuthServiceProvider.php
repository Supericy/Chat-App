<?php

namespace App\Providers;

use App\Chat\Api\AuthorizationHeader;
use App\Chat\Api\TokenAuthentication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * @var TokenAuthentication
     */
    private $tokenAuthentication;

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //

        $this->tokenAuthentication = new TokenAuthentication();
    }

    /**
     * Boot the authentication services for the application.
     *
     * @return void
     */
    public function boot()
    {
        // Here you may define how you wish users to be authenticated for your Lumen
        // application. The callback which receives the incoming request instance
        // should return either a User instance or null. You're free to obtain
        // the User instance via an API token or any other method necessary.

        Auth::viaRequest('api', function (Request $request) {

            $authorizationHeader = AuthorizationHeader::parseAuthorizationHeader($request->header('Authorization'));

            return $this->tokenAuthentication->authenticate($authorizationHeader);
        });
    }
}
