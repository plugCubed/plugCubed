'use strict';

const gulp = require('gulp');
const zip = require('gulp-zip');
const path = require('path');
const spawn = require('child_process').spawn;
const maxPath = path.resolve('extensions', 'Maxthon');
const browsers = ['Chrome', 'Firefox', 'Opera'];

gulp.task('extensions:copy', () => {
    return gulp
        .src('bin/release/plugCubed.js')
        .pipe(gulp.dest('extensions/Chrome'))
        .pipe(gulp.dest('extensions/Firefox'))
        .pipe(gulp.dest('extensions/Opera'));
});

for (let i = 0; i < browsers.length; i++) {
    gulp.task(`extensions:${browsers[i]}`, () => {
        return gulp
            .src(`./extensions/${browsers[i]}/**`)
            .pipe(zip(`${browsers[i]}.zip`))
            .pipe(gulp.dest('./extensions/'));
    });
}

gulp.task('extensions:Maxthon', (done) => {
    const maxCmd = spawn('python', [path.resolve('scripts', 'mxpacker.py'), maxPath, path.resolve('extensions', 'plugcubed.mxaddon')], {
        stdio: 'inherit'
    });

    maxCmd.on('close', done);
});
