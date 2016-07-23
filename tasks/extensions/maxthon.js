'use strict';

const gulp = require('gulp');

const path = require('path');
const spawn = require('child_process').spawn;
const maxPath = path.resolve('extensions', 'Maxthon');

gulp.task('extensions:maxthon', (done) => {
    const maxCmd = spawn('python', [path.resolve('scripts', 'mxpacker.py'), maxPath, path.resolve('extensions','plugcubed.mxaddon')], {
        stdio: 'inherit'
    });

    maxCmd.on('close', done);
});
