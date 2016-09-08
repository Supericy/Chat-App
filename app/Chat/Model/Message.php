<?php
/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-09-08
 * Time: 2:22 AM
 */

namespace App\Chat\Model;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{

    protected $table = 'Message';

    protected $with = ['User'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'channel_id',
        'text'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [

    ];

    public function user()
    {
        return $this->belongsTo('App\Chat\Model\User');
    }

    public function channel()
    {
        return $this->belongsTo('App\Chat\Model\Channel');
    }
}