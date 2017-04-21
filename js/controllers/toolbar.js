// toolbar.js

angular.module('linkitzApp').controller('ToolbarController', [
    '$scope',
    '$timeout',
    'LogService',
    'LinkitzToy',
    'Messager',
    'errorCatcher',
    'ChromeBrowser',
    'minimumFirmwareVersion',
    function($scope, $timeout, LogService, LinkitzToy, Messager, errorCatcher, ChromeBrowser, minimumFirmwareVersion) {

//	$scope.connectTransitioning = false;
//
//	$scope.toggleConnect = function toggleConnect()
//	{
//        $scope.connectTransitioning = true;
//	var catch_msg = "Error connecting to Linkitz";
//	LinkitzToy.connect()
//	.then(function () {
//            return LinkitzToy.verifyDevice();
//        })
//        .then(function (querybytes) {
//            $scope.setConnected(true);
//            return LinkitzToy.readID();
//        })
//        .then(function (connectedID) {
//            $scope.setHubID(connectedID);
//        })
//	.then(function () {
//            catch_msg = "Error programming Linkitz";
//	})
//        .then($scope.generateCode)
//        .then(HexGenerator.processAssembly)
//        .then(LinkitzToy.programDevice) // in linkitztoy.js line 252 (aliased linkitzProgramDevice)
//        .then(function programSuccess() {
//            LogService.appLogMsg("Programming Successful. Signing...");
//        })
//        .then(LinkitzToy.signFlash) 
//        .then(function signSuccess() {
//            LogService.appLogMsg("Signed.");
//        })
//	.then(function () {
//            catch_msg = "Error disconnecting from Linkitz";
//	})
//        .then(LinkitzToy.disconnect)
//	.then(function () {
//            $scope.setConnected(false);
//	})
//        .catch(function (reason) {
//            $scope.connectTransitioning = false;
//            errorCatcher.handle(catch_msg, reason);
//	});	
//	}

    $scope.savedDropdownOpen = false;
    $scope.savedProgramList = null;

    $scope.updateSavedProgramList = function () {
    }


}]);