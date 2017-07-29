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



	//$scope.savedDropdownOpen = false;

	$scope.savedProgramList = null;

	//$scope.isSelected = false;
	
	//$scope.getSelected = function(num) {
	//	if ($scope.activeProgram) {
	//		if (num == $scope.activeProgram.codeid) {
	//		return true;
	//		}
	//	}
	//}
	
	$scope.getSelected = function(hubNum,progNum) {
		if (($scope.activeProgram) && (hubNum == $scope.activeProgram.userid) && (progNum == $scope.activeProgram.codeid)) {
			return true;
			} else
		if (!($scope.activeProgram) && (progNum == $scope.newProg)){
			return true;
			} else
			return false;	
	}
	
	// hub id = undefined $scope.localID = 16b1b6d7-a459-418f-a968-c62a62fb8fac
	$scope.useLocalLabel = function(hubNum) {	
		if (!($scope.localID == null) && !(hubNum==null)) {
			if (hubNum == $scope.localID) {
				return true;
			} else {
				return false;
				}
		} else {
			return false;
		}
	}


	}
]);