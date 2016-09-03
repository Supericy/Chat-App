<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;

class LaravelLoggerProxy {
    public function log( $msg ) {
        Log::info($msg);
    }
}

class PusherServiceProvider extends ServiceProvider
{

    public function boot()
    {
        $pusher = $this->app->make('Pusher');
        $pusher->set_logger( new LaravelLoggerProxy() );
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
        $this->app->singleton('\Pusher', function () {
            $options = [
                'encrypted' => false
            ];

            // hardcoded because apparently env doesn't work hah
            return new \Pusher('944b0bdac25cd6df507f', 'ce1b3a20821f64ccaa2b', '243917', $options);
        });
    }
}
