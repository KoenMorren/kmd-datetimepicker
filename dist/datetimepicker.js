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
               DefaultOutput: 'DD-MM-YYYY HH:mm:ss'
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
           })
           .constant('ICONS',  {
               previous: 'icon-chevron-left',
               next: 'icon-chevron-right',
               up: 'icon-chevron-up',
               down: 'icon-chevron-down',
               calendar: 'icon-calendar-o',
               clock: 'icon-clock-o'  
           });
})();
(function() {
'use strict';

    angular
        .module('kmd-datetimepicker')
        .controller('datetimepickerController', datetimepickerController);

    datetimepickerController.$inject = ['$scope', '$compile', '$window' ,'$document', '$templateRequest', '$element', '$timeout', 'FORMATS', 'VIEW_LEVELS', 'TEMPLATES', 'ICONS'];
    function datetimepickerController($scope, $compile, $window, $document, $templateRequest, $element, $timeout, FORMATS, VIEW_LEVELS, TEMPLATES, ICONS) {
        var vm = this;
        
        //Properties that can be overwritten by the user
        vm.defaults = {
            startOfWeek: 0,
            outputFormat: FORMATS.DefaultOutput,
            time: {
                stepping: {
                    m: 5,
                    s: 5
                },
                columnCount: {}
            }, 
            usePeriod: true
        };
        
        //Properties used to hold the information about the current situation
        vm.currents = {
            showLocation: 'show-under',
            date: moment(),
            viewDate: moment(),
            datepickerViewLevel: VIEW_LEVELS.Date.Day,
            datepickerSwitchLabel: null,
            isVisible: false,
            position: {
                top: null,
                left: null
            }
        };
        
        //Exposing properties
        angular.extend(vm, {
            icons: ICONS,            
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
        });
        
        //Exposing functions
        angular.extend(vm, {
            //container
            applyOptions: applyOptions,
            disableMouseEventsOnContainer: disableMouseEventsOnContainer,
            
            //datepicker
            selectYear: selectYear,
            selectMonth: selectMonth,
            selectDay: selectDay,
            decreaseDatepickerViewLevel: decreaseDatepickerViewLevel,
            datepickerNext: datepickerNext,
            datepickerPrevious: datepickerPrevious,
            switchMode: switchMode,
            
            //timepicker
            increment: increment,
            decrement: decrement,
            getCurrent: getCurrent,
            togglePeriod: togglePeriod,
            getCurrentPeriod: getCurrentPeriod,
            getValues: getValues,
            setValue: setValue
        });

        activate();

        function activate() {    
            attachListeners();
            generateTemplate();
                    
            //applyOptions();
            
            setDefaultTemplate();
            
            generateDaysOfWeek();
            generateMonths();
            
            generateDaysInMonth();
             
            updateDatepickerSwitchLabel();
            //updateModel();
        }
        
        //attach listeners to the target control
        function attachListeners() {
            $element.bind('focus', function() {
                //reset the picker to the default view
                setDefaultTemplate();
                vm.currents.viewDate = moment();
                updateDatepickerSwitchLabel();
                generateDaysInMonth();
                determinePosition();
                
                angular.element($window).bind('resize', function() {
                    $element[0].blur();
                });
                
                vm.currents.isVisible = true;
                $scope.$apply();
            });
            $element.bind('blur', function() {
                vm.currents.isVisible = false;
                $scope.$apply();
            });
        }
        //add the picker template to the body
        function generateTemplate() {
            $templateRequest(TEMPLATES.Base).then(function(html) {
                var picker = $compile(html)($scope);                
                $element.parent().append(picker);
            });
        }
        //determine the offset of the picker
        function determinePosition() {
            var windowHeight = $window.innerHeight;
            var offsetTop = $element.prop('offsetTop');
            var elementHeight = $element.prop('offsetHeight');
            var offsetBottom = windowHeight - (offsetTop + elementHeight);
            
            if(offsetBottom < 300) {
                delete vm.currents.position.top;
                vm.currents.position.bottom = (offsetBottom + elementHeight) + 'px';
                vm.currents.showLocation = 'show-above';
                
            } else {
                delete vm.currents.position.bottom;
                vm.currents.position.top = (offsetTop + elementHeight) + 'px';
                vm.currents.showLocation = 'show-under';
            }        
            
            vm.currents.position.left = $element.prop('offsetLeft') + 'px';
        }
        
        function applyOptions() {
            for (var property in $scope.datetimepickerOptions) {
                if ($scope.datetimepickerOptions.hasOwnProperty(property)) {
                    if(vm.defaults.hasOwnProperty(property)) {
                        //switch for handling special cases
                        switch(property) {
                            case 'time':
                                //loop over time-object
                                break;
                            default:
                                vm.defaults[property] = $scope.datetimepickerOptions[property];       
                                break;
                        }
                    } else {
                        throw new Error('kmd-datetimepicker: Unsupported option:' + property + '.');
                    }
                }
            }
            
            vm.defaults.usePeriod = !has24Hours();
        }
        function setDefaultTemplate() {
            if(hasDate()) {
                vm.template = TEMPLATES.Date;
                vm.dateSelectionTemplate = TEMPLATES.DatePart.Day;
                vm.currents.datepickerViewLevel = VIEW_LEVELS.Date.Day;
            } else if (!hasDate() && hasTime()) {
                vm.template = TEMPLATES.Time;
            } else {
                throw new Error('Unable to set template. The format is not valid for either date or time.');
            }
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
            
            for(var i = 0; i < end.diff(begin, 'days') / 7; i ++) {
                vm.daysOnCalendar[i] = [];
                
                for(var j = 0; j <= 6; j++) {                    
                    vm.daysOnCalendar[i][j] = createDayFromMoment(begin.clone().add(((i * 7) + j), 'days'));
                }
                
            }
        }
        function createDayFromMoment(moment) {
            return {
                label: moment.date(),
                date: moment,
                inSelectedMonth: moment.month() - vm.currents.viewDate.month() === 0  
            };
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
                end.add(1, 'days').day(vm.defaults.startOfWeek);
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
            $scope.ngModel = vm.currents.date.format(vm.defaults.outputFormat);
        }
        
        //Functionality
        function disableMouseEventsOnContainer($event) {
            $event.preventDefault();
        } 
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
            return vm.currents.date.clone().format('A');
        }

        function getValues(granularity) {
            if (!isEnabled(granularity)) return;
            var step = vm.defaults.time.stepping[granularity] || 1,
                columCount = vm.defaults.time.columnCount[granularity] || 4;
            var values;
            switch (granularity) {
                case 'h':
                    if (vm.defaults.usePeriod) {
                        values = [{name: '12', value: 12}].concat(createNameValueArray(step, 11, step));
                        return createRowColumnArray(values, columCount);
                    } else {
                        values = createNameValueArray(0, 23, step);
                        return createRowColumnArray(values, columCount);
                    }
                case 'm':
                case 's':
                    values = createNameValueArray(0, 59, step);
                    return createRowColumnArray(values, columCount);
                default:
                    return false;
            }
        }

        function createNameValueArray(minValue, maxValue, step) {
            var arr = [];
            for (var i = minValue, len = maxValue; i <= len; i += step) {
                arr[arr.length] = {
                    name: ('00' + i).slice(-2),
                    value: i
                };
            }
            return arr;
        }

        function createRowColumnArray(keyValueArray, columnCount) {
            var rows = [],
                ilen = keyValueArray.length / columnCount;
            for (var i = 0; i < ilen; i++) {
                var cols = [],
                    jlen = columnCount;
                for (var j = 0; j < jlen; j++) {
                    //var row = i, col = j;
                    var index = i * columnCount + j;
                    if (keyValueArray[index]) {
                        cols[cols.length] = keyValueArray[index];
                    } else {
                        break;
                    }
                }
                rows[rows.length] = cols;
            }
            return rows;
        }

        function setValue($event, granularity, val) {
            $event.preventDefault();

            if (granularity === 'h' && vm.defaults.usePeriod) {
                if (vm.currents.date.hours() >= 12) {
                    if (val !== 12) {
                        val += 12;
                    } 
                } else {
                    if (val === 12) {
                        val = 0;
                    }
                }
            }
            
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