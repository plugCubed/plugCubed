module.exports = function() {
    if (this.devExists) {
        this.include([
            'replace/linksDev',
            'requirejs/dev',
            'replace/versionDev',
            'copy/dev',
            'replace/enableMinifyDev',
            'execute/closureCompilerDev'
        ]);
    }

};
