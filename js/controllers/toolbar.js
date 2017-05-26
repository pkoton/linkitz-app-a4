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

function linkitzPing(){
	if (!$scope.connectTransitioning) { //don't ping if we are already connected
		LinkitzToy.connect()
			.then(function () {
			    return LinkitzToy.verifyDevice();
			   })
			.then(function (querybytes) {
			       $scope.setConnected(true);
			       $scope.setAttached(true);
			       return LinkitzToy.readID();
			   })
			.then(function (connectedID) {
			    $scope.setHubID(connectedID);
			    console.log("Pinging hub " + connectedID[0].toString(16) + ':' +
				 connectedID[1].toString(16) + ':' +
				 connectedID[2].toString(16) + ':' +
				 connectedID[3].toString(16) );
			   })
			.then(LinkitzToy.disconnect)
			.then(function () {
			$scope.setConnected(false);
		    })
		    .catch(function (reason) {
			console.log("Ping: No hub detected");
			$scope.setAttached(false);
		    });
	}
    }
    
    setInterval(function(){
        linkitzPing()}, 5000)

    $scope.savedDropdownOpen = false;
    $scope.savedProgramList = null;

    $scope.updateSavedProgramList = function () {
    }


}]);