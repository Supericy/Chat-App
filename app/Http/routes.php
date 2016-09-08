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

use App\Chat\Model\Channel;
use App\Chat\Model\User;
use App\Chat\Model\Message;

$app->get('/', function () use ($app) {
    return view('index');
});

$app->group(['prefix' => '/api/v1'], function () use ($app) {
    $app->post('pusher/auth', 'App\Http\Controllers\PusherAuthController@authenticate');
//    $app->get ('users', 'App\Http\Controllers\UserController@getAll');

    $app->post('/user', 'App\Http\Controllers\CreateUserController@create');
    $app->post('/user/auth', 'App\Http\Controllers\UserAuthController@authenticate');
//    $app->get ('/user/{id}', 'App\Http\Controllers\UserController@retrieve');

    $app->post('/chat/send', 'App\Http\Controllers\ChatController@sendMessage');
    $app->get('/chat/history', 'App\Http\Controllers\ChatController@history');
});



$app->get('/broadcast', function() use ($app) {
    $pusher = app()->make('Pusher');
    $channel = Channel::find(1);
    $user = User::find(6); // Server user

    $message = new Message([
        'text' => 'Hello!'
    ]);

    $message->user()->associate($user);
    $message->channel()->associate($channel);

    $message->save();

    $pusher->trigger('presence-general', 'message-new', [
        'message' => $message->toArray()
    ]);

    return 'done2';
});