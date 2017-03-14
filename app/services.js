var controllers = angular.module('smce');


controllers.factory('ModelData', function($http) { 

    var obj = {};

    obj.getData = function () {
        return $http.get('smce_tree_structure.json');
    }
    return obj;    
});