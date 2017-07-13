define(['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/CustomChatColors', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/Lang'], function($, Class, p3Lang, CCC, Settings, p3Utils) {
    var Context = window.plugCubedModules.context;

    function guiInput(id, text, defaultColor) {
        if (!Settings.colors[id]) {
            Settings.colors[id] = defaultColor;
        }

        return $('<div class="item">').addClass('p3-s-cc-' + id).append($('<span>').text(text)).append($('<span>').addClass('default').css('display', (p3Utils.equalsIgnoreCase(Settings.colors[id], defaultColor) ? 'none' : 'block')).mouseover(function() {
            Context.trigger('tooltip:show', p3Lang.i18n('tooltip.reset'), $(this), false);
        }).mouseout(function() {
            Context.trigger('tooltip:hide');
        }).click(function() {
            $(this).parent().find('input').val(defaultColor);
            $(this).parent().find('.example').css('background-color', p3Utils.toRGB(defaultColor));
            $(this).css('display', 'none');
            Settings.colors[id] = defaultColor;
            Settings.save();
            CCC.update();
        })).append($('<span>').addClass('example').css('background-color', p3Utils.toRGB(Settings.colors[id]))).append($('<input>').val(Settings.colors[id]).keyup(function() {
            if (p3Utils.isRGB($(this).val())) {
                $(this).parent().find('.example').css('background-color', p3Utils.toRGB($(this).val()));
                Settings.colors[id] = $(this).val();
                Settings.save();
                CCC.update();
            }
            $(this).parent().find('.default').css('display', (p3Utils.equalsIgnoreCase($(this).val(), defaultColor) ? 'none' : 'block'));
        }));
    }

    var div;

    var A = Class.extend({
        render: function() {
            var i;
            var $settings = $('#p3-settings');

            if (div != null) {
                if (div.css('left') === '-500px') {
                    div.animate({
                        left: $settings.width() + 1
                    });

                    return;
                }
                div.animate({
                    left: -div.width() - 2
                }, {
                    complete: function() {
                        if (div) {
                            div.detach();
                            div = undefined;
                        }
                    }
                });

                return;
            }
            var container = $('<div class="container">').append($('<div class="section">').text(p3Lang.i18n('customchatcolors.userRanksHeader')));

            for (i in Settings.colorInfo.ranks) {
                if (Settings.colorInfo.ranks.hasOwnProperty(i)) {
                    container.append(guiInput(i, p3Lang.i18n(Settings.colorInfo.ranks[i].title), Settings.colorInfo.ranks[i].color));
                }
            }
            container.append($('<div class="spacer">').append($('<div class="divider">'))).append($('<div class="section">').text(p3Lang.i18n('customchatcolors.chatnotifs')));
            for (i in Settings.colorInfo.notifications) {
                if (Settings.colorInfo.notifications.hasOwnProperty(i)) {
                    if (i === 'songLength') {
                        if (API.hasPermission(undefined, API.ROLE.BOUNCER) || p3Utils.isPlugCubedDeveloper()) {
                            container.append(guiInput(i, p3Lang.i18n(Settings.colorInfo.notifications[i].title, Settings.notifySongLength), Settings.colorInfo.notifications[i].color));
                        }
                    } else if (i === 'boothAlert') {
                        container.append(guiInput(i, p3Lang.i18n(Settings.colorInfo.notifications[i].title, Settings.boothAlert), Settings.colorInfo.notifications[i].color));
                    } else {
                        container.append(guiInput(i, p3Lang.i18n(Settings.colorInfo.notifications[i].title), Settings.colorInfo.notifications[i].color));
                    }
                }
            }
            div = $('<div id="p3-settings-custom-colors" style="left: -500px;">').append($('<div class="header">').append($('<div class="back">').append($('<i class="icon icon-arrow-left"></i>')).click(function() {
                if (div != null) {
                    div.animate({
                        left: -div.width() - 2
                    }, {
                        complete: function() {
                            if (div) {
                                div.detach();
                                div = undefined;
                            }
                        }
                    });
                }
            })).append($('<div class="title">').append($('<span>').text(p3Lang.i18n('menu.customchatcolors'))))).append(container).animate({
                left: $settings.width() + 1
            });
            $('#p3-settings-wrapper').append(div);
        },
        hide: function() {
            if (div != null) {
                div.animate({
                    left: -div.width() - 2
                }, {
                    complete: function() {
                        if (div) {
                            div.detach();
                            div = undefined;
                        }
                    }
                });
            }
        }
    });

    return new A();
});
