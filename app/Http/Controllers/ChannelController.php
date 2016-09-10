<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-09-08
 * Time: 9:55 PM
 */

namespace App\Http\Controllers;

use App\Chat\Model\Channel;
use App\Chat\Model\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChannelController extends Controller
{
    /**
     * @var \Pusher
     */
    var $pusher;

    public function __construct(\Pusher $pusher)
    {
        $this->middleware('auth');

        $this->pusher = $pusher;
    }

    public function sendMessage(Request $request, $channelId)
    {
        $this->validate($request, [
            'text' => 'required|max:256'
        ]);

        $pusher = app()->make('Pusher');
        $channel = Channel::findOrFail($channelId);
        $user = Auth::user();

        $message = new Message([
            'text' => $request->input('text')
        ]);

        $message->user()->associate($user);
        $message->channel()->associate($channel);

        $message->save();

        $this->pusher->trigger('presence-general', 'new-message', [
            'message' => $message->toArray()
        ]);

        return [
            'code' => 200,
            'status' => 'OK'
        ];
    }

    public function getAll()
    {
        return [
            'code' => 200,
            'status' => 'OK',
            'data' => [
                'channels' => Channel::all()
            ]
        ];
    }

    public function history(Request $request, $id)
    {
        // TODO: make channel controller
        $channel = Channel::findOrFail($id);

        $messages = $channel->messages()->with('User', 'Channel')->get();

        return [
            'code' => 200,
            'status' => 'OK',
            'data' => [
                'messages' => $messages->toArray()
            ]
        ];
    }

    public function get(Request $request, $id)
    {
        $channel = Channel::findOrFail($id);

        return $channel;
    }

    public function create(Request $request)
    {
        $this->validate($request, [
            'display_name' => 'required|min:1|max:32|unique:Channel|regex:/^[\pL\s]+$/u',
            'password' => ''
        ]);

        $name = $this->generatePresenceChannelName();
        $displayName = $request->input('display_name');

        $channel = Channel::create([
            'name' => $name,
            'display_name' => $displayName,
            'password' => null
        ]);

        $this->pusher->trigger('presence-server', 'new-channel', [
            'channel' => $channel->toArray()
        ]);

        return $channel;
    }

    private function generatePresenceChannelName()
    {
        return 'presence-' . base64_encode(random_bytes(10));
    }
}