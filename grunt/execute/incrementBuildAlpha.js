module.exports = function() {
    this.execute({
        options: {
            args: '--dir alpha'
        },
        src: ['_incrementBuild.js']
    });
};
