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
    _          = require('lodash'),
    resolve    = require('resolve');

var config = {
    browserify: {
        debug:         true,
        basedir:       './',
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
        //main:     'app.js',
        //compiled: 'app-bundle.js'
    },

    vendor: {
        //compiled: 'vendor-bundle.js'
    },

    paths: {
        views:    './resources/views/',
        src:      './resources/scripts/',
        dest:     './public/scripts/'
    }
};

class Bundlizer {
    constructor(opts) {
        this.name = opts.name;

        opts.entries = [
            config.paths.src + this.name + '.js'
        ];

        this.bundler = browserify(assign(config.browserify, watchify.args, opts))
            .on('error', gutil.log.bind(gutil, 'Bundler Error'))
            .on('log', gutil.log.bind(gutil, 'Bundler Info'));
    }

    watchify() {
        this.bundler = watchify(this.bundler, config.watchify);
        this.bundler.on('update', () => {
            gulp.start('compile-' + this.name);
        });

        return this;
    }

    bundle() {
        return this.bundler
            .bundle()
            .on('error', function (err) {
                gutil.log('Bundle Error', err);
                this.emit('end');
            })
            .on('log', gutil.log.bind(gutil, 'Bundle Info'))
            .pipe(source(this.name + '-bundle.js'))
            .pipe(buffer())
            //.pipe(size())
            .pipe(maps.init({loadMaps: true}))
            .pipe(gulp.dest(config.paths.dest))
            //.pipe(uglify())
            //.pipe(size())
            .pipe(rename({suffix: '.min'}))
            .pipe(maps.write('./'))
            .pipe(gulp.dest(config.paths.dest));
    }

    compile() {
        return gulp.start('compile');
    }

    clean() {
        return gulp.src([config.paths.dest + this.name + '*'])
            .pipe(clean());
    }

    static Vendor(opts) {
        let bundlizer = new Bundlizer({
            name: 'vendor'
        });

        Bundlizer.getNpmPackageIds().forEach((id) => {
            bundlizer.bundler.require(resolve.sync(id), {
                expose: id
            });
        });

        return bundlizer;
    }

    static App(opts) {
        let bundlizer = new Bundlizer({
            name: 'app'
        });

        Bundlizer.getNpmPackageIds().forEach((id) => {
            bundlizer.bundler.external(id);
        });

        return bundlizer;
    }

    static getNpmPackageIds() {
        // read package.json and get dependencies' package ids
        var packageManifest = {};
        try {
            packageManifest = require('./package.json');
        } catch (e) {
            // does not have a package.json manifest
        }
        return _.keys(packageManifest.dependencies) || [];
    }
}

let vendor = Bundlizer.Vendor();
let app = Bundlizer.App();

gulp.task('lint', () => {
    return gulp.src(config.paths.src + '**/*.js')
        .pipe(jshint(config.jshint))
        .pipe(jshint.reporter('default'));
});

gulp.task('clean-vendor', () => {
    return vendor.clean();
});

gulp.task('clean-app', () => {
    return app.clean();
});

gulp.task('compile-vendor', ['clean-vendor'], () => {
    return vendor.bundle();
});

gulp.task('compile-app', ['clean-app', 'lint'], () => {
    return app.bundle();
});

gulp.task('compile', ['lint', 'compile-vendor', 'compile-app']);

gulp.task('watch', [], () => {
    vendor.watchify();
    app.watchify();

    gulp.start('compile');
});

//// define the default task and add the watch task to it
gulp.task('default', ['watch']);