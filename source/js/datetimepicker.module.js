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