<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddChannelDisplayNameColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('Channel', function (Blueprint $table) {
            $table->string('display_name')->unique();
            $table->string('password')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('Channel', function (Blueprint $table) {
            $table->dropColumn(['display_name', 'password']);
        });
    }
}
