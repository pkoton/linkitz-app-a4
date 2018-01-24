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
            deferred.reject("Could not find a Linkitz device: \n"+
                            " - Check that your Linkitz Hub is connected using a USB Petal and USB Micro cable. \n"+
                            " - Try changing which port the USB Petal is connected to on the Hub.\n"+
                            " - Try unplugging other petals.\n"+
                            " - If the hub runs out of battery it can take a while to recondition the cell, so just try waiting.\n"+
                            "Error#: 3861");
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
                    deferred.reject("Could not find a Linkitz device:\n"+
                            " - Check that your Linkitz Hub is connected using a USB Petal and USB Micro cable. \n"+
                            " - Try changing which port the USB Petal is connected to on the Hub.\n"+
                            " - Try unplugging other petals.\n"+
                            " - If the hub runs out of battery it can take a while to recondition the cell, so just try waiting.\n"+
                            "Error#: 1889");
                });
            },
            function onError (reason) {
                $rootScope.$evalAsync(function () {//                                                             |
                    deferred.reject("Could not find a Linkitz device:\n"+
                                    " - Check that your Linkitz Hub is connected using a USB Petal and USB Micro cable. \n"+
                                    " - Try changing which port the USB Petal is connected to on the Hub.\n"+
                                    " - Try unplugging other petals.\n"+
                                    " - If the hub runs out of battery it can take a while to recondition the cell, so just try waiting.\n"+
                                         "Error#: 3425");//reason is usually Invalid HID device ID
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
            deferred.reject("Already not connected to Linkitz\n" +
                            "Error#: 4100");
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
                    deferred.reject("Timeout verifying device.\n" +
                                    "Error#: 7417");
                });
            },
            function errorCallback() {
                $rootScope.$evalAsync(function () {
                    deferred.reject("Could not find a Linkitz device: \n"+
                                    " - Check that your Linkitz Hub is connected using a USB Petal and USB cable. \n"+
                                    " - Try changing which port the USB Petal is connected to on the Hub.\n "+
                                    " - If the hub has run out of battery it can take a while to recondition the cell and start again, so it may take a bit of time to connect. Just trying waiting.\n" +
                                    "Error#: 1645");
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
                    deferred.reject("Timeout erasing device.\n "+
                                    "Error#: 7535");
                },
                function errorCallback() {
                    deferred.reject("Error erasing device.\n "+
                                    "Error#: 2042");;
                }
            );
        }
        else {
            deferred.reject("Not connected to Linkitz\n "+
                            "Error#: 6507");
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
                    deferred.reject("Timeout programming device.\n "+
                            "Error#: 4109");
                },
                function errorCallback() {
                    deferred.reject("Error while programming device. It may have been unplugged during programming.\n "+
                                    "Please re-attach it and try again.\n "+
                            "Error#: 3311");
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
                    deferred.reject("Timeout programming device.\n"+
                                                "Error#: 3550");
                },
                function errorCallback() {
                    deferred.reject("Error after programming device. It may have been unplugged during programming or verification.\n "+
                                    "Please re-attach it and try again.\n "+
                            "Error#: 8462");
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
                                deferred.reject("Something went wrong while programming Linkitz. Please try again, and if that fails, send an email to support@linkitz.com.\n"+
                                                "Byte " + n + " in block at address " + address + " does not match record.\n"+
                                                "Error#: 1031");
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
                    deferred.reject("Timeout programming device.\n"+
                                                "Error#: 1124");
                },
                function errorCallback() {
                    deferred.reject("Error programming device.\n"+
                                                "Error#: 9020");
                }
            );

        }

        doProgramDevice();
        return deferred.promise;
    }

    function linkitzReadID() {
        var deferred = $q.defer();

        var address = 0x11C0;
        var bufferLength = 64;
        var idBuffer = new Uint8Array(32);

        linkitz.getData(address, bufferLength,
            function successCallback(rxBuffer) {
                for(i=0;i<64;i+=2){
                    idBuffer[i/2] = rxBuffer[i];
                }
                //idBuffer[0] =(rxBuffer[0] << 8) + (rxBuffer[1] & 0x3f);
                //idBuffer[1] = (rxBuffer[2] << 8) + (rxBuffer[3] & 0x3f);
                //idBuffer[2] = (rxBuffer[4] << 8) + (rxBuffer[5] & 0x3f);
                //idBuffer[3] = (rxBuffer[6] << 8) + (rxBuffer[7] & 0x3f);
                
                $rootScope.$evalAsync(function () {
                    deferred.resolve(idBuffer);
                });
            },
            function timeoutCallback() {
                deferred.reject("Timeout programming device.\n"+
                                                "Error#: 1134");
            },
            function errorCallback() {
                deferred.reject("Error programming device.\n"+
                                                "Error#: 9030");
            }
        );

        return deferred.promise;
    }

    function linkitzProgramDevice(programHex) {
        var deferred = $q.defer();

        var programPromise = $q.all([
            LinkitzFirmware.getLatestFirmware().then(IntelHex.parseHex),        // firmware hex
            IntelHex.parseHex(programHex)                                       // user program hex
        ])
            .then(function(parsedRecords) {
                return linkitzEraseDevice()                                     // erase flash
                    .then(function () {
                        return linkitzProgramDeviceFromHex(parsedRecords[0]);   // program firmware
                    })
                    .then(function () {
                        return linkitzProgramDeviceFromHex(parsedRecords[1]);   // program user program
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
                    deferred.reject("Timeout resetting device.\n"+
                                                "Error#: 2907");
                },
                function errorCallback() {
                    deferred.reject("Error resetting device.\n"+
                                                "Error#: 8758");
                }
            );
        }
        else {
            deferred.reject("Not connected to Linkitz\n"+
                                                "Error#: 5806");
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
                    deferred.reject("Timeout signing flash.\n"+
                                                "Error#: 6426");
                },
                function errorCallback() {
                    deferred.reject("Error signing flash.\n"+
                                                "Error#: 3405");
                }
            );
        }
        else {
            deferred.reject("Not connected to Linkitz\n"+
                                                "Error#: 9816");
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