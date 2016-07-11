// alert.js

angular.module('linkitzApp').controller('AlertController', ['$scope', 'errorObject', function($scope, errorObject) {
	$scope.errorObject = errorObject;
}]);