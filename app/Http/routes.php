<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$app->get('/', function () use ($app) {
    return view('index');
});

$app->group(['prefix' => '/api/v1'], function () use ($app) {
    $app->post('auth', 'App\Http\Controllers\UserAuthController@authenticate');
    $app->post('pusher/auth', 'App\Http\Controllers\PusherAuthController@authenticate');
//    $app->get ('users', 'App\Http\Controllers\UserController@getAll');

    $app->post('/user', 'App\Http\Controllers\CreateUserController@create');
//    $app->get ('/user/{id}', 'App\Http\Controllers\UserController@retrieve');

    $app->post('/chat/send', 'App\Http\Controllers\ChatController@sendMessage');
});



$app->get('/broadcast', function() use ($app) {

    $app->make('Pusher')->trigger('presence-general', 'message-new', [
        'name' => 'Server',
        'timestamp' => time(),
        'message' => 'Hello!'
    ]);

    return 'done2';
});