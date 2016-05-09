var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('compileSass', function() {
    return gulp.src('./source/sass/style.scss')
               .pipe(sass())
               .pipe(gulp.dest('./source/css/')); 
});