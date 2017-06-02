// projectdata.js

var linkitzApp = angular.module('linkitzApp');

linkitzApp.factory('HubPrograms', ['$resource', function($resource) {
    return $resource('https://polar-hamlet-45060.herokuapp.com/db/:userid/:codeid', {userid: "@userid", codeid: "@codeid"},
        {   'get':    {method:'GET'},
            'save':   {method:'POST'},
            'query':  {method:'GET', isArray:true},
            'remove': {method:'DELETE'},
            'delete': {method:'DELETE'}
        }
    );
}]);
