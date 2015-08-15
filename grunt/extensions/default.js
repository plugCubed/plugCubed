module.exports = function() {
    this.$run([
        'extensions/replaceVersionExtensions',
        'execute/extension',
        'extensions/packFirefox'
    ]);
};
