module.exports = function() {
    if (this.devExists) {
        this.$run([
            'clean/dev',
            'replace/linksDev',
            'requirejs/dev',
            'replace/versionDev',
            'copy/dev',
            'replace/enableMinifyDev',
            'execute/closureCompilerDev'
        ]);
    }

};
