'use strict';

// Declare app level module which depends on views, and components
angular.module('smce', ['chart.js', 'ngRoute', 'ngMaterial', 'openlayers-directive', 'angularTreeview', 'ngMessages', 'material.svgAssetsCache'])
    .config(function ($routeProvider, $mdThemingProvider) {
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('green')
            .warnPalette('green')
            .accentPalette('green')
            .dark();
        $routeProvider
            .when('/', {
                templateUrl: "method1/method1.html"
            })
            .when('/method2', {
                templateUrl: "method2/method2.html"
            })
            .when('/methods', {
                templateUrl: "methods/methods.html"
            })
    });