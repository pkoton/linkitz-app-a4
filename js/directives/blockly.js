'use strict';

// blockly.js
// Binds the Blockly editor into the DOM

angular.module('ui.blockly', [])
    .directive('uiBlockly', ['$timeout', '$window', function ($timeout, $window) {

    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
        template: '<iframe class="blockly-frame" src="blocklyframe.html"></iframe>',
        link: function (scope, elm, attrs, ngModel) {

            var opts = scope.$eval(attrs.uiBlockly);
            var lastXML = '';

            var messageHandlers = {
                onBlocklyLoaded: function onBlocklyLoaded(arg) {
                    setBlocklyXML(lastXML);
                    if (angular.isFunction(opts.onLoad)) {
                        var callback = opts.onLoad;
                        scope.$apply(function () {
                            callback(elm[0]);
                        });
                    }
                },
                onBlocklyChanged: function onBlocklyChanged (arg) {
                    lastXML = arg;
                    if (angular.isDefined(ngModel)) {
                        scope.$apply(function () {
                            ngModel.$setViewValue(lastXML);
                            if (angular.isFunction(opts.onChange)) {
                                var callback = opts.onChange;
                                callback(lastXML, elm[0]);
                            }
                        });
                    }
                },
                onBlocklyGenerate: function onBlocklyGenerate (arg, exceptn) {
                    var generatedCode = arg;
                    if (angular.isFunction(opts.onGenerate)) {
                        var callback = opts.onGenerate;
                        scope.$apply(function () {
                            callback(generatedCode, elm[0], exceptn);
                        });
                    }
                }
            }

            function receiveMessage(event) {
                var eventData = event.data;
                var handlerMethod = messageHandlers[eventData.method];
                var arg = eventData.arg;
                var exn = eventData.exceptn;

                if (handlerMethod) {
                    handlerMethod(arg, exn);
                }
            }
            $window.addEventListener("message", receiveMessage, false);

            var setBlocklyHighlight = function setBlocklyHighlight (blockid) {
                var blocklyFrame = elm[0].querySelector('iframe');
                blocklyFrame.contentWindow.postMessage({method: 'setBlocklyHighlight', arg: blockid}, '*');
            };

            var setBlocklyXML = function setBlocklyXML(xml) {
                var blocklyFrame = elm[0].querySelector('iframe');
                blocklyFrame.contentWindow.postMessage({method: 'setBlocklyXML', arg: xml}, '*');
            };

            if (angular.isDefined(ngModel)) {
                ngModel.$formatters.push(function (value) {
                    if (angular.isUndefined(value) || value === null) {
                        return '';
                    } else if (angular.isObject(value) || angular.isArray(value)) {
                        throw new Error('ui-blockly cannot use an object or an array as a model');
                    }
                    return value;
                });
                ngModel.$render = function () {
                    lastXML = ngModel.$viewValue;
                    setBlocklyXML(lastXML);
                };
            }

        }
    };

}]);
