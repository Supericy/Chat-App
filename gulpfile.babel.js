/**
 * Created by Chad on 2016-09-05.
 */
'use strict';

// grab our packages
var gulp       = require('gulp'),
    jshint     = require('gulp-jshint'),
    maps       = require('gulp-sourcemaps'),
    buffer     = require('vinyl-buffer'),
    browserify = require('browserify'),
    source     = require('vinyl-source-stream'),
    babelify   = require('babelify'),
    clean      = require('gulp-clean'),
    uglify     = require('gulp-uglify'),
    gutil      = require('gulp-util'),
    watchify   = require('watchify'),
    assign     = require('lodash.assign'),
    rename     = require('gulp-rename'),
    size       = require('gulp-size'),
    _          = require('lodash');

var config = {
    browserify: {
        debug:         true,
        basedir:       './',
        fullPaths:     true,
        insertGlobals: true
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
    constructor(opts) {
        config.browserify.entries = [
            config.app.src + config.app.main
        ];

        this.bundler = browserify(assign(config.browserify, watchify.args, opts))
            .on('error', gutil.log.bind(gutil, 'Bundler Error'))
            .on('log', gutil.log.bind(gutil, 'Bundler Info'));

        getNPMPackageIds().forEach((id) => {
            this.bundler.external(id);
        });
    }

    watchify() {
        this.bundler = watchify(this.bundler, config.watchify);
        this.bundler.on('update', this.compile);

        return this;
    }

    bundle() {
        return this.bundler
            .bundle()
            .on('error', function (err) {
                gutil.log('Bundle Error', err);
                this.emit('end');
            })
            .on('log', gutil.log.bind(gutil, 'Bundle Info'));
    }

    compile() {
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
    console.log(getNPMPackageIds());

    return bundlizer
        .bundle()
        .pipe(source(config.app.compiled))
        .pipe(buffer())
        .pipe(size())
        .pipe(maps.init({loadMaps: true}))
        //.pipe(gulp.dest(config.app.dest))
        //.pipe(uglify())
        //.pipe(size())
        //.pipe(rename({suffix: '.min'}))
        .pipe(maps.write('./'))
        .pipe(gulp.dest(config.app.dest));
});

gulp.task('watch', [], () => {
    return bundlizer.watchify().compile();
});

//// define the default task and add the watch task to it
gulp.task('default', ['watch']);


function getNPMPackageIds() {
    // read package.json and get dependencies' package ids
    var packageManifest = {};
    try {
        packageManifest = require('./package.json');
    } catch (e) {
        // does not have a package.json manifest
    }
    return _.keys(packageManifest.dependencies) || [];

}