module.exports = function() {
    this.s3({
        files: [{
            src: 'titles.json',
            dest: 'titles.json'
        }]
    });
};
