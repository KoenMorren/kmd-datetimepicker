(function() {
'use strict';

  angular.module('kmd-datetimepicker')
         .controller('datetimepickerController', datetimepickerController);

  datetimepickerController.$inject = ['$scope', '$compile', '$document', '$templateRequest'];
  function datetimepickerController($scope, $compile, $document, $templateRequest) {
    /*jshint validthis:true*/
    var vm = this;

    vm.options = {
      time: {
        stepping: {
          m: 5,
          s: 5
        }
      }
    }
    vm.actualFormat = 'yyyy-MM-dd hh:mm:ss';
    vm.defaults = {
        startOfWeek: 1
    };
    vm.currents = {
      date: moment()
    };
    vm.use24Hours = has24Hours();
    
    vm.template = '/source/templates/timepicker.html';
    vm.dateSelectionTemplate = '/source/templates/datepicker.day.html';

    vm.hasDate = hasDate;
    vm.hasTime = hasTime;
    vm.isEnabled = isEnabled;
    vm.increment = increment;
    vm.decrement = decrement;
    vm.showPicker = showPicker;
    vm.getCurrent = getCurrent;
    vm.togglePeriod = togglePeriod;
    vm.getCurrentPeriod = getCurrentPeriod;
    vm.getColumnWidthClass = getColumnWidthClass;

    activate();

    function activate() {
         applyOptions();
         generateTemplate();
         generateDaysOfWeek();
         generateDaysInMonth();
    }
    
    function applyOptions() {
        //loop over all options in vm.options
        //if key in vm.options also exists in vm.defaults, overwrite value
        //else throw error 'option not supported'
    }

    function generateTemplate() {
        $templateRequest('/source/templates/picker_container.html').then(function(html) {
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

    function generateDaysInMonth() {
        var temp = [];
        vm.daysOnCalendar = [];
        
        var begin = moment().subtract(moment().date() - 1, 'days');
        if(begin.day() !== vm.defaults.startOfWeek)
            begin = begin.day(vm.defaults.startOfWeek - 7)
        var end = moment().add(1, 'months').subtract(moment().day() + 1, 'days').day(vm.defaults.startOfWeek + 7);
        
        while(begin.diff(end, 'days') < 0) {
            temp[temp.length] = {
                label: begin.date(),
                date: begin,
                inSelectedMonth: begin.diff(moment(), 'months') === 0       
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
        
        console.log(vm.daysOnCalendar);
    }

    function hasDate() {
        return (isEnabled('y') || isEnabled('M') || isEnabled('d'));
    }

    function hasTime() {
        return (isEnabled('h') || isEnabled('m') || isEnabled('s'));
    }

    function has24Hours() {
      return vm.actualFormat.indexOf('H') !== -1;
    }

    function isEnabled(granularity) {
      if (!isValid(granularity)) return;
      switch (granularity) {
          case 'y':
              return vm.actualFormat.toLowerCase().indexOf(granularity) !== -1;
          case 'M':
              return vm.actualFormat.indexOf(granularity) !== -1;
          case 'd':
              return vm.actualFormat.toLowerCase().indexOf(granularity) !== -1;
          case 'h':
              return vm.actualFormat.toLowerCase().indexOf(granularity) !== -1;
          case 'm':
              return vm.actualFormat.indexOf(granularity) !== -1;
          case 's':
              return vm.actualFormat.indexOf(granularity) !== -1;
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

    function increment(granularity) {
      if (!isEnabled(granularity)) return;
      var newDate = vm.currents.date.clone().add(vm.options.time.stepping[granularity] || 1, granularity);
      vm.currents.date = newDate;
    }

    function decrement(granularity) {
      if (!isEnabled(granularity)) return;
      var newDate = vm.currents.date.clone().subtract(vm.options.time.stepping[granularity] || 1, granularity);
      vm.currents.date = newDate;
    }

    function showPicker(granularity) {
      if (!isEnabled(granularity)) return;

    }

    function getCurrent(granularity) {
      if (!isEnabled(granularity)) return;
      switch (granularity) {
        case 'y':
          return vm.currents.date.clone().format('yyyy');
        case 'M':
          return vm.currents.date.clone().format('MM');
        case 'd':
          return vm.currents.date.clone().format('dd');
        case 'h':
          if (vm.use24Hours) {
            return vm.currents.date.clone().format('HH');
          } else {
            return vm.currents.date.clone().format('hh');
          }
        case 'm':
            return vm.currents.date.clone().format('mm');
        case 's':
            return vm.currents.date.clone().format('ss');
        default:
          return false;
      }
    }

    function togglePeriod() {
      var newDate = vm.currents.date.clone().add((vm.currents.date.hours() >= 12) ? -12 : 12, 'h');
      vm.currents.date = newDate;
    }

    function getCurrentPeriod() {
      return vm.currents.date.clone().format('a');
    }

    function getColumnWidthClass() {
      var columnWidth = 12 / (isEnabled('h') + isEnabled('m') + isEnabled('s') + !vm.use24Hours);
      return 'col-md-' + columnWidth; // either 12, 6, 4 or 3
    }
  }
})();