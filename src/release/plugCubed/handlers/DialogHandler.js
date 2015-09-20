define(['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/enums/Notifications'], function($, Class, p3Lang, Settings, enumNotifications) {
    var dialogTarget;
    var dialogObserver;
    var handler = Class.extend({
        register: function() {
            dialogTarget = document.querySelector('#dialog-container');
            dialogObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes[0] !== undefined) {
                        if (mutation.addedNodes[0].attributes[0].nodeValue === 'dialog-restricted-media') {
                            if ((Settings.notify & enumNotifications.SONG_UNAVAILABLE) === enumNotifications.SONG_UNAVAILABLE) {
                                $('#dialog-restricted-media .dialog-frame .icon').click();
                            }
                        }
                    }
                });
            });
            dialogObserver.observe(dialogTarget, {
                childList: true
            });
        },
        close: function() {
            dialogObserver.disconnect();
        }
    });
    return new handler();
});
