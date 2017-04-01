/* eslint-env node */

'use strict';

const fs = require('graceful-fs');
const path = require('path');
const gulp = require('gulp');
const HubRegistry = require('gulp-hub');
let devVersionExists;

try {
    fs.accessSync(path.resolve('src', 'dev', 'version.js')); // eslint-disable-line no-sync
    devVersionExists = true;
} catch (err) {
    devVersionExists = false;
}

Object.defineProperties(global, {
    devVersionExists: {
        value: devVersionExists
    },
    versions: {
        value: ['alpha', devVersionExists && 'dev', 'release']
    }
});

const regex = ['tasks/**/*.js'];
const hub = new HubRegistry(regex);

gulp.registry(hub);

gulp.task('minify:alpha', gulp.parallel('minify:alphaJS', 'minify:alphaCSS', (done) => done()));

gulp.task('minify:release', gulp.parallel('minify:releaseJS', 'minify:releaseCSS', (done) => done()));

gulp.task('build:alpha', gulp.series('test:alpha', 'clean:alpha', 'replace:linksalpha', 'requirejs:alpha', 'autoprefixer:alpha', 'template:alpha', 'minify:alpha', (done) => done()));

gulp.task('build:extensions', gulp.series('extensions:copy', [ 'replace:extensionChrome', 'replace:extensionFirefox', 'replace:extensionMaxthon'], ['extensions:chrome', 'extensions:firefox', 'extensions:opera', 'extensions:maxthon'], (done) => done()));

gulp.task('build:release', gulp.series('test:release', 'clean:release', 'replace:linksrelease', 'requirejs:release', 'autoprefixer:release', 'template:release', ['build:extensions', 'minify:release'], (done) => done()));

if (devVersionExists) {
    gulp.task('build:all', gulp.parallel('build:alpha', 'build:dev', 'build:release', (done) => done()));

    gulp.task('test:all', gulp.parallel('test:alpha', 'test:dev', 'test:release', (done) => done()));

    gulp.task('build:dev', gulp.series('test:dev', 'clean:dev', 'replace:linksdev', 'requirejs:dev', 'autoprefixer:dev', 'template:dev', (done) => done()));

    gulp.task('watch:dev', (done) => {
        const devWatcher = gulp.watch('**/*.{css,js}', {
            cwd: path.resolve('src', 'dev')
        }, ['build:dev']);

        devWatcher.on('change', (event) => {
            console.log(`File ${event.path} was ${event.type} running build:dev task...`);
        });
    });
}

gulp.task('watch:alpha', (done) => {
    const alphaWatcher = gulp.watch('**/*.{css,js}', {
        cwd: path.resolve('src', 'alpha')
    }, ['build:alpha']);

    alphaWatcher.on('change', (event) => {
        console.log(`File ${event.path} was ${event.type} running build:alpha task...`);
    });
});

gulp.task('watch:release', (done) => {
    const releaseWatcher = gulp.watch('**/*.{css,js}', {
        cwd: path.resolve('src', 'release')
    }, ['build:release']);

    releaseWatcher.on('change', (event) => {
        console.log(`File ${event.path} was ${event.type} running build:release task...`);
    });
});
