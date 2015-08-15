module.exports = function() {
        this.$run([
        'execute/incrementBuildAlpha',
        'build/alpha'
    ]).s3({
        files: [{
            src: 'bin/alpha/plugCubed.css',
            dest: 'alpha/plugCubed.css'
        }, {
            src: 'bin/alpha/plugCubed.js',
            dest: 'alpha/plugCubed.js'
        }, {
            src: 'bin/alpha/plugCubed.min.js',
            dest: 'alpha/plugCubed.min.js'
        }, {
            src: 'src/alpha/lang.json',
            dest: 'alpha/lang.json'
        }, {
            cwd: 'src/alpha/images/badges',
            src: '**.png',
            dest: 'alpha/images/badges/'
        }, {
            cwd: 'src/alpha/images/icons',
            src: '**.png',
            dest: 'alpha/images/icons/'
        }, {
            cwd: 'src/alpha/images/ranks',
            src: '**.png',
            dest: 'alpha/images/ranks/'
        }, {
            cwd: 'src/alpha/langs',
            src: '**.json',
            dest: 'alpha/langs/'
        }]
    });
};
