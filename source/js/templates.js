(function () {
  "use strict";

  angular.module('kmd-datetimepicker')
         .run(['$templateCache', function($templateCache) {
    $templateCache.put('/source/templates/datepicker.day.html','<table class=\"kmd-datepicker-day\"><tr><th data-ng-repeat=\"day in dtpCtrl.daysOfWeek\" data-ng-bind=\"day\"></th></tr><tr data-ng-repeat=\"week in dtpCtrl.daysOnCalendar\"><td data-ng-repeat=\"day in week\"><div class=\"kmd-button\" data-ng-bind=\"day.label\" data-ng-class=\"{\'day-not-in-selected-month\': !day.inSelectedMonth, \'day-is-today\': dtpCtrl.isCurrentDay(day.date), \'day-is-selected\': dtpCtrl.isSelectedDay(day.date), \'day-is-disabled\': day.isDisabled}\" data-ng-mousedown=\"dtpCtrl.selectDay($event, day.isDisabled, day.date)\"></div></td></tr></table>');
    $templateCache.put('/source/templates/datepicker.html','<div class=\"kmd-datepicker\"><div class=\"kmd-row\"><div class=\"kmd-button kmd-prev\" data-ng-mousedown=\"dtpCtrl.datepickerPrevious($event)\"><i data-ng-class=\"dtpCtrl.icons.previous\"></i></div><div class=\"kmd-button kmd-switch\" data-ng-mousedown=\"dtpCtrl.decreaseDatepickerViewLevel($event)\" data-ng-bind=\"dtpCtrl.currents.datepickerSwitchLabel\"></div><div class=\"kmd-button kmd-next\" data-ng-mousedown=\"dtpCtrl.datepickerNext($event)\"><i data-ng-class=\"dtpCtrl.icons.next\"></i></div></div><div class=\"kmd-row\" data-ng-include=\"dtpCtrl.dateSelectionTemplate\"></div><div class=\"kmd-row\" data-ng-if=\"dtpCtrl.hasTime()\"><div class=\"kmd-button kmd-timeswitch\" data-ng-mousedown=\"dtpCtrl.switchMode($event, \'time\')\"><i data-ng-class=\"dtpCtrl.icons.clock\"></i></div></div></div>');
    $templateCache.put('/source/templates/datepicker.month.html','<table class=\"kmd-datepicker-month\"><tr data-ng-repeat=\"trimester in dtpCtrl.months\"><td data-ng-repeat=\"month in trimester\"><div class=\"kmd-button\" data-ng-bind=\"month.label\" data-ng-mousedown=\"dtpCtrl.selectMonth($event, month.month)\"></div></td></tr></table>');
    $templateCache.put('/source/templates/datepicker.year.html','<table class=\"kmd-datepicker-year\"><tr data-ng-repeat=\"trimester in dtpCtrl.years\"><td data-ng-repeat=\"year in trimester\"><div class=\"kmd-button\" data-ng-bind=\"year.label\" data-ng-mousedown=\"dtpCtrl.selectYear($event, year.year)\"></div></td></tr></table>');
    $templateCache.put('/source/templates/picker_container.html','<div class=\"kmd-datetimepicker\" data-ng-class=\"dtpCtrl.currents.showLocation\" data-ng-include=\"dtpCtrl.template\" data-ng-show=\"dtpCtrl.currents.isVisible\" data-ng-style=\"dtpCtrl.currents.position\" data-ng-mousedown=\"dtpCtrl.disableMouseEventsOnContainer($event)\"></div>');
    $templateCache.put('/source/templates/timepicker.granular.html','<div class=\"kmd-timepicker\" data-ng-if=\"dtpCtrl.hasTime() && dtpCtrl.currents.granularity\"><div class=\"kmd-row\"><div class=\"kmd-button kmd-timeswitch\" data-ng-mousedown=\"dtpCtrl.switchMode($event, \'time\')\"><i data-ng-class=\"dtpCtrl.icons.clock\"></i></div></div><div class=\"kmd-row\" data-ng-if=\"dtpCtrl.isEnabled(dtpCtrl.currents.granularity)\"><table data-ng-init=\"rows = dtpCtrl.getValues(dtpCtrl.currents.granularity)\"><tr data-ng-repeat=\"row in rows\"><td data-ng-repeat=\"col in row\"><div class=\"kmd-button\" data-ng-bind=\"col.name\" data-ng-mousedown=\"dtpCtrl.setValue($event, dtpCtrl.currents.granularity, col.value)\"></div></td></tr></table></div></div>');
    $templateCache.put('/source/templates/timepicker.html','<div class=\"kmd-timepicker\"><div class=\"kmd-row\" data-ng-if=\"dtpCtrl.hasDate()\"><div class=\"kmd-button kmd-dateswitch\" data-ng-mousedown=\"dtpCtrl.switchMode($event, \'date\')\"><i data-ng-class=\"dtpCtrl.icons.calendar\"></i></div></div><div class=\"kmd-row\"><table><tr><td data-ng-if=\"dtpCtrl.isEnabled(\'h\')\"><div class=\"kmd-button\" data-ng-mousedown=\"dtpCtrl.increment($event, \'h\')\"><i data-ng-class=\"dtpCtrl.icons.up\"></i></div></td><td data-ng-if=\"dtpCtrl.isEnabled(\'h\') && dtpCtrl.isEnabled(\'m\')\"></td><td data-ng-if=\"dtpCtrl.isEnabled(\'m\')\"><div class=\"kmd-button\" data-ng-mousedown=\"dtpCtrl.increment($event, \'m\')\"><i data-ng-class=\"dtpCtrl.icons.up\"></i></div></td><td data-ng-if=\"(dtpCtrl.isEnabled(\'h\') || dtpCtrl.isEnabled(\'m\')) && dtpCtrl.isEnabled(\'s\')\"></td><td data-ng-if=\"dtpCtrl.isEnabled(\'s\')\"><div class=\"kmd-button\" data-ng-mousedown=\"dtpCtrl.increment($event, \'s\')\"><i data-ng-class=\"dtpCtrl.icons.up\"></i></div></td><td data-ng-if=\"dtpCtrl.defaults.usePeriod\"></td></tr><tr><td data-ng-if=\"dtpCtrl.isEnabled(\'h\')\"><div class=\"kmd-button\" data-ng-bind=\"dtpCtrl.getCurrent(\'h\')\" data-ng-mousedown=\"dtpCtrl.switchMode($event, \'h\')\"></div></td><td data-ng-if=\"dtpCtrl.isEnabled(\'h\') && dtpCtrl.isEnabled(\'m\')\">:</td><td data-ng-if=\"dtpCtrl.isEnabled(\'m\')\"><div class=\"kmd-button\" data-ng-bind=\"dtpCtrl.getCurrent(\'m\')\" data-ng-mousedown=\"dtpCtrl.switchMode($event, \'m\')\"></div></td><td data-ng-if=\"(dtpCtrl.isEnabled(\'h\') || dtpCtrl.isEnabled(\'m\')) && dtpCtrl.isEnabled(\'s\')\">:</td><td data-ng-if=\"dtpCtrl.isEnabled(\'s\')\"><div class=\"kmd-button\" data-ng-bind=\"dtpCtrl.getCurrent(\'s\')\" data-ng-mousedown=\"dtpCtrl.switchMode($event, \'s\')\"></div></td><td data-ng-if=\"dtpCtrl.defaults.usePeriod\"><div class=\"kmd-button kmd-button-active\" data-ng-bind=\"dtpCtrl.getCurrentPeriod()\" data-ng-mousedown=\"dtpCtrl.togglePeriod($event);\"></div></td></tr><tr><td data-ng-if=\"dtpCtrl.isEnabled(\'h\')\"><div class=\"kmd-button\" data-ng-mousedown=\"dtpCtrl.decrement($event, \'h\')\"><i data-ng-class=\"dtpCtrl.icons.down\"></i></div></td><td data-ng-if=\"dtpCtrl.isEnabled(\'h\') && dtpCtrl.isEnabled(\'m\')\"></td><td data-ng-if=\"dtpCtrl.isEnabled(\'m\')\"><div class=\"kmd-button\" data-ng-mousedown=\"dtpCtrl.decrement($event, \'m\')\"><i data-ng-class=\"dtpCtrl.icons.down\"></i></div></td><td data-ng-if=\"(dtpCtrl.isEnabled(\'h\') || dtpCtrl.isEnabled(\'m\')) && dtpCtrl.isEnabled(\'s\')\"></td><td data-ng-if=\"dtpCtrl.isEnabled(\'s\')\"><div class=\"kmd-button\" data-ng-mousedown=\"dtpCtrl.decrement($event, \'s\')\"><i data-ng-class=\"dtpCtrl.icons.down\"></i></div></td><td data-ng-if=\"dtpCtrl.defaults.usePeriod\"></td></tr></table></div></div>');
  }]);
})();