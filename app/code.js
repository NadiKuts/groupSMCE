'use strict';

var controllers = angular.module('smce');

controllers.controller('criteriaTreeCtrl', ['$scope', '$log', '$timeout', '$http', 'olData', 'ModelData', function ($scope, $log, $timeout, $http, olData, ModelData) {
    ModelData.getData('smce_tree_structure.json').success(function (data) {
        /* JSON file with structure of criteria tree */
        $scope.criteria = data;
        //console.log("criteria tree");
        //console.log($scope.criteria);

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
                    var elem = {};
                    elem.name = user.children[i].name;
                    elem.map = user.children[i].map;
                    elem.weight = user.children[i].value;
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

        //console.log("flatten_tree");
        //console.log($scope.flatten_tree);

        /* Function for displaying output */

        /*First, I need to create an array, where I will check, if the current user (clicked on) is already on the panel*/
        $scope.users_outputs_inputs = [];


        /* Function for visualization maps of decision makers on criteria panel onclick */
        $scope.displayOutput = function (output, id) {
            if (id.length == 4) {
                $scope.ranges = ["0.34-0.84", "0.32-0.7", "0.32-0.86", "0.12-0.88"];
                $scope.showRange = true;
            } else {
                $scope.showRange = false;
            }
            console.log(id);
            $scope.id_user = parseInt(id.charAt(2), 10) - 1;
            $scope.selectedName = output;
            $scope.showDetailOutput = true;
            console.log($scope.id_user);
            if ($scope.isUser(id) == false) {
                for (var i = 0; i < $scope.flatten_tree[$scope.id_user]["maps"].length; i++) {
                    if ($scope.flatten_tree[$scope.id_user]["maps"][i]["name"] == $scope.selectedName) {
                        /*all input maps for the selected map*/
                        $scope.inputMaps = [];
                        for (var j = 0; j < $scope.flatten_tree[$scope.id_user]["maps"][i]["children"].length; j++) {
                            $scope.inpMap = {
                                "mapname": $scope.flatten_tree[$scope.id_user]["maps"][i]["children"][j]["name"],
                                "weight": $scope.flatten_tree[$scope.id_user]["maps"][i]["children"][j]["value"],
                                "map": {
                                    center: {
                                        lat: -1.95,
                                        lon: 29.87,
                                        zoom: 7.5
                                    },
                                    layers_name: [
                                        {
                                            name: $scope.flatten_tree[$scope.id_user]["maps"][i]["children"][j]["map"],
                                            source: {
                                                type: 'ImageWMS',
                                                url: 'http://130.89.221.193:85/geoserver/wms',
                                                params: {
                                                    'LAYERS': 'nadja_smce:' + $scope.flatten_tree[$scope.id_user]["maps"][i]["children"][j]["map"]
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
                                            name: 'districts1method',
                                            source: {
                                                type: 'ImageWMS',
                                                url: 'http://130.89.221.193:85/geoserver/wms',
                                                params: {
                                                    'LAYERS': 'nadja_smce:districts1method'
                                                }
                                            },
                                            visible: true
                                        },
                                        {
                                            name: 'districts2method',
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
                                }
                            };
                            $scope.inputMaps.push($scope.inpMap);
                        };

                        $scope.userOutput = {
                            "mapname": $scope.flatten_tree[$scope.id_user]["maps"][i]["name"],
                            "username": $scope.flatten_tree[$scope.id_user]["username"],
                            "weight": $scope.flatten_tree[$scope.id_user]["maps"][i]["weight"],
                            "map": {
                                center: {
                                    lat: -1.95,
                                    lon: 29.87,
                                    zoom: 7.5
                                },
                                layers_name: [
                                    {
                                        name: $scope.flatten_tree[$scope.id_user]["maps"][i]["map"],
                                        source: {
                                            type: 'ImageWMS',
                                            url: 'http://130.89.221.193:85/geoserver/wms',
                                            params: {
                                                'LAYERS': 'nadja_smce:' + $scope.flatten_tree[$scope.id_user]["maps"][i]["map"]
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
                                    ,
                                    {
                                        name: 'districts1method',
                                        source: {
                                            type: 'ImageWMS',
                                            url: 'http://130.89.221.193:85/geoserver/wms',
                                            params: {
                                                'LAYERS': 'nadja_smce:districts1method'
                                            }
                                        },
                                        visible: true
                                        },
                                    {
                                        name: 'districts2method',
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
                            }
                        };
                        
                        $scope.userProfile = {
                            "id": $scope.id_user,
                            "output": $scope.userOutput,
                            "inputs": $scope.inputMaps
                        }
                        if (id.length == 4) {
                            $scope.userProfile["range"] = $scope.ranges[$scope.id_user];
                            //console.log("Range");
                            //console.log($scope.userProfile);
                        } else {
                            $scope.userProfile["range"] = "";
                            //console.log($scope.userProfile);
                        }
                        
                    }
                };
                var isUserInList = false;
                for (var k = 0; k < $scope.users_outputs_inputs.length; k++) {
                    if ($scope.users_outputs_inputs[k].id == $scope.id_user) {
                        $scope.users_outputs_inputs[k] = $scope.userProfile;
                        isUserInList = true;
                        break;
                    }
                }
                if (isUserInList == false) {
                    $scope.users_outputs_inputs.push($scope.userProfile);
                }
                //console.log($scope.users_outputs_inputs);

            } else {
                /* Do not show anything in "output" panel, if user click on "User" in criteria tree*/
                //console.log("It is user - nothing to show!");
            }
        };

        $scope.delete_user = function (id) {
            //console.log("id " + id);
            for (var i = 0; i < $scope.users_outputs_inputs.length; i++) {
                if ($scope.users_outputs_inputs[i].id == id) {
                    $scope.users_outputs_inputs.splice(i, 1);
                }
            }
            //console.log($scope.users_outputs_inputs);
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
        center_main: {
            lat: -1.95,
            lon: 29.87,
            zoom: 8.5
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