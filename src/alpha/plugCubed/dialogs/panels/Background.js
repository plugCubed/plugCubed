define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RoomSettings', 'plugCubed/Lang'], function(Class, p3Utils, ControlPanel, Styles, RoomSettings, p3Lang) {
    var Handler, $contentDiv, $formDiv, $localFileInput, $clearButton, $submitButton, $previewButton, panel, value, $previewImg;

    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel(p3Lang.i18n('menu.background'));

            if (panel === null) return; // This happens if the panel already exists.

            $contentDiv = $('<div>').append($('<p>').text(p3Lang.i18n('panels.background.description')).width(207).css('margin', '25px auto auto auto'));

            panel.addContent($contentDiv);

            $formDiv = $('<div>').width('100%').css({
                margin: '3% auto auto 17%'
            });

            $previewImg = $('<img id="p3-preview-background" style="max-width: 664px; max-height: 500px">');
            $localFileInput = ControlPanel.inputField('url', undefined, 'URL To Background').change(function(e) {
                value = e.target.value;
            });
            $localFileInput.getJQueryElement().find('input').css({
                width: '640px'
            });
            $submitButton = ControlPanel.button(p3Lang.i18n('panels.buttons.submit'), true, function() {
                if (value != null) {
                    var url = value;

                    if (p3Utils.endsWithIgnoreCase(url, ['.gif', '.jpg', '.jpeg', '.png']) || p3Utils.endsWithIgnoreCase(p3Utils.getBaseURL(url), ['.gif', '.jpg', '.jpeg', '.png'])) {
                        url = p3Utils.proxifyImage(url);
                        $.get(url, function(dat, stat) {
                            if (stat === 'success') {
                                Styles.set('room-settings-background-image', '.left-side-wrapper { background-image: url("' + url + '") !important; background-position-x: center !important; background-position-y: bottom !important; }');
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
            $clearButton.getJQueryElement().addClass('clear');
            $previewButton = ControlPanel.button(p3Lang.i18n('panels.buttons.preview'), true, function() {
                if (value != null) {
                    var url = value;

                    if (p3Utils.endsWithIgnoreCase(url, ['.gif', '.jpg', '.jpeg', '.png']) || p3Utils.endsWithIgnoreCase(p3Utils.getBaseURL(url), ['.gif', '.jpg', '.jpeg', '.png'])) {
                        url = p3Utils.proxifyImage(url);
                        $.get(url, function(dat, stat) {
                            if (stat === 'success') {
                                $('#p3-preview-background').attr('src', url);
                            }
                        });
                    }
                }
            });
            $previewButton.getJQueryElement().addClass('preview');
            $formDiv.append($localFileInput.getJQueryElement()).append($('<div>').addClass('btn-group').append($submitButton.getJQueryElement()).append($clearButton.getJQueryElement()).append($previewButton.getJQueryElement())).append($previewImg);

            panel.addContent($formDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);

            $contentDiv = $formDiv = $localFileInput = panel = null;
        }
    });

    return new Handler();
});
