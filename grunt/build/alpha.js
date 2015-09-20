module.exports = function() {
    this.$run([
        'clean/alpha',
        'replace/linksAlpha',
        'requirejs/alpha',
        'replace/versionAlpha',
        'copy/alpha',
        'replace/enableMinifyAlpha',
        'execute/closureCompilerAlpha'
    ]);
};
