<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-09-02
 * Time: 7:31 PM
 */

namespace App\Chat\Api;


use App\Chat\Model\User;
use Illuminate\Contracts\Validation\UnauthorizedException;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class TokenAuthentication
{
    const SCHEMA = 'API-TOKEN';

    public function __construct()
    {
    }

    public function authenticate(AuthorizationHeader $authorizationHeader)
    {
        if ($authorizationHeader->getSchema() !== self::SCHEMA) {
            throw new UnauthorizedHttpException('', 'Unknown authorization schema');
        }

        $user = User::where('api_token', $authorizationHeader->getToken())->first();

        if (!$user) {
            throw new UnauthorizedHttpException('', 'Unauthorized');
        }

        return $user;
    }

}