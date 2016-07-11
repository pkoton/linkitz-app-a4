// loggerservices.js

var linkitzApp = angular.module('linkitzApp');

linkitzApp.factory('LogService', ['$rootScope', '$log', function($rootScope, $log) {

    var developerMode = false;
    var logContent = [];

    function setDeveloperMode(isDeveloperMode) {
            developerMode = isDeveloperMode;
    }

    return {
        appLogMsg: function appLogMsg(msg) {
            var prefixedMsg = "APP: " + msg;
            logContent.push(msg);
            $log.log(prefixedMsg);
        },
        commLogMsg: function commLogMsg(msg) {
            var prefixedMsg = "COMM: " + msg;
            logContent.push(msg);
            if (developerMode) {
                $log.log(prefixedMsg);
            }
        },
        debugLogMsg: function debugLogMsg(msg) {
            var prefixedMsg = "DEBUG: " + msg;
            logContent.push(msg);
            if (developerMode) {
                $log.log(prefixedMsg);
            }
        },
        buildLogMsg: function buildLogMsg(msg) {
            var prefixedMsg = "BUILD: " + msg;
            logContent.push(msg);
            if (developerMode) {
                $log.log(prefixedMsg);
            }
        },
        content: logContent,
        setDevMode: setDeveloperMode
    };

}]);
