module.exports = function() {
    this.$run([
        'execute/cleanLang',
        'build/release',
        'build/alpha',
        'build/dev'
    ]);
};
