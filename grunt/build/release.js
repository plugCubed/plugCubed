module.exports = function() {
    this.include([
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
