<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-08-31
 * Time: 9:34 PM
 */

namespace App\Http\Controllers;

use App\Chat\Model\Channel;
use App\Chat\Model\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function sendMessage(Request $request)
    {
        $this->validate($request, [
            'text' => 'required|max:256'
        ]);

        $pusher = app()->make('Pusher');
        $channel = Channel::find(1);
        $user = Auth::user();

        $message = new Message([
            'text' => $request->input('text')
        ]);

        $message->user()->associate($user);
        $message->channel()->associate($channel);

        $message->save();

        $pusher->trigger('presence-general', 'message-new', [
            'message' => $message->toArray()
        ]);

        return [
            'code' => 200,
            'status' => 'OK'
        ];
    }
}