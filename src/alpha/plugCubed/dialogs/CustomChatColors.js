define(['jquery', 'plugCubed/Class', 'plugCubed/Lang', 'plugCubed/CustomChatColors', 'plugCubed/Settings', 'plugCubed/Utils', 'plugCubed/bridges/Context'], function($, Class, p3Lang, CCC, Settings, p3Utils, _$context) {
    function GUIInput(id, text, defaultColor) {
        if (!Settings.colors[id])
            Settings.colors[id] = defaultColor;
        return $('<div class="item">').addClass('p3-s-cc-' + id).append($('<span>').text(text)).append($('<span>').addClass('default').css('display', Settings.colors[id] === defaultColor ? 'none' : 'block').mouseover(function() {
                _$context.trigger('tooltip:show', p3Lang.i18n('tooltip.reset'), $(this), false);
            }).mouseout(function() {
                _$context.trigger('tooltip:hide');
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
                $(this).parent().find('.default').css('display', $(this).val() === defaultColor ? 'none' : 'block');
            }));
    }

    var div, a = Class.extend({
        render: function() {
            var i, $settings = $('#p3-settings');
            if (div != null) {
                if (div.css('left') === '-500px') {
                    div.animate({
                        left: $settings.width() + 1
                    });
                    return;
                }
                div.animate({
                    left: -500
                });
                return;
            }
            var container = $('<div class="container">').append($('<div class="section">').text('User Ranks'));
            for (i in Settings.colorInfo.ranks) {
                if (Settings.colorInfo.ranks.hasOwnProperty(i))
                    container.append(GUIInput(i, p3Lang.i18n(Settings.colorInfo.ranks[i].title), Settings.colorInfo.ranks[i].color));
            }
            container.append($('<div class="spacer">').append($('<div class="divider">'))).append($('<div class="section">').text(p3Lang.i18n('notify.header')));
            for (i in Settings.colorInfo.notifications) {
                if (Settings.colorInfo.notifications.hasOwnProperty(i))
                    container.append(GUIInput(i, p3Lang.i18n(Settings.colorInfo.notifications[i].title), Settings.colorInfo.notifications[i].color));
            }
            div = $('<div id="p3-settings-custom-colors" style="left: -500px;">').append($('<div class="header">').append($('<div class="back">').append($('<i class="icon icon-arrow-left"></i>')).click(function() {
                    if (div != null) div.animate({
                        left: -500
                    });
                })).append($('<div class="title">').append($('<span>').text(p3Lang.i18n('menu.customchatcolors'))))).append(container).animate({
                left: $settings.width() + 1
            });
            $('#p3-settings-wrapper').append(div);
        },
        hide: function() {
            if (div != null) div.animate({
                left: -500
            });
        }
    });
    return new a();
});