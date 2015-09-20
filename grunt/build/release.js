module.exports = function() {
    this.$run([
        'clean/release',
        'replace/linksRelease',
        'requirejs/release',
        'replace/versionRelease',
        'copy/release',
        'concat/extensions',
        'replace/enableMinifyRelease',
        'execute/closureCompilerRelease',
        'extensions'
    ]);
};
