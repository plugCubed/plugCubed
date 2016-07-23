'use strict';

const gulp = require('gulp');
const justReplace = require('gulp-just-replace');

gulp.task('replace:linksRelease', () => {
    return gulp
        .src('src/release/plugCubed/**/*.js')
        .pipe(justReplace([{
            search: /https?:\/\/plugcubed\.net\/scripts\/(alpha|dev|release)\//gi,
            replacement: 'https://plugcubed.net/scripts/release/'
        }]))
        .pipe(gulp.dest('src/release/plugCubed'));
});
