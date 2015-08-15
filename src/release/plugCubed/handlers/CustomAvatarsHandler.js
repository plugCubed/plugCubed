define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/AvatarManifest', 'plugCubed/overrides/UserInventory', 'plugCubed/ModuleLoader'], function(Class, p3Utils, p3Avatars, UserInventory, ModuleLoader) {

    var AvatarManifest = ModuleLoader.getModule({
        getAvatarUrl: 'function'
    });
    var initialized = false;

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
