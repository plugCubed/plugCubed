define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RoomSettings', 'plugCubed/Lang'], function(Class, p3Utils, ControlPanel, Styles, RoomSettings, p3Lang) {
    var Handler, $contentDiv, $formDiv, $localFileInput, $clearButton, $submitButton, panel, value;

    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel(p3Lang.i18n('menu.background'));

            if (panel === null) return; // This happens if the panel already exists.

            $contentDiv = $('<div>').append($('<p>').text(p3Lang.i18n('panels.background.description')).width(207).css('margin', '25px auto auto auto'));

            panel.addContent($contentDiv);

            $formDiv = $('<div>').width(280).css('margin', '25px auto auto auto');
            $localFileInput = ControlPanel.inputField('url', undefined, 'URL To Background').change(function(e) {
                value = e.target.value;
            });
            $submitButton = ControlPanel.button(p3Lang.i18n('panels.buttons.submit'), true, function() {
                if (value != null) {
                    var url = value;

                    if (p3Utils.endsWithIgnoreCase(url, ['.gif', '.jpg', '.jpeg', '.png']) || p3Utils.endsWithIgnoreCase(p3Utils.getBaseURL(url), ['.gif', '.jpg', '.jpeg', '.png'])) {
                        url = p3Utils.proxifyImage(url);
                        $.get(url, function(dat, stat) {
                            if (stat === 'success') {
                                Styles.set('room-settings-background-image', '.left-side-wrapper { background: url(' + url + ') !important; }');
                            }
                        });
                        this.changeSubmit(false);
                        $clearButton.changeSubmit(true);
                    }
                }
            });
            $clearButton = ControlPanel.button(p3Lang.i18n('panels.buttons.clear'), false, function() {
                RoomSettings.execute();
                this.changeSubmit(false);
                $submitButton.changeSubmit(true);
            });

            $formDiv.append($localFileInput.getJQueryElement()).append($submitButton.getJQueryElement()).append($clearButton.getJQueryElement());

            panel.addContent($formDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);

            $contentDiv = $formDiv = $localFileInput = panel = null;
        }
    });

    return new Handler();
});
