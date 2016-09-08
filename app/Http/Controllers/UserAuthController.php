<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-09-02
 * Time: 6:40 PM
 */

namespace App\Http\Controllers;

use App\Chat\Model\User;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class UserAuthController extends Controller
{
    /**
     * @var Hasher
     */
    private $hasher;

    public function __construct(Hasher $hasher)
    {
        $this->hasher = $hasher;
    }

    public function authenticate(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|max:32',
            'password' => 'required'
        ]);

        $name = $request->input('name');
        $password = $request->input('password');

        $user = User::where('name', $name)->first();

        if (!$user || !$this->hasher->check($password, $user->password)) {
            throw new UnauthorizedHttpException('', 'Invalid name or password.');
        }

        return $user->toArrayPrivate();
    }
}