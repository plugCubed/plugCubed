module.exports = function() {
    this.replace({
        src: ['bin/release/plugCubed.src.js'],
        overwrite: true,
        replacements: [{
            from: 'minified: false',
            to: 'minified: true'
        }]
    });
};
