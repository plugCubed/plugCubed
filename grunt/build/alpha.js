module.exports = function() {
    this.$run([
        'replace/linksAlpha',
        'requirejs/alpha',
        'replace/versionAlpha',
        'requirejsObfuscate/alpha',
        'copy/alpha',
        'replace/enableMinifyAlpha',
        'execute/closureCompilerAlpha'
    ]);
};
