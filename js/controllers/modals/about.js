// dashboard.js

angular.module('linkitzApp').controller('AboutController', [
    '$scope',
    'ChromeBrowser',
    'LinkitzToy',
    function($scope, ChromeBrowser, LinkitzToy) {

    $scope.appVersion = ChromeBrowser.appVer();
    $scope.linkitz = LinkitzToy;

}]);