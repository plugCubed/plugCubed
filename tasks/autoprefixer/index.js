'use strict';

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const justReplace = require('gulp-just-replace');

versions.forEach((version) => {
    if (version == null) return;

    gulp.task(`autoprefixer:${version}`, () => {
        return gulp
            .src(`src/${version}/plugCubed.css`)
            .pipe(justReplace([{
                search: /https?:\/\/plugcubed\.net\/scripts\/(alpha|dev|release)\//gi,
                replacement: `https://plugcubed.net/scripts/${version}/`
            }]))
            .pipe(autoprefixer({
                browsers: ['> 1%', 'ie >= 9', 'last 5 versions']
            }))
            .pipe(gulp.dest(`src/${version}`));
    });
});
