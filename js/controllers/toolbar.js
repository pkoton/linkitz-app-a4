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

	$scope.isConnected = false;
	$scope.connectTransitioning = false;

	$scope.toggleConnect = function toggleConnect()
	{
        $scope.savedDropdownOpen = false;
		$scope.connectTransitioning = true;
		if (!$scope.isConnected) {
			LinkitzToy.connect()
				.then(function () {
                    return LinkitzToy.verifyDevice();
                })
                .then(function (querybytes) {
                    $scope.isConnected = true;
                })
                .catch(function (reason) {
                    $scope.connectTransitioning = false;
                    errorCatcher.handle("Error connecting to Linkitz", reason);
                });
		}
		else {
			LinkitzToy.disconnect()
				.then(function () {
					$scope.isConnected = false;
					$scope.connectTransitioning = false;
				})
                .catch(function (reason) {
                    $scope.connectTransitioning = false;
                    errorCatcher.handle("Error disconnecting from Linkitz", reason);
                });
		}
	}

    $scope.savedDropdownOpen = false;
    $scope.savedProgramList = null;

    $scope.updateSavedProgramList = function () {
    }


}]);