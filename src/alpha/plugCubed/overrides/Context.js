define(['plugCubed/handlers/OverrideHandler', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang'], function(OverrideHandler, Settings, p3Utils, p3Lang) {
    var Context, Handler, PopoutView;

    PopoutView = window.plugCubedModules.PopoutView;
    Context = window.plugCubedModules.context;
    Handler = OverrideHandler.extend({
        doOverride: function() {
            if (typeof Context._trigger !== 'function') {
                Context._trigger = Context.trigger;
            }
            Context.trigger = function() {

                // Code adapted from JTBrinkmann AKA Brinkie Pie
                var $msg, socketEvents, args, $deleteMessage, deletes, userData, modUser, chat, $cm;

                socketEvents = window.plugCubedModules.socketEvents;
                chat = window.plugCubedModules.chat;
                if (arguments.callee.caller === socketEvents.chatDelete && (p3Utils.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador()) && Settings.moderation.showDeletedMessages) {

                    args = arguments.callee.caller.arguments[0];
                    modUser = API.getUser(args.mi).username || args.mi;
                    console.info('[plug³ showDeletedMessages]', args.c, args.mi, args);
                    $msg = $('.text.cid-' + args.c).parent();
                    $cm = PopoutView && PopoutView.chat ? PopoutView.chat.$chatMessages : chat ? chat.$chatMessages : $('#chat-messages');

                    $deleteMessage = $('<div>')
                        .addClass('plugCubed-deleted fromID-' + args.mi)
                        .css({
                            color: 'red',
                            textAlign: 'right'
                        });
                    deletes = $msg.data('deletes') || {};

                    if (userData = deletes[args.mi]) { // eslint-disable-line no-cond-assign
                        $msg.find('.fromID-' + args.mi).text(p3Lang.i18n('notify.deletedMessages') + modUser + ' (' + ++userData.count + ')');
                    } else {
                        $deleteMessage
                            .text(p3Lang.i18n('notify.deletedMessages') + modUser)
                            .appendTo($msg);
                        deletes[args.mi] = {
                            count: 1
                        };
                    }

                    $msg
                        .data({
                            deletes: deletes
                        })
                        .css({
                            opacity: 0.8
                        });

                    $msg.parent().find('.delete-button').remove();

                    if ($msg.position().top < $cm.height()) {
                        $cm.scrollTop($cm.scrollTop() + $deleteMessage.height());
                    }

                    if (chat.lastText && chat.lastText.hasClass('cid-' + args.c)) {
                        chat.lastType = 'plugCubed-deleted';
                        chat.lastID = chat.lastText = chat.lastTime = null;
                    }
                } else {
                    return this._trigger.apply(this, arguments);
                }
            };

        },
        doRevert: function() {
            if (typeof Context._trigger === 'function') {
                Context.trigger = Context._trigger;
            }

        }
    });

    return new Handler();
});
