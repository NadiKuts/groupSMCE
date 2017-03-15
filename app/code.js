'use strict';

var controllers = angular.module('smce');

controllers.controller('criteriaTreeCtrl', ['$scope', '$log', '$timeout', '$http', 'olData', 'ModelData', function ($scope, $log, $timeout, $http, olData, ModelData) {
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
                "username": $scope.criteria[user][0].name,
                "maps": $scope.flatten($scope.criteria[user][0])
            };
            $scope.flatten_tree.push($scope.user);

        }
        
        console.log("flatten_tree");
        console.log($scope.flatten_tree);

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

        /* Toggling criteria tree panel */

        $scope.collapsed = false;
        $scope.nameButton = "Hide Criteria tree";
        $scope.ct_width = 35;
        $scope.viz_width = 100 - $scope.ct_width;

        $scope.toggleCriteriaTree = function () {
            if ($scope.collapsed == false) {
                $(".criteriatree").slideUp();
                $scope.nameButton = "Show Criteria tree";
                $scope.collapsed = true;
                $scope.ct_width = 0;
                $scope.viz_width = 100 - $scope.ct_width;
            } else {
                $(".criteriatree").slideDown();
                $scope.nameButton = "Hide Criteria tree";
                $scope.collapsed = false;
                $scope.ct_width = 35;
                $scope.viz_width = 100 - $scope.ct_width;
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