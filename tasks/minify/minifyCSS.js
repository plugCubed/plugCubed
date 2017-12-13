'use strict';

const gulp = require('gulp');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const bytediff = require('gulp-bytediff');
const sourcemaps = require('gulp-sourcemaps');

versions.forEach((version) => {
    if (version == null) return;

    gulp.task(`minify:${version}CSS`, () => {
        return gulp
            .src(`src/${version}/plugCubed.css`)
            .pipe(sourcemaps.init())
            .pipe(bytediff.start())
            .pipe(postcss([
                cssnano({
                    preset: ['default', {
                        normalizeCharset: false
                    }]
                })
            ]))
            .pipe(bytediff.stop())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(`bin/${version}/`));
    });
});
