(function() {
    'use strict';

    angular
        .module('kmd-datetimepicker')
        .directive('datetimepicker', datetimepickerDirective);

    datetimepickerDirective.$inject = [];
    function datetimepickerDirective() {
        var directive = {
            scope: {},
            bindToController: {
                options: '=datetimepickerOptions',
                ngModel: '='
            },
            controller: 'datetimepickerController',
            controllerAs: 'vm',
            restrict: 'A',
            require: 'ngModel'
        };
        
        return directive;
    }
})();