'use strict';

var controllers = angular.module('smce');

controllers.controller('method1Ctrl', ['$scope', '$log', '$timeout', '$http', 'olData', 'ModelData', function ($scope, $log, $timeout, $http, olData, ModelData) {
    ModelData.getData('smce_tree_structure.json').success(function (data) {
        /* JSON file with structure of criteria tree */
        $scope.criteria = data;
        console.log($scope.criteria);

        /* Number of Decision-makers */
        $scope.num_users = $scope.criteria.length;

        /* Names of Decision-makers */
        $scope.dm_names = $scope.criteria.map(function (dm) {
            return dm[0].name;
        });

        /* Utility maps of individual smce */
        $scope.dm_maps = $scope.criteria.map(function (dm) {
            return dm[0].children[0].map;
        });

        /* Score individual maps */
        $scope.dm_maps_score = $scope.dm_maps.map(function (m) {
            return m + "_score";
        });


        $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];
        $scope.labels = $scope.dm_names;
        $scope.scores = [[0, 0, 0, 0], [0, 0, 0, 0]];
        $scope.dataMaps1 = [[0, 0, 0, 0], [0, 0, 0, 0]];
        $scope.datasetOverride = [
            {
                label: "Utility value",
                borderWidth: 1,
                type: 'bar'
                },
            {
                label: "Mean",
                borderWidth: 1,
                hoverBackgroundColor: "rgba(255,99,132,0.4)",
                hoverBorderColor: "rgba(255,99,132,1)",
                type: 'line'
                }
            ];
        $scope.chartOptions1 = {
            scales: {
                yAxes: [{
                    id: 'y-axis-1',
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        min: 0,
                        max: 1
                    }
                }]
            }
        };


        $scope.$on('openlayers.map.singleclick', function (event, data) {
            $scope.depends = true;
            $scope.$apply(function () {
                olData.getMap().then(function (map) {

                    var view = map.getView();
                    var viewProjection = view.getProjection();
                    var viewResolution = view.getResolution();
                    var zoom = view.getZoom();
                    
                    /* DISTRICTS map */
                    var distr_map = new ol.source.TileWMS({
                        url: 'http://130.89.221.193:85/geoserver/wms',
                        params: {
                            'LAYERS': 'nadja_smce:districts1'
                        },
                        serverType: 'geoserver',
                        buffer: 10
                    });
                    $scope.dist_map_val = distr_map.getGetFeatureInfoUrl(data.coord, viewResolution, viewProjection, {
                        'INFO_FORMAT': 'application/json'
                    });
                    $.getJSON($scope.dist_map_val, function (data) {
                        $scope.distMap = data.features[0].properties.DISTRICT;
                        console.log("distMap");
                        console.log($scope.distMap);
                    });

                    /* Utility maps */
                    var promises_ut = [];
                    for (var i = 0; i < $scope.dm_maps.length; i++) {
                        // $.getJSON returns a promise
                        var intermLayer = new ol.source.TileWMS({
                            url: 'http://130.89.221.193:85/geoserver/wms',
                            params: {
                                'LAYERS': 'nadja_smce:' + $scope.dm_maps[i]
                            },
                            serverType: 'geoserver',
                            buffer: 10
                        });
                        var map_dm = intermLayer.getGetFeatureInfoUrl(data.coord, viewResolution, viewProjection, {
                            'INFO_FORMAT': 'application/json'
                        });
                        promises_ut.push($.getJSON(map_dm));
                    }
                    $.when.apply($, promises_ut).then(function () {
                        $scope.utility_values = [];

                        // This callback will be passed the result of each AJAX call as a parameter
                        for (var i = 0; i < arguments.length; i++) {
                            $scope.utility_values.push(parseFloat((arguments[i][0].features[0].properties.GRAY_INDEX).toFixed(2)));
                        }
                        console.log("utility_values");
                        console.log($scope.utility_values);
                        $scope.dataMaps1[0] = $scope.utility_values;
                        console.log("datamaps1");
                        console.log($scope.dataMaps1);
                        $timeout(function () {
                            $scope.dataMaps1[0] = $scope.utility_values;
                            $scope.dataMaps1[1] = $scope.meanMap;

                        }, 1000);

                    });


                    /* mean map */
                    var promises_mean_map = [];
                    for (var i = 0; i < $scope.num_users; i++) {
                        // $.getJSON returns a promise
                        var intermLayer = new ol.source.TileWMS({
                            url: 'http://130.89.221.193:85/geoserver/wms',
                            params: {
                                'LAYERS': 'nadja_smce:r3_mean_map'
                            },
                            serverType: 'geoserver',
                            buffer: 10
                        });
                        var map_dm = intermLayer.getGetFeatureInfoUrl(data.coord, viewResolution, viewProjection, {
                            'INFO_FORMAT': 'application/json'
                        });
                        promises_mean_map.push($.getJSON(map_dm));
                    }
                    $.when.apply($, promises_mean_map).then(function () {
                        $scope.meanMap = [];
                        // This callback will be passed the result of each AJAX call as a parameter
                        for (var i = 0; i < arguments.length; i++) {
                            $scope.meanMap.push(parseFloat((arguments[i][0].features[0].properties.GRAY_INDEX).toFixed(2)));
                        }
                        console.log("meanMap");
                        console.log($scope.meanMap);
                        $scope.dataMaps1[1] = $scope.meanMap;
                        console.log("datamaps1");
                        console.log($scope.dataMaps1);
                        $timeout(function () {
                            $scope.dataMaps1[0] = $scope.utility_values;
                            $scope.dataMaps1[1] = $scope.meanMap;

                        }, 1000);

                    });
                    
                    /* SD map */
                    var sd_map = new ol.source.TileWMS({
                        url: 'http://130.89.221.193:85/geoserver/wms',
                        params: {
                            'LAYERS': 'nadja_smce:r3_sd_map'
                        },
                        serverType: 'geoserver',
                        buffer: 10
                    });
                    $scope.sd_map_val = sd_map.getGetFeatureInfoUrl(data.coord, viewResolution, viewProjection, {
                        'INFO_FORMAT': 'application/json'
                    });
                    $.getJSON($scope.sd_map_val, function (data) {
                        $scope.sdMap = parseFloat((data.features[0].properties.GRAY_INDEX).toFixed(2));
                        console.log("sdMap");
                        console.log($scope.sdMap);
                    });
                });
            });
        });
    });

    /*Maps, Openlayers*/
    angular.extend($scope, {
        center: {
            lat: -1.95,
            lon: 29.87,
            zoom: 7.5
        },
        center_main: {
            lat: -1.95,
            lon: 29.87,
            zoom: 8
        },
        defaults: {
            events: {
                map: ['singleclick']
            }
        },
        method_1_mean: [
            {
                name: 'mean_map',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:r3_mean_map'
                    }
                },
                visible: true
            },
            {
                name: 'bounds',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1'
                    }
                },
                visible: true
            },
            {
                name: 'highlight1',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1method'
                    }
                },
                visible: true
            }

        ],
        method_1_sd: [
            {
                name: 'sd_map',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:r3_sd_map'
                    }
                },
                visible: true
            },
            {
                name: 'bounds',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1'
                    }
                },
                visible: true
            },
            {
                name: 'highlight1',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1method'
                    }
                },
                visible: true
            }
        ],
        method_2_mean: [
            {
                name: 'score_mean_map',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:r3_score_mean_map'
                    }
                },
                visible: true
            },
            {
                name: 'bounds',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1'
                    }
                },
                visible: true
            },
            {
                name: 'highlight2',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts2method'
                    }
                },
                visible: true
            }
        ],
        method_2_sd: [
            {
                name: 'score_sd_map',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:r3_score_sd_map'
                    }
                },
                visible: true
            },
            {
                name: 'bounds',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1'
                    }
                },
                visible: true
            },
            {
                name: 'highlight2',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts2method'
                    }
                },
                visible: true
            }
        ],
        //projection: 'EPSG:3857',
        bounds: {
            source: {
                type: 'ImageWMS',
                url: 'http://130.89.221.193:85/geoserver/wms',
                params: {
                    'LAYERS': 'nadja_smce:districts1'
                }
            },
            visible: true
        }
    });


}]);



controllers.controller('NavigationCtrl', AppCtrl);

function AppCtrl($scope) {
    $scope.currentNavItem = 'method1';
}