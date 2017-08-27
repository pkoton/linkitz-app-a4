// toolbar.js
'use strict';

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
		if ($scope.activeProgram && (hubNum == $scope.activeProgramHubID) && (progNum == $scope.activeProgramCodeID)) {
			return true;
			} else
		if (!($scope.activeProgram) && (progNum == $scope.newProg)){
				return true;
			} else
				return false;	
	};
	
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