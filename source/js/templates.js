(function () {
  "use strict";

  angular.module('kmd-datetimepicker')
         .run(['$templateCache', function($templateCache) {
    $templateCache.put('/source/templates/datepicker.day.html','<table class=\"kmd-datepicker-day\"><tr><th data-ng-repeat=\"day in vm.daysOfWeek\" data-ng-bind=\"day\"></th></tr><tr data-ng-repeat=\"week in vm.daysOnCalendar\"><td data-ng-repeat=\"day in week\"><div class=\"kmd-button\" data-ng-bind=\"day.label\" data-ng-class=\"{\'day-not-in-selected-month\': !day.inSelectedMonth, \'day-is-today\': vm.isCurrentDay(day.date), \'day-is-selected\': vm.isSelectedDay(day.date), \'day-is-disabled\': day.isDisabled}\" data-ng-mousedown=\"vm.selectDay($event, day.isDisabled, day.date)\"></div></td></tr></table>');
    $templateCache.put('/source/templates/datepicker.html','<div class=\"kmd-datepicker\"><div class=\"kmd-row\"><div class=\"kmd-button kmd-prev\" data-ng-mousedown=\"vm.datepickerPrevious($event)\"><i class=\"fa fa-fw fa-chevron-left\"></i></div><div class=\"kmd-button kmd-switch\" data-ng-mousedown=\"vm.decreaseDatepickerViewLevel($event)\" data-ng-bind=\"vm.currents.datepickerSwitchLabel\"></div><div class=\"kmd-button kmd-next\" data-ng-mousedown=\"vm.datepickerNext($event)\"><i class=\"fa fa-fw fa-chevron-right\"></i></div></div><div class=\"kmd-row\" data-ng-include=\"vm.dateSelectionTemplate\"></div><div class=\"kmd-row\"><div class=\"kmd-button kmd-timeswitch\" data-ng-mousedown=\"vm.switchMode($event, \'time\')\"><i class=\"fa fa-fw fa-clock-o\"></i></div></div></div>');
    $templateCache.put('/source/templates/datepicker.month.html','<table class=\"kmd-datepicker-month\"><tr data-ng-repeat=\"trimester in vm.months\"><td data-ng-repeat=\"month in trimester\"><div class=\"kmd-button\" data-ng-bind=\"month.label\" data-ng-mousedown=\"vm.selectMonth($event, month.month)\"></div></td></tr></table>');
    $templateCache.put('/source/templates/datepicker.year.html','<table class=\"kmd-datepicker-year\"><tr data-ng-repeat=\"trimester in vm.years\"><td data-ng-repeat=\"year in trimester\"><div class=\"kmd-button\" data-ng-bind=\"year.label\" data-ng-mousedown=\"vm.selectYear($event, year.year)\"></div></td></tr></table>');
    $templateCache.put('/source/templates/picker_container.html','<div class=\"kmd-datetimepicker\" ng-include=\"vm.template\"></div>');
    $templateCache.put('/source/templates/timepicker.granular.html','<div class=\"kmd-timepicker\" data-ng-if=\"vm.hasTime() && vm.currents.granularity\"><div class=\"kmd-row\"><div class=\"kmd-button kmd-timeswitch\" data-ng-mousedown=\"vm.switchMode($event, \'time\')\"><i class=\"fa fa-fw fa-clock-o\"></i></div></div><div class=\"kmd-row\" data-ng-if=\"vm.isEnabled(vm.currents.granularity)\"><table data-ng-init=\"rows = vm.getValues(vm.currents.granularity)\"><tr data-ng-repeat=\"row in rows\"><td data-ng-repeat=\"col in row\"><div class=\"kmd-button\" data-ng-bind=\"col.name\" data-ng-mousedown=\"vm.setValue($event, vm.currents.granularity, col.value)\"></div></td></tr></table></div></div>');
    $templateCache.put('/source/templates/timepicker.html','<div class=\"kmd-timepicker\"><div class=\"kmd-row\" data-ng-if=\"vm.hasDate()\"><div class=\"kmd-button kmd-dateswitch\" data-ng-mousedown=\"vm.switchMode($event, \'date\')\"><i class=\"fa fa-fw fa-calendar\"></i></div></div><div class=\"kmd-row\"><table><tr><td data-ng-if=\"vm.isEnabled(\'h\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.increment($event, \'h\')\"><i class=\"fa fa-fw fa-chevron-up\"></i></div></td><td data-ng-if=\"vm.isEnabled(\'h\') && vm.isEnabled(\'m\')\"></td><td data-ng-if=\"vm.isEnabled(\'m\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.increment($event, \'m\')\"><i class=\"fa fa-fw fa-chevron-up\"></i></div></td><td data-ng-if=\"(vm.isEnabled(\'h\') || vm.isEnabled(\'m\')) && vm.isEnabled(\'s\')\"></td><td data-ng-if=\"vm.isEnabled(\'s\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.increment($event, \'s\')\"><i class=\"fa fa-fw fa-chevron-up\"></i></div></td><td data-ng-if=\"vm.defaults.usePeriod\"></td></tr><tr><td data-ng-if=\"vm.isEnabled(\'h\')\"><div class=\"kmd-button\" data-ng-bind=\"vm.getCurrent(\'h\')\" data-ng-mousedown=\"vm.switchMode($event, \'h\')\"></div></td><td data-ng-if=\"vm.isEnabled(\'h\') && vm.isEnabled(\'m\')\">:</td><td data-ng-if=\"vm.isEnabled(\'m\')\"><div class=\"kmd-button\" data-ng-bind=\"vm.getCurrent(\'m\')\" data-ng-mousedown=\"vm.switchMode($event, \'m\')\"></div></td><td data-ng-if=\"(vm.isEnabled(\'h\') || vm.isEnabled(\'m\')) && vm.isEnabled(\'s\')\">:</td><td data-ng-if=\"vm.isEnabled(\'s\')\"><div class=\"kmd-button\" data-ng-bind=\"vm.getCurrent(\'s\')\" data-ng-mousedown=\"vm.switchMode($event, \'s\')\"></div></td><td data-ng-if=\"vm.defaults.usePeriod\"><div class=\"kmd-button kmd-button-active\" data-ng-bind=\"vm.getCurrentPeriod()\" data-ng-mousedown=\"vm.togglePeriod($event);\"></div></td></tr><tr><td data-ng-if=\"vm.isEnabled(\'h\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.decrement($event, \'h\')\"><i class=\"fa fa-fw fa-chevron-down\"></i></div></td><td data-ng-if=\"vm.isEnabled(\'h\') && vm.isEnabled(\'m\')\"></td><td data-ng-if=\"vm.isEnabled(\'m\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.decrement($event, \'m\')\"><i class=\"fa fa-fw fa-chevron-down\"></i></div></td><td data-ng-if=\"(vm.isEnabled(\'h\') || vm.isEnabled(\'m\')) && vm.isEnabled(\'s\')\"></td><td data-ng-if=\"vm.isEnabled(\'s\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.decrement($event, \'s\')\"><i class=\"fa fa-fw fa-chevron-down\"></i></div></td><td data-ng-if=\"vm.defaults.usePeriod\"></td></tr></table></div></div>');
  }]);
})();