'use strict';

const gulp = require('gulp');
const justReplace = require('gulp-just-replace');

versions.forEach((version) => {
    if (version == null) return;
    gulp.task(`replace:links${version}`, () => {
        return gulp
            .src(`src/${version}/plugCubed/**/*.js`)
            .pipe(justReplace([{
                search: /https?:\/\/plugcubed\.net\/scripts\/(alpha|dev|release)\//gi,
                replacement: `https://plugcubed.net/scripts/${version}/`
            }]))
            .pipe(gulp.dest(`src/${version}/plugCubed`));
    });
});
