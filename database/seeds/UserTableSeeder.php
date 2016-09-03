<?php
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\User;

/**
 * Created by PhpStorm.
 * User: Chad
 * Date: 2016-08-31
 * Time: 9:06 PM
 */
class UserTableSeeder extends Seeder {
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'name' => 'Chad Kosie',
            'password' => 'lol123'
         ]);
    }
}