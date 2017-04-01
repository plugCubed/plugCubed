'use strict';

const gulp = require('gulp');
const zip = require('gulp-zip');
const path = require('path');
const spawn = require('child_process').spawn;

const jpm = path.resolve('node_modules', '.bin', process.platform === 'win32' ? 'jpm.cmd' : 'jpm');
const maxPath = path.resolve('extensions', 'Maxthon');

gulp.task('extensions:copy', () => {
    return gulp
        .src('bin/release/plugCubed.js')
        .pipe(gulp.dest('extensions/Chrome'))
        .pipe(gulp.dest('extensions/Firefox/data'))
        .pipe(gulp.dest('extensions/Edge'))
        .pipe(gulp.dest('extensions/Opera'));

});
gulp.task('extensions:firefox', () => {
    return spawn(jpm, ['xpi', '--addon-dir', path.resolve('extensions', 'Firefox')], {
        stdio: 'inherit'
    });
});
gulp.task('extensions:chrome', () => {
    return gulp
        .src('./extensions/Chrome/**')
        .pipe(zip('chrome.zip'))
        .pipe(gulp.dest('./extensions/'));
});

gulp.task('extensions:maxthon', (done) => {
    const maxCmd = spawn('python', [path.resolve('scripts', 'mxpacker.py'), maxPath, path.resolve('extensions', 'plugcubed.mxaddon')], {
        stdio: 'inherit'
    });

    maxCmd.on('close', done);
});

gulp.task('extensions:opera', () => {
    return gulp
        .src('./extensions/opera/**')
        .pipe(zip('opera.zip'))
        .pipe(gulp.dest('./extensions/'));
});
