// linkitztoy.js

var linkitzApp = angular.module('linkitzApp');

linkitzApp.constant('minimumFirmwareVersion', 42);
linkitzApp.factory('LinkitzToy',
    ['$q',
    '$rootScope',
    '$interval',
    'LogService',
    'Messager',
    'IntelHex',
    'LinkitzFirmware',
    function($q, $rootScope, $interval, LogService, Messager, IntelHex, LinkitzFirmware) {

    var printCommLog = function printCommLog(logmsg, detailed) {
        LogService.commLogMsg(logmsg, detailed);
    }

    var hexdumpLog = function hexdumpLog(data) {
    }

    var linkitz = new MLABootloader(printCommLog, hexdumpLog);

    var linkitzInfo = {
        isConnected: false
    }

    function linkitzConnect() {
        var lastDevice = linkitz.getLastDevice();
        var deviceId;
        if (lastDevice) {
            deviceId = linkitz.getLastDevice().deviceId;
        }
        var deferred = $q.defer();

        if ((!lastDevice) || (!deviceId)) {
            deferred.reject("No device found, not connecting.");
        } else {

        linkitz.connect(deviceId,
            function onConnect (connId) {
                linkitzInfo.isConnected = true;
                $rootScope.$evalAsync(function () {
                    deferred.resolve();
                });
            },
            function onTimeout () {
                $rootScope.$evalAsync(function () {
                    deferred.reject("Error connecting to Linkitz");
                });
            },
            function onError (reason) {
                $rootScope.$evalAsync(function () {
                    deferred.reject("Error connecting to Linkitz: \n" + reason);
                });
            });
        }

        return deferred.promise;
    }

    function linkitzDisconnect() {
        var deferred = $q.defer();

        if (linkitzInfo.isConnected) {
            linkitz.disconnect(
                function onDisconnect () {
                    linkitzInfo.isConnected = false;
                    $rootScope.$evalAsync(function () {
                        deferred.resolve();
                    });
                });
        }
        else {
            deferred.reject("Already not connected to Linkitz");
        }

        return deferred.promise;
    }

    function linkitzVerifyDevice() {
        var deferred = $q.defer();
        linkitz.queryDevice(
            function successCallback(rxbytes) {
                $rootScope.$evalAsync(function () {
                    deferred.resolve();
                });
            },
            function timeoutCallback() {
                $rootScope.$evalAsync(function () {
                    deferred.reject("Timeout verifying device.");
                });
            },
            function errorCallback() {
                $rootScope.$evalAsync(function () {
                    deferred.reject("Error verifying device.");
                });
            }
        );
        return deferred.promise;
    }

    function linkitzEraseDevice() {
        var deferred = $q.defer();

        if (linkitzInfo.isConnected) {
            linkitz.eraseDevice(
                function successCallback() {
                    $rootScope.$evalAsync(function () {
                        deferred.resolve();
                    });
                },
                function timeoutCallback() {
                    deferred.reject("Timeout erasing device.");
                },
                function errorCallback() {
                    deferred.reject("Error erasing device.");
                }
            );
        }
        else {
            deferred.reject("Not connected to Linkitz");
        }

        return deferred.promise;
    }

    function linkitzProgramDeviceFromHex(hexRecords) {
        var deferred = $q.defer();
//        LogService.appLogMsg("hexRecords:\n" + JSON.stringify(hexRecords, null, 2));

        var i = 0;
        var recordCount = hexRecords.dataRecords.length;

        var doProgramDevice = function doProgramDevice() {
            var dataRecord = hexRecords.dataRecords[i];
            var address = dataRecord.absoluteAddress;
            var bufferLength = dataRecord.buffer.length;
            var arrayBuffer = dataRecord.buffer;

            linkitz.programDevice(address, bufferLength, arrayBuffer,
                function successCallback() {
                    i++;
                    if (i < recordCount) {
                        var nextDataRecord = hexRecords.dataRecords[i];
                        var nextAddress = nextDataRecord.absoluteAddress;
//                        LogService.appLogMsg("(nextAddress,address,bufferLength) = " + "(" + nextAddress + "," + address + "," + bufferLength + ")");
                        if (nextAddress > address + bufferLength) {
                            doProgramComplete();
                        }
                        else {
                            doProgramDevice();
                        }
                    }
                    else {
                        doProgramComplete();
                    }
                },
                function timeoutCallback() {
                    deferred.reject("Timeout programming device.");
                },
                function errorCallback() {
                    deferred.reject("Error programming device.");
                }
            );
        }

        var doProgramComplete = function doProgramComplete() {
            linkitz.programComplete(
                function successCallback() {
                    if (i < recordCount) {
                        doProgramDevice();
                    }
                    else {
                        i = 0;
                        doProgramVerify();
                    }
                },
                function timeoutCallback() {
                    deferred.reject("Timeout programming device.");
                },
                function errorCallback() {
                    deferred.reject("Error programming device.");
                }
            );
        }

        var doProgramVerify = function doProgramVerify() {
            var dataRecord = hexRecords.dataRecords[i];
            var address = dataRecord.absoluteAddress;
            var bufferLength = dataRecord.buffer.length;
            var arrayBuffer = dataRecord.buffer;

            linkitz.getData(address, bufferLength,
                function successCallback(rxBuffer) {
                    for (var n = 0; n < bufferLength; n++) {
                        if (rxBuffer[n] != arrayBuffer[n]) {
                            $rootScope.$evalAsync(function () {
                                deferred.reject("Byte " + n + " in block at address " + address + " does not match record");
                            });
                        }
                    }
                    i++;
                    if (i < recordCount) {
                        doProgramVerify();
                    }
                    else {
                        LogService.appLogMsg("Program verification successful.");
                        $rootScope.$evalAsync(function () {
                            deferred.resolve();
                        });
                    }
                },
                function timeoutCallback() {
                    deferred.reject("Timeout programming device.");
                },
                function errorCallback() {
                    deferred.reject("Error programming device.");
                }
            );

        }

        doProgramDevice();
        return deferred.promise;
    }

    function linkitzReadID() {
        var deferred = $q.defer();

        var address = 0x3ff8;
        var bufferLength = 8;
        var idBuffer = new Uint16Array(4);

        linkitz.getData(address, bufferLength,
            function successCallback(rxBuffer) {
                idBuffer[0] = (rxBuffer[0] << 8) + (rxBuffer[1] & 0x3f);
                idBuffer[1] = (rxBuffer[2] << 8) + (rxBuffer[3] & 0x3f);
                idBuffer[2] = (rxBuffer[4] << 8) + (rxBuffer[5] & 0x3f);
                idBuffer[3] = (rxBuffer[6] << 8) + (rxBuffer[7] & 0x3f);
                $rootScope.$evalAsync(function () {
                    deferred.resolve(idBuffer);
                });
            },
            function timeoutCallback() {
                deferred.reject("Timeout reading device ID.");
            },
            function errorCallback() {
                deferred.reject("Error reading device ID.");
            }
        );

        return deferred.promise;
    }       

    function linkitzProgramDevice(IDHex,programHex) {
        var deferred = $q.defer();

        var programPromise = $q.all([
            LinkitzHubID.parseHex(IDHex),
            LinkitzFirmware.getLatestFirmware().then(IntelHex.parseHex),        // firmware hex
            IntelHex.parseHex(programHex)                                       // user program hex
        ])
            .then(function(parsedRecords) {
                return linkitzEraseDevice()                                     // erase flash
                    .then(function () {
                        return linkitzProgramDeviceFromHex(parsedRecords[0]);
                    })
                    .then(function () {
                        return linkitzProgramDeviceFromHex(parsedRecords[1]);   // program firmware
                    })
                    .then(function () {
                        return linkitzProgramDeviceFromHex(parsedRecords[2]);   // program user program
                    });
            })
            .then(function () {
                deferred.resolve();                                             // programming complete
            })
            .catch(function (reason) {
                deferred.reject(reason);
            });

        return deferred.promise;
    }

    function linkitzResetDevice() {
        var deferred = $q.defer();

        if (linkitzInfo.isConnected) {
            linkitz.resetDevice(
                function successCallback() {
                    $rootScope.$evalAsync(function () {
                        deferred.resolve();
                    });
                },
                function timeoutCallback() {
                    deferred.reject("Timeout resetting device.");
                },
                function errorCallback() {
                    deferred.reject("Error resetting device.");
                }
            );
        }
        else {
            deferred.reject("Not connected to Linkitz");
        }


        return deferred.promise;
    }

    function linkitzSignFlash() {
        var deferred = $q.defer();

        if (linkitzInfo.isConnected) {
            linkitz.signFlash(
                function successCallback() {
                    $rootScope.$evalAsync(function () {
                        deferred.resolve();
                    });
                },
                function timeoutCallback() {
                    deferred.reject("Timeout signing flash.");
                },
                function errorCallback() {
                    deferred.reject("Error signing flash.");
                }
            );
        }
        else {
            deferred.reject("Not connected to Linkitz");
        }


        return deferred.promise;
    }

    return {
        '$linkitz':         linkitz,
        'info':             linkitzInfo,
        'connect':          linkitzConnect,
        'disconnect':       linkitzDisconnect,
        'verifyDevice':     linkitzVerifyDevice,
        'eraseDevice':      linkitzEraseDevice,
        'programDevice':    linkitzProgramDevice,
        'resetDevice':      linkitzResetDevice,
        'signFlash':        linkitzSignFlash,
        'readID':           linkitzReadID
    };

}]);