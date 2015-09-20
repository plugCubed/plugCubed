define([], function() {
    // TODO: Change base_url back to https://d1rfegul30378.cloudfront.net/avatars/
    return {
        manifest: {
            test: {
                dj: 'abc'
            }
        },
        base_url: 'https://localhost/',
        getAvatarUrl: function(avatar, type) {
            if (this.manifest[avatar] == null || this.manifest[avatar][type] == null) return null;
            return this.base_url + '/' + avatar + type + '.' + this.manifest[avatar][type] + '.png';
        }
    };
});
