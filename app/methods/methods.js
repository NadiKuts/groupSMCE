'use strict';

var controllers = angular.module('smce');

controllers.controller('methodsCtrl', ['$scope', '$log', '$timeout', '$http', 'olData', 'ModelData', function ($scope, $log, $timeout, $http, olData, ModelData) {
    ModelData.getData('smce_tree_structure.json').success(function (data) {
        /* JSON file with structure of criteria tree */
        $scope.criteria = data;
        //console.log($scope.criteria);
        
        $scope.showTipp = false;
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
        $scope.dataMaps2 = [[0, 0, 0, 0], [0, 0, 0, 0]];
        $scope.datasetOverride1 = [
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
        $scope.datasetOverride2 = [
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

        $scope.table_data_utility = [{
            "district": "District",
            "mean_value": "Mean utility value",
            "sd": "SD value"
        }];
        
        $scope.table_data_score = [{
            "district": "District",
            "mean_score": "Mean score",
            "sd": "SD value"
        }];

        $scope.$on('openlayers.map.singleclick', function (event, data) {
            $scope.inProcess = true;
            $scope.depends = true;
            $scope.$apply(function () {
                olData.getMap().then(function (map) {

                    var view = map.getView();
                    var viewProjection = view.getProjection();
                    var viewResolution = view.getResolution();
                    var zoom = view.getZoom();
                    

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
                    
                    /* DISTRICTS map */
                    var promiseDistrict = [];
                    var distr_map = new ol.source.TileWMS({
                        url: 'http://130.89.221.193:85/geoserver/wms',
                        params: {
                            'LAYERS': 'nadja_smce:districts1'
                        },
                        serverType: 'geoserver',
                        buffer: 10
                    });
                    $scope.dist_map_name = distr_map.getGetFeatureInfoUrl(data.coord, viewResolution, viewProjection, {
                        'INFO_FORMAT': 'application/json'
                    });

                    promiseDistrict.push($.getJSON($scope.dist_map_name));
                    $.when.apply($, promiseDistrict).then(function () {
                        console.log("get!");
                        $scope.distMap = arguments[0].features[0].properties.DISTRICT;
                        $scope.point_utility = {
                            "district": $scope.distMap,
                            "mean_value": $scope.meanMap[0],
                            "sd": $scope.sdMap
                        };
                        $scope.point_score = {
                            "district": $scope.distMap,
                            "mean_score": $scope.scoreMeanMap[0],
                            "sd": $scope.sd_score_map
                        };
                        
                        
                    });
                    $timeout(function () {
                        if ($scope.table_data_utility.length < 8) {
                            $scope.table_data_utility.push($scope.point_utility);
                        } else {
                            $scope.table_data_utility.splice(1, 1);
                            $scope.table_data_utility.push($scope.point_utility);
                        }
                        if ($scope.table_data_score.length < 8) {
                            $scope.table_data_score.push($scope.point_score);
                        } else {
                            $scope.table_data_score.splice(1, 1);
                            $scope.table_data_score.push($scope.point_score);
                        }
                        $scope.inProcess = false;
                    }, 5000);
                });
            });
        });
        
        $scope.del1_last_row = function () {
            if ($scope.table_data_utility.length > 1) {
                $scope.table_data_utility.pop();
                $scope.table_data_score.pop();
            }
        };
        $scope.del2_last_row = function () {
            if ($scope.table_data_score.length > 1) {
                $scope.table_data_score.pop();
            }
        };
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
            zoom: 7.8
        },
        defaults: {
            events: {
                map: ['singleclick']
            }
        },
        method_1_mean: [
            {
                name: 'Mean utility values',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:r3_mean_map'
                    }
                },
                opacity: 1,
                visible: true
            },
            {
                name: 'Boundaries of the districts',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1'
                    }
                },
                opacity: 1,
                visible: true
            },
            {
                name: 'Top 6 best locations',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1method'
                    }
                },
                opacity: 1,
                visible: true
            }

        ],
        method_1_sd: [
            {
                name: 'Level of agreement',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:r3_sd_map'
                    }
                },
                opacity: 1,
                visible: true
            },
            {
                name: 'Boundaries of the districts',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1'
                    }
                },
                opacity: 1,
                visible: true
            },
            {
                name: 'Top 6 best locations',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1method'
                    }
                },
                opacity: 1,
                visible: true
            }
        ],
        method_2_mean: [
            {
                name: 'Score values',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:r3_score_mean_map'
                    }
                },
                opacity: 1,
                visible: true
            },
            {
                name: 'Boundaries if the districts',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1'
                    }
                },
                opacity: 1,
                visible: true
            },
            {
                name: 'Top 6 best locations',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts2method'
                    }
                },
                opacity: 1,
                visible: true
            }
        ],
        method_2_sd: [
            {
                name: 'Level of agreement',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:r3_score_sd_map'
                    }
                },
                opacity: 1,
                visible: true
            },
            {
                name: 'Boundaries of the districts',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts1'
                    }
                },
                opacity: 1,
                visible: true
            },
            {
                name: 'Top 6 best locations',
                source: {
                    type: 'ImageWMS',
                    url: 'http://130.89.221.193:85/geoserver/wms',
                    params: {
                        'LAYERS': 'nadja_smce:districts2method'
                    }
                },
                opacity: 1,
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
