'use strict';

const path = require('path');
const spawn = require('child_process').spawn;

const jpm = path.resolve('node_modules', '.bin', process.platform === 'win32' ? 'jpm.cmd' : 'jpm');
const gulp = require('gulp');

gulp.task('extensions:firefox', () => {
    return spawn(jpm, ['xpi', '--addon-dir', path.resolve('extensions', 'Firefox')], {
        stdio: 'inherit'
    });
});
