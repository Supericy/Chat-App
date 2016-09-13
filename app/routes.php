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
    return view('index');
});


$app->group(['prefix' => '/api/v1', 'namespace' => 'App\Http\Controllers'], function ($group) {
    /** @var RoutesRequests $group */

    $group->post('pusher/auth', 'PusherAuthController@authenticate');

    $group->post('/user',       'UserController@create');
    $group->post('/user/auth',  'UserController@authenticate');

    $group->post('/chat/send',    'ChatController@sendMessage');
    $group->get ('/chat/history', 'ChatController@history');

    $group->get ('/channels',                   'ChannelController@getAll');
    $group->post('/channel',                    'ChannelController@create');
    $group->get ('/channel/{id}',               'ChannelController@get');
    $group->get ('/channel/{id}/history',       'ChannelController@history');
    $group->post('/channel/{id}/send-message',  'ChannelController@sendMessage');
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