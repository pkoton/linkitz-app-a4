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

    // const emptyBlocklyXML = '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>';
    const AlmostEmptyBlocklyXML = '<xml xmlns="http://www.w3.org/1999/xhtml"> <block type="on_regular_event" x="0" y="0"></block> </xml>';


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
    $scope.hubKeys = []; // this is formaintaining the order in which hubs are displayed in the savedProrams dropdown menu
 /*   
 $scope.hubs format:
 $scope.hubs[hubid] is a list of program objects [{userid: hubid,codeid:number,codexml: string,codename:string},{},{},...{}]
    {"string1 long hub name":
        [
            {"userid":"string1 long hub name",
            "codeid":1,
            "codexml":"<xml xmlns=\"http://www.w3.org/1999/xhtml\"> ...</xml>",
            "codename":null},
            {"userid":"string1 long hub name",
            "codeid":2,
            "codexml":"<xml xmlns=\"http://www.w3.org/1999/xhtml\">...</xml>",
            "codename":null},
            {"userid":"string1 long hub name",
            "codeid":3,
            "codexml":"<xml xmlns=\"http://www.w3.org/1999/xhtml\">...</xml>",
            "codename":null}
            ],
    "string2 long hub name":
         [
            {"userid":"string2 long hub name",
            "codeid":1,
            "codexml":"<xml xmlns=\"http://www.w3.org/1999/xhtml\"> ...</xml>",
            "codename":null},
            {"userid":"string2 long hub name",
            "codeid":2,
            "codexml":"<xml xmlns=\"http://www.w3.org/1999/xhtml\">...</xml>",
            "codename":null},
            {"userid":"string2 long hub name",
            "codeid":3,
            "codexml":"<xml xmlns=\"http://www.w3.org/1999/xhtml\">...</xml>",
            "codename":null}
            ],
       
        ...
    }
 */   
    //$scope.lastHub = '00:00:00:00';
    
    
    $scope.LinkitzPrograms = [];
    $scope.newProgNum = -1;
    
    $scope.OK = false;
    
    // $scope.localID = null; // ID for local storage in $scope.hubs for this installation of the app. moved initialization to app-entry because we only want it to be set once
    $scope.connectedID = ''; // the hubid of the currently plugged-in hub. A string.
    $scope.activeProgram = false; // this is TRUE if a program has been loaded from $scope.hubs or if a new program on the workspace has been saved.
    $scope.activeProgramHubID = ''; // used for Saved Programs menu arrow
    $scope.activeProgramCodeID = null; // used for Saved Programs menu arrow
    $scope.loadInfo = {}; // used to pass info about program to be loaded from loadEditor to loadEditor2 (I know its a kludge)
    $scope.devMode = false; // true if developer mode is selected (toggle button is in the about.html modal)
    $scope.editor = {};
    $scope.editor.blocklyXML = AlmostEmptyBlocklyXML;
    $scope.editor.dirty = false;
    $scope.editor.noOverwrite = false; // this flag is set to true if editor contains a builtIn program, which users are not alowed ot modify
    $scope.isConnected = false;
    
    // the following flags are used to set status messages in the toolbar
    
    $scope.isAttached = false;
    $scope.isGeneratingAssembly = false;
    $scope.isProcessingAssembly = false;
    $scope.isProgrammingDevice = false;
    $scope.isVerifying = false;
    $scope.isSigning = false;
    $scope.programmingComplete = false;
    $scope.pingCount = 0;
    //
    
    
    
    $scope.setHubID = function setHubID(connectedHubId) { // connectedHubId  is array [32]
        var temp= '';
        for (var i = 0; i < 31; i++) {
            // temp += padhex(connectedHubId[i]) + ':'; //connectedHubId is a string of 64 2-char hex separated by :
            temp += padhex(connectedHubId[i]); //connectedHubId is a string of 64 2-char hex (no separator)
        }
        temp += padhex(connectedHubId[31]);
        $scope.connectedID = temp; // $scope.connectedID is a 64-char string
//        console.log("full hub " + $scope.connectedID);
//        $scope.lastHub = padhex(connectedHubId[0]) + ':' + // lastHub is char(11)
//                        padhex(connectedHubId[1]) + ':' +
//				     	padhex(connectedHubId[2]) + ':' +
//				     	padhex(connectedHubId[3]);
//        console.log("last hub " + $scope.lastHub);
	if (!$scope.hubs[$scope.connectedID]) {
            $scope.hubs[$scope.connectedID] = {};
            //put connectedID at front of hubKeys array
            ($scope.hubKeys).splice(0,0,$scope.connectedID);
        } else {
            var i = ($scope.hubKeys).indexOf($scope.connectedID);
            swapElement($scope.hubKeys, i, 0);
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
                    {
                        console.log("Ping: A hub is connected");
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
                        console.log("Ping: No hub detected " + $scope.pingCount);
                        $scope.pingCount += 1;
                        if ($scope.pingCount == 3) {
                            $scope.setAttached(false);
                            $scope.programmingComplete = false;
                            $scope.pingCount = 0;
                        }
                });
        }
    }
    
    setInterval(function(){
        linkitzPing()}, 5000);
    
    function padhex(d) {
        var h = d.toString(16);
        return (h.length < 2? '0' : '') + h;
    }
    // use swapElement(array,from,to) to move the currently attached hub to the top of the savedPrograms dropdown list
    function swapElement(array, indexA, indexB) {
        if (indexA ==indexB) return;
        var tmp = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = tmp;
    }

    //portable wordifying library, reveals 10 bits of information about a name in a memorable and 
    //useful fashion

    var adjectives = ["Energetic",  "Bright",   "Swift",  "Clever", 
            "Active", "Daring",     "Fearless",    "Gentle",     "Happy",
            "Strong", "Brilliant",  "Neat",     "Useful",
            "Precise","Accurate",   "Vast", "Apparent", "Lively",
            "Constant",             "Mighty",           "Efficient",
            "Electronic",           "Rare",          "Wise"]
    var nouns =    ["Plane",    "Carbon",   "Oxygen",   "Neon", "Helium",
            "Hydrogen", "Iron", "Aluminium",    "Copper",   "Gold", 
            "Silver",   "Diode",    "Transistor",   "Resistor", "Light",
            "Star",    "Line", "Circuit", "X-ray", "Action",
            "Anode",    "Cathode",  "Atom", "Molecule", "Cell", "Beam",
            "Network", "Conductor",    "Constant", "Energy",   "Map", 
            "Power",    "Field",    "Proton",   "Electron", "Neutron",
            "Flow", "Frequency",    "Gravity",  "Ion",  "Mass", "Matter",
            "Particle", "Satellite",    "Wave"]

    function abs(number){
        if(number<0){
            return -number;
        }else{
            return number;
        }
    }

    function djb2Code(str){
        var hash = 5381;
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
        }
        return hash;
    }

    $scope.wordify = function wordify(number){
        if(parseInt(number)){
            number=abs(parseInt(number));
        } else if(number){
            number = abs(djb2Code(number));
        } else {
            return "New Hub"
        }
        var adsel = number%adjectives.length;
        var nounsel = parseInt(number/adjectives.length)%nouns.length;
        return adjectives[adsel]+" "+nouns[nounsel];
    }
    
    $scope.restoreState = function restoreState() {
        // console.log("in restore state");
        return ChromeBrowser.loadLocalStorage("persistState")
            .then(function (persistState) {
                if (persistState) {
                    $scope.connectedID = persistState.fullHub;
                    $scope.hubKeys[0] = $scope.connectedID;
                    $scope.localID = persistState.localID;
                    ($scope.hubKeys).push($scope.localID);
                    for (var hubid in persistState.hubs) {
                        if (persistState.hubs.hasOwnProperty(hubid)) {
                            $scope.hubs[hubid] = {};
                            if (($scope.hubKeys).indexOf(hubid) === -1) {
                                ($scope.hubKeys).push(hubid);
                            }
                        }
                    }
                }
                // NEW: call queryPrograms for hubs to restore savedPrograms dropdown
                $scope.queryPrograms();
            });
    };

    $scope.saveState = function saveState() {
        var persistState = {
            'hubs': {},
            'fullHub': $scope.connectedID,
            'localID': $scope.localID
        };
        for (var hubid in $scope.hubs) {
          if ($scope.hubs.hasOwnProperty(hubid)) { 
            // persistState.hubs[key] = key; // trying to remove all the duplicate info in $scope.hubs
            persistState.hubs[hubid] = {};
          }
        }
        //console.log("in saveState, hubs is " + JSON.stringify($scope.hubs));
        return ChromeBrowser.saveLocalStorage("persistState", persistState);
    };

    $scope.queryPrograms = function queryPrograms() {
        //console.log("in queryPrograms start, hubs is " + JSON.stringify($scope.hubs));
        $scope.LinkitzPrograms = HubPrograms.query({'userid': 'builtIn'});
        for (var hubid in $scope.hubs) { //$scope.hubs[hubid] is a list of program objects [{userid: hubid,codeid:number,codexml: string,codename:string},{},{},...{}]
          if ($scope.hubs.hasOwnProperty(hubid)) {
            //console.log("before HubPrograms.query, $scope.hubs["+hubid+"].length = " + ($scope.hubs[hubid]).length);
            //console.log("HubPrograms.query " + HubPrograms.query({'userid': hubid}));
            $scope.hubs[hubid] = HubPrograms.query({'userid': hubid});
            //console.log("after HubPrograms.query, $scope.hubs["+hubid+"].length = " + ($scope.hubs[hubid]).length);
          }
        }
        //console.log("after queryPrograms loop, hubs is " + JSON.stringify($scope.hubs));
    };
    
  $scope.queryProgramsNoThrottle = function queryProgramsNoThrottle() {
	var size = Object.keys($scope.hubs).length;
    // $scope.LinkitzPrograms = HubPrograms.query({'userid': 'builtIn'}); // only check this on startup, it is unlikely to change during a user session
    //console.log("# of hubs = " + size);
    var rand = Math.floor((Math.random() * size + 1)); // use rand to pick one hub to query
    //console.log("rand = " + rand);
    var i = 1;
	for (var hubid in $scope.hubs) {
        //console.log("hubid: " + hubid);
          if ($scope.hubs.hasOwnProperty(hubid)) {
            if (i == rand) {
                 $scope.hubs[hubid] = HubPrograms.query({'userid': hubid});
            } else i++;
          }
        }
    };  

    $scope.loadEditor = function loadEditor (selectedProg,noOverWriteFlag) {
        $scope.loadInfo = {"prog":selectedProg, "noOverWriteFlag":noOverWriteFlag};
        if ($scope.editor.blocklyXML == '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>') {
                $scope.loadEditor2(); // empty workspace, don't need a warning, just load code
        } else
        if ($scope.editor.dirty == false) {
                $scope.loadEditor2(); // no changes were made to workspace, don't need a warning, just load code
        } else
        {
            errorCatcher.confirm('WARNING', 'This will erase all the blocks on your workspace!', $scope.loadEditor2);
        }
    };
   
    $scope.loadEditor2 = function loadEditor2 () {
        var prog = $scope.loadInfo.prog;
        var flag = $scope.loadInfo.noOverWriteFlag;
        $scope.programmingComplete = false;
        $scope.activeProgram = true;
        $scope.editor.blocklyXML = prog.codexml;
        $scope.editor.dirty = false;
        $scope.editor.noOverwrite = flag;
        $scope.newProgNum = -1;
        $scope.activeProgramHubID = prog.userid;
        $scope.activeProgramCodeID = prog.codeid;
        
        if (prog.userid == $scope.localID) { // this matters for saving local code when a hub is attached
            $scope.isLocal = true;
        } else {
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
        $scope.programmingComplete = false;
        $scope.activeProgram = false;
        $scope.activeProgramHubID = '';
        $scope.activeProgramCodeID = null;
        $scope.editor.blocklyXML = AlmostEmptyBlocklyXML;
        $scope.editor.dirty = false;
        $scope.newProgNum = -1;
 };
    
    $scope.saveEditor = function saveEditor () {
        var saveBody;
        var newProgram;
        // case: blank worskpace. Don't save
        if ($scope.editor.blocklyXML == '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>') {
                LogService.appLogMsg("Save: Empty workspace, did not save");
        }
        // case: no hub ID (this will occur right after installing). Save locally
        else if (!($scope.connectedID) && ($scope.localID == null)) { // db CREATES a localID, SAVE code ID, and save code locally
            saveBody = {
                "userid": 'local',
                "codexml": $scope.editor.blocklyXML
            };
            newProgram = new HubPrograms(saveBody);
            newProgram.$save(function(response) {
                if ((response.userid == null) || (response.codeid == null)) {
                       errorCatcher.handle("Save: Error saving program", {});
                       return;
                }
                LogService.appLogMsg("Saved as local program #  " + response.codeid);
                if ($scope.devMode) {
                    LogService.appLogMsg(" for userid: " + (response.userid).substring(0, 11)); // show userID in dev mode
                }
                $scope.localID = response.userid;
                $scope.activeProgramHubID = response.userid;
                $scope.activeProgramCodeID = response.codeid;
                $scope.activeProgram = true;
                $scope.hubs[$scope.activeProgramHubID] = HubPrograms.query({'userid': $scope.activeProgramHubID});
                });
            }
        // case: code is built-in or new. SAVE AS NEW (don't overwrite built-in code)
            else if (($scope.activeProgram && $scope.editor.noOverwrite) || (!($scope.activeProgram))) { 
                if (!($scope.connectedID)) { // if no attached hub
                    saveBody = {
                        "userid": $scope.localID,
                        "codexml": $scope.editor.blocklyXML
                    };
                } else {
                    saveBody = {
                        "userid": $scope.connectedID,
                        "codexml": $scope.editor.blocklyXML
                    };
                }
                newProgram = new HubPrograms(saveBody);
                newProgram.$save(function(response) {
                if ((response.userid == null) || (response.codeid == null)) {
                   errorCatcher.handle("Save: Error saving program", {});
                   return;
                }
                LogService.appLogMsg("Saved program, stored as codeid: " + response.codeid);
                if ($scope.devMode) {
                    LogService.appLogMsg(" for userid: " + (response.userid).substring(0, 11)); // show userID in dev mode
                }
                $scope.activeProgramHubID = ($scope.connectedID) ? $scope.connectedID : $scope.localID;
                $scope.activeProgramCodeID = response.codeid;
                $scope.activeProgram = true;
                $scope.hubs[$scope.activeProgramHubID] = HubPrograms.query({'userid': $scope.activeProgramHubID});
                });
            } // case: local program has been changed and there is a hub. Save to hub.
            else if ($scope.connectedID && $scope.isLocal) { // save changes to a local program to the hubID if there is one
                saveBody = {
                    "userid": $scope.connectedID,
                    "codexml": $scope.editor.blocklyXML
                    };
                newProgram = new HubPrograms(saveBody);
                    newProgram.$save(function(response) {
                    if ((response.userid == null) || (response.codeid == null)) {
                       errorCatcher.handle("Save: Error saving program", {});
                       return;
                    }
                    LogService.appLogMsg("Saved local program to hub, stored as codeid: " + response.codeid);
                    if ($scope.devMode) {
                        LogService.appLogMsg(" for userid: " + (response.userid).substring(0, 11)); // show userID in dev mode
                    }
                    $scope.activeProgramHubID = $scope.connectedID;
                    $scope.activeProgramCodeID = response.codeid;
                    $scope.activeProgram = true;
                    $scope.hubs[$scope.activeProgramHubID] = HubPrograms.query({'userid': $scope.activeProgramHubID});
                    });
            }
            // case: the program we edited doesn't belong to this hub, save it to the current hub
            else if ($scope.activeProgramHubID && $scope.connectedID && ($scope.activeProgramHubID != $scope.connectedID)){ 
               //$scope.activeProgram = $scope.hubs[$scope.activeProgramHubID][$scope.activeProgramCodeID]; // this is the program currently loaded on the workspace
               saveBody = {
                    "userid": $scope.connectedID,
                    "codexml": $scope.editor.blocklyXML
                    };
                    newProgram = new HubPrograms(saveBody);
                    newProgram.$save(function(response) {
                    if ((response.userid == null) || (response.codeid == null)) {
                       errorCatcher.handle("Save: Error saving program", {});
                       return;
                    }
                    LogService.appLogMsg("Saved program to hub, stored as codeid: " + response.codeid);
                        if ($scope.devMode) {
                            LogService.appLogMsg(" for userid: " + (response.userid).substring(0, 11)); // show userID in dev mode
                        }
                        $scope.activeProgramHubID = $scope.connectedID;
                        $scope.activeProgramCodeID = response.codeid;
                        $scope.activeProgram = true;
                        $scope.hubs[$scope.activeProgramHubID] = HubPrograms.query({'userid': $scope.activeProgramHubID});
                        });
            }

            else if ($scope.activeProgram) { // if existing usercode, UPDATE it (write back under same codeID) <<< where is userid???? <<<<<<
                // have to update active program here to reflect the hubid and code id on the workspace. it is not available after $save
                //$scope.activeProgram = $scope.hubs[$scope.activeProgramHubID][$scope.activeProgramCodeID]; // this is the program currently loaded on the workspace
                saveBody = {
                        "userid": $scope.activeProgramHubID,
                        "codexml": $scope.editor.blocklyXML,
                        "codeid": $scope.activeProgramCodeID
                    };
                     newProgram = new HubPrograms(saveBody);
                    newProgram.$save(function(response) {
                        if ((response.userid == null) || (response.codeid == null)) {
                            errorCatcher.handle("Save: Error saving program", {});
                            return;
                        }
                        LogService.appLogMsg("Updated program codeid: " + response.codeid);
                        if ($scope.devMode) {
                            LogService.appLogMsg(" for userid: " + (response.userid).substring(0, 11)); // show userID in dev mode
                        }
                    $scope.activeProgramHubID = ($scope.connectedID) ? $scope.connectedID : $scope.localID;
                    $scope.activeProgramCodeID = response.codeid;
                    $scope.activeProgram = true;
                    $scope.hubs[$scope.activeProgramHubID] = HubPrograms.query({'userid': $scope.activeProgramHubID});
                });
            }
            else {
            errorCatcher.handle("Save: Error saving program", {});
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
            $scope.isProgrammingDevice = true;
            catch_msg = "Load code: Error programming Linkitz";
	    })
	    .then($scope.generateCode)
	    .then(HexGenerator.processAssembly)
	    .then(LinkitzToy.programDevice) // in linkitztoy.js line 252 (aliased linkitzProgramDevice)
	    .then(function programSuccess() {
            $scope.isProgrammingDevice = false;
            $scope.isSigning = true;
            LogService.appLogMsg("Programming Successful. Signing...(according to toggleConnect)");
	    })
	    .then(LinkitzToy.signFlash) 
	    .then(function signSuccess() {
            $scope.isSigning = false;
            LogService.appLogMsg("Signed.");
	    })
	    .then(function () {
            catch_msg = "Load code: Error disconnecting from Linkitz";
	    })
	    .then(LinkitzToy.disconnect)
	    .then(function () {
            $scope.programmingComplete = true;
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
