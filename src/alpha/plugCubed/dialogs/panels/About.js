define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/dialogs/ControlPanel', 'plugCubed/Version', 'plugCubed/Lang'], function(Class, p3Utils, ControlPanel, Version, p3Lang) {
    var Handler, $contentDiv, $table, panel;

    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel(p3Lang.i18n('menu.about'));

            $contentDiv = $('<div>').append($('<h1>').text(p3Lang.i18n('panels.about.header')).css({
                'text-align': 'center'
            })).css({
                width: '500px',
                margin: '25px auto auto auto',
                'font-size': '17px'
            });
            $table = $('<table>').css({
                width: '100%',
                color: '#CC00CC',
                'font-size': '1.02em'
            });

            $table.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('panels.about.version') + ':')).append($('<span>').css('color', '#FFFFFF').text(Version.getSemver()))));

            $table.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('panels.about.website') + ':')).append($('<span>').css('color', '#FFFFFF').html('<a href="https://plugcubed.net" target="_blank" style="color:#FFFFFF;">' + p3Lang.i18n('panels.about.websiteText') + '</a>'))));

            $table.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('panels.about.translations') + ':')).append($('<span>').css('color', '#FFFFFF').html('<a href="https://crowdin.com/project/plug3" target="_blank" style="color:#FFFFFF;">' + p3Lang.i18n('panels.about.translationsText') + '</a>'))));

            $table.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('panels.about.translations') + ':')).append($('<span>').css('color', '#FFFFFF').html('<a href="https://crowdin.com/project/plugcubed-website" target="_blank" style="color:#FFFFFF;">' + p3Lang.i18n('panels.about.websitetranslationsText') + '</a>'))));

            $table.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('panels.about.discord') + ':')).append($('<span>').css('color', '#FFFFFF').html('<a href="https://plugcubed.net/discord" target="_blank" style="color:#FFFFFF;">' + p3Lang.i18n('panels.about.discordText') + '</a>'))));

            $table.append($('<tr>').append($('<td>').attr('colspan', 2).append($('<strong>').text(p3Lang.i18n('panels.about.version') + ':')).append($('<span>').css('color', '#FFFFFF').html('<a href="https://twitter.com/plugCubed" target="_blank" style="color:#FFFFFF;">' + p3Lang.i18n('panels.about.twitterText') + '</a>'))));

            $contentDiv.append($('<br>')).append($table);

            panel.addContent($contentDiv);

        },
        close: function() {
            ControlPanel.removePanel(panel);

            $contentDiv = $table = null;
        }
    });

    return new Handler();

});
