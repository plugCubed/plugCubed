define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/AvatarManifest'], function(Class, p3Utils, p3Avatars) {
    if (p3Utils.runLite) return;

    var AvatarManifest = require('app/utils/AvatarManifest'), initialized = false;

    Class.extend({
        init: function() {
            if (initialized) return;
            AvatarManifest._getAvatarUrl = AvatarManifest._getAvatarUrl || AvatarManifest.getAvatarUrl;
            AvatarManifest.getAvatarUrl = function(avatar, type) {
                if (avatar.indexOf('p3') === 0) {
                    if (!p3Avatars.manifest[avatar]) return this._getAvatarUrl(avatar, type);
                    var version = p3Avatars.manifest[avatar][type];
                    return p3Avatars.base_url + "/" + avatar + type + "." + version + ".png";
                } else {
                    return this._getAvatarUrl(avatar, type);
                }
            };
            initialized = true;
        }
    });
});