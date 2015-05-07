define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/AvatarManifest'], function(Class, p3Utils, p3Avatars) {
    if (p3Utils.runLite) return;

    var AvatarManifest = require('app/utils/AvatarManifest'), initialized = false;

    Class.extend({
        init: function() {
            if (initialized) return;

            // Override AvatarManifest
            AvatarManifest._getAvatarUrl = AvatarManifest._getAvatarUrl || AvatarManifest.getAvatarUrl;
            AvatarManifest.getAvatarUrl = function(avatar, type) {
                if (avatar.indexOf('p3') === 0) {
                    if (p3Avatars.manifest[avatar] == null || p3Avatars.manifest[avatar][type] == null) return this._getAvatarUrl(avatar, type);
                    return p3Avatars.base_url + "/" + avatar + type + "." + p3Avatars.manifest[avatar][type] + ".png";
                } else {
                    return this._getAvatarUrl(avatar, type);
                }
            };

            initialized = true;
        },
        close: function() {
            if (!initialized) return;

            initialized = false;
        }
    });
});