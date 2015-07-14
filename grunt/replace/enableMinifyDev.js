module.exports = function() {
    if (this.devExists) {
        this.replace({
            src: ['bin/dev/plugCubed.src.js'],
            overwrite: true,
            replacements: [{
                from: 'minified: false',
                to: 'minified: true'
            }]
        });
    }
};
