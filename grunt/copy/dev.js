module.exports = function() {
    if (this.devExists) {
        this.copy({
            src: 'bin/dev/plugCubed.src.js',
            dest: 'bin/dev/plugCubed.js'
        });
    }
};
