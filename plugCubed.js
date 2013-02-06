/**
 * @license Copyright (c) 2012-2013 by Jeremy "Colgate" Richardson and Thomas "TAT" Andresen
 * 
 * Permission to use and/or distribute this software for any purpose without fee is hereby granted,
 * provided that the above copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHORS DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE
 * INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHORS
 * BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 * @author  Jeremy "Colgate" Richardson
 * @author  Thomas "TAT" Andresen
 */

if (Class === undefined)
    (function(){var e=false,t=/xyz/.test(function(){xyz})?/\b_super\b/:/.*/;plugCubed.Class=function(){};Class.extend=function(n){function o(){if(!e&&plugCubed.init)plugCubed.init.apply(plugCubed,arguments);}var r=plugCubed.prototype;e=true;var i=new plugCubed;e=false;for(var s in n){i[s]=typeof n[s]=="function"&&typeof r[s]=="function"&&t.test(n[s])?function(e,t){return function(){var n=plugCubed._super;plugCubed._super=r[e];var i=t.apply(plugCubed,arguments);plugCubed._super=n;return i;}}(s,n[s]):n[s];}o.prototype=i;o.prototype.constructor=o;o.extend=arguments.callee;return o;};})();
if (plugCubed !== undefined)
    plugCubed.close();
String.prototype.equalsIgnoreCase = function(other) {
    return this.toLowerCase() === other.toLowerCase();
};
Math.randomRange = function(min,max) {
    return min + Math.floor(Math.random()*(max-min+1));
};
String.prototype.isHEX = function() {
    if (this.substr(0,1) !== "#") a = "#" + this;
    else a = this;
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
}

var plugCubedModel = Class.extend({
    guiButtons: {},
    detectPdP: function() {
        return typeof(pdpSocket) !== 'undefined' && pdpSocket._base_url === 'http://socket.plugpony.net:9000/gateway';
    },
    init: function() {
        this.version = "Running plug&#179; version 1.0.1";
        this.proxy = {
            menu: {
                onAutoWootClick:  $.proxy(this.onAutoWootClick, this),
                onAutoJoinClick:  $.proxy(this.onAutoJoinClick, this),
                onUserlistClick:  $.proxy(this.onUserlistClick, this),
                onAFKClick:       $.proxy(this.onAFKClick,      this),
                onNotifyClick:    $.proxy(this.onNotifyClick,   this),
                onStreamClick:    $.proxy(this.onStreamClick,   this),
                onColorClick:     $.proxy(this.onColorClick,    this)
            },
            onDjAdvance:          $.proxy(this.onDjAdvance,     this),
            onVoteUpdate:         $.proxy(this.onVoteUpdate,    this),
            onCurate:             $.proxy(this.onCurate,        this),
            onUserJoin:           $.proxy(this.onUserJoin,      this),
            onUserLeave:          $.proxy(this.onUserLeave,     this),
            onChat:               $.proxy(this.onChat,          this)
        };
        this.colors = {
            userCommands: "#66FFFF",
            modCommands:  "#FF0000",
            infoMessage1: "#FFFF00",
            infoMessage2: "#66FFFF",
            curates:      "#00FF00",
            userJoin:     "#3366FF",
            userLeave:    "#3366FF"
        };
        this.defaultAwayMsg = 'I\'m away from keyboard.';

        this.customColorsStyle = $('<style type="text/css"></css>');
        $('head').append(this.customColorsStyle);

        this.log(this.version, null, this.colors.infoMessage1);
        this.log("Use '/commands' to see expanded chat commands.", null, this.colors.infoMessage2);

        if (Models.chat._chatCommand === undefined)
            Models.chat._chatCommand = Models.chat.chatCommand;
        if (ChatModel._chatCommand   === undefined)
            ChatModel._chatCommand   = ChatModel.chatCommand;

        Models.chat.chatCommand = this.customChatCommand;
        ChatModel.chatCommand   = this.customChatCommand;
        Dialog.getInputField = function(a,b,c,d,e,f) {
            a = $('<input type="text" name="'+a+'" placeholder="'+c+'" maxlength="'+e+'" onKeyPress="return Dialog.onKeyPressHandler(event)"/>')
                .attr("value",d)
                .data("ph",c)
                .focus($.proxy(this.onInputFocus,this))
                .blur($.proxy(this.onInputBlur,this));
            f&&a.attr("disabled","disabled");
            return $("<div/>").addClass("dialog-input-container").append($("<span/>").addClass("dialog-input-label").text(b))
            .append($("<div/>").addClass("dialog-input-background").addClass("dialog-input").append(a))
        }
        
        this.loadSettings();

        var styles = [
            '#side-left .sidebar-content p { margin: 0; padding-top: 2px; text-indent: 15px; font-size: 10px; height:15px; }',
            '#side-left .sidebar-content p:hover { color:#66ff33; }',
            '#side-left .sidebar-content p:first-child { padding-top: 0px !important; }',
            '#side-left .sidebar-content h1.users { text-indent: 8px; color: #66FFFF; font-size: 16px; }',
            '#side-left .sidebar-content h3.waitlistspot { color: #66FFFF; text-align: left; font-size: 15px; margin-left: 8px }',
            '#side-left .sidebar-content p span.admin_current,#side-left .sidebar-content p span.admin_meh,#side-left .sidebar-content p span.admin_undecided,#side-left .sidebar-content p span.admin_woot,#side-left .sidebar-content p span.ambassador_current,',
            '#side-left .sidebar-content p span.ambassador_meh,#side-left .sidebar-content p span.ambassador_undecided,#side-left .sidebar-content p span.ambassador_woot,#side-left .sidebar-content p span.bouncer_current,#side-left .sidebar-content p span.bouncer_meh,',
            '#side-left .sidebar-content p span.bouncer_undecided,#side-left .sidebar-content p span.bouncer_woot,#side-left .sidebar-content p span.host_current,#side-left .sidebar-content p span.host_meh,#side-left .sidebar-content p span.host_undecided,',
            '#side-left .sidebar-content p span.host_woot,#side-left .sidebar-content p span.manager_current,#side-left .sidebar-content p span.manager_meh,#side-left .sidebar-content p span.manager_undecided,#side-left .sidebar-content p span.manager_woot,#side-left .sidebar-content p span.void {',
            '    background: url(http://tatdk.github.com/plugCubed/images/sprites.png) no-repeat;width:15px;height: 15px;position: relative;left: -5px;top:4px;display:inline-block',
            '}',
            '#side-left .sidebar-content p span.admin_current {background-position: -45px 0;}',
            '#side-left .sidebar-content p span.admin_meh {background-position: -30px 0;}',
            '#side-left .sidebar-content p span.admin_undecided {background-position: -15px 0;}',
            '#side-left .sidebar-content p span.admin_woot {background-position: 0 0;}',
            '#side-left .sidebar-content p span.ambassador_current {background-position: -45px -15px;}',
            '#side-left .sidebar-content p span.ambassador_meh {background-position: -30px -15px;}',
            '#side-left .sidebar-content p span.ambassador_undecided {background-position: -15px -15px;}',
            '#side-left .sidebar-content p span.ambassador_woot {background-position: 0 -15px;}',
            '#side-left .sidebar-content p span.bouncer_current {background-position: -45px -60px;}',
            '#side-left .sidebar-content p span.bouncer_meh {background-position: -30px -60px;}',
            '#side-left .sidebar-content p span.bouncer_undecided {background-position: -15px -60px;}',
            '#side-left .sidebar-content p span.bouncer_woot {background-position: 0 -60px;}',
            '#side-left .sidebar-content p span.host_current {background-position: -45px -30px;}',
            '#side-left .sidebar-content p span.host_meh {background-position: -30px -30px;}',
            '#side-left .sidebar-content p span.host_undecided {background-position: -15px -30px;}',
            '#side-left .sidebar-content p span.host_woot {background-position: 0 -30px;}',
            '#side-left .sidebar-content p span.manager_current {background-position: -45px -45px;}',
            '#side-left .sidebar-content p span.manager_meh {background-position: -30px -45px;}',
            '#side-left .sidebar-content p span.manager_undecided {background-position: -15px -45px;}',
            '#side-left .sidebar-content p span.manager_woot {background-position: 0 -45px;}',
            '#side-left .sidebar-content p span.void {background-position: 0px -75px;}',
            '#plugcubed-gui { position: absolute; margin-left:-522px; top: -320px; }',
            '#plugcubed-gui h2 { background-color: #0b0b0b; height: 112px; width: 156px; margin: 0; color: #fff; font-size: 13px; font-variant: small-caps; padding: 8px 0 0 12px; border-top: 1px dotted #292929; }',
            '#plugcubed-gui ul {list-style-type:none; margin:0; padding:0;}',
            '#plugcubed-gui li {float:left;}',
            '#plugcubed-gui p { background: #0b0b0b; height: 32px; padding-top: 8px; padding-left: 8px; cursor: pointer; font-variant: small-caps; width: 84px; font-size: 15px; margin: 0; }',
            '#plugcubed-gui p:hover {background-color: #3C3C3C}',
            '#plugcubed-gui h1 { background-color: #0b0b0b; height: 32px; padding-top: 8px; padding-left: 8px; cursor: pointer; font-variant: small-caps; width: 84px; font-size: 20px; margin: 0; }',
            '.sidebar {',
                'position: fixed;',
                'top: 0;',
                'height: 100%;',
                'width: 200px;',
                'z-index: 99999;',
                '-moz-user-select: none;',
                '-khtml-user-select: none;',
                '-webkit-user-select: none;',
                'user-select: none;',
                'background: rgb(69,72,77);',
                'background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzQ1NDg0ZCIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMDAwMDAiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);',
                'background: -moz-linear-gradient(top,  rgba(69,72,77,1) 0%, rgba(0,0,0,1) 100%);',
                'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(69,72,77,1)), color-stop(100%,rgba(0,0,0,1)));',
                'background: -webkit-linear-gradient(top,  rgba(69,72,77,1) 0%,rgba(0,0,0,1) 100%);',
                'background: -o-linear-gradient(top,  rgba(69,72,77,1) 0%,rgba(0,0,0,1) 100%);',
                'background: -ms-linear-gradient(top,  rgba(69,72,77,1) 0%,rgba(0,0,0,1) 100%);',
                'background: linear-gradient(to bottom,  rgba(69,72,77,1) 0%,rgba(0,0,0,1) 100%);',
                'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#45484d\', endColorstr=\'#000000\',GradientType=0 );',
            '}',
            '.sidebar#side-left {',
                'left: -220px;',
                'z-index: 99999;',
            '}',
            '.sidebar#side-right {',
                'right: -190px;',
                'z-index: 99999;',
            '}',
            '.sidebar-handle {',
                'width: 12px;',
                'height: 100%;',
                'z-index: 99999;',
                'margin: 0;',
                'padding: 0;',
                'background: #474747;',
                'box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, .9);',
                'cursor: "ne-resize";',
            '}',
            '.sidebar-handle span {',
                'display: block;',
                'position: absolute;',
                'width: 10px;',
                'top: 50%;',
                'text-align: center;',
                'letter-spacing: -1px;',
                'color: #000;',
            '}',
            '#side-left .sidebar-handle {',
                'float: right;',
            '}',
            '.sidebar-content {',
                'position: absolute;',
                'width: 185px;',
                'float: left;',
                'height: 100%;',
                'padding: 15px;',
                'overflow: scroll;',
            '}',
            /*
            // Is not working with the jQuery slide, need to find a fix for this
            '.sidebar-content ::-webkit-scrollbar-track {',
            '    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); ',
            '    -webkit-border-radius: 10px;',
            '    border-radius: 10px;',
            '}',
            '.sidebar-content ::-webkit-scrollbar-thumb {',
            '    -webkit-border-radius: 10px;',
            '    border-radius: 10px;',
            '    background: rgba(255,255,255,255,0.4); ',
            '    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5); ',
            '}',
            '.sidebar-content ::-webkit-scrollbar-thumb:window-inactive {',
            '    background: rgba(255,255,255,255,0.2); ',
            '}',
            */
            '#side-left a {',
                'display: block;',
                'min-width: 100%;',
                'cursor: pointer;',
                'padding: 5px;',
                'border-radius: 5px;',
            '}',
            '#side-left a span {',
                'padding-right: 8px;',
            '}',
            '#side-left a:hover {',
                'background-color: #333;',
            '}',
            '#side-left hr {',
                'height: 0;',
                'border: none;',
                'border-top: 1px solid #AAA;',
                'padding: 0;',
                'margin: 10px 0;',
            '}',
            '#side-right .sidebar-handle {',
                'float: left;',
            '}',
            '#side-right a {',
                'display: block;',
                'min-width: 100%;',
                'cursor: pointer;',
                'padding: 5px;',
                'border-radius: 3px;',
            '}',
            '#side-right a span {',
                'padding-right: 8px;',
            '}',
            '#side-right a:hover {',
                'background-color: #333;',
            '}',
            '#side-right hr {',
                'height: 0;',
                'border: none;',
                'border-top: 1px solid #AAA;',
                'padding: 0;',
                'margin: 10px 0px 10px 3px;',
            '}',
            '[class^="status-"], [class*=" status-"] {',
                'border-radius: 50%;',
                'width: 10px;',
                'height: 10px;',
                'background: yellow;',
                'display: inline-block;',
                'margin-right: 5px;',
            '}',
            '.status-on { background: green; }',
            '.status-off { background: red; }',
            '#dialog-custom-colors { width: 230px; height: 360px; }',
            '#dialog-custom-colors .dialog-body { height: 125px; }',
            '#dialog-custom-colors .dialog-cancel-button { right: 100px; }',
            '#dialog-custom-colors .dialog-submit-button { width: 75px; }',
            '#dialog-custom-colors .dialog-checkbox-container-enabled { left: 10px; top: 5px; }',
            '#dialog-custom-colors .dialog-input-background { width: 60px; left:150px; }'
        ];
        var scripts = [
        '/**',
        '* hoverIntent r6 // 2011.02.26 // jQuery 1.5.1+',
        '* <http://cherne.net/brian/resources/jquery.hoverIntent.html>',
        '* ',
        '* @param  f  onMouseOver function || An object with configuration options',
        '* @param  g  onMouseOut function  || Nothing (use configuration options object)',
        '* @author    Brian Cherne brian(at)cherne(dot)net',
        '*/',
        "(function($){$.fn.hoverIntent=function(f,g){var cfg={sensitivity:7,interval:100,timeout:0};cfg=$.extend(cfg,g?{over:f,out:g}:f);var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if((Math.abs(pX-cX)+Math.abs(pY-cY))<cfg.sensitivity){$(ob).unbind('mousemove',track);ob.hoverIntent_s=1;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=0;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=jQuery.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type=='mouseenter'){pX=ev.pageX;pY=ev.pageY;$(ob).bind('mousemove',track);if(ob.hoverIntent_s!=1){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).unbind('mousemove',track);if(ob.hoverIntent_s==1){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.bind('mouseenter',handleHover).bind('mouseleave',handleHover)}})(jQuery);",
        'if (jQuery.easing.easeOutQuart === undefined) jQuery.easing.easeOutQuart = function (a,b,c,d,e) { return -d*((b=b/e-1)*b*b*b-1)+c; }',
        '$("#side-right")',
        '    .hoverIntent(function() {',
        '        var timeout_r = $(this)',
        '            .data("timeout_r");',
        '        if (timeout_r) {',
        '            clearTimeout(timeout_r);',
        '        }',
        '        $(this)',
        '            .animate({',
        '                "right": "0px"',
        '            }, 300, "easeOutQuart");',
        '    }, function() {',
        '        $(this)',
        '            .data("timeout_r", setTimeout($.proxy(function() {',
        '            $(this)',
        '                .animate({',
        '                    "right": "-190px"',
        '                }, 300, "easeOutQuart");',
        '       }, this), 500));',
        '    });'
        ];
        $('body').prepend('<style type="text/css" id="plugcubed-css">' + "\n" + styles.join("\n") + "\n" + '</style>');
        $('body').append('<div id="side-left" class="sidebar">' +
        '    <div class="sidebar-content"></div>' +
        '</div><div id="side-right" class="sidebar">' +
        '    <div class="sidebar-handle"><span>||</span></div>' +
        '    <div class="sidebar-content"></div>' +
        '</div>');
        $('body').append('<script type="text/javascript">' + "\n" + scripts.join("\n") + "\n" + '</script>');
        this.initGUI();
        this.initAPIListeners();
        if (this.settings.userlist) {
            this.populateUserlist();
            this.showUserlist();
        } else this.hideUserlist();
        var users = API.getUsers();
        for (var i in users) {
            var a = users[i];
            if (a.wootcount === undefined) a.wootcount = 0;
            if (a.mehcount  === undefined) a.mehcount  = 0;
            if (a.curVote   === undefined) a.curVote   = 0;
            if (a.joinTime  === undefined) a.joinTime  = this.getTimestamp();
        }
    },
    close: function() {
        Models.chat.chatCommand = Models.chat._chatCommand;
        ChatModel.chatCommand = ChatModel._chatCommand;
        API.removeEventListener(API.DJ_ADVANCE,      this.proxy.onDjAdvance);
        API.removeEventListener(API.VOTE_UPDATE,     this.proxy.onVoteUpdate);
        API.removeEventListener(API.CURATE_UPDATE,   this.proxy.onCurate);
        API.removeEventListener(API.USER_JOIN,       this.proxy.onUserJoin);
        API.removeEventListener(API.USER_LEAVE,      this.proxy.onUserLeave);
        API.removeEventListener(API.CHAT,            this.proxy.onChat);
        for (var i in plugCubed.guiButtons) {
            if (i === undefined || plugCubed.guiButtons[i] === undefined) continue;
            $("#plugcubed-btn-" + i).unbind();
            delete plugCubed.guiButtons[i];
        }
        $('#plugcubed-css').remove();
        $('#plugcubed-js').remove();
        $('#side-right').remove();
        $('#side-left').remove();
        this.customColorsStyle.remove();
    },
    showUserlist: function() {
        $("#side-left").show().animate({ "left": "0px" }, 300, "easeOutQuart");
        if (this.detectPdP()) {
            if (userlistShow === true) $("#pdpUsers").hide();
            $("#pdpUsersToggle").hide();
        }
    },
    hideUserlist: function() {
        var sbarWidth = -$("#side-left").width()-20;
        $("#side-left").animate({ "left": sbarWidth + "px" }, 300, "easeOutQuart", function() {
            $("#side-left").hide();
        });
        if (this.detectPdP()) {
            if (userlistShow === true) $("#pdpUsers").show();
            $("#pdpUsersToggle").show();
        }
    },
    settings: {
        recent      : false,
        awaymsg     : '',
        autowoot    : false,
        autojoin    : false,
        userlist    : false,
        autorespond : false,
        menu        : false,
        notify      : false,
        customColors: false,
        colors      : {
            regular    : 'B0B0B0',
            featureddj : 'E90E82',
            bouncer    : 'E90E82',
            manager    : 'E90E82',
            cohost     : 'E90E82',
            host       : 'E90E82',
            ambassador : '9A50FF',
            admin      : '42A5DC'
        }
    },
    loadSettings: function() {
        if (localStorage.plugCubed === undefined) return;
        var save = JSON.parse(localStorage.plugCubed);
        for (var i in this.settings) {
            if (save[i] !== undefined) this.settings[i] = save[i];
        }
        this.settings.recent = false;
        if (this.settings.autowoot) this.woot();
        if (this.settings.userlist) {
            this.populateUserlist();
            this.showUserlist();
        }
        if (this.settings.customColors)
            this.updateCustomColors();
    },
    saveSettings: function() {
        localStorage.plugCubed = JSON.stringify(this.settings);
    },
    updateCustomColors: function() {
        if (this.settings.customColors)
            this.customColorsStyle.text(
                '.chat-from { color:#' + this.settings.colors.regular + '; }' +
                '.chat-from-featureddj { color:#' + this.settings.colors.featureddj + '; }' +
                '.chat-from-bouncer { color:#' + this.settings.colors.bouncer + '; }' +
                '.chat-from-manager { color:#' + this.settings.colors.manager + '; }' +
                '.chat-from-cohost { color:#' + this.settings.colors.cohost + '; }' +
                '.chat-from-host { color:#' + this.settings.colors.host + '; }' +
                '.chat-from-ambassador { color:#' + this.settings.colors.ambassador + '; }' +
                '.chat-from-admin { color:#' + this.settings.colors.admin + '; }'
            );
        else
            this.customColorsStyle.text('');
    },
    initAPIListeners: function() {
        API.addEventListener(API.DJ_ADVANCE,    this.proxy.onDjAdvance);
        API.addEventListener(API.VOTE_UPDATE,   this.proxy.onVoteUpdate);
        API.addEventListener(API.CURATE_UPDATE, this.proxy.onCurate);
        API.addEventListener(API.USER_JOIN,     this.proxy.onUserJoin);
        API.addEventListener(API.USER_LEAVE,    this.proxy.onUserLeave);
        API.addEventListener(API.CHAT,          this.proxy.onChat);
    },
    initGUI: function() {
        this.addGUIButton(this.settings.autowoot,      'woot',        'Autowoot',           this.proxy.menu.onAutoWootClick);
        this.addGUIButton(this.settings.autojoin,      'join',        'Autojoin',           this.proxy.menu.onAutoJoinClick);
        this.addGUIButton(this.settings.userlist,      'userlist',    'Userlist',           this.proxy.menu.onUserlistClick);
        this.addGUIButton(this.settings.customColors,  'colors',      'Custom chat colors', this.proxy.menu.onColorClick);
        this.addGUIButton(this.settings.autorespond,   'autorespond', 'AFK Status',         this.proxy.menu.onAFKClick);
        this.addGUIButton(this.settings.notify,        'notify',      'Notify',             this.proxy.menu.onNotifyClick);
        this.addGUIButton(!DB.settings.streamDisabled, 'stream',      'Stream',             this.proxy.menu.onStreamClick);
    },
    addGUIButton: function(setting,id,text,callback) {
        if (this.guiButtons[id] !== undefined) return;
        if ($('#side-right .sidebar-content').children().length > 0)
            $('#side-right .sidebar-content').append('<hr />');

        $('#side-right .sidebar-content').append('<a id="plugcubed-btn-' + id + '"><div class="status-' + (setting ? 'on' : 'off') + '"></div>' + text + '</a>');
        $('#plugcubed-btn-' + id).click(callback);

        this.guiButtons[id] = { text: text, callback:callback };
    },
    changeGUIColor: function(id,value) {
        $('#plugcubed-btn-' + id).find('[class^="status-"], [class*=" status-"]').attr('class','status-' + (value === true ? 'on' : 'off'));
    },
    populateUserlist: function() {
        if ($('#side-left .sidebar-content').children().length > 0)
            $('#side-left .sidebar-content').append('<hr />');

        $('#side-left .sidebar-content').html('<h1 class="users">Users: ' + API.getUsers().length + '</h1>');
        var spot = Models.room.getWaitListPosition();
        var waitlistDiv = $('<h3></h3>').addClass('waitlistspot').text('Waitlist: ' + (spot !== null ? spot + ' / ' : '') + Models.room.data.waitList.length);
        $('#side-left .sidebar-content').append(waitlistDiv).append('<hr />');
        var users = API.getUsers();
        for (var i in users)
            this.appendUser(users[i]);
    },
    log: function(message, from, color, changeToColor) {
        var style  = "",
            div,
            scroll = false;

        if (color) style = 'style="color:' + color + ';"';

        if (from) div = '<div class="chat-message"><span class="chat-from" ' + style + '>' + from + '</span><span class="chat-text" ' + style + '>: ' + message + '</span></div>';
        else      div = '<div class="chat-message"><span class="chat-text" ' + style + '>' + message + '</span></div>';

        if ($("#chat-messages")[0].scrollHeight - $("#chat-messages").scrollTop() == $("#chat-messages").outerHeight())
            scroll = true;

        var curChatDiv = Popout ? Popout.Chat.chatMessages : Chat.chatMessages,
            s          = curChatDiv.scrollTop()>curChatDiv[0].scrollHeight-curChatDiv.height()-20;

        curChatDiv.append(div);

        if (s) curChatDiv.scrollTop(curChatDiv[0].scrollHeight);
        
        if (changeToColor) {
            $(div).click(function(e) {
                this.childNodes[0].style.color = changeToColor;
            });
        }
    },
    appendUser: function(user) {
        var username = user.username,prefix;

             if (Models.room.data.staff[user.id] && Models.room.data.staff[user.id] == Models.user.BOUNCER) prefix = 'bouncer';
        else if (Models.room.data.staff[user.id] && Models.room.data.staff[user.id] == Models.user.MANAGER) prefix = 'manager';
        else if (Models.room.data.staff[user.id] && Models.room.data.staff[user.id] == Models.user.COHOST)  prefix = 'host';
        else if (Models.room.data.staff[user.id] && Models.room.data.staff[user.id] == 5)                   prefix = 'host';
        else if (Models.room.ambassadors[user.id])                                                          prefix = 'ambassador';
        else if (Models.room.admins[user.id])                                                               prefix = 'admin';
        else                                                                                                prefix = 'normal';

        if (Models.room.data.djs.length > 0 && Models.room.data.djs[0].user.id == user.id) {
            if (prefix === 'normal')
                this.drawUserlistItem('void', '#66FFFF', username);
            else
                this.drawUserlistItem(prefix + '_current', '#66FFFF', username);
        } else if (prefix === 'normal')
            this.drawUserlistItem('void',this.colorByVote(user.vote,user.curated), username);
        else
            this.drawUserlistItem(prefix + this.prefixByVote(user.vote), this.colorByVote(user.vote,user.curated), username);
    },
    colorByVote: function(vote,curated) {
        var color = '';
        if (vote === undefined && curated !== true)
            color = 'FFFFFF';
        else if (curated === true)
            color = 'BE187D';
        else {
            switch (vote) {
                case -1: color = 'ED1C24';
                case 1:  color = '3FFF00';
                default: color = 'FFFFFF';
            }
        }
        return '#' + color;
    },
    prefixByVote: function(vote) {
        var prefix = '';
        if (vote === undefined)
            prefix = 'undecided';
        else switch (vote) {
            case -1: prefix = 'meh'; break;
            case 1:  prefix = 'woot'; break;
            default: prefix = 'undecided'; break;
        }
        return '_' + prefix;
    },
    drawUserlistItem: function(prefix, color, username) {
        $('#side-left .sidebar-content').append(
            '<p><span style="cursor:pointer;color:' + color + ';' +
            (Models.room.data.djs.length > 0 && Models.room.data.djs[0].username == username ? 'font-size:15px;font-weight:bold;' : '') +
            '" onclick="$(\'#chat-input-field\').val($(\'#chat-input-field\').val() + \'@' + username + ' \').focus();"><span class="' + prefix + '"></span>' + username + '</span></p>'
        );
    },
    getUser: function(data) {
        if (data.substr(0,1) === "@")
            data = data.substr(1);
        data = data.trim();

        var users = API.getUsers();
        for (var i in users) {
            if (users[i].username.equalsIgnoreCase(data) || users[i].id.equalsIgnoreCase(data))
                return users[i];
        }
        return null;
    },
    moderation: function(target,type) {
        if (Models.room.data.staff[Models.user.data.id] && Models.room.data.staff[Models.user.data.id] >= Models.user.BOUNCER) {
            var service;
            switch (type) {
                case 'kick':     service = ModerationKickUserService; break;
                case 'removedj': service = ModerationRemoveDJService; break;
                case 'adddj':    service = ModerationAddDJService;    break;
                default:         log("Unknown moderation");          return;
            }
            var user = this.getUser(target);
            if (user === null) log("user not found");
            else              new service(user.id, " ");
        }
    },
    getUserInfo: function(data) {
        var user = this.getUser(data);
        if (user === null) log("user not found");
        else {
            var rank,
                status,
                voted,
                points    = user.djPoints + user.curatorPoints + user.listenerPoints,
                voteTotal = user.wootcount + user.mehcount;

                 if (Models.room.data.staff[user.id] && Models.room.data.staff[user.id] == Models.user.FEATUREDDJ) rank = 'Featured DJ';
            else if (Models.room.data.staff[user.id] && Models.room.data.staff[user.id] == Models.user.BOUNCER)    rank = 'Bouncer';
            else if (Models.room.data.staff[user.id] && Models.room.data.staff[user.id] == Models.user.MANAGER)    rank = 'Manager';
            else if (Models.room.data.staff[user.id] && Models.room.data.staff[user.id] == Models.user.COHOST)     rank = 'Co-Host';
            else if (Models.room.data.staff[user.id] && Models.room.data.staff[user.id] == 5)                      rank = 'Host';
            else if (Models.room.ambassadors[user.id])                                                             rank = 'Ambassador';
            else if (Models.room.admins[user.id])                                                                  rank = 'Admin';
            else                                                                                                   rank = 'User';

            switch (user.status) {
                case -1: status = "Idle"; break;
                default: status = "Available"; break;
                case 1:  status = "AFK"; break;
                case 2:  status = "Working"; break;
                case 3:  status = "Sleeping"; break;
            }

            switch (user.vote) {
                case -1:  voted = "Meh"; break;
                default:  voted = "Undecided"; break;
                case 1:   voted = "Woot"; break;
            }
            
            this.log('<table style="width:100%"><tr><td colspan="2"><strong>Name</strong>: <span style="color:#FFFFFF">' + user.username + '</span></td></tr>' + 
            '<tr><td colspan="2"><strong>ID</strong>: <span style="color:#FFFFFF">' + user.id + '</span></td></tr>' + 
             '<tr><td><strong>Rank</strong>: <span style="color:#FFFFFF">' + rank + '</span></td><td><strong>Time Joined</strong>: <span style="color:#FFFFFF">' + user.joinTime + '</span></td></tr>' + 
            '<tr><td><strong>Status</strong>: <span style="color:#FFFFFF">' + status + '</span></td><td><strong>Vote</strong>: <span style="color:#FFFFFF">' + voted + '</span></td></tr>' + 
            '<tr><td><strong>Points</strong>: <span style="color:#FFFFFF">' + points + '</span></td><td><strong>Fans</strong>: <span style="color:#FFFFFF">' + user.fans + '</span></td></tr>' + 
            '<tr><td><strong>Woot Count</strong>: <span style="color:#FFFFFF">' + user.wootcount + '</span></td><td><strong>Meh Count</strong>: <span style="color:#FFFFFF">' + user.mehcount + '</span></td></tr>' + 
            '<tr><td colspan="2" ><strong>Woot/Meh ratio</strong>: <span style="color:#FFFFFF">' + (voteTotal === 0 ? '0' : (user.wootcount/voteTotal).toFixed(2)) + '</span></td></tr></table>', null, "#cc00cc");
        }
    },
    onAutoWootClick: function() {
        this.settings.autowoot = !this.settings.autowoot;
        this.changeGUIColor('woot',this.settings.autowoot);
        if (this.settings.autowoot)
            $("#button-vote-positive").click();
        this.saveSettings();
    },
    onAutoJoinClick: function() {
        this.settings.autojoin = !this.settings.autojoin;
        this.changeGUIColor('join',this.settings.autojoin);
        if (this.settings.autojoin && $("#button-dj-waitlist-join").length > 0)
            API.waitListJoin();
        this.saveSettings();
    },
    onUserlistClick: function() {
        this.settings.userlist = !this.settings.userlist;
        this.changeGUIColor('userlist',this.settings.userlist);
        if (this.settings.userlist) {
            this.populateUserlist();
            this.showUserlist();
        } else {
            $("#side-left .sidebar-content").empty();
            this.hideUserlist();
        }
        this.saveSettings();
    },
    onAFKClick: function() {
        this.settings.autorespond = !this.settings.autorespond;
        this.changeGUIColor('autorespond',this.settings.autorespond);
        if (this.settings.autorespond) {
            var a = prompt("Please enter your away message here.\nThis is what you will reply via @mention.",this.settings.awaymsg === '' ? this.defaultAwayMsg : this.settings.awaymsg);
            if (a === null) {
                this.settings.autorespond = false;
                this.changeGUIColor('autorespond',false);
                return;
            }
            this.settings.awaymsg = a.trim() === '' ? this.defaultAwayMsg : a;
            if (Models.user.data.status != 2)
                Models.user.changeStatus(1);
        } else Models.user.changeStatus(0);
        this.saveSettings();
    },
    onNotifyClick: function() {
        this.settings.notify = !this.settings.notify;
        this.changeGUIColor('notify',this.settings.notify);
        this.log("Join/leave alerts " + (this.settings.notify ? "enabled" : "disabled"), null, plugCubed.colors.infoMessage1);
        this.saveSettings();
    },
    onStreamClick: function() {
        this.changeGUIColor('stream',DB.settings.streamDisabled);
        API.sendChat(DB.settings.streamDisabled ? "/stream on" : "/stream off");
    },
    onColorClick: function() {
        Dialog.closeDialog();
        Dialog.context = "isCustomChatColors";
        Dialog.submitFunc = $.proxy(this.onColorSubmit, this);
        Dialog.showDialog(
            $("<div/>")
            .attr("id", "dialog-custom-colors")
            .addClass("dialog")
            .css("left",Main.LEFT+(Main.WIDTH-230)/2)
            .css("top",208.5)
            .append(Dialog.getHeader("Custom chat colors"))
            .append(
                $("<div/>")
                .addClass("dialog-body")
                .append(
                    $("<form/>")
                    .submit("return false")
                    .append(Dialog.getCheckBox("Enable custom", "enabled", this.settings.customColors))
                    .append($(Dialog.getInputField("regular", 'Regular', 'B0B0B0', this.settings.colors.regular, 6)).css('top',30))
                    .append($(Dialog.getInputField("featureddj", 'Featured DJ', 'E90E82', this.settings.colors.featureddj, 6)).css('top',60))
                    .append($(Dialog.getInputField("bouncer", 'Bouncer', 'E90E82', this.settings.colors.bouncer, 6)).css('top',90))
                    .append($(Dialog.getInputField("manager", 'Manager', 'E90E82', this.settings.colors.manager, 6)).css('top',120))
                    .append($(Dialog.getInputField("cohost", 'Co-Host', 'E90E82', this.settings.colors.cohost, 6)).css('top',150))
                    .append($(Dialog.getInputField("host", 'Host', 'E90E82', this.settings.colors.host, 6)).css('top',180))
                    .append($(Dialog.getInputField("ambassador", 'Ambassador', '9A50FF', this.settings.colors.ambassador, 6)).css('top',210))
                    .append($(Dialog.getInputField("admin", 'Admin', '42A5DC', this.settings.colors.admin, 6)).css('top',240))
                )
            )
            .append(Dialog.getCancelButton())
            .append(Dialog.getSubmitButton(Lang.dialog.save))
        )
    },
    onColorSubmit: function() {
        var a = $("input[name=regular]"),
            b = $("input[name=featureddj]"),
            c = $("input[name=bouncer]"),
            d = $("input[name=manager]"),
            e = $("input[name=cohost]"),
            f = $("input[name=host]"),
            g = $("input[name=ambassador]"),
            h = $("input[name=admin]");
        this.settings.customColors = $("#dialog-checkbox-enabled").is(":checked");
        if (a.val() === "")  a.data('ph');
        else if (a.val().isHEX()) this.settings.colors.regular = a.val();
        if (b.val() === "")  b.data('ph');
        else if (b.val().isHEX()) this.settings.colors.featureddj = b.val();
        if (c.val() === "")  c.data('ph');
        else if (c.val().isHEX()) this.settings.colors.bouncer = c.val();
        if (d.val() === "")  d.data('ph');
        else if (d.val().isHEX()) this.settings.colors.manager = d.val();
        if (e.val() === "")  e.data('ph');
        else if (e.val().isHEX()) this.settings.colors.cohost = e.val();
        if (f.val() === "")  f.data('ph');
        else if (f.val().isHEX()) this.settings.colors.host = f.val();
        if (g.val() === "")  g.data('ph');
        else if (g.val().isHEX()) this.settings.colors.ambassador = g.val();
        if (h.val() === "")  h.data('ph');
        else if (h.val().isHEX()) this.settings.colors.admin = h.val();
        this.updateCustomColors();
        this.changeGUIColor('colors',this.settings.customColors);
        this.saveSettings();
        Dialog.closeDialog();
    },
    onVoteUpdate: function(data) {
        var a = Models.room.userHash[data.user.id];
        this.onUserlistUpdate();
        if (a.curVote !== 0) {
                 if (a.curVote == 1)  a.wootcount--;
            else if (a.curVote == -1) a.mehcount--;
        }
             if (data.vote == 1)  a.wootcount++;
        else if (data.vote == -1) a.mehcount++;
        a.curVote = data.vote;
    },
    onCurate: function(data) {
        var media = API.getMedia();
        if (this.settings.notify === true)
            this.log(data.user.username + " added " + media.author + " - " + media.title, null, this.colors.curates);
        Models.room.userHash[data.user.id].curated = true;
        this.onUserlistUpdate();
    },
    onDjAdvance: function(data) {
        setTimeout($.proxy(this.onDjAdvanceLate,this),Math.randomRange(1,10));
        this.onUserlistUpdate();
        var users = API.getUsers();
        for (var i in users)
            users[i].curVote = 0;
    },
    onDjAdvanceLate: function(data) {
        if (this.settings.autowoot) this.woot();
        if ($("#button-dj-waitlist-join").css("display") === "block" && this.settings.autojoin)
            API.waitListJoin();
    },
    woot: function() {
        var dj = Models.room.data.djs[0];
        if (dj === null) return;
        if (dj == API.getSelf()) return;
        $('#button-vote-positive').click();
    },
    onUserJoin: function(data) {
        if (this.settings.notify === true)
            this.log(data.username + " joined the room", null, this.colors.userJoin);
        var a = Models.room.userHash[data.id];
        if (a.wootcount === undefined) a.wootcount = 0;
        if (a.mehcount === undefined)  a.mehcount = 0;
        if (a.curVote === undefined)   a.curVote = 0;
        if (a.joinTime === undefined)  a.joinTime = this.getTimestamp();
        this.onUserlistUpdate();
    },
    onUserLeave: function(data) {
        if (this.settings.notify === true)
            this.log(data.username + " left the room", null, this.colors.userLeave);
        this.onUserlistUpdate();
    },
    onChat: function(data) {
        if (data.type == "mention") {
            if (Models.room.data.staff[data.fromID] && Models.room.data.staff[data.fromID] >= Models.user.BOUNCER && data.message.indexOf("!disable") > 0) {
                if (this.settings.autojoin) {
                    this.settings.autojoin = false;
                    this.changeGUIColor('join',this.settings.autojoin);
                    this.saveSettings();
                    API.waitListLeave();
                    API.sendChat("@" + data.from + " Autojoin disabled");
                } else
                    API.sendChat("@" + data.from + " Autojoin was not enabled");
            } else if (this.settings.autorespond && !this.settings.recent) {
                this.settings.recent = true;
                setTimeout(function() { plugCubed.settings.recent = false; plugCubed.saveSettings(); },180000);
                API.sendChat("@" + data.from + " " + this.settings.awaymsg);
            }
        }
    },
    onUserlistUpdate: function() {
        if (this.settings.userlist)
            this.populateUserlist();
    },
    getTimestamp: function() {
        var time = new Date();
        var minutes = time.getMinutes();
        minutes = ( minutes < 10 ? "0" : "" ) + minutes;
        return (time.getHours()+":"+minutes);
    
    },
    customChatCommand: function(value) {
        if (Models.chat._chatCommand(value) === true) {
            if (value == '/stream on' || value == '/stream off')
                plugCubed.changeGUIColor('stream',!DB.settings.streamDisabled);
            if (value == '/afk' && plugCubed.settings.autojoin) {
                plugCubed.settings.autojoin = false;
                plugCubed.changeGUIColor('join',false);
                plugCubed.saveSettings();
            }
            return true;
        }
        if (value.indexOf("/commands") === 0) {
            var commands = [
                "<strong>User Commands</strong>",
                "/nick - change username",
                "/idle - set status to idle",
                "/avail - set status to available",
                "/afk - set status to afk",
                "/work - set status to working",
                "/sleep - set status to sleeping",
                "/leave - leaves dj booth/waitlist",
                "/woot - woots current song",
                "/meh - mehs current song",
                "/curate - add current song to your selected playlist",
                "/getpos - get current waitlist position",
                "/version - displays version number",
                "/commands - shows this list"
            ];
            plugCubed.log(commands.join('<br />'),null,plugCubed.colors.userCommands);
            if (Models.user.hasPermission(Models.user.BOUNCER)) {
                commands = [
                    "<strong>Moderation Commands</strong>",
                    "/whois (username) - gives general information about user",
                    "/skip - skip current song",
                    "/kick (username) - kicks targeted user",
                    "/lock - locks DJ booth",
                    "/unlock - unlocks DJ booth",
                    "/add (username) - adds targeted user to dj booth/waitlist",
                    "/remove (username) - removes targeted user from dj booth/waitlist"
                ];
                plugCubed.log(commands.join('<br />'),null,plugCubed.colors.modCommands);
            }
            return true;
        }
        if (value == "/idle") {
            Models.user.changeStatus(-1);
            return true;
        }
        if (value == "/avail" || value == "/available") {
            Models.user.changeStatus(0);
            return true;
        }
        if (value == "/brb" || value == "/away") {
            Models.user.changeStatus(1);
            if (plugCubed.settings.autojoin) {
                plugCubed.settings.autojoin = false;
                plugCubed.changeGUIColor('join',false);
                plugCubed.saveSettings();
            }
            return true;
        }
        if (value == "/work" || value == "/working") {
            Models.user.changeStatus(2);
            return true;
        }
        if (value == "/sleep" || value == "/sleeping") {
            Models.user.changeStatus(3);
            if (plugCubed.settings.autojoin) {
                plugCubed.settings.autojoin = false;
                plugCubed.changeGUIColor('join',false);
                plugCubed.saveSettings();
            }
            return true;
        }
        if (value == "/join")
            return API.waitListJoin(), true;
        if (value == "/leave")
            return API.waitListLeave(),true;
        if (value == "/woot")
            return $("#button-vote-positive").click(), true;
        if (value == "/meh")
            return $("#button-vote-negative").click(), true;
        if (value == "/version")
            return plugCubed.log(plugCubed.version, null, plugCubed.colors.infoMessage1), true;
        if (value.indexOf("/nick ") === 0)
            return Models.user.changeDisplayName(value.substr(6)), true;
        if (value.indexOf("/curate") === 0) {
            new DJCurateService(Models.playlist.selectedPlaylistID);
            setTimeout(function() { Dialog.closeDialog(); },500);
            return true;
        }
        if (value == "/alertsoff") {
            if (plugCubed.settings.notify) {
                plugCubed.log("Join/leave alerts disabled", null, plugCubed.colors.infoMessage1);
                plugCubed.settings.notify = false;
                plugCubed.changeGUIColor('notify',false);
            }
            return true;
        }
        if (value == "/alertson") {
            if (!plugCubed.settings.notify) {
                plugCubed.log("Join/leave alerts enabled", null, plugCubed.colors.infoMessage1);
                plugCubed.settings.notify = true;
                plugCubed.changeGUIColor('notify',true);
            }
            return true;
        }
        if (value == "/getpos") {
            var spot = Models.room.getWaitListPosition();
            if (spot !== null)
                plugCubed.log("Position in waitlist " + spot + "/" + Models.room.data.waitList.length, null, plugCubed.colors.infoMessage2);
            else
                plugCubed.log("Not in waitlist", null, plugCubed.colors.infoMessage2);
            return true;
        }
        if (Models.user.hasPermission(Models.user.BOUNCER)) {
            if (value.indexOf("/whois ") === 0) {
                plugCubed.getUserInfo(value.substr(7));
                return true;
            }
            if (value == "/skip") {
                new ModerationForceSkipService();
                return true;
            }
            if (value.indexOf("/kick ") === 0) {
                plugCubed.moderation(value.substr(6),'kick');
                return true;
            }
            if (value.indexOf("/add ") === 0) {
                plugCubed.moderation(value.substr(5),'adddj');
                return true;
            }
            if (value.indexOf("/remove ") === 0) {
                plugCubed.moderation(value.substr(8),'removedj');
                return true;
            }
        }
        if (Models.user.hasPermission(Models.user.MANAGER)) {
            if (value.indexOf("/lock") === 0) {
                new RoomPropsService(Slug,true,Models.room.data.waitListEnabled,Models.room.data.maxPlays,Models.room.data.maxDJs);
                return true;
            }
            if (value.indexOf("/unlock") === 0) {
                new RoomPropsService(Slug,false,Models.room.data.waitListEnabled,Models.room.data.maxPlays,Models.room.data.maxDJs);
                return true;
            }
        }
        return false;
    }
});
if (jQuery && ($("#plugcubed-js").length === 1 && $("#plugcubed-js").attr('src').indexOf("raw.github.com") === -1)) var plugCubed = new plugCubedModel();
else if (confirm("You need to update your plugCubed URL\nPlease click OK to visit our page to get the new URL.")) window.open("http://tatdk.github.com/plugCubed/","_blank");