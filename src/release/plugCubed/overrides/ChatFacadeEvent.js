define(['plugCubed/handlers/OverrideHandler', 'plugCubed/Utils'], function(OverrideHandler, p3Utils) {
    var chatFacade, Context, CurrentUser, Handler;

    chatFacade = window.plugCubedModules.chatAuxiliaries;
    Context = window.plugCubedModules.context;
    CurrentUser = window.plugCubedModules.CurrentUser;
    Handler = OverrideHandler.extend({
        doOverride: function() {
            if (typeof chatFacade._onChatReceived !== 'function') {
                chatFacade._onChatReceived = chatFacade.onChatReceived;
            }
            chatFacade.onChatReceived = function(data, internal, n) {
                if (data.uid === CurrentUser.get('id')) {
                    var latestInputs = p3Utils.getUserData(-1, 'latestInputs', []);

                    latestInputs.push(p3Utils.html2text(data.message));
                    if (latestInputs.length > 10) {
                        latestInputs.splice(0, 1);
                    }
                    p3Utils.setUserData(-1, 'latestInputs', latestInputs);
                    p3Utils.setUserData(-1, 'tmpInput', null);
                }

                p3Utils.setUserData(data.uid, 'lastChat', Date.now());
                Context.trigger('p3:chat:pre', data);
                API.trigger('p3:chat:pre', data);
                chatFacade._onChatReceived(data, internal, n);

            };

        },
        doRevert: function() {
            if (typeof chatFacade._onChatReceived === 'function') {
                chatFacade.onChatReceived = chatFacade._onChatReceived;
            }

        }
    });

    return new Handler();
});
