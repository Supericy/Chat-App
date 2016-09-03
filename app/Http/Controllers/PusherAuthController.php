<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-09-02
 * Time: 6:37 PM
 */

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PusherAuthController extends Controller
{

    /**
     * @var \Pusher
     */
    private $pusher;

    public function __construct(\Pusher $pusher)
    {
        $this->pusher = $pusher;
    }

    public function authenticate(Request $request)
    {
        $this->middleware('auth');

        try {
            $user = Auth::user();


            $data = $user->toArrayPublic();

            return response($this->pusher->presence_auth($request->input('channel_name'), $request->input('socket_id'), $user->id, $data));


//            return response($this->pusher->socket_auth($request->input('channel_name'), $request->input('socket_id')), 200);
        } catch (\PusherException $pe) {
            throw new HttpException(500, $pe->getMessage(), $pe);
        }
    }

}