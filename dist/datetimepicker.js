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
               Time: '/source/templates/timepicker.html',
               Granular: '/source/templates/timepicker.granular.html'
           })
           .constant('FORMATS', {
               DateFormat: 'DD-MM-YYYY',
               SwitchLabel_Day: 'MMMM YYYY',
               SwitchLabel_Month: 'YYYY',
               DefaultOutput: 'DD-MM-YYYYThh:mm:ss A'
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
            outputFormat: FORMATS.DefaultOutput,
            //timepicker
            time: {
                stepping: {
                    m: 5,
                    s: 5
                },
                columnCount: {

                }
            }, 
            usePeriod: true
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
            isDisabled: isDisabled,
            
            //timepicker
            hasDate: hasDate,
            hasTime: hasTime,
            isEnabled: isEnabled,
            increment: increment,
            decrement: decrement,
            getCurrent: getCurrent,
            togglePeriod: togglePeriod,
            getCurrentPeriod: getCurrentPeriod,
            getValues: getValues,
            setValue: setValue
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
            
            vm.defaults.usePeriod = !has24Hours();
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
        function generateDaysInMonth() {
            var temp = [];
            vm.daysOnCalendar = [];
            
            var begin = generateBeginOfMonth();
            var end = generateEndOfMonth();            
            
            while(begin.diff(end, 'days') < 0) {
                temp[temp.length] = {
                    label: begin.date(),
                    date: begin.clone(),
                    inSelectedMonth: begin.clone().month() - vm.currents.viewDate.month() === 0
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
            return day.isSame(vm.currents.date, 'day');
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
                    vm.currents.datepickerViewLevel = VIEW_LEVELS.Date.Day;
                    updateDatepickerSwitchLabel();
                    generateDaysInMonth();
                    break;
                case 'time':
                    vm.template = TEMPLATES.Time;
                    break;
                case 'h':
                case 'm':
                case 's':
                    vm.currents.granularity = mode;
                    vm.template = TEMPLATES.Granular;
                    break;
            }
        }
    
        //timepicker
        function hasDate() {
            return (isEnabled('y') || isEnabled('M') || isEnabled('d'));
        }

        function hasTime() {
            return (isEnabled('h') || isEnabled('m') || isEnabled('s'));
        }

        function has24Hours() {
            return vm.defaults.outputFormat.indexOf('H') !== -1;
        }

        function isEnabled(granularity) {
            if (!isValid(granularity)) 
                return;
                
            switch (granularity) {
                case 'y':
                    return vm.defaults.outputFormat.toLowerCase().indexOf(granularity) !== -1;
                case 'M':
                    return vm.defaults.outputFormat.indexOf(granularity) !== -1;
                case 'd':
                    return vm.defaults.outputFormat.toLowerCase().indexOf(granularity) !== -1;
                case 'h':
                    return vm.defaults.outputFormat.toLowerCase().indexOf(granularity) !== -1;
                case 'm':
                    return vm.defaults.outputFormat.indexOf(granularity) !== -1;
                case 's':
                    return vm.defaults.outputFormat.indexOf(granularity) !== -1;
                default:
                    return false;
            }
        }

        function isValid(granularity) {
            if (typeof granularity !== 'string' || granularity.length > 1) {
                throw new TypeError('isEnabled expects a single character string parameter');
            } else {
                return true;
            }
        }

        function increment($event, granularity) {
            $event.preventDefault();
            
            if (!isEnabled(granularity)) 
                return;
                
            //why clone first?
            var newDate = vm.currents.date.clone().add(vm.defaults.time.stepping[granularity] || 1, granularity);
            vm.currents.date = newDate;
            
            updateModel();
        }

        function decrement($event, granularity) {
            $event.preventDefault();
            
            if (!isEnabled(granularity)) 
                return;
            
            
            //why clone first?
            var newDate = vm.currents.date.clone().subtract(vm.defaults.time.stepping[granularity] || 1, granularity);
            vm.currents.date = newDate;
            
            updateModel();
        }

        function getCurrent(granularity) {
            if (!isEnabled(granularity)) 
                return;
                
            switch (granularity) {
                case 'y':
                    return vm.currents.date.clone().format('yyyy');
                case 'M':
                    return vm.currents.date.clone().format('MM');
                case 'd':
                    return vm.currents.date.clone().format('dd');
                case 'h':
                    if (vm.defaults.usePeriod) {
                        return vm.currents.date.clone().format('hh');
                    } else {
                        return vm.currents.date.clone().format('HH');
                    }
                case 'm':
                    return vm.currents.date.clone().format('mm');
                case 's':
                    return vm.currents.date.clone().format('ss');
                default:
                    return false;
            }
        }

        function togglePeriod($event) {
            $event.preventDefault();
            
            var newDate = vm.currents.date.clone().add((vm.currents.date.hours() >= 12) ? -12 : 12, 'h');
            vm.currents.date = newDate;
            
            updateModel();
        }

        function getCurrentPeriod() {
            return vm.currents.date.clone().format('a');
        }

        function getValues(granularity) {
            if (!isEnabled(granularity)) return;
            switch (granularity) {
                case 'h':
                    var minHour = 1,
                            maxHour = vm.use24Hours ? 24 : 12,
                            hourStep = vm.defaults.time.stepping[granularity] || 1,
                            hourColCount = vm.defaults.time.columnCount[granularity] || 4;
                    return fillKeyValues(minHour, maxHour, hourStep, hourColCount);
                case 'm':
                case 's':
                    var min = 0,
                            max = 59,
                            step = vm.defaults.time.stepping[granularity] || 1,
                            columnCount = vm.defaults.time.columnCount[granularity] || 4;
                    return fillKeyValues(min, max, step, columnCount);
                default:
                    return false;
            }
        }

        function fillKeyValues(minValue, maxValue, stepSize, columnCount) {
            var rowCount = maxValue / stepSize / columnCount;
            var rows = [];
            for (var row  = 0; row < rowCount; row++) {
                var cols = [];
                for (var col = minValue, len = columnCount + minValue; col < len; col++) {
                    var hourValue = col * stepSize + row * columnCount * stepSize;
                    if (hourValue > maxValue) break;
                    var hour = {
                        value: hourValue,
                        label: ('00' + hourValue).slice(-2)
                    }
                    cols[cols.length] = hour;
                    if (hourValue === maxValue) break;
                }
                rows[rows.length] = cols;
            }
            return rows;
        }

        function setValue($event, granularity, val) {
            $event.preventDefault();
            
            vm.currents.date.set(granularity, val);
            updateModel();
            switchMode($event, 'time');
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
    $templateCache.put('/source/templates/timepicker.granular.html','<div class=\"kmd-timepicker\" data-ng-if=\"vm.hasTime() && vm.currents.granularity\"><div class=\"kmd-row\"><div class=\"kmd-button kmd-timeswitch\" data-ng-mousedown=\"vm.switchMode($event, \'time\')\"><i class=\"fa fa-fw fa-clock-o\"></i></div></div><div class=\"kmd-row\" data-ng-if=\"vm.isEnabled(vm.currents.granularity)\"><table data-ng-init=\"rows = vm.getValues(vm.currents.granularity)\"><tr data-ng-repeat=\"row in rows\"><td data-ng-repeat=\"col in row\"><div class=\"kmd-button\" data-ng-bind=\"col.label\" data-ng-mousedown=\"vm.setValue($event, vm.currents.granularity, col.value)\"></div></td></tr></table></div></div>');
    $templateCache.put('/source/templates/timepicker.html','<div class=\"kmd-timepicker\"><div class=\"kmd-row\" data-ng-if=\"vm.hasDate()\"><div class=\"kmd-button kmd-dateswitch\" data-ng-mousedown=\"vm.switchMode($event, \'date\')\"><i class=\"fa fa-fw fa-calendar\"></i></div></div><div class=\"kmd-row\"><table><tr><td data-ng-if=\"vm.isEnabled(\'h\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.increment($event, \'h\')\"><i class=\"fa fa-fw fa-chevron-up\"></i></div></td><td data-ng-if=\"vm.isEnabled(\'h\') && vm.isEnabled(\'m\')\"></td><td data-ng-if=\"vm.isEnabled(\'m\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.increment($event, \'m\')\"><i class=\"fa fa-fw fa-chevron-up\"></i></div></td><td data-ng-if=\"(vm.isEnabled(\'h\') || vm.isEnabled(\'m\')) && vm.isEnabled(\'s\')\"></td><td data-ng-if=\"vm.isEnabled(\'s\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.increment($event, \'s\')\"><i class=\"fa fa-fw fa-chevron-up\"></i></div></td><td data-ng-if=\"vm.defaults.usePeriod\"></td></tr><tr><td data-ng-if=\"vm.isEnabled(\'h\')\"><div class=\"kmd-button\" data-ng-bind=\"vm.getCurrent(\'h\')\" data-ng-mousedown=\"vm.switchMode($event, \'h\')\"></div></td><td data-ng-if=\"vm.isEnabled(\'h\') && vm.isEnabled(\'m\')\">:</td><td data-ng-if=\"vm.isEnabled(\'m\')\"><div class=\"kmd-button\" data-ng-bind=\"vm.getCurrent(\'m\')\" data-ng-mousedown=\"vm.switchMode($event, \'m\')\"></div></td><td data-ng-if=\"(vm.isEnabled(\'h\') || vm.isEnabled(\'m\')) && vm.isEnabled(\'s\')\">:</td><td data-ng-if=\"vm.isEnabled(\'s\')\"><div class=\"kmd-button\" data-ng-bind=\"vm.getCurrent(\'s\')\" data-ng-mousedown=\"vm.switchMode($event, \'s\')\"></div></td><td data-ng-if=\"vm.defaults.usePeriod\"><div class=\"kmd-button kmd-button-active\" data-ng-bind=\"vm.getCurrentPeriod()\" data-ng-mousedown=\"vm.togglePeriod($event);\"></div></td></tr><tr><td data-ng-if=\"vm.isEnabled(\'h\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.decrement($event, \'h\')\"><i class=\"fa fa-fw fa-chevron-down\"></i></div></td><td data-ng-if=\"vm.isEnabled(\'h\') && vm.isEnabled(\'m\')\"></td><td data-ng-if=\"vm.isEnabled(\'m\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.decrement($event, \'m\')\"><i class=\"fa fa-fw fa-chevron-down\"></i></div></td><td data-ng-if=\"(vm.isEnabled(\'h\') || vm.isEnabled(\'m\')) && vm.isEnabled(\'s\')\"></td><td data-ng-if=\"vm.isEnabled(\'s\')\"><div class=\"kmd-button\" data-ng-mousedown=\"vm.decrement($event, \'s\')\"><i class=\"fa fa-fw fa-chevron-down\"></i></div></td><td data-ng-if=\"vm.defaults.usePeriod\"></td></tr></table></div></div>');
  }]);
})();