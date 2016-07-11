// editor.js

angular.module('linkitzApp').controller('EditorController', ['$scope', '$timeout', 'LogService', function($scope, $timeout, LogService) {

    var extensionMap = {
        "xml": "blockly",
    }

    var contentTypeMap = {
        "blockly": "partials/blocklyeditor.html"
    }

    var nextSessionIndex = 1;

    $scope.blocklyExtension = "xml";

    $scope.editors = {};
    $scope.files = {};
    $scope.currentEditor = {};

    $scope.onBlocklyEditorLoaded = function onBlocklyEditorLoaded (blocklyElement) {
//        LogService.appLogMsg('loaded blockly');
        $scope.editor.blocklyFrameElement = blocklyElement.querySelector('iframe');
    }

    $scope.onBlocklyEditorChange = function onBlocklyEditorChange (xml, blocklyElement) {
//        LogService.appLogMsg('updated XML from blockly:\n' + xml);
        $scope.editor.blocklyXML = xml;
        $scope.editor.dirty = true;
    }

    $scope.onBlocklyEditorGenerate = function onBlocklyEditorGenerate(code, blocklyElement) {
        $scope.editor.deferredCode.resolve(code);
    }

    var getFileContentType = function getFileContentType (extension) {
        if (extensionMap[extension]) {
            return extensionMap[extension];
        }
        else {
            return "unknown";
        }
    }

    $scope.getEditorTemplate = function getEditorTemplate (contenttype) {
        if (contentTypeMap[contenttype]) {
            return contentTypeMap[contenttype];
        }
        else {
            return "partials/noeditor.html";
        }
    }

}]);