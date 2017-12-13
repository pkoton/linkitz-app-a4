// alert.js

angular.module('linkitzApp').controller('AlertController', ['$scope', 'errorObject', function($scope, errorObject) {
	$scope.connectTransitioning = false;
	$scope.errorObject = errorObject;
}]);