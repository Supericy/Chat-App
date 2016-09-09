<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-09-08
 * Time: 9:55 PM
 */

namespace App\Http\Controllers;

use App\Chat\Model\Channel;
use Illuminate\Http\Request;

class ChannelController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function getAll()
    {
        return Channel::all();
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
            'display_name' => 'required|min:1|max:32|unique:Channel|alpha_dash',
            'password' => ''
        ]);

        $name = $this->generatePresenceChannelName();
        $displayName = $request->input('display_name');

        $channel = Channel::create([
            'name' => $name,
            'display_name' => $displayName,
            'password' => null
        ]);

        return $channel;
    }

    private function generatePresenceChannelName()
    {
        return 'presence-' . base64_encode(random_bytes(10));
    }
}