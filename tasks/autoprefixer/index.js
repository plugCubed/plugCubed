'use strict';

const gulp = require('gulp');
const postcss = require('gulp-postcss');
const unprefix = require('postcss-unprefix');
const autoprefixer = require('autoprefixer');
const justReplace = require('gulp-just-replace');
const gulpIf = require('gulp-if');

versions.forEach((version) => {
    if (version == null) return;

    gulp.task(`autoprefixer:${version}`, () => {
        return gulp
            .src(`src/${version}/plugCubed.css`)
            .pipe(justReplace([{
                search: /https?:\/\/plugcubed\.net\/scripts\/(alpha|dev|release)\//gi,
                replacement: `https://plugcubed.net/scripts/${version}/`
            }]))
            .pipe(postcss([
                unprefix,
                autoprefixer({
                    cascade: false
                })
            ]))
            .pipe(gulp.dest(`src/${version}`))
            .pipe(gulpIf((file) => file.path && file.path.includes('dev'), gulp.dest('bin/dev')));
    });
});
