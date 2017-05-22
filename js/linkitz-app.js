'use strict';

var linkitzApp = angular.module('linkitzApp', [
        'ngAnimate',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui.blockly']);

linkitzApp.controller('LinkitzAppController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$q',
    'errorCatcher',
    'LogService',
    'ChromeBrowser',
    'Messager',
    'HexGenerator',
    'IntelHex',
    'LinkitzToy',
    'HubPrograms',
    function($scope, $http, $uibModal, $window, $q, errorCatcher, LogService, ChromeBrowser, Messager, HexGenerator, IntelHex, LinkitzToy, HubPrograms) {

    const emptyBlocklyXML = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';

    ChromeBrowser.updateCheck();
    ChromeBrowser.getPlatformInfo()
        .then(function (info) {
            $scope.platformInfo = info;
        });

    $scope.isConnected = false;
    $scope.isAttached = false;

    $scope.hubs = {};
    $scope.lastHub = '00:00:00:00';

    $scope.hubID = null;
    $scope.activeProgram = null;

    $scope.devMode = false;
    $scope.editor = {};
    $scope.editor.blocklyXML = emptyBlocklyXML;
    $scope.editor.dirty = false;

    $scope.setHubID = function setHubID(connectedHubId) {
        $scope.hubID = connectedHubId;
        $scope.lastHub = connectedHubId[0].toString(16) + ':' +
                         connectedHubId[1].toString(16) + ':' +
                         connectedHubId[2].toString(16) + ':' +
                         connectedHubId[3].toString(16);
        if (!$scope.hubs[$scope.lastHub]) {
            $scope.hubs[$scope.lastHub] = {};
        }
        return $scope.saveState();
    }

    $scope.setConnected = function setConnected(connected) {
        $scope.isConnected = connected;
    }
    
    $scope.setAttached = function setAttached(attached) {
        $scope.isAttached = attached;
    }

    $scope.restoreState = function restoreState() {
        return ChromeBrowser.loadLocalStorage("persistState")
            .then(function (persistState) {
                if (persistState) {
                    $scope.lastHub = persistState.lastHub;
                    angular.forEach(persistState.hubs, function(value, key) {
                        $scope.hubs[key] = {};
                    });
                }
            });
    }

    $scope.saveState = function saveState() {
        var persistState = {
            'hubs': {},
            'lastHub': $scope.lastHub
        };
        angular.forEach($scope.hubs, function(value, key) {
            persistState.hubs[key] = key;
        });
        return ChromeBrowser.saveLocalStorage("persistState", persistState);
    }

    $scope.queryPrograms = function queryPrograms() {
        angular.forEach($scope.hubs, function(value, key) {
            value['hubId'] = key;
            value['hubPrograms'] = HubPrograms.query({'userid': key});
        });
    }

    $scope.loadEditor = function loadEditor (program) {
        var blocklyxml = program.codexml;
        $scope.activeProgram = program;
//        LogService.appLogMsg("Loading Blockly XML:\n" + blocklyxml);
        $scope.editor.blocklyXML = blocklyxml;
        $scope.editor.dirty = false;
    }

    $scope.clearEditor = function clearEditor () {
//        LogService.appLogMsg("Re-initializing Blockly XML");
        $scope.activeProgram = null;
        $scope.editor.blocklyXML = emptyBlocklyXML;
        $scope.editor.dirty = false;
    }

    $scope.saveEditor = function saveEditor () {
        if ($scope.activeProgram) {
            $scope.activeProgram.codexml = $scope.editor.blocklyXML;
            $scope.activeProgram.$save();
        }
        else {
	    if (!($scope.lastHub)) {
		errorCatcher.handle("Save: No hubID specified", {});
	    } else {
		var saveBody = {
		    "userid": $scope.lastHub,
		    "codexml": $scope.editor.blocklyXML
		}
		var newProgram = new HubPrograms(saveBody);
		newProgram.$save(function(response) {
		    LogService.appLogMsg("Saved program, stored as codeid: " + response.codeid + " .");
		    $scope.queryPrograms();
		});
	    }
        }
    }

    $scope.generateCode = function generateCode () {
        $scope.editor.deferredCode = $q.defer();

        var blocklyFrame = $scope.editor.blocklyFrameElement;
        blocklyFrame.contentWindow.postMessage({method: 'generateBlocklyCode'}, '*');

        return $scope.editor.deferredCode.promise;
    }

    $scope.connectTransitioning = false;

	$scope.toggleConnect = function toggleConnect()
	{
	    $scope.connectTransitioning = true;
	    var catch_msg = "Load code: Error connecting to Linkitz";
	    LinkitzToy.connect()
	    .then(function () {
		return LinkitzToy.verifyDevice();
	    })
	    .then(function (querybytes) {
		$scope.setConnected(true);
		return LinkitzToy.readID();
	    })
	    .then(function (connectedID) {
		console.log("connectedID " + connectedID); // this prints 4 comma-separated decimal numbers
		$scope.setHubID(connectedID);
		console.log("Connected to hub " + connectedID[0].toString(16) + ':' +
                         connectedID[1].toString(16) + ':' +
                         connectedID[2].toString(16) + ':' +
                         connectedID[3].toString(16) );
	    })
	    .then(function () {
		catch_msg = "Load code: Error programming Linkitz";
	    })
	    .then($scope.generateCode)
	    .then(HexGenerator.processAssembly)
	    .then(LinkitzToy.programDevice) // in linkitztoy.js line 252 (aliased linkitzProgramDevice)
	    .then(function programSuccess() {
		LogService.appLogMsg("Programming Successful. Signing...");
	    })
	    .then(LinkitzToy.signFlash) 
	    .then(function signSuccess() {
		LogService.appLogMsg("Signed.");
	    })
	    .then(function () {
		catch_msg = "Load code: Error disconnecting from Linkitz";
	    })
	    .then(LinkitzToy.disconnect)
	    .then(function () {
		$scope.setConnected(false);
		$scope.connectTransitioning = false;
	    })
	    .catch(function (reason) {
		$scope.connectTransitioning = false;
		errorCatcher.handle(catch_msg, reason);
	    });	
	}

    
    function tryConnect() {
	var deferred = $q.defer();
	LinkitzToy.connect()
		.then(function () {
		    return LinkitzToy.verifyDevice();
		   })
	        .then(function (querybytes) {
		       $scope.setConnected(true);
		       return LinkitzToy.readID();
		   })
		.then(function (connectedID) {
		    $scope.setHubID(connectedID);
		   })
		.then(function () {
                deferred.resolve();                                             // programming complete
            })
            .catch(function (reason) {
                deferred.reject(reason);
            });

        return deferred.promise;
    }
    
    function tryBuild() {
	var deferred = $q.defer();
	generateCode()
        .then(HexGenerator.processAssembly)
        .then(LinkitzToy.programDevice) // def in linkitztoy.js line 252 (aliased linkitzProgramDevice)
        .then(function programSuccess() {
            LogService.appLogMsg("Programming Successful. Signing...");
        })
        .then(LinkitzToy.signFlash) 
        .then(function signSuccess() {
            LogService.appLogMsg("Signed.");
        })
        .then(function () {
                deferred.resolve();                                             // programming complete
            })
            .catch(function (reason) {
                deferred.reject(reason);
            });

        return deferred.promise;
    }
    
    function tryDisconnect() {
	var deferred = $q.defer();
	LinkitzToy.disconnect()
	.then(function () {
            $scope.setConnected(false);
	})
	.then(function () {
                deferred.resolve();                                             // programming complete
            })
            .catch(function (reason) {
                deferred.reject(reason);
            });

        return deferred.promise;
    }
    
    $scope.toggleDevMode = function toggleDevMode() {
        $scope.devMode = !$scope.devMode;
        LogService.setDevMode($scope.devMode);
    }

    $scope.modals = {
        about: {
            open: function open() {
                $scope.modals.about.instance = $uibModal.open({
                    templateUrl: 'partials/modals/about.html',
                    controller: 'AboutController',
                    size: 'lg',
                    scope: $scope
                });
            }
        },
        alert: {
            open: function open() {
                $scope.modals.alert.instance = $uibModal.open({
                    templateUrl: 'partials/modals/alert.html',
                    controller: 'AlertController'
                });
            }
        }
    };

    $scope.exitApplication = function exitApplication () {
        LinkitzToy.disconnect()
            .then(function (result) {
        		ChromeBrowser.closeWin();
            })
            .catch(function(result) {
            	ChromeBrowser.closeWin();
            });
    }

    $scope.titlebar = {
        minimizeWin: function minimizeWin() {
            ChromeBrowser.minimizeWin()
        },
        maximizeWin: function maximizeWin() {
            ChromeBrowser.maximizeWin()
        },
        closeWin: function closeWin() {
            $scope.exitApplication();
        },
        appVer: function appVer() {
            ChromeBrowser.appVer()
        }
    };

    $scope.restoreState()
        .then($scope.queryPrograms);

}]);