module.exports = function() {
    this.s3({
        files: [{
            src: 'plugCubed.user.js',
            dest: 'files/plugCubed.user.js'
        }]
    })
};
