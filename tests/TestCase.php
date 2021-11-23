<?php

namespace VanOns\Laraberg\Test;

use Orchestra\Testbench\Testcase as OrchestraTestCase;
use VanOns\Laraberg\LarabergFacade;
use VanOns\Laraberg\LarabergServiceProvider;

class TestCase extends OrchestraTestCase
{
    /**
     * Load package service provider
     * @param  \Illuminate\Foundation\Application $app
     * @return VanOns\Laraberg\LarabergServiceProvider
     */
    protected function getPackageProviders($app)
    {
        return [LarabergServiceProvider::class];
    }

    /**
     * Load package alias
     * @param  \Illuminate\Foundation\Application $app
     * @return array
     */
    protected function getPackageAliases($app)
    {
        return [
            'Laraberg' => LarabergFacade::class,
        ];
    }
}
