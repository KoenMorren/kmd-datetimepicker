(function() {
    'use strict';

    angular
        .module('kmd-datetimepicker')
        .directive('datetimepicker', datetimepickerDirective);

    datetimepickerDirective.$inject = [];
    function datetimepickerDirective() {
        var directive = {
            controller: 'datetimepickerController',
            controllerAs: 'dtpCtrl',
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attrs, ngModel) {
                //necessary due to inherited scope
                scope.$watch(function() { return scope.ngModel; }, function(newVal, oldVal) {
                    ngModel.$setViewValue(scope.ngModel);
                    ngModel.$render(); 
                });
                
                scope.$watch(function() { return scope.$eval(attrs.datetimepickerOptions); }, function(newVal, oldVal) {
                    scope.datetimepickerOptions = scope.$eval(attrs.datetimepickerOptions);
                    scope.dtpCtrl.applyOptions(); 
                });
            }
        };
        
        return directive;
    }
})();