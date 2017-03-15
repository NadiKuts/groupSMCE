'use strict';

var controllers = angular.module('smce');

controllers.controller('method2Ctrl', ['$scope', '$log', '$timeout', '$http', 'olData', 'ModelData', function ($scope, $log, $timeout, $http, olData, ModelData) {
    ModelData.getData('smce_tree_structure.json').success(function (data) {
        /* JSON file with structure of criteria tree */
        $scope.criteria = data;
        console.log($scope.criteria);

        /* Number of Decision-makers */
        $scope.num_users = $scope.criteria.length;

        /* Names of Decision-makers */
        $scope.dm_names = $scope.criteria[0].map(function (dm) {
            return dm.name;
        });

        /* Utility maps of individual smce */
        $scope.dm_maps = $scope.criteria[0].map(function (dm) {
            return dm.children[0].map;
        });

        /* Score individual maps */
        $scope.dm_maps_score = $scope.dm_maps.map(function (m) {
            return m + "_score";
        });
        

        $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];
        $scope.dataMaps2 = [[0, 0, 0, 0], [0, 0, 0, 0]];
        $scope.scores = [[0, 0, 0, 0], [0, 0, 0, 0]];
        $scope.datasetOverride = [
            {
                label: "Score",
                borderWidth: 1,
                type: 'bar'
                },
            {
                label: "Mean score",
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
        $scope.chartOptions2 = {
            scales: {
                yAxes: [{
                    id: 'y-axis-1',
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        min: 0,
                        max: 4
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
                    
                    /* Score maps */
                    var promises_sc = [];
                    for (var i = 0; i < $scope.dm_maps_score.length; i++) {
                        // $.getJSON returns a promise
                        var intermLayer = new ol.source.TileWMS({
                            url: 'http://130.89.221.193:85/geoserver/wms',
                            params: {
                                'LAYERS': 'nadja_smce:' + $scope.dm_maps_score[i]
                            },
                            serverType: 'geoserver',
                            buffer: 10
                        });
                        var map_dm = intermLayer.getGetFeatureInfoUrl(data.coord, viewResolution, viewProjection, {
                            'INFO_FORMAT': 'application/json'
                        });
                        promises_sc.push($.getJSON(map_dm));
                    }
                    $.when.apply($, promises_sc).then(function () {
                        
                        $scope.scores = [];

                        // This callback will be passed the result of each AJAX call as a parameter
                        for (var i = 0; i < arguments.length; i++) {
                            $scope.scores.push(parseInt(arguments[i][0].features[0].properties.GRAY_INDEX));
                        }
                        console.log("scores");
                        console.log($scope.scores);
                        $timeout(function () {
                            $scope.dataMaps2[0] = $scope.scores;
                            $scope.dataMaps2[1] = $scope.scoreMeanMap;
                        }, 1000);
                    });
                    
                    /* SCORE MEAN map */
                    var promises_score_mean_map = [];
                    for (var i = 0; i < $scope.num_users; i++) {
                        // $.getJSON returns a promise
                        var intermLayer = new ol.source.TileWMS({
                            url: 'http://130.89.221.193:85/geoserver/wms',
                            params: {
                                'LAYERS': 'nadja_smce:r3_score_mean_map'
                            },
                            serverType: 'geoserver',
                            buffer: 10
                        });
                        var score_mean_map = intermLayer.getGetFeatureInfoUrl(data.coord, viewResolution, viewProjection, {
                            'INFO_FORMAT': 'application/json'
                        });
                        promises_score_mean_map.push($.getJSON(score_mean_map));
                    }
                    $.when.apply($, promises_score_mean_map).then(function () {
                        $scope.scoreMeanMap = [];
                        // This callback will be passed the result of each AJAX call as a parameter
                        for (var i = 0; i < arguments.length; i++) {
                            $scope.scoreMeanMap.push(parseFloat((arguments[i][0].features[0].properties.GRAY_INDEX).toFixed(2)));
                        }
                        console.log("ScoremeanMap");
                        console.log($scope.scoreMeanMap);
                        $scope.dataMaps2[1] = $scope.scoreMeanMap;
                        console.log("datamaps2");
                        console.log($scope.dataMaps2);
                        $timeout(function () {
                            $scope.dataMaps2[0] = $scope.scores;
                            $scope.dataMaps2[1] = $scope.scoreMeanMap;
                            
                        }, 1000);

                    });
                    
                    /* SD SCORE map */
                    var sd_score_map = new ol.source.TileWMS({
                        url: 'http://130.89.221.193:85/geoserver/wms',
                        params: {
                            'LAYERS': 'nadja_smce:r3_score_sd_map'
                        },
                        serverType: 'geoserver',
                        buffer: 10
                    });
                    $scope.sd_score_map_val = sd_score_map.getGetFeatureInfoUrl(data.coord, viewResolution, viewProjection, {
                        'INFO_FORMAT': 'application/json'
                    });
                    $.getJSON($scope.sd_score_map_val, function (data) {
                        $scope.sd_score_map = parseFloat((data.features[0].properties.GRAY_INDEX).toFixed(3));
                        console.log("sd_score_map");
                        console.log($scope.sd_score_map);
                    });

                    

                });
            });


            $scope.labels = $scope.dm_names;
            $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];

            //$scope.data = [$scope.utility_values, $scope.meanMap];
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


        });







    });

    /*Maps, Openlayers*/
    angular.extend($scope, {
        center: {
            lat: -1.95,
            lon: 29.87,
            zoom: 7.5
        },
        defaults: {
            events: {
                map: ['singleclick']
            }
        },
        method_1_mean : [
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
        method_1_sd : [
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
        method_2_mean : [
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
        method_2_sd : [
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
        ]
    });


}]);



controllers.controller('NavigationCtrl', AppCtrl);

function AppCtrl($scope) {
    $scope.currentNavItem = 'method1';
}