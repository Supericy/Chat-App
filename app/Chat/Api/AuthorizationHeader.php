<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-09-02
 * Time: 7:35 PM
 */

namespace App\Chat\Api;

use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class AuthorizationHeader
{

    private $scheme;
    private $token;

    public function __construct($scheme, $token)
    {
        $this->scheme = $scheme;
        $this->token = $token;
    }

    public function getSchema()
    {
        return $this->scheme;
    }

    public function getToken()
    {
        return $this->token;
    }

    public static function parseAuthorizationHeader($header)
    {
        $parsed = explode(' ', $header);

        if (!isset($parsed[0], $parsed[1])) {
            throw new UnauthorizedHttpException(TokenAuthentication::SCHEMA, 'Invalid authorization header');
        }

        return new AuthorizationHeader($parsed[0], $parsed[1]);
    }
}