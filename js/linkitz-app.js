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
    //$scope.lastHub = '00:00:00:00';
    $scope.fullHub = '';
    
    $scope.LinkitzPrograms = [];
    $scope.newProg = -1;
    
    $scope.OK = false;
    
    //$scope.hubID = null;
    $scope.activeProgram = null;
    // $scope.localID = null; // move initialization to app-entry because we only want it to be set once
    $scope.activeProgramID = '';
    $scope.loadInfo = {}; // used to pass info about program to be loaded from loadEditor to loadEditor2 (I know its a kludge)

    $scope.devMode = false;
    $scope.editor = {};
    $scope.editor.blocklyXML = emptyBlocklyXML;
    $scope.editor.dirty = false;
    $scope.editor.noOverwrite = false; // this flag is set to true if editor contains a builtIn program
    $scope.eraseOK = false;

    $scope.setHubID = function setHubID(connectedHubId) { // connectedHubId  is array [32]
        var temp= '';
        for (var i = 0; i < 31; i++) {
            temp += padhex(connectedHubId[i]) + ':'; //fullHub is a string of 64 2-char hex separated by :
        }
        temp += padhex(connectedHubId[31]);
        $scope.fullHub = temp;
//        console.log("full hub " + $scope.fullHub);
//        $scope.lastHub = padhex(connectedHubId[0]) + ':' + // lastHub is char(11)
//                        padhex(connectedHubId[1]) + ':' +
//				     	padhex(connectedHubId[2]) + ':' +
//				     	padhex(connectedHubId[3]);
//        console.log("last hub " + $scope.lastHub);
	if (!$scope.hubs[$scope.fullHub]) {
            $scope.hubs[$scope.fullHub] = {};
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
                //console.log("Pinging hub " + connectedID);
			    if ($scope.devMode == true) {
				console.log("Pinging hub " + padhex(connectedID[0]) + ':' +
				     						 padhex(connectedID[1]) + ':' +
				     						 padhex(connectedID[2]) + ':' +
				     						 padhex(connectedID[3]) );
			    } else
			    {console.log("Ping: A hub is connected");
			    }
			   })
			.then(LinkitzToy.disconnect)
			.then(function () {
                $scope.setConnected(false);
                if (!$scope.savedDropdownOpen) { // don't refresh program list if dropdown is open (makes it flash)
                    //$scope.queryPrograms();
                    $scope.queryProgramsNoThrottle();
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
    
    function padhex(d) {
        var h = d.toString(16);
        return (h.length < 2? '0' : '') + h;
    }
    
    $scope.restoreState = function restoreState() {
        // console.log("in restore state");
        return ChromeBrowser.loadLocalStorage("persistState")
            .then(function (persistState) {
                if (persistState) {
                    $scope.fullHub = persistState.fullHub;
                    $scope.localID = persistState.localID;
                    angular.forEach(persistState.hubs, function(value, key) {
                        $scope.hubs[key] = {};
                    });
                }
                // NEW: call queryPrograms for hubs to restore savedPrograms dropdown
                $scope.queryPrograms();
            });
    }

    $scope.saveState = function saveState() {
        var persistState = {
            'hubs': {},
            'fullHub': $scope.fullHub,
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
    
  $scope.queryProgramsNoThrottle = function queryProgramsNoThrottle() {
	var size = Object.keys($scope.hubs).length;
    // $scope.LinkitzPrograms = HubPrograms.query({'userid': 'builtIn'}); // only check this on startup, it is unlikely to change during a user session
    //console.log("# of hubs = " + size);
    var rand = Math.floor((Math.random() * size + 1)); // use rand to pick one hub to query
    //console.log("rand = " + rand);
    var i = 1;
	angular.forEach($scope.hubs, function(value, key) {
        if (i == rand) {
            value['hubId'] = key;
            value['hubPrograms'] = HubPrograms.query({'userid': key});
            //console.log("querying  " + key);
        };
        i += 1;
        });
    }  

    $scope.loadEditor = function loadEditor (program,writeFlag) {
        $scope.loadInfo = {program:program, writeFlag:writeFlag};
        if ($scope.editor.blocklyXML == '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>') {
                $scope.loadEditor2(); // empty workspace, don't need a warning, just load code
        } else
        {
            errorCatcher.confirm('WARNING', 'This will erase all the blocks on your workspace!', $scope.loadEditor2);
        }
    };
   
    $scope.loadEditor2 = function loadEditor () {
        var program = $scope.loadInfo.program;
        var writeFlag = $scope.loadInfo.writeFlag;
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
            $scope.activeProgramID = program.userid;
            $scope.isLocal = false;
        }
    };

    $scope.clearEditor = function clearEditor () {
        if ($scope.editor.blocklyXML == '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>') {
                return; // empty workspace, don't need a warning, workspace is already clear 
        } else
        {
            errorCatcher.confirm('WARNING', 'This will erase all the blocks on your workspace!', $scope.wipeEditor);
        }
    };
    

$scope.wipeEditor = function wipeEditor () {    
        // console.log("Wipe editor: Re-initializing Blockly XML");
        $scope.activeProgram = null;
        $scope.editor.blocklyXML = emptyBlocklyXML;
        $scope.editor.dirty = false;
        $scope.newProg = -1;
}

    $scope.saveEditor = function saveEditor () {
        var saveBody;
        var newProgram;
        var temp;
        if ($scope.editor.blocklyXML == '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>') {
                LogService.appLogMsg("Save: Empty workspace, did not save");
        } else {
            if (!($scope.fullHub) && ($scope.localID == null)) { // CREATE localID, SAVE code ID, and save code locally
                saveBody = {
                    "userid": 'local',
                    "codexml": $scope.editor.blocklyXML
                };
                newProgram = new HubPrograms(saveBody);
                newProgram.$save(function(response) {
                console.log("Saved as local program # " + response.codeid); //
                if ($scope.devMode) {
                    console.log(" = " + (response.userid).substring(0, 11)); // show userID in dev mode
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
                .catch(function (reason) {
                console.log("Couldn't save " + reason);
                });
            }
            else if (($scope.editor.noOverwrite) || (!($scope.activeProgram))) { // if code is built-in or new, SAVE AS NEW
            // $scope.fullHub = $scope.attachedHub;
            if (!($scope.fullHub)) { // if no attached hub
                saveBody = {
                    "userid": $scope.localID,
                    "codexml": $scope.editor.blocklyXML
                };
            } else {
                saveBody = {
                    "userid": $scope.fullHub,
                    "codexml": $scope.editor.blocklyXML
                };
            }
            newProgram = new HubPrograms(saveBody);
                newProgram.$save(function(response) {
                LogService.appLogMsg("Saved program, stored as codeid: " + response.codeid);
                if ($scope.devMode) {
                    temp = response.userid;
                    LogService.appLogMsg(" for userid: " + temp.substring(0,11) + "."); // show userID in dev mode
                }
                $scope.newProg = response.codeid;
                $scope.queryPrograms();
                });
            }
            else if ($scope.fullHub && ($scope.isLocal == true)) { // save changes to a local program to the hubID if there is one
                saveBody = {
                    "userid": $scope.fullHub,
                    "codexml": $scope.editor.blocklyXML
                    };
                newProgram = new HubPrograms(saveBody);
                    newProgram.$save(function(response) {
                    LogService.appLogMsg("Saved local program to hub, stored as codeid: " + response.codeid);
                    if ($scope.devMode) {
                        temp = response.userid;
                        LogService.appLogMsg(" for userid: " + temp.substring(0,11) + "."); // show userID in dev mode
                    }
                    $scope.newProg = response.codeid;
                    $scope.queryPrograms();
                    var progs = $scope.hubs[$scope.fullHub].hubPrograms;
                    $scope.activeProgram = progs[$scope.newProg - 1];
                    });
            }
            else if ($scope.activeProgram.userid != $scope.fullHub){ // the program we edited doesn't belong to this hub, save it to the current hub
               saveBody = {
                    "userid": $scope.fullHub,
                    "codexml": $scope.editor.blocklyXML
                    };
                newProgram = new HubPrograms(saveBody);
                    newProgram.$save(function(response) {
                    LogService.appLogMsg("Saved local program to hub, stored as codeid: " + response.codeid);
                    if ($scope.devMode) {
                        temp = response.userid;
                        LogService.appLogMsg(" for userid: " + temp.substring(0,11) + "."); // show userID in dev mode
                    }
                    $scope.newProg = response.codeid;
                    $scope.queryPrograms();
                    var progs = $scope.hubs[$scope.fullHub].hubPrograms;
                    $scope.activeProgram = progs[$scope.newProg - 1];
                    }); 
            }
            else if ($scope.activeProgram) { // if existing usercode, UPDATE it (write back under same codeID) <<< where is userid???? <<<<<<
                $scope.activeProgram.codexml = $scope.editor.blocklyXML;
                $scope.activeProgram.$save(function(response) {
                    LogService.appLogMsg("Updated program codeid: " + response.codeid);
                    if ($scope.devMode) {
                        temp = response.userid;
                        LogService.appLogMsg(" for userid: " + temp.substring(0,11) + "."); // show userID in dev mode
                    }
                    $scope.queryPrograms();
                });
            }
            else {
            errorCatcher.handle("Save: Error saving program", {});
            }
        }
    };

    $scope.generateCode = function generateCode () {
        $scope.editor.deferredCode = $q.defer();

        var blocklyFrame = $scope.editor.blocklyFrameElement;
        blocklyFrame.contentWindow.postMessage({method: 'generateBlocklyCode'}, '*');

        return $scope.editor.deferredCode.promise;
    };

    $scope.connectTransitioning = false;

	$scope.toggleConnect = function toggleConnect()
	{
	    if ($scope.editor.blocklyXML == '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>') {
		    LogService.appLogMsg("Upload: Empty workspace, nothing to load");
		    return;
	    }
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
	};

    
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
    };

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
        confirm: {
            open: function open() {
                $scope.modals.confirm.instance = $uibModal.open({
                    templateUrl: 'partials/modals/confirm.html',
                    controller: 'ConfirmController',
                    size: 'lg',
                    scope: $scope
                });
            }
        },alert: {
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