module.exports = function() {
    if (this.devExists) {
        this.$run([
            'replace/linksDev',
            'requirejs/dev',
            'replace/versionDev',
            'copy/dev',
            'replace/enableMinifyDev',
            'execute/closureCompilerDev'
        ]);
    }

};
