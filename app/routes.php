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
use Laravel\Lumen\Concerns\RoutesRequests;

$app->get('/', function () use ($app) {
    return view('landing');
});

$app->group(['prefix' => '/chat', 'namespace' => 'App\Http\Controllers'], function ($app) {
    /** @var RoutesRequests $app */

    $app->get('/', function () {
        return view('chat');
    });
});

$app->group(['prefix' => '/chat/api/v1', 'namespace' => 'App\Http\Controllers'], function ($app) {
    /** @var RoutesRequests $app */

    $app->post('pusher/auth', 'PusherAuthController@authenticate');

    $app->post('/user',       'UserController@create');
    $app->post('/user/auth',  'UserController@authenticate');

    $app->post('/chat/send',    'ChatController@sendMessage');
    $app->get ('/chat/history', 'ChatController@history');

    $app->get ('/channels',                   'ChannelController@getAll');
    $app->post('/channel',                    'ChannelController@create');
    $app->get ('/channel/{id}',               'ChannelController@get');
    $app->get ('/channel/{id}/history',       'ChannelController@history');
    $app->post('/channel/{id}/send-message',  'ChannelController@sendMessage');
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

    $pusher->trigger('presence-general', 'new-message', [
        'message' => $message->toArray()
    ]);

    return 'done2';
});


$app->get('/push-notification-test', function () use ($app) {
    return view('push-notification-test');
});