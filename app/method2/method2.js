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
        $scope.dm_names = $scope.criteria.map(function (dm) {
            return dm.name;
        });

        /* Utility maps of individual smce */
        $scope.dm_maps = $scope.criteria.map(function (dm) {
            return dm.children[0].map;
        });

        /* Score individual maps */
        $scope.dm_maps_score = $scope.dm_maps.map(function (m) {
            return m + "_score";
        });


        /* function to check if it is user*/
        $scope.isUser = function (id_user) {
            if (id_user.length == 3) {
                return true
            } else {
                return false
            }
        }

        /* Flatten tree */
        $scope.flatten = function (user) {
            $scope.flat_criteria_tree = [];
            $scope.helper = function (user) {
                for (var i = 0; i < user.children.length; i++) {
                    /*console.log("USER "+user.children[i].name);*/
                    var elem = {};
                    elem.name = user.children[i].name;
                    elem.map = user.children[i].map;
                    if (user.children[i].children.length != 0) {
                        elem.children = user.children[i].children;
                        $scope.helper(user.children[i]);
                    } else {
                        elem.children = [];
                    }
                    $scope.flat_criteria_tree.push(elem);
                }
            }
            $scope.helper(user);
            return $scope.flat_criteria_tree;
        }

        /* For further using */
        $scope.flatten_tree = [];
        for (var user = 0; user < $scope.num_users; user++) {
            $scope.user = {
                "username": $scope.criteria[user].name,
                "maps": $scope.flatten($scope.criteria[user])
            };
            $scope.flatten_tree.push($scope.user);

        }


        /* Function for displaying output */

        $scope.displayOutput = function (output, id) {
            $scope.id_user = parseInt(id.charAt(2), 10);
            $scope.showDetailOutput = true;

            if ($scope.isUser(id) == false) {
                $scope.selectedName = output;
                console.log($scope.selectedName);

                $scope.all_users_map = [];
                $scope.all_users_map.push($scope.flatten_tree[$scope.id_user - 1]);
                for (var i = 0; i < $scope.flatten_tree.length; i++) {
                    if (i != $scope.id_user - 1) {
                        $scope.all_users_map.push($scope.flatten_tree[i]);
                    }
                }
                console.log("all_users_map");
                console.log($scope.all_users_map);

                $scope.selectedUsers = [];
                //$scope.printSelectedUsers =  



                $scope.users_outputs_inputs = [];
                for (var i = 0; i < $scope.all_users_map.length; i++) {
                    for (var j = 0; j < $scope.all_users_map[i]["maps"].length; j++) {
                        if ($scope.all_users_map[i]["maps"][j]["name"] == output) {
                            $scope.inputs = [];
                            for (var inp = 0; inp < $scope.all_users_map[i]["maps"][j]["children"].length; inp++) {
                                $scope.inputs.push({
                                    name: $scope.all_users_map[i]["maps"][j]["children"][inp]["name"],
                                    center: {
                                        lat: -1.95,
                                        lon: 29.87,
                                        zoom: 7.5
                                    },
                                    source: {
                                        type: 'ImageWMS',
                                        url: 'http://130.89.221.193:85/geoserver/wms',
                                        params: {
                                            'LAYERS': 'nadja_smce:' + $scope.all_users_map[i]["maps"][j]["children"][inp]["map"]
                                        }
                                    },
                                    visible: true
                                });
                            };

                            $scope.users_outputs_inputs.push({
                                "username": $scope.all_users_map[i]["username"],
                                "map": {
                                    name: $scope.all_users_map[i]["maps"][j]["name"],
                                    center: {
                                        lat: -1.95,
                                        lon: 29.87,
                                        zoom: 7.5
                                    },
                                    source: {
                                        type: 'ImageWMS',
                                        url: 'http://130.89.221.193:85/geoserver/wms',
                                        params: {
                                            'LAYERS': 'nadja_smce:' + $scope.all_users_map[i]["maps"][j]["map"]
                                        }
                                    },
                                    visible: true
                                },
                                "input_maps": $scope.inputs
                            });
                        }
                    }
                }
                console.log("users_inputs");
                console.log($scope.users_outputs_inputs);
                //console.log($scope.users_inputs[0].map.)

            } else {
                /* Do not show anything in "output" panel, if user click on "User" in criteria tree*/
                console.log("It is user - nothing to show!");
            }


        };

        $scope.displayInputs = function (selectedName, id) {

        }

        

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
                    /* mean map */
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
        },
        mean_map: {
            source: {
                type: 'ImageWMS',
                url: 'http://130.89.221.193:85/geoserver/wms',
                params: {
                    'LAYERS': 'nadja_smce:r3_mean_map'
                }
            },
            visible: true
        },
        sd_map: {
            source: {
                type: 'ImageWMS',
                url: 'http://130.89.221.193:85/geoserver/wms',
                params: {
                    'LAYERS': 'nadja_smce:r3_sd_map'
                }
            },
            visible: true
        },
        bc_map: {
            source: {
                type: 'ImageWMS',
                url: 'http://130.89.221.193:85/geoserver/wms',
                params: {
                    'LAYERS': 'nadja_smce:r3_score_mean_map'
                }
            },
            visible: true
        },
        bc_sd: {
            source: {
                type: 'ImageWMS',
                url: 'http://130.89.221.193:85/geoserver/wms',
                params: {
                    'LAYERS': 'nadja_smce:r3_score_sd_map'
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