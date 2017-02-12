'use strict';

module.exports = function(config) {
    config.set({
        files: [
            'node_modules/jquery/jquery.js',
            'node_modules/jquery-ui/ui/jquery-ui.js',
            'node_modules/angular/angular.js',
            'node_modules/angular-route/angular-route.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'node_modules/angular-bootstrap/ui-bootstrap-tpls.js',
            'node_modules/angular-ui-sortable/sortable.js',
            'node_modules/d3/d3.js',
            'app/scripts/app.js',
            'app/scripts/services/**/*.js',
            'app/scripts/directives/**/*.js',
            'app/scripts/controllers/**/*.js',
            'app/scripts/filters/**/*.js',
            'test/unit/**/*.js'
        ],
        basePath: '../',
        frameworks: ['jasmine'],
        reporters: ['progress'],
        browsers: ['Chrome'],
        autoWatch: false,
        singleRun: true,
        colors: true
    });
};