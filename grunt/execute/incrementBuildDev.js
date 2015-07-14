module.exports = function() {
    if (this.devExists) {
        this.execute({
            options: {
                args: '--dir dev'
            },
            src: ['_incrementBuild.js']
        });
    }
};
