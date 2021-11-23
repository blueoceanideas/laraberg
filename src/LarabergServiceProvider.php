<?php

namespace VanOns\Laraberg;

use Illuminate\Support\ServiceProvider;

class LarabergServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot(): void
    {
        $this->publishes([__DIR__ . '/config/laraberg.php' => config_path('laraberg.php')], 'config');
        require __DIR__ . '/Http/routes.php';
        $this->publishes([__DIR__ . '/../public' => public_path('vendor/laraberg')], 'public');
    }
}
