(function() {
    'use strict';

    angular.module('kmd-datetimepicker', [])
           .constant('FORMATS', {
               DateFormat: 'DD-MM-YYYY',
               SwitchLabel_Day: 'MMMM YYYY',
               SwitchLabel_Month: 'YYYY'
           })
           .constant('VIEW_LEVELS', {
               Date: {
                   0: 'Year', Year: 0,
                   1: 'Month', Month: 1,
                   2: 'Day', Day: 2                   
               },
               DateTemplates: {
                   0: '/source/templates/datepicker.year.html',
                   1: '/source/templates/datepicker.month.html',
                   2: '/source/templates/datepicker.day.html',
               }
           });
})();