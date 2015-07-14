module.exports = function() {
        this.include([
        'execute/incrementBuildRelease',
        'build/release'
    ]).s3({
        files: [{
            src: 'bin/release/plugCubed.css',
            dest: 'files/plugCubed.css'
        }, {
            src: 'bin/release/plugCubed.js',
            dest: 'files/plugCubed.js'
        }, {
            src: 'bin/release/plugCubed.min.js',
            dest: 'files/plugCubed.min.js'
        }, {
            src: 'src/release/lang.json',
            dest: 'files/lang.json'
        }, {
            cwd: 'src/release/images/badges',
            src: '**.png',
            dest: 'files/images/badges/'
        }, {
            cwd: 'src/release/images/icons',
            src: '**.png',
            dest: 'files/images/icons/'
        }, {
            cwd: 'src/release/images/ranks',
            src: '**.png',
            dest: 'files/images/ranks/'
        }, {
            cwd: 'src/release/langs',
            src: '**.json',
            dest: 'files/langs/'
        }]
    })
};
