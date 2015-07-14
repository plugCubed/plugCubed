module.exports = function() {
    this.replace({
        src: ['bin/alpha/plugCubed.src.js'],
        overwrite: true,
        replacements: [{
            from: 'minified: false',
            to: 'minified: true'
        }]
    });
};
