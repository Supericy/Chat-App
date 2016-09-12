/**
 * Created by Chad on 2016-09-05.
 */
'use strict';


// grab our packages
var gulp       = require('gulp'),
    jshint     = require('gulp-jshint'),
    maps       = require('gulp-sourcemaps'),
    amd        = require('amd-optimize'),
    buffer     = require('vinyl-buffer'),
    browserify = require('browserify'),
    source     = require('vinyl-source-stream'),
    babelify   = require('babelify'),
    clean      = require('gulp-clean'),
    uglify     = require('gulp-uglify'),
    gutil      = require('gulp-util'),
    watchify   = require('watchify'),
    assign     = require('lodash.assign'),
    rename     = require('gulp-rename');

var config = {
    browserify: {
        debug:   true,
        basedir: './'
    },

    watchify: {
        ignoreWatch: ['**/node_modules/**'],
        poll:        500
    },

    babelify: {
        presets: ['es2015']
    },

    jshint: {
        esversion:  6,
        browserify: true,
        devel:      true
    },

    app: {
        main:     'main.js',
        compiled: 'build.js',
        views:    './resources/views/',
        src:      './resources/scripts/',
        dest:     './public/scripts/'
    }
};

var bundlizer = new (function () {
    config.browserify.entries = [
        config.app.src + config.app.main
    ];

    this.bundler = browserify(assign({}, watchify.args, config.browserify));
    this.bundler.transform(babelify, config.babelify);
    this.bundler.on('error', gutil.log.bind(gutil, 'Bundler Error'));
    this.bundler.on('log', gutil.log.bind(gutil, 'Bundler Info'));

    this.watchify = function () {
        this.bundler = watchify(this.bundler, config.watchify);
        this.bundler.on('update', this.run);

        return this;
    };

    this.bundle = function () {
        return this.bundler.bundle();
    };

    this.compile = function () {
        return this.bundle()
            .on('error', gutil.log.bind(gutil, 'Bundle Error'))
            .on('log', gutil.log.bind(gutil, 'Bundle Info'))

            .pipe(source(config.app.compiled))
            .pipe(buffer())
            .pipe(gulp.dest(config.app.dest))
            .pipe(maps.init({loadMaps: true}))
            //.pipe(uglify())
            //.pipe(rename({suffix: '.min'}))
            .pipe(maps.write('./'))
            .pipe(gulp.dest(config.app.dest));
    };

    this.run = function () {
        gulp.start('compile');
    };
});

gulp.task('lint', function () {
    return gulp.src(config.app.src + '**/*.js')
        .pipe(jshint(config.jshint))
        .pipe(jshint.reporter('default'));
});

gulp.task('clean', function () {
    return gulp.src([config.app.dest + '*'])
        .pipe(clean());
});

gulp.task('compile', ['lint', 'clean'], function () {
    bundlizer.compile();
});

gulp.task('watch', [], function () {
    bundlizer.watchify().run();
});

//// define the default task and add the watch task to it
gulp.task('default', ['watch']);