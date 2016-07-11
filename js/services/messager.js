// messager.js

var linkitzApp = angular.module('linkitzApp');

linkitzApp.factory('Messager', ['$rootScope', function($rootScope) {
	return {

	    sendEditorMessage: function sendEditorMessage (msg, args) {
	        $rootScope.$broadcast('editor.' + msg, args);
	    },

	    sendLinkitzMessage: function sendLinkitzMessage (msg, args) {
	        $rootScope.$broadcast('linkitz.' + msg, args);
	    }

	};
}])

