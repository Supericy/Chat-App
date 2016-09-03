<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-08-31
 * Time: 9:34 PM
 */

namespace App\Http\Controllers;

use App\User;
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
            'message' => 'required|max:256'
        ]);

        $pusher = app()->make('Pusher');
        $user = Auth::user();

        $pusher->trigger('presence-general', 'message-new', [
            'id' => $user->id,
            'name' => $user->name,
            'timestamp' => time(),
            'message' => $request->input('message')
        ]);

        return [
            'code' => 200,
            'message' => 'sent'
        ];
    }
}