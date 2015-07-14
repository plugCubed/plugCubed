module.exports = function() {
    if (this.devExists) {
        this.replace({
            src: ['src/dev/**/*.js', 'src/dev/*.js', 'src/dev/**/*.css', 'src/dev/*.css'],
            overwrite: true,
            replacements: [{
                from: 'https://d1rfegul30378.cloudfront.net/alpha/',
                to: 'https://d1rfegul30378.cloudfront.net/dev/'
            }, {
                from: 'https://d1rfegul30378.cloudfront.net/files/',
                to: 'https://d1rfegul30378.cloudfront.net/dev/'
            }]
        });
    }
};
