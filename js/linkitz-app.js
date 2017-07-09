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
	
	
	$scope.status = {
	    isopen: false
	};

	$scope.toggled = function(open) {
	    if (open) {
		$scope.savedDropdownOpen = true;
	    } else {
		$scope.savedDropdownOpen = false;
	    }
	};

    $scope.isConnected = false;
    $scope.isAttached = false;

    $scope.hubs = {};
    $scope.lastHub = '00:00:00:00';
    $scope.attachedHub = null;
    
    $scope.LinkitzPrograms = [];
    $scope.newProg = -1;
    
    //$scope.hubID = null;
    $scope.activeProgram = null;
    // $scope.localID = null; // move initialization to app-entry because we only want it to be set once

    $scope.devMode = false;
    $scope.editor = {};
    $scope.editor.blocklyXML = emptyBlocklyXML;
    $scope.editor.dirty = false;
    $scope.editor.noOverwrite = false; // this flag is set to true if editor contains a builtIn program


    $scope.setHubID = function setHubID(connectedHubId) {
        //$scope.hubID = connectedHubId;
        $scope.lastHub = connectedHubId[0].toString(16) + ':' +
                         connectedHubId[1].toString(16) + ':' +
                         connectedHubId[2].toString(16) + ':' +
                         connectedHubId[3].toString(16);
	$scope.attachedHub = $scope.lastHub;
	if (!$scope.hubs[$scope.lastHub]) {
            $scope.hubs[$scope.lastHub] = {};
	    //console.log("in setHubID, hubs is " + JSON.stringify($scope.hubs));
        }
        return $scope.saveState();
    }

    $scope.setConnected = function setConnected(connected) {
        $scope.isConnected = connected;
    }
    
    $scope.setAttached = function setAttached(attached) {
        $scope.isAttached = attached;
    }
    
    function linkitzPing(){
		if (!$scope.connectTransitioning){ //don't ping if we are already connected 
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
			    if ($scope.devMode == true) {
				console.log("Pinging hub " + connectedID[0].toString(16) + ':' +
				     						 connectedID[1].toString(16) + ':' +
				     						 connectedID[2].toString(16) + ':' +
				     						 connectedID[3].toString(16) );
			    } else
			    {console.log("Ping: A hub is connected");
			    }
			   })
			.then(LinkitzToy.disconnect)
			.then(function () {
			$scope.setConnected(false);
			if (!$scope.savedDropdownOpen) { // don't refresh program list if dropdown is open (makes it flash)
			    $scope.queryPrograms();
			}
		    })
		    .catch(function (reason) {
			console.log("Ping: No hub detected");
			$scope.setAttached(false);
		    });
	}
    }
    
    setInterval(function(){
        linkitzPing()}, 5000)
    
    $scope.restoreState = function restoreState() {
        return ChromeBrowser.loadLocalStorage("persistState")
            .then(function (persistState) {
                if (persistState) {
                    $scope.lastHub = persistState.lastHub;
		    $scope.localID = persistState.localID;
                    angular.forEach(persistState.hubs, function(value, key) {
                        $scope.hubs[key] = {};
                    });
                }
            });
    }

    $scope.saveState = function saveState() {
        var persistState = {
            'hubs': {},
            'lastHub': $scope.lastHub,
	    'localID': $scope.localID
        };
        angular.forEach($scope.hubs, function(value, key) {
            persistState.hubs[key] = key;
        });
	//console.log("in saveState, hubs is " + JSON.stringify($scope.hubs));
        return ChromeBrowser.saveLocalStorage("persistState", persistState);
    }

    $scope.queryPrograms = function queryPrograms() {
	//console.log("in queryPrograms start, hubs is " + JSON.stringify($scope.hubs));
	$scope.LinkitzPrograms = HubPrograms.query({'userid': 'builtIn'});
	angular.forEach($scope.hubs, function(value, key) {
            //console.log(key);
	    value['hubId'] = key;
            value['hubPrograms'] = HubPrograms.query({'userid': key});
        });
	//console.log("after queryPrograms loop, hubs is " + JSON.stringify($scope.hubs));
    }

    $scope.loadEditor = function loadEditor (program,writeFlag) {
        var blocklyxml = program.codexml;
        $scope.activeProgram = program;
//        LogService.appLogMsg("Loading Blockly XML:\n" + blocklyxml);
        $scope.editor.blocklyXML = blocklyxml;
        $scope.editor.dirty = false;
	$scope.editor.noOverwrite = writeFlag;
	$scope.newProg = -1;
	if (program.userid == $scope.localID) { // this matters for saving local code when a hub is attached
	    $scope.isLocal = true;
	} else
	{
	    $scope.isLocal = false;
	}
    }

    $scope.clearEditor = function clearEditor () {
//        LogService.appLogMsg("Re-initializing Blockly XML");
            $scope.activeProgram = null;
	    $scope.editor.blocklyXML = emptyBlocklyXML;
	    $scope.editor.dirty = false;
	    $scope.newProg = -1;
    }

    $scope.saveEditor = function saveEditor () {
	if ($scope.editor.blocklyXML == '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>') {
		    LogService.appLogMsg("Save: Empty workspace, did not save");
	} else {
		if (!($scope.attachedHub) && ($scope.localID == null)) { // CREATE localID, SAVE code ID, and save code locally
		//errorCatcher.handle("Save: No hubID specified", {}); // used to throw an error. Now we save the code locally.
		var saveBody = {
			"userid": 'local',
			"codexml": $scope.editor.blocklyXML
		    }
		    var newProgram = new HubPrograms(saveBody);
		    newProgram.$save(function(response) {
			console.log("Saved as local program # " + response.codeid); //
			if ($scope.devMode) {
			    console.log(" = " + response.userid); // show userID in dev mode
			}
			$scope.localID = response.userid;
			$scope.newProg = response.codeid;
			console.log("program variable localID " + $scope.localID); //
    		    })
		    // add localID to hubs structure
		    .then(function() {
			//console.log("program variable localID outside if " + $scope.localID); //
			$scope.hubs[$scope.localID] = {};
			//console.log("case 0" + JSON.stringify($scope.hubs[$scope.localID])); // 2
		    })
		    .then($scope.saveState)
		    .then($scope.queryPrograms)
		    .then(function() {
			//console.log("case 1" + JSON.stringify($scope.hubs)); // 7
		    })
		    .catch(function (reason) {
			console.log("Couldn't save");
		    });
		}
	    else if (($scope.editor.noOverwrite) || (!($scope.activeProgram))) { // if code is built-in or new, SAVE AS NEW
		// $scope.lastHub = $scope.attachedHub;
		if (!($scope.attachedHub)) { // if no attached hub
		    var saveBody = {
		    "userid": $scope.localID,
		    "codexml": $scope.editor.blocklyXML
		    }
		} else {
		    var saveBody = {
		    	"userid": $scope.attachedHub,
			"codexml": $scope.editor.blocklyXML
		    }
		}
		var newProgram = new HubPrograms(saveBody);
		    newProgram.$save(function(response) {
			LogService.appLogMsg("Saved program, stored as codeid: " + response.codeid);
			if ($scope.devMode) {
			    LogService.appLogMsg(" for userid: " + response.userid + "."); // show userID in dev mode
			}
			$scope.newProg = response.codeid;
			$scope.queryPrograms();
		    });
		}
	    else if ($scope.lastHub && ($scope.isLocal == true)) { // save changes to a local program to the hubID if there is one
		var saveBody = {
		    	"userid": $scope.attachedHub,
			"codexml": $scope.editor.blocklyXML
		    }
		var newProgram = new HubPrograms(saveBody);
		    newProgram.$save(function(response) {
			LogService.appLogMsg("Saved local program to hub, stored as codeid: " + response.codeid);
			if ($scope.devMode) {
			    LogService.appLogMsg(" for userid: " + response.userid + "."); // show userID in dev mode
			}
			$scope.newProg = response.codeid;
			$scope.queryPrograms();
			var progs = $scope.hubs[$scope.attachedHub].hubPrograms;
			$scope.activeProgram = progs[$scope.newProg - 1];
		    });
		}
	    else if ($scope.activeProgram) { // if existing usercode, UPDATE it (write back under same codeID)
		$scope.activeProgram.codexml = $scope.editor.blocklyXML;
		$scope.activeProgram.$save(function(response) {
		    LogService.appLogMsg("Updated program codeid: " + response.codeid);
			if ($scope.devMode) {
			    LogService.appLogMsg(" for userid: " + response.userid + "."); // show userID in dev mode
			}
		    $scope.queryPrograms();
		});
	    }
	    else {
		errorCatcher.handle("Save: Error saving program", {});
	    }
	};
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
		// console.log("connectedID " + connectedID); // this prints 4 comma-separated decimal numbers
		$scope.setHubID(connectedID);
//		console.log("Connected to hub " + connectedID[0].toString(16) + ':' +
//                         connectedID[1].toString(16) + ':' +
//                         connectedID[2].toString(16) + ':' +
//                         connectedID[3].toString(16) );
	    })
	    .then(function () {
		catch_msg = "Load code: Error programming Linkitz";
	    })
	    .then($scope.generateCode)
	    .then(HexGenerator.processAssembly)
	    .then(LinkitzToy.programDevice) // in linkitztoy.js line 252 (aliased linkitzProgramDevice)
	    .then(function programSuccess() {
		LogService.appLogMsg("Programming Successful. Signing...(according to toggleConnect)");
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
            LogService.appLogMsg("Programming Successful. Signing...(according to tryBuild)");
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