'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp.task('test:dev', () => {
    return gulp
        .src('test/dev/**.js')
        .pipe(mocha({
            timeout: 5000
        }));
});
