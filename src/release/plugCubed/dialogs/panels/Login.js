define(['plugCubed/Class', 'plugCubed/dialogs/ControlPanel', 'plugCubed/Socket'], function(Class, ControlPanel, Socket) {
    var handler, loggedIn, $loginDiv, $selectButton, $contentDiv, panel;

    handler = Class.extend({
        register: function() {
            panel = ControlPanel.addPanel('Login');

            $contentDiv = $('<div>').append($('<p>').text('Login to your plugCubed account.')).append($('<p>').text('Using this system, you can validate and lock your userIDs to your plugCubed account.'));

            panel.addContent($contentDiv);

            function checkLoggedIn() {
                $.ajax({
                    dataType: 'json',
                    url: 'https://login.plugcubed.net/check',
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(data) {
                    loggedIn = data['loggedIn'];
                    $selectButton.changeLabel(loggedIn ? 'Already logged in' : 'Login');
                    $selectButton.changeSubmit(!loggedIn);
                }).error(function() {
                    loggedIn = false;
                    $selectButton.changeLabel('Login');
                    $selectButton.changeSubmit(true);
                });
            }

            $selectButton = ControlPanel.button(loggedIn ? 'Already logged in' : 'Login', !loggedIn, function() {
                if (loggedIn)
                    return;
                $selectButton.changeLabel('Please wait');
                var loginWindow = window.open('https://login.plugcubed.net', 'p3Login_' + Date.now(), 'height=200,width=520,toolbar=0,scrollbars=0,status=0,resizable=0,location=1,menubar=0');
                (function() {
                    var check = function() {
                        if (loginWindow.closed) {
                            checkLoggedIn();
                            return;
                        }
                        setTimeout(function() {
                            check();
                        }, 500);
                    };
                    setTimeout(function() {
                        check();
                    }, 1000);
                })();
            });

            checkLoggedIn();

            $loginDiv = $('<div>').width(500).css('margin', '25px auto auto auto').append($selectButton.getJQueryElement());

            panel.addContent($loginDiv);
        },
        close: function() {
            ControlPanel.removePanel(panel);
        }
    });

    return new handler();
});