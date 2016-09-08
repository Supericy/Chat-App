<?php

namespace App\Chat\Model;

use Illuminate\Auth\Authenticatable;
use Laravel\Lumen\Auth\Authorizable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use App\Chat\Model\Message;

class User extends Model implements
    AuthenticatableContract,
    AuthorizableContract
{
    use Authenticatable, Authorizable;

    protected $table = 'User';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'password',
        'api_token',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'api_token'
    ];

    public function toArrayPublic()
    {
        return $this->toArray();
//        return [
//            'id' => $this->id,
//            'name' => $this->name,
//            'created_at' => $this->created_at
//        ];
    }

    public function toArrayPrivate()
    {
        $private = [
            'api_token' => $this->api_token
        ];

        return array_merge($this->toArrayPublic(), $private);
    }

    public function messages()
    {
        return $this->hasMany('App\Chat\Model\Message');
    }
}
