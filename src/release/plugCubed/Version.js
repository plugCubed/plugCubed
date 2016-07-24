define(function() {
    return {
        major: VERSION.MAJOR,
        minor: VERSION.MINOR,
        patch: VERSION.PATCH,
        prerelease: 'VERSION.PRERELEASE',
        build: VERSION.BUILD,
        minified: false,
        getSemver: function() {
            return this.major + '.' + this.minor + '.' + this.patch + '.' + this.build + (this.prerelease != null && this.prerelease !== '' ? '+' + this.prerelease : '') + (this.minified ? '_min' : '');
        },
        toString: function() {
            return this.major + '.' + this.minor + '.' + this.patch + (this.prerelease != null && this.prerelease !== '' ? '-' + this.prerelease : '') + (this.minified ? '_min' : '') + ' (Build ' + this.build + ')';
        }
    };
});
