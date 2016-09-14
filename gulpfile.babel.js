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
    stringify  = require('stringify'),
    rename     = require('gulp-rename'),
    size       = require('gulp-size');

var config = {
    browserify: {
        debug:   true,
        basedir: './'
    },

    watchify: {
        ignoreWatch: ['**/node_modules/**'],
        poll:        500
    },

    jshint: {
        esversion:  6,
        browserify: true,
        devel:      true
    },

    app: {
        main:     'main.js',
        compiled: 'bundle.js',
        views:    './resources/views/',
        src:      './resources/scripts/',
        dest:     './public/scripts/'
    }
};

var bundlizer = new (class {
    constructor() {
        config.browserify.entries = [
            config.app.src + config.app.main
        ];

        this.bundler = browserify(assign({}, watchify.args, config.browserify))
            .on('error', gutil.log.bind(gutil, 'Bundler Error'))
            .on('log', gutil.log.bind(gutil, 'Bundler Info'));
    }

    watchify() {
        this.bundler = watchify(this.bundler, config.watchify);
        this.bundler.on('update', this.run);

        return this;
    }

    compile() {
        return this.bundler
            .bundle()
            .on('error', gutil.log.bind(gutil, 'Bundle Error'))
            .on('log', gutil.log.bind(gutil, 'Bundle Info'))
            .pipe(source(config.app.compiled))
            .pipe(buffer())
            .pipe(size())
            .pipe(maps.init({loadMaps: true}))
            .pipe(gulp.dest(config.app.dest))
            .pipe(uglify())
            .pipe(size())
            .pipe(rename({suffix: '.min'}))
            .pipe(maps.write('./'))
            .pipe(gulp.dest(config.app.dest));
    }

    run() {
        return gulp.start('compile');
    }
})();

gulp.task('lint', () => {
    return gulp.src(config.app.src + '**/*.js')
        .pipe(jshint(config.jshint))
        .pipe(jshint.reporter('default'));
});

gulp.task('clean', () => {
    return gulp.src([config.app.dest + '*'])
        .pipe(clean());
});

gulp.task('compile', ['lint', 'clean'], () => {
    return bundlizer.compile();
});

gulp.task('watch', [], () => {
    return bundlizer.watchify().run();
});

//// define the default task and add the watch task to it
gulp.task('default', ['watch']);