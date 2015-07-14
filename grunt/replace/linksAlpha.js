module.exports = function() {
    this.replace({
        src: ['src/alpha/**/*.js', 'src/alpha/*.js', 'src/alpha/**/*.css', 'src/alpha/*.css'],
        overwrite: true,
        replacements: [{
            from: 'https://d1rfegul30378.cloudfront.net/files/',
            to: 'https://d1rfegul30378.cloudfront.net/alpha/'
        }, {
            from: 'https://d1rfegul30378.cloudfront.net/dev/',
            to: 'https://d1rfegul30378.cloudfront.net/alpha/'
        }]
    });
};
