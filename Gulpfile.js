var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    rimraf = require('rimraf'),
    runSequence = require('gulp-run-sequence');

var EXPRESS_PORT = 4000;
var EXPRESS_ROOT = __dirname;
var LIVERELOAD_PORT = 35729;


// express setup
gulp.task('express', function () {
    var express = require('express');
    var app = express();
    app.use(require('connect-livereload')({port: LIVERELOAD_PORT}));
    app.use(express.static(EXPRESS_ROOT));
    app.listen(EXPRESS_PORT, '0.0.0.0');
});

function notifyLivereload(event) {

    gulp.src(event.path, {read: false})
        .pipe(livereload(lr));
}

// styles compile
gulp.task('sass', function () {
    return gulp.src(['sass/index.scss'])
        .pipe(sass({
            includePaths: [
                'node_modules/bootstrap/scss'
            ],
            style: 'expanded'
            //errLogToConsole: true
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('assets/css'))
        .pipe(autoprefixer())
        .pipe(minifycss())
        .pipe(gulp.dest('assets/css'));
});

gulp.task('fontgen', function() {
    return gulp.src("./fonts/*.{ttf,otf}")
        .pipe(fontgen({
            dest: "./assets/fonts"
        }));
});

gulp.task('watch', function () {
    gulp.watch('sass/*.scss', ['sass']);
    gulp.watch('assets/css/*.css', notifyLiveReload);
});

gulp.task('build:clean', function (cb) {
    rimraf('./dist/**/*', cb);
});

gulp.task('build:app', ['sass'], function (cb) {
    gulp.src(['./assets/**/*'])
        .pipe(gulp.dest('dist/app/dist/assets'), cb);
    return gulp.src(['./index.html'])
        .pipe(gulp.dest('dist/app/dist'), cb);
});


gulp.task('build:bower', function (cb) {
    return gulp.src(['./bower_components/**/*'])
        .pipe(gulp.dest('dist/app/bower_components'), cb);
});


gulp.task('build', function(cb){
    runSequence('build:clean', 'build:app', 'build:bower', cb);
});

var tinylr;
gulp.task('livereload', function () {
    tinylr = require('tiny-lr')();
    tinylr.listen(35729);
});

function notifyLiveReload(event) {
    var fileName = require('path').relative(__dirname, event.path);

    tinylr.changed({
        body: {
            files: [fileName]
        }
    });
}

gulp.task('default', ['sass', 'express', 'livereload', 'watch'], function () {

});