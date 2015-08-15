module.exports = function() {
    this.$run([
        'execute/incrementBuildDev',
        'build/dev'
    ]).s3({
        files: [{
            src: 'bin/dev/plugCubed.css',
            dest: 'dev/plugCubed.css'
        }, {
            src: 'src/dev/lang.json',
            dest: 'dev/lang.json'
        }, {
            cwd: 'src/dev/images/badges',
            src: '**.png',
            dest: 'dev/images/badges/'
        }, {
            cwd: 'src/dev/images/icons',
            src: '**.png',
            dest: 'dev/images/icons/'
        }, {
            cwd: 'src/dev/images/ranks',
            src: '**.png',
            dest: 'dev/images/ranks/'
        }, {
            cwd: 'src/dev/langs',
            src: '**.json',
            dest: 'dev/langs/'
        }]
    });
};
