#! /usr/bin/python
# -*- coding: utf-8 -*-

# This is our path to the firmware .hex file
HEXFILE = "js/services/firmware.hex"
JSFILE  = "js/services/firmware.js"

with open(HEXFILE, 'r') as hexfile:
    with open(JSFILE,'w') as jsfile:
        
        jsfile.write("""// firmware.js

var linkitzApp = angular.module('linkitzApp');

linkitzApp.factory('LinkitzFirmware',
    ['$q',
    '$rootScope',
    'LogService',
    function($q, $rootScope, LogService) {

    var latestFirmwareEmbedded =
""")
        for line in hexfile.readlines():
            jsfile.write('        "'+line[:-1]+'\\n" +\n')

        jsfile.write('''
        "";

	function latestFirmware() {
        var deferred = $q.defer();
        deferred.resolve(latestFirmwareEmbedded);
        return deferred.promise;
	}

    return {
        'getLatestFirmware':   latestFirmware
    };

}]);
''')
