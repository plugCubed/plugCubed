module.exports = function() {
    this.s3({
        files: [{
            cwd: 'src/release/langs',
            src: '**.json',
            dest: 'release/langs/'
        }, {
            cwd: 'src/alpha/langs',
            src: '**.json',
            dest: 'alpha/langs/'
        }, {
            cwd: 'src/dev/langs',
            src: '**.json',
            dest: 'dev/langs/'
        }]
    });
};
