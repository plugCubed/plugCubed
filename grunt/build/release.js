module.exports = function() {
    this.$run([
        'replace/linksRelease',
        'requirejs/release',
        'replace/versionRelease',
        'requirejsObfuscate/release',
        'copy/release',
        'replace/enableMinifyRelease',
        'execute/closureCompilerRelease',
        'extensions'
    ]);
};
