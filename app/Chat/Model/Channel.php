<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-09-08
 * Time: 2:22 AM
 */

namespace App\Chat\Model;

use Illuminate\Database\Eloquent\Model;

class Channel extends Model
{

    protected $table = 'Channel';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'display_name'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'password'
    ];

    public function messages()
    {
        return $this->hasMany('App\Chat\Model\Message');
    }

}