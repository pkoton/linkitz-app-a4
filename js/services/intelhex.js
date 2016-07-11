// intelhex.js

// substantial portions adapted from https://github.com/bminer/intel-hex.js
// license follows below

/*
The MIT License (MIT)

Copyright (c) 2013. Blake C. Miner.
http://blakeminer.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var linkitzApp = angular.module('linkitzApp');

linkitzApp.factory('IntelHex', ['$rootScope', 'LogService', '$q', function($rootScope, LogService, $q) {

    // Intel Hex record types
    const DATA = 0,
          END_OF_FILE = 1,
          EXT_SEGMENT_ADDR = 2,
          START_SEGMENT_ADDR = 3,
          EXT_LINEAR_ADDR = 4,
          START_LINEAR_ADDR = 5;

    const EMPTY_VALUE = 0xFF;

    function parseIntelHex(data) {

        var deferred = $q.defer();

        // initialization
        var highAddress = 0;

        var startSegmentAddress = null,
            startLinearAddress = null,
            lineNum = 0, //Line number in the Intel Hex string
            pos = 0; //Current position in the Intel Hex string

        const SMALLEST_LINE = 11;

        var records = [];

        var doneProcessing = false;
        while (!doneProcessing)
        {
            //Parse an entire line
            if(data.charAt(pos++) != ":")
                throw new Error("Line " + (lineNum+1) +
                    " does not start with a colon (:).");
            else
                lineNum++;

            // number of bytes (hex digit pairs) in the data field
            var dataLength = parseInt(data.substr(pos, 2), 16);
            pos += 2;

            // 16-bit address (big-endian)
            var lowAddress = parseInt(data.substr(pos, 4), 16);
            pos += 4;

            // record type
            var recordType = parseInt(data.substr(pos, 2), 16);
            pos += 2;

            // data field (hex-encoded string)
            var dataFieldText = data.substr(pos, dataLength * 2);
            var dataFieldBuffer = new Uint8Array(dataLength);
            for (var i = 0; i < dataLength; i++) {
                dataFieldBuffer[i] = parseInt(dataFieldText.substr(i * 2, 2), 16);
            }
            pos += dataLength * 2;

            // checksum
            var checksum = parseInt(data.substr(pos, 2), 16);
            pos += 2;

            // validate checksum
            var calcChecksum = (dataLength + (lowAddress >> 8) + lowAddress + recordType) & 0xFF;
            for(var i = 0; i < dataLength; i++)
                calcChecksum = (calcChecksum + dataFieldBuffer[i]) & 0xFF;
            calcChecksum = (0x100 - calcChecksum) & 0xFF;

            if(checksum != calcChecksum) {
                deferred.reject("Invalid checksum on line " + lineNum + ": got " + checksum + ", but expected " + calcChecksum);
                doneProcessing = true;
                break;
            }

            switch(recordType)
            {
                case DATA:
                    var absoluteAddress = highAddress + lowAddress;
                    records.push({
                        "absoluteAddress": absoluteAddress,
                        "buffer": dataFieldBuffer
                    });
                    break;

                case END_OF_FILE:
                    if (dataLength != 0) {
                        deferred.reject("Invalid EOF record on line " + lineNum + ".");
                        doneProcessing = true;
                    }
                    deferred.resolve({
                        "dataRecords": records,
                        "startSegmentAddress": startSegmentAddress,
                        "startLinearAddress": startLinearAddress
                    });
                    doneProcessing = true;
                    break;

                case EXT_SEGMENT_ADDR:
                    if(dataLength != 2 || lowAddress != 0) {
                        deferred.reject("Invalid extended segment address record on line " + lineNum + ".");
                        doneProcessing = true;
                    }
                    highAddress = parseInt(dataField, 16) << 4;
                    break;

                case START_SEGMENT_ADDR:
                    if(dataLength != 4 || lowAddress != 0) {
                        deferred.reject("Invalid start segment address record on line " + lineNum + ".");
                        doneProcessing = true;
                    }
                    startSegmentAddress = parseInt(dataField, 16);
                    break;

                case EXT_LINEAR_ADDR:
                    if(dataLength != 2 || lowAddress != 0) {
                        deferred.reject("Invalid extended linear address record on line " + lineNum + ".");
                        doneProcessing = true;
                    }
                    highAddress = parseInt(dataField, 16) << 16;
                    break;

                case START_LINEAR_ADDR:
                    if(dataLength != 4 || lowAddress != 0) {
                        deferred.reject("Invalid start linear address record on line " + lineNum + ".");
                        doneProcessing = true;
                    }
                    startLinearAddress = parseInt(dataField, 16);
                    break;

                default:
                    deferred.reject("Invalid record type (" + recordType + ") on line " + lineNum);
                    doneProcessing = true;
                    break;
            }

            // advance to the next line
            if(data.charAt(pos) == "\r")
                pos++;
            if(data.charAt(pos) == "\n")
                pos++;

            if (pos + SMALLEST_LINE > data.length) {
                deferred.reject("Unexpected end of input: missing or invalid EOF record.");
                doneProcessing = true;
            }
        }

        return deferred.promise;
    }


    return{
    	parseHex: parseIntelHex,
    };

}]);
