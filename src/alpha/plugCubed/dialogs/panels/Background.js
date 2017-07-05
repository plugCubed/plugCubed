define(['plugCubed/Class', 'plugCubed/Utils', 'plugCubed/dialogs/ControlPanel', 'plugCubed/StyleManager', 'plugCubed/RoomSettings'], function(Class, p3Utils, ControlPanel, Styles, RoomSettings) {
    var Handler, $contentDiv, $formDiv, $localFileInput, $clearButton, $submitButton, panel, value;

    Handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Background');

            $contentDiv = $('<div>').append($('<p>').text('Set your own room background.')).width(430).css('margin', '25px auto auto auto');

            panel.addContent($contentDiv);

            $formDiv = $('<div>').width(500).css('margin', '25px auto auto auto');
            $localFileInput = ControlPanel.inputField('url', undefined, 'URL To Background').change(function(e) {
                value = e.target.value;
            });
            $submitButton = ControlPanel.button('Submit', true, function() {
                if (value != null) {
                    var url = value;

                    if (p3Utils.endsWithIgnoreCase(url, ['.gif', '.jpg', '.jpeg', '.png']) || p3Utils.endsWithIgnoreCase(p3Utils.getBaseURL(url), ['.gif', '.jpg', '.jpeg', '.png'])) {
                        url = p3Utils.proxifyImage(url);
                        $.get(url, function(dat, stat) {
                            if (stat === 'success') {
                                Styles.set('room-settings-background-image', '.room-background { background: url(' + url + ') fixed center center / cover !important; }');
                            }
                        });
                        this.changeSubmit(false);
                        $clearButton.changeSubmit(true);
                    }
                }
            });
            $clearButton = ControlPanel.button('Clear', false, function() {
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
