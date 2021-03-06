<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-08-31
 * Time: 8:17 PM
 */

namespace App\Http\Controllers;

use App\Chat\Model\User;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class UserController extends Controller
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

    public function create(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|unique:User|max:32',
            'password' => 'required|min:8'
        ]);

        $name = $request->input('name');
        $password = $request->input('password');
        $hashedPassword = $this->hasher->make($password);
        $apiToken = $this->generateApiToken();

        $user = User::create([
            'name' => $name,
            'password' => $hashedPassword,
            'api_token' => $apiToken
        ]);

        return $user->toArrayPrivate();
    }

    private function generateApiToken()
    {
        return base64_encode(random_bytes(10));
    }
}