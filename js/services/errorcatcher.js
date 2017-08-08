// errors.js

var linkitzApp = angular.module('linkitzApp');

linkitzApp.factory('errorCatcher', ['$rootScope', '$uibModal', function($rootScope, $uibModal) {

	function errorReporter (message, reason) {
		var errorObject = {message: message, reason: reason};

		//$rootScope.addError({message: message, reason: reason});
       	console.log(errorObject);

        $uibModal.open(
            {
                templateUrl: 'partials/modals/alert.html',
                controller: 'AlertController',
                resolve:
                    {
                        errorObject: function () {
                            return errorObject;
                        }
                    }
            }
        );
	}

    function warningReporter (message, reason) {
        var errorObject = {message: message, reason: reason};

        //$rootScope.addError({message: message, reason: reason});
        console.log(errorObject);

        $uibModal.open(
            {
                templateUrl: 'partials/modals/warning.html',
                controller: 'AlertController',
                resolve:
                    {
                        errorObject: function () {
                            return errorObject;
                        }
                    }
            }
        );
    }
	
function confirmDialogMix(title, message, doThisFunc) {
		title = title || "Confirm...";
		message = message || "you may want to click cancel...";
		var confirmObject = {title: title, message: message};
		var ctrlr = function($rootScope,$scope, $uibModalInstance) {
			$scope.confirmObject = confirmObject;
            var init = function() {
                $scope.cancelStep = cancelStep;
                $scope.okStep = okStep;
            };

            function cancelStep() {
                $uibModalInstance.dismiss('dismissed');
            }
            function okStep() {
                reason = true;
                doThisFunc();
                $uibModalInstance.close();
            }

            init();
        };

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'partials/modals/confirm.html',
            //controller: 'confirmController',
			controller: ctrlr,
            size: 'sm',
            backdrop: 'static'
        });

// this is not currently used but works and might be userful later
//        modalInstance.result.then(function(submitVar) {
//			console.log("in errorcatcher2, confirmObject: " + JSON.stringify(confirmObject));
//			console.log("sumbited value inside parent controller: " + submitVar);
//		})
}


    return {
        catch: function (message) {
            return function (reason) {
            	errorReporter(message, reason);
            };
        },
        handle: function (message, reason) {
        	errorReporter(message, reason);
        },
        warning: function (message, reason) {
            warningReporter(message, reason);
        },
		confirm: function (title, message, doThisFunc) {
            confirmDialogMix(title, message, doThisFunc);
        }
    };

}]);