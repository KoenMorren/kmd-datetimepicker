var gulp = require('gulp');
var path = require('path');

var cleanCss = require('gulp-clean-css');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');

var sourcePath = './source/';
var distPath = './dist/';

gulp.task('sass', function() {
    return gulp.src('./source/sass/style.scss')
               .pipe(sass({outputStyle: 'expanded'}))
               .pipe(gulp.dest('./source/css/'))
               .pipe(gulp.dest(distPath))
               .pipe(rename('style.min.css'))
               .pipe(cleanCss())
               .pipe(gulp.dest(distPath)); 
});

gulp.task('createTemplateCache', function() {
    var TEMPLATE_HEADER = [
        '(function () {\r\n',
        '  "use strict";\r\n',
        '\r\n',
        '  angular.module(\'<%= module %>\'<%= standalone %>)\r\n',
        '         .run([\'$templateCache\', function($templateCache) {\r\n'].join('');
    var TEMPLATE_BODY = '    $templateCache.put(\'<%= url %>\',\'<%= contents %>\');';
    var TEMPLATE_FOOTER = [
        '\r\n',
        '  }]);\r\n',
        '})();'].join('');
        
    var templateCacheOptions = {
        root: '/source/templates/',
        module: 'kmd-datetimepicker',
        templateHeader: TEMPLATE_HEADER,
        templateBody: TEMPLATE_BODY,
        templateFooter: TEMPLATE_FOOTER,
    };
    
    return gulp.src(path.join(sourcePath, 'templates/*.html'))
               .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
               .pipe(templateCache(templateCacheOptions))
               .pipe(gulp.dest(path.join(sourcePath, '/js/')));
});

gulp.task('js', function() {
    return gulp.src([path.join(sourcePath, 'js/*.module.js')
                     , path.join(sourcePath, 'js/*.js')])
               .pipe(concat('datetimepicker.js'))
               .pipe(gulp.dest(distPath))
               .pipe(rename('datetimepicker.min.js'))
               .pipe(uglify())
               .pipe(gulp.dest(distPath));
});

gulp.task('build', function() {
    runSequence('sass', 'createTemplateCache', 'js');
});