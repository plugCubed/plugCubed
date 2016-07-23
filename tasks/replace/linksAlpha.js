'use strict';

const gulp = require('gulp');
const justReplace = require('gulp-just-replace');

gulp.task('replace:linksAlpha', () => {
    return gulp
        .src('src/alpha/plugCubed/**/*.js')
        .pipe(justReplace([{
            search: /https?:\/\/plugcubed\.net\/scripts\/(alpha|dev|release)\//gi,
            replacement: 'https://plugcubed.net/scripts/alpha/'
        }]))
        .pipe(gulp.dest('src/alpha/plugCubed'));
});
