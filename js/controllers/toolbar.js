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
    // status flags >> means used for status messages
    // >> $scope.isAttached 
    //$scope.isGeneratingAssembly 
    //$scope.isProcessingAssembly 
    //  >> $scope.isProgrammingDevice 
    //$scope.isVerifying 
    // >> $scope.isSigning 
    // >> $scope.programmingComplete 

	$scope.notAttached = !$scope.isAttached;
    $scope.notGeneratingAssembly = !$scope.isGeneratingAssembly;
    $scope.notProgrammingDevice = !$scope.isProgrammingDevice;
    $scope.notVerifying = !$scope.isVerifying;
    $scope.notSigning = !$scope.isSigning;
    
    $scope.hideAttached = function() {
		if ($scope.isProgrammingDevice || $scope.isSigning || $scope.programmingComplete) {
			return true;
			}
		else return false;
	}
    
    $scope.showAttached = function() {
//        console.log("in showAttached, isAttached is " + $scope.isAttached);
//		if ($scope.isProgrammingDevice || $scope.isSigning || $scope.programmingComplete) {
//            return false;
//            }
//        else
        //if ($scope.isAttached) {
			return true;
			//}
		//else return false;
	}
    
    $scope.hideNotAttached = function() {
		if ($scope.isAttached) {
			return true;
			}
		else return false;
	}
    
    $scope.hideProgrammingDevice = function() {
		if ($scope.isAttached || $scope.notAttached || $scope.isSigning || $scope.programmingComplete) {
			return true;
			}
		else return false;
	}
    
    $scope.hideIsSigning = function() {
		if ($scope.isAttached || $scope.notAttached || $scope.isProgrammingDevice || $scope.programmingComplete) {
			return true;
			}
		else return false;
	}
    
    $scope.hideProgrammingComplete = function() {
		if (!$scope.programmingComplete || $scope.notAttached || $scope.isProgrammingDevice || $scope.isSigning || $scope.editor.dirty) {
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
