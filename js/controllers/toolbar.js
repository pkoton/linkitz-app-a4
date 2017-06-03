// toolbar.js

var linkitzApp = angular.module('linkitzApp');

linkitzApp.controller('ToolbarController', [
    '$scope',
    '$timeout',
    'LogService',
    'LinkitzToy',
    'Messager',
    'errorCatcher',
    'ChromeBrowser',
    'minimumFirmwareVersion',
    function($scope, $timeout, LogService, LinkitzToy, Messager, errorCatcher, ChromeBrowser, minimumFirmwareVersion) {



	$scope.savedDropdownOpen = false;

	$scope.savedProgramList = null;

	$scope.updateSavedProgramList = function () {
	}
	
	

	//$scope.isSelected = false;
	
	//$scope.getSelected = function(num) {
	//	if ($scope.activeProgram) {
	//		if (num == $scope.activeProgram.codeid) {
	//		return true;
	//		}
	//	}
	//}
	
	$scope.getSelected = function(num) {
		//console.log("in getSelected, $scope.newProg = " + $scope.newProg);
		if (($scope.activeProgram) && (num == $scope.activeProgram.codeid)) {
			return true;
			}
		if (num == $scope.newProg){
			return true;
			}
		
	}
}]);