(function() {
    'use strict';

    angular.module('kmd-datetimepicker', [])
           .constant('TEMPLATES', {
               Base: '/source/templates/picker_container.html',
               Date: '/source/templates/datepicker.html',
               DatePart: {
                   0: '/source/templates/datepicker.year.html',
                   Year: '/source/templates/datepicker.year.html',
                   1: '/source/templates/datepicker.month.html',
                   Month: '/source/templates/datepicker.month.html',
                   2: '/source/templates/datepicker.day.html',
                   Day: '/source/templates/datepicker.day.html'
               },
               Time: '/source/templates/timepicker.html'
           })
           .constant('FORMATS', {
               DateFormat: 'DD-MM-YYYY',
               SwitchLabel_Day: 'MMMM YYYY',
               SwitchLabel_Month: 'YYYY',
               DefaultOutput: 'DD-MM-YYYYTHH:mm:ss'
           })
           .constant('VIEW_LEVELS', {
               Date: {
                   0: 'Year', 
                   Year: 0,
                   1: 'Month',
                   Month: 1,
                   2: 'Day', 
                   Day: 2                   
               }
           });
})();
(function() {
'use strict';

    angular
        .module('kmd-datetimepicker')
        .controller('datetimepickerController', datetimepickerController);

    datetimepickerController.$inject = ['$scope', '$compile', '$document', '$templateRequest', 'FORMATS', 'VIEW_LEVELS', 'TEMPLATES'];
    function datetimepickerController($scope, $compile, $document, $templateRequest, FORMATS, VIEW_LEVELS, TEMPLATES) {
        var vm = this;
        
        vm.defaults = {
            startOfWeek: 0,
            disableWeekdays: [0],
            outputFormat: FORMATS.DefaultOutput
        };
        vm.currents = {
            date: moment(),
            viewDate: moment(),
            datepickerViewLevel: VIEW_LEVELS.Date.Day,
            datepickerSwitchLabel: null
        };
        
        //Exposing properties
        angular.extend(vm, {
            daysOfWeek: null,
            daysOnCalendar: null,
            months: null,
            years: null,
            
            template: TEMPLATES.Date,
            dateSelectionTemplate: TEMPLATES.DatePart.Day,
                        
            isCurrentDay: isCurrentDay,
            isSelectedDay: isSelectedDay,
            isDisabled: isDisabled
        });
        
        //Exposing functions
        angular.extend(vm, {
            selectYear: selectYear,
            selectMonth: selectMonth,
            selectDay: selectDay,
            decreaseDatepickerViewLevel: decreaseDatepickerViewLevel,
            datepickerNext: datepickerNext,
            datepickerPrevious: datepickerPrevious,
            switchMode: switchMode
        });

        activate();

        function activate() {            
            applyOptions();
            generateTemplate();
            generateDaysOfWeek();
            generateMonths();
            generateDaysInMonth();
             
            updateDatepickerSwitchLabel();
            updateModel();
        }
        
        function applyOptions() {
            //loop over all options in vm.options
            //if key in vm.options also exists in vm.defaults, overwrite value
            //else throw error 'option not supported'
        }
        function generateTemplate() {
            $templateRequest(TEMPLATES.Base).then(function(html) {
                var picker = $compile(html)($scope);
                $document.find('body').append(picker); 
            });
        }
        function generateDaysOfWeek() {
            var index = vm.defaults.startOfWeek;
            vm.daysOfWeek = [];
            
            do {
                vm.daysOfWeek[vm.daysOfWeek.length] = moment().day(index).format('dd');
                index = ++index%7;
            } while(index !== vm.defaults.startOfWeek)
        }
        function generateYears() {
            vm.currents.minYear = vm.currents.viewDate.year() - 5;
            vm.currents.maxYear = vm.currents.viewDate.year() + 6;
            vm.years = [];
            
            for(var i = 0; i < 3; i++) {
                vm.years[i] = [];    
                for(var j = 0; j < 4; j++) {
                    var year = vm.currents.minYear + (i * 4) + j;
                    
                    vm.years[i][j] = {
                        label: year,
                        year: year
                    }; 
                }
            }
        }
        function generateMonths() {
            if(vm.defaults.alternativeMonthLabels) {
                //TODO
            } else {
                vm.months = [];
                
                for(var i = 0; i < 3; i++) {
                    vm.months[i] = [];    
                    for(var j = 0; j < 4; j++) {
                        var month = (i * 4) + j;
                        
                        vm.months[i][j] = {
                            label: moment().month(month).format('MMM'),
                            month: month
                        }; 
                    }
                }
            }
        }
        function generateDaysInMonth() {
            var temp = [];
            vm.daysOnCalendar = [];
            
            var begin = generateBeginOfMonth();
            var end = generateEndOfMonth();            
            
            while(begin.diff(end, 'days') < 0) {
                temp[temp.length] = {
                    label: begin.date(),
                    date: begin.clone(),
                    inSelectedMonth: begin.clone().month() - vm.currents.viewDate.month() === 0,
                    isDisabled: isDisabled(begin.clone())
                };
                
                begin.add(1, 'days');
            }
            
            for(var i = 0; i < temp.length / 7; i++) {
                var week = [];
                
                for(var j = 0; j < 7; j++) {
                    week[week.length] = temp[(i * 7) + j];
                }
                
                vm.daysOnCalendar[i] = week;
            }
        }
        function generateBeginOfMonth() {
            var clone = vm.currents.viewDate.clone();
            var begin = clone.subtract(clone.date() - 1, 'days');
            
            if(begin.day() > vm.defaults.startOfWeek) {
                begin.day(vm.defaults.startOfWeek);
            } else if (begin.day() < vm.defaults.startOfWeek) {
                begin.day(vm.defaults.startOfWeek - 7);
            } 
            
            return begin;
        }
        function generateEndOfMonth() {
            var clone = vm.currents.viewDate.clone();
            var end = clone.add(1, 'months').subtract(clone.date(), 'days');
            
            if(end.clone().add(1, 'days').day() !== vm.defaults.startOfWeek) {
                end.day(vm.defaults.startOfWeek + 7)
            } else {
                end.day(vm.defaults.startOfWeek);
            }
            
            return end;
        }
        function updateDatepickerSwitchLabel() {
            switch(vm.currents.datepickerViewLevel) {
                case VIEW_LEVELS.Date.Day:
                    vm.currents.datepickerSwitchLabel = vm.currents.viewDate.format(FORMATS.SwitchLabel_Day);
                    break;
                case VIEW_LEVELS.Date.Month:
                    vm.currents.datepickerSwitchLabel = vm.currents.viewDate.format(FORMATS.SwitchLabel_Month);
                    break;
                case VIEW_LEVELS.Date.Year:
                    vm.currents.datepickerSwitchLabel = vm.currents.minYear + ' - ' + vm.currents.maxYear;
                    break;
            }
        }
        function isCurrentDay(day) {
            return day.isSame(moment(), 'day');
        }
        function isSelectedDay(day) {
            return day.isSame(vm.currents.viewDate, 'day');
        }
        function isDisabled(day) {
            //check if not < mindate
            var minDateBlock = false;
            
            //check if > maxdate
            var maxDateBlock = false;
            
            //check if day.day() not in vm.defaults.disableWeekdays
            var weekdayBlock = vm.defaults.disableWeekdays.indexOf(day.day()) !== -1;
            
            return minDateBlock || maxDateBlock || weekdayBlock;
        }
        function updateModel() {
            vm.ngModel = vm.currents.date.format(vm.defaults.outputFormat);
        }
        
        //Functionality
        function decreaseDatepickerViewLevel($event) {
            $event.preventDefault();
            
            switch(vm.currents.datepickerViewLevel) {
                case VIEW_LEVELS.Date.Day:
                    vm.currents.datepickerViewLevel = VIEW_LEVELS.Date.Month;
                    vm.dateSelectionTemplate = TEMPLATES.DatePart[vm.currents.datepickerViewLevel];
                    updateDatepickerSwitchLabel();
                    break;
                case VIEW_LEVELS.Date.Month:
                    vm.currents.datepickerViewLevel = VIEW_LEVELS.Date.Year;
                    vm.dateSelectionTemplate = TEMPLATES.DatePart[vm.currents.datepickerViewLevel];
                    generateYears();
                    updateDatepickerSwitchLabel();
                    break;
            }
        }
        function increaseDatepickerViewLevel() {
            if(vm.currents.datepickerViewLevel + 1 <= 2) {
                vm.currents.datepickerViewLevel += 1;
                vm.dateSelectionTemplate = TEMPLATES.DatePart[vm.currents.datepickerViewLevel];
                updateDatepickerSwitchLabel();
            }
        }
        function selectYear($event, year) {
            $event.preventDefault();
            
            vm.currents.viewDate.set('year', year);
            vm.currents.date = vm.currents.viewDate.clone();
            updateModel();
            
            increaseDatepickerViewLevel();
        }
        function selectMonth($event, month) {
            $event.preventDefault();
            
            vm.currents.viewDate.set('month', month);
            vm.currents.date = vm.currents.viewDate.clone();
            updateModel();
            
            increaseDatepickerViewLevel();
            generateDaysInMonth();
        }
        function selectDay($event, isDisabled, day) {
            $event.preventDefault();
            
            if(!isDisabled) {
                vm.currents.viewDate.set('year', day.year());
                vm.currents.viewDate.set('month', day.month());
                vm.currents.viewDate.set('date', day.date());
                vm.currents.date = vm.currents.viewDate.clone();
                updateModel();   
            }            
        }
        function datepickerNext($event) {
            $event.preventDefault();
            
            switch(vm.currents.datepickerViewLevel) {
                case VIEW_LEVELS.Date.Day:
                    vm.currents.viewDate.add(1, 'months');
                    generateDaysInMonth();
                    break;
                case VIEW_LEVELS.Date.Month:
                    vm.currents.viewDate.add(1, 'years');
                    break;
                case VIEW_LEVELS.Date.Year:
                    vm.currents.viewDate.add(12, 'years');
                    generateYears();
                    break;
            }
            
            updateDatepickerSwitchLabel();
        }
        function datepickerPrevious($event) {
            $event.preventDefault();
            
            switch(vm.currents.datepickerViewLevel) {
                case VIEW_LEVELS.Date.Day:
                    vm.currents.viewDate.subtract(1, 'months');
                    generateDaysInMonth();
                    break;
                case VIEW_LEVELS.Date.Month:
                    vm.currents.viewDate.subtract(1, 'years');
                    break;
                case VIEW_LEVELS.Date.Year:
                    vm.currents.viewDate.subtract(12, 'years');
                    generateYears();
                    break;
            }
            
            updateDatepickerSwitchLabel();
        }
        function switchMode($event, mode) {
            $event.preventDefault();
            
            switch(mode) {
                case 'date':
                    vm.template = TEMPLATES.Date;
                    vm.dateSelectionTemplate = TEMPLATES.DatePart.Day;
                    break;
                case 'time':
                    vm.template = TEMPLATES.Time;
                    break;
            }
        }
    }
})();
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
(function () {
  "use strict";

  angular.module('kmd-datetimepicker')
         .run(['$templateCache', function($templateCache) {
    $templateCache.put('/source/templates/datepicker.day.html','<table class=\"kmd-datepicker-day\"><tr><th data-ng-repeat=\"day in vm.daysOfWeek\" data-ng-bind=\"day\"></th></tr><tr data-ng-repeat=\"week in vm.daysOnCalendar\"><td data-ng-repeat=\"day in week\"><div class=\"kmd-button\" data-ng-bind=\"day.label\" data-ng-class=\"{\'day-not-in-selected-month\': !day.inSelectedMonth, \'day-is-today\': vm.isCurrentDay(day.date), \'day-is-selected\': vm.isSelectedDay(day.date), \'day-is-disabled\': day.isDisabled}\" data-ng-mousedown=\"vm.selectDay($event, day.isDisabled, day.date)\"></div></td></tr></table>');
    $templateCache.put('/source/templates/datepicker.html','<div class=\"kmd-datepicker\"><div class=\"kmd-row\"><div class=\"kmd-button kmd-prev\" data-ng-mousedown=\"vm.datepickerPrevious($event)\"><i class=\"fa fa-fw fa-chevron-left\"></i></div><div class=\"kmd-button kmd-switch\" data-ng-mousedown=\"vm.decreaseDatepickerViewLevel($event)\" data-ng-bind=\"vm.currents.datepickerSwitchLabel\"></div><div class=\"kmd-button kmd-next\" data-ng-mousedown=\"vm.datepickerNext($event)\"><i class=\"fa fa-fw fa-chevron-right\"></i></div></div><div class=\"kmd-row\" data-ng-include=\"vm.dateSelectionTemplate\"></div><div class=\"kmd-row\"><div class=\"kmd-button kmd-timeswitch\" data-ng-mousedown=\"vm.switchMode($event, \'time\')\"><i class=\"fa fa-fw fa-clock-o\"></i></div></div></div>');
    $templateCache.put('/source/templates/datepicker.month.html','<table class=\"kmd-datepicker-month\"><tr data-ng-repeat=\"trimester in vm.months\"><td data-ng-repeat=\"month in trimester\"><div class=\"kmd-button\" data-ng-bind=\"month.label\" data-ng-mousedown=\"vm.selectMonth($event, month.month)\"></div></td></tr></table>');
    $templateCache.put('/source/templates/datepicker.year.html','<table class=\"kmd-datepicker-year\"><tr data-ng-repeat=\"trimester in vm.years\"><td data-ng-repeat=\"year in trimester\"><div class=\"kmd-button\" data-ng-bind=\"year.label\" data-ng-mousedown=\"vm.selectYear($event, year.year)\"></div></td></tr></table>');
    $templateCache.put('/source/templates/picker_container.html','<div class=\"kmd-datetimepicker\" ng-include=\"vm.template\"></div>');
    $templateCache.put('/source/templates/timepicker.html','<div class=\"kmd-timepicker\"></div>');
  }]);
})();