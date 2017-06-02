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



    $scope.savedDropdownOpen = false;
    $scope.savedProgramList = null;

    $scope.updateSavedProgramList = function () {
    }


}]);