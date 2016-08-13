//  Initial code for Linkitz MLA bootloader

const packetSize = 64;

const commandTimeout = 1000;

const commandMap = {
    "QUERY_DEVICE": { commandId: 0x02, name: "QUERY_DEVICE" },
    "UNLOCK_CONFIG": { commandId: 0x03, name: "UNLOCK_CONFIG" },
    "ERASE_DEVICE": { commandId: 0x04, name: "ERASE_DEVICE" },
    "PROGRAM_DEVICE": { commandId: 0x05, name: "PROGRAM_DEVICE" },
    "PROGRAM_COMPLETE": { commandId: 0x06, name: "PROGRAM_COMPLETE" },
    "GET_DATA": { commandId: 0x07, name: "GET_DATA" },
    "RESET_DEVICE": { commandId: 0x08, name: "RESET_DEVICE" },
    "SIGN_FLASH": { commandId: 0x09, name: "SIGN_FLASH" },
    "QUERY_EXTENDED_INFO": { commandId: 0x0C, name: "QUERY_EXTENDED_INFO" }
};

var byteToHex = function byteToHex(value) {
    if (value < 16)
        return '0' + value.toString(16);
    return value.toString(16);
};

var dumpPacket = function dumpPacket(bytes) {
    var log = '';
    for (var i = 0; i < bytes.length; i += 16) {
        var sliceLength = Math.min(bytes.length - i, 16);
        var lineBytes = new Uint8Array(bytes.buffer, i, sliceLength);
        for (var j = 0; j < lineBytes.length; ++j) {
            log += byteToHex(lineBytes[j]) + ' ';
        }
        for (var j = 0; j < lineBytes.length; ++j) {
            var ch = String.fromCharCode(lineBytes[j]);
            if (lineBytes[j] < 32 || lineBytes[j] > 126)
                ch = '.';
            log += ch;
        }
        log += '\n';
    }
    log += "================================================================\n";
    return log;
};

function MLABootloader(logCallback, hexdumpCallback) {
    this.devices = {};
    this.lastDeviceFound = null;

    this.conn = null;
    this.commLock = false;

    this.logCallback = logCallback;
    this.hexdumpCallback = hexdumpCallback;

    this.enumerateDevices();
}

MLABootloader.prototype.getLastDevice = function getLastDevice () {
    return this.lastDeviceFound;
}

MLABootloader.prototype.enumerateDevices = function enumerateDevices () {
    chrome.hid.getDevices({}, this.onDevicesEnumerated.bind(this));
    chrome.hid.onDeviceAdded.addListener(this.onDeviceAdded.bind(this));
    chrome.hid.onDeviceRemoved.addListener(this.onDeviceRemoved.bind(this));
}

MLABootloader.prototype.onDevicesEnumerated = function onDevicesEnumerated (devices) {
    if (chrome.runtime.lastError) {
        var errorinfo = "Unable to enumerate devices: " + chrome.runtime.lastError.message;
        if (this.logCallback) this.logCallback(errorinfo);
        if (errorCallback) errorCallback(errorinfo);
        return;
    }

    for (var device of devices) {
        this.onDeviceAdded(device);
    }
}

MLABootloader.prototype.onDeviceAdded = function onDeviceAdded (device) {
    var deviceName = 'device-' + device.deviceId;
    if (this.devices[deviceName]) {
        return;
    }
    else {
        this.devices[deviceName] = device;
        this.lastDeviceFound = device;
    }
}

MLABootloader.prototype.onDeviceRemoved = function onDeviceRemoved (device) {
    var deviceName = 'device-' + device.deviceId;
    if (!this.devices[deviceName]) {
        return;
    }
    else {
        delete this.devices[deviceName];
    }
}

MLABootloader.prototype.connect = function(deviceId, connectCallback, timeoutCallback, errorCallback) {
    if (this.logCallback) this.logCallback('Attempting connection to bootloader on device: ' + deviceId);

    chrome.hid.connect(deviceId, function (connInfo) {
        if (chrome.runtime.lastError) {
            var errorMessage = chrome.runtime.lastError.message;
            if (this.logCallback) this.logCallback("Error connecting to bootloader on device: " + deviceId + ", cause: " + errorMessage);
            if (errorCallback) errorCallback(errorMessage);
            return;
        }

        if (this.logCallback) this.logCallback("Connection opened.");

        if (!connInfo) {
            if (this.logCallback) this.logCallback("Error connecting to bootloader on device: " + deviceId);
            if (errorCallback) errorCallback();
            return;
        }
        else {
            this.conn = connInfo;
            var connId = connInfo.connectionId;
            if (connectCallback) connectCallback(connId);
        }
    }.bind(this));
}

MLABootloader.prototype.disconnect = function(disconnectCallback) {
    if (this.conn) {
        var connId = this.conn.connectionId;

        if (this.logCallback) this.logCallback('(' + connId + ') disconnecting');
        chrome.hid.disconnect(connId, function () {
            if (chrome.runtime.lastError) {
                var errorMessage = chrome.runtime.lastError.message;
                if (this.logCallback) this.logCallback("Error disconnecting connection: " + connId + ", cause: " + errorMessage);
                return;
            }

            if (this.logCallback) this.logCallback('(' + connId + ') close successful');
            this.conn = null;
            if (disconnectCallback) disconnectCallback();
        }.bind(this));
    }
}

MLABootloader.prototype.sendCommand = function sendCommand (txbytes, txCallback, timeoutCallback, errorCallback) {
    if (!this.conn) {
        var errorinfo = 'Cannot send command packet, not connected';
        if (this.logCallback) this.logCallback(errorinfo);
        if (errorCallback) errorCallback(errorinfo);
        return;
    }
    var connId = this.conn.connectionId;
    var reportId = 0;

    if (this.commLock) {
        var errorinfo = 'Communications link is busy, cannot execute command.';
        if (this.logCallback) this.logCallback(errorinfo);
        if (errorCallback) errorCallback(errorinfo)
        return;
    }
    this.commLock = true;

    this.logCallback(">>\n" + dumpPacket(txbytes));
    chrome.hid.send(connId, reportId, txbytes.buffer, function () {
        this.commLock = false;
        if (chrome.runtime.lastError) {
            var errorMessage = chrome.runtime.lastError.message;
            if (this.logCallback) this.logCallback("Error sending command on connection: " + connId + ", cause: " + errorMessage);
            if (errorCallback) errorCallback(errorMessage);
            return;
        }
        if (txCallback) txCallback();
    }.bind(this));
}

MLABootloader.prototype.getResponse = function getResponse (rxCallback, timeoutCallback, errorCallback) {
    if (!this.conn) {
        var errorinfo = 'Cannot get response packet, not connected';
        if (this.logCallback) this.logCallback(errorinfo);
        if (errorCallback) errorCallback(errorinfo);
        return;
    }
    var connId = this.conn.connectionId;

    if (this.commLock) {
        var errorinfo = 'Communications link is busy, cannot execute command.';
        if (this.logCallback) this.logCallback(errorinfo);
        if (errorCallback) errorCallback(errorinfo)
        return;
    }
    this.commLock = true;

    chrome.hid.receive(connId, function (reportId, rxbuffer) {
        this.commLock = false;

        if (chrome.runtime.lastError) {
            var errorMessage = chrome.runtime.lastError.message;
            if (this.logCallback) this.logCallback("Error receiving response on connection: " + connId + ", cause: " + errorMessage);
            if (errorCallback) errorCallback(errorMessage);
            return;
        }

        var rxbytes = new Uint8Array(rxbuffer);
        this.logCallback("<<\n" + dumpPacket(rxbytes));
        if (rxCallback) rxCallback(rxbytes);
    }.bind(this));
}

MLABootloader.prototype.queryDevice = function (successCallback, timeoutCallback, errorCallback) {
    var txbytes = new Uint8Array(packetSize);
    txbytes[0] = commandMap.QUERY_DEVICE.commandId;
    this.sendCommand(txbytes, function () {
        this.getResponse(function (rxbytes) {
            if (successCallback) successCallback(rxbytes);
        });
    }.bind(this), timeoutCallback, errorCallback);
}

MLABootloader.prototype.unlockConfig = function (lock, successCallback, timeoutCallback, errorCallback) {
    var txbytes = new Uint8Array(packetSize);
    txbytes[0] = commandMap.UNLOCK_CONFIG.commandId;
    txbytes[1] = (lock) ? 1 : 0;

    this.sendCommand(txbytes, function () {
        if (successCallback) successCallback();
    }, timeoutCallback, errorCallback);
}

MLABootloader.prototype.eraseDevice = function (successCallback, timeoutCallback, errorCallback) {
    var txbytes = new Uint8Array(packetSize);
    txbytes[0] = commandMap.ERASE_DEVICE.commandId;

    this.sendCommand(txbytes, function () {
        if (successCallback) successCallback();
    }, timeoutCallback, errorCallback);
}

MLABootloader.prototype.programDevice = function (address, size, data, successCallback, timeoutCallback, errorCallback) {
    var txbytes = new Uint8Array(packetSize);
    var addressView = new DataView(txbytes.buffer, 1, 4);
    var dataOffset = 64 - size;

    txbytes[0] = commandMap.PROGRAM_DEVICE.commandId;           // byte 0
    addressView.setUint32(0, address, true);                    // bytes 1-4
    txbytes[5] = size;                                          // byte 5
    for (var i = 0; i < size; i++) {
        txbytes[dataOffset + i] = data[i];
    }

    this.sendCommand(txbytes, function () {
        if (successCallback) successCallback();
    }, timeoutCallback, errorCallback);
}

MLABootloader.prototype.programComplete = function (successCallback, timeoutCallback, errorCallback) {
    var txbytes = new Uint8Array(packetSize);
    txbytes[0] = commandMap.PROGRAM_COMPLETE.commandId;

    this.sendCommand(txbytes, function () {
        if (successCallback) successCallback();
    }, timeoutCallback, errorCallback);
}

MLABootloader.prototype.getData = function (address, size, rxCallback, timeoutCallback, errorCallback) {
    var txbytes = new Uint8Array(packetSize);
    var addressView = new DataView(txbytes.buffer, 1, 4);
    var dataOffset = 64 - size;

    txbytes[0] = commandMap.GET_DATA.commandId;                 // byte 0
    addressView.setUint32(0, address, true);                    // bytes 1-4
    txbytes[5] = size;                                          // byte 5

    this.sendCommand(txbytes, function () {
        this.getResponse(function (rxbytes) {
            var rxBuffer = new Uint8Array(size);
            for (var i = 0; i < size; i++) {
                rxBuffer[i] = rxbytes[dataOffset + i];
            }
            if (rxCallback) rxCallback(rxBuffer);
        }, timeoutCallback, errorCallback);
    }.bind(this), timeoutCallback, errorCallback);
}

MLABootloader.prototype.resetDevice = function (successCallback, timeoutCallback, errorCallback) {
    var txbytes = new Uint8Array(packetSize);
    txbytes[0] = commandMap.RESET_DEVICE.commandId;

    this.sendCommand(txbytes, function () {
        if (successCallback) successCallback();
    }, timeoutCallback, errorCallback);
}

MLABootloader.prototype.signFlash = function (successCallback, timeoutCallback, errorCallback) {
    var txbytes = new Uint8Array(packetSize);
    txbytes[0] = commandMap.SIGN_FLASH.commandId;

    this.sendCommand(txbytes, function () {
        if (successCallback) successCallback();
    }, timeoutCallback, errorCallback);
}

MLABootloader.prototype.queryExtendedInfo = function (successCallback, timeoutCallback, errorCallback) {
    var txbytes = new Uint8Array(packetSize);
    txbytes[0] = commandMap.QUERY_EXTENDED_INFO.commandId;
    this.sendCommand(txbytes, function () {
        this.getResponse(function (rxbytes) {
            if (successCallback) successCallback(rxbytes);
        });
    }, timeoutCallback, errorCallback);
}
