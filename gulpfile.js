/**
 * Created by Chad on 2016-09-05.
 */

// grab our packages
var gulp   = require('gulp'),
    jshint = require('gulp-jshint'),
    babel  = require('gulp-babel'),
    concat = require('gulp-concat'),
    maps   = require('gulp-sourcemaps');

var src = 'resources/js/';
var dest = 'public/js/';

// define the default task and add the watch task to it
gulp.task('default', ['watch']);

// configure the jshint task
gulp.task('lint', function() {
    return gulp.src(src + '**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('build-js', ['lint'], function () {
    return gulp.src(src + '**/*.js')
        .pipe(maps.init())
        //.pipe(babel())
        .pipe(concat('bundle.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest(dest));
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function() {
    gulp.watch(src + '**/*.js', ['lint', 'build-js']);
});