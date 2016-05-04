(function() {
'use strict';

    angular
        .module('kmd-datetimepicker')
        .controller('datetimepickerController', datetimepickerController);

    datetimepickerController.$inject = ['$scope', '$compile', '$document', '$templateRequest'];
    function datetimepickerController($scope, $compile, $document, $templateRequest) {
        var vm = this;
        
        vm.defaults = {
            startOfWeek: 1
        };
        
        vm.template = '/source/templates/datepicker.html';
        vm.dateSelectionTemplate = '/source/templates/datepicker.day.html';

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
    }
})();