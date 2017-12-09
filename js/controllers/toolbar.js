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

	$scope.notAttached = !$scope.isAttached;
    $scope.notGeneratingAssembly = !$scope.isGeneratingAssembly;
    $scope.notProgrammingDevice = !$scope.isProgrammingDevice;
    $scope.notVerifying = !$scope.isVerifying;
    $scope.notSigning = !$scope.isSigning;
    
    $scope.hideAttached = function() {
		if ($scope.notAttached || $scope.isGeneratingAssembly || $scope.isSigning) {
			return true;
			}
		else return false;
	}
    
    $scope.hideNotAttached = function() {
		if ($scope.isAttached || $scope.isGeneratingAssembly || $scope.isSigning) {
			return true;
			}
		else return false;
	}
    
    //$scope.isSelected = false;
	
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