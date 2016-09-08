<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Seed Users
        User::create([
            'name' => 'Chad Kosie',
            'password' => 'lol123'
        ]);

        Channel::create([
            'name' => 'General'
        ]);
    }
}
