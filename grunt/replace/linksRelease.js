module.exports = function() {
    this.replace({
        src: ['src/release/**/*.js', 'src/release/*.js', 'src/release/**/*.css', 'src/release/*.css'],
        overwrite: true,
        replacements: [{
            from: 'https://d1rfegul30378.cloudfront.net/alpha/',
            to: 'https://d1rfegul30378.cloudfront.net/files/'
        }, {
            from: 'https://d1rfegul30378.cloudfront.net/dev/',
            to: 'https://d1rfegul30378.cloudfront.net/files/'
        }]
    });
};
