define(['jquery', 'plugCubed/handlers/OverrideHandler', 'plugCubed/Utils'], function($, OverrideHandler, p3Utils) {
    var CurrentUser, Handler, UserRolloverView;

    CurrentUser = window.plugCubedModules.CurrentUser;
    UserRolloverView = window.plugCubedModules.userRollover;
    Handler = OverrideHandler.extend({
        doOverride: function() {
            if (typeof UserRolloverView._showSimple !== 'function') {
                UserRolloverView._showSimple = UserRolloverView.showSimple;
            }

            if (typeof UserRolloverView._clear !== 'function') {
                UserRolloverView._clear = UserRolloverView.clear;
            }

            UserRolloverView.showSimple = function(a, b) {
                this._showSimple(a, b);
                var specialIconInfo = p3Utils.getPlugCubedSpecial(a.id);
                var rank = p3Utils.getRank(a.id);

                if (rank === 'dj') rank = 'residentdj';

                if (p3Utils.hasPermission(a.id, API.ROLE.COHOST) && !p3Utils.hasPermission(a.id, API.ROLE.HOST) && !p3Utils.hasPermission(a.id, API.ROLE.BOUNCER, true)) {
                    this.$roleIcon.removeClass().addClass('icon icon-chat-cohost');
                }
                if (CurrentUser.hasPermission(API.ROLE.BOUNCER) || CurrentUser.hasPermission(API.ROLE.BOUNCER, true) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador()) {
                    if (this.$p3VoteIcon == null) {
                        this.$p3VoteIcon = $('<i>');
                    }

                    if (a.get('vote') && (a.get('vote') === 1 || a.get('vote') === -1)) {
                        var vote = a.get('vote');

                        this.$p3VoteIcon.removeClass().addClass('p3VoteIcon icon icon-' + (vote === -1 ? 'meh' : 'woot'));
                        this.$meta.append(this.$p3VoteIcon);
                    } else {
                        this.$p3VoteIcon.remove();
                    }
                }

                if (this.$p3UserID == null) {
                    this.$p3UserID = $('<span>').addClass('p3UserID');
                }
                if (CurrentUser.get('gRole') === 0) {
                    this.$p3UserID.text('User ID: ' + a.id);
                    this.$meta.append(this.$p3UserID);
                } else {
                    this.$p3UserID.remove();
                }

                this.$meta.removeClass('rank-regular rank-residentdj rank-bouncer rank-manager rank-cohost rank-host rank-ambassador rank-admin id-' + a.id).addClass('rank-' + rank + ' id-' + a.id);

                if (p3Utils.havePlugCubedRank(a.id)) {
                    if (this.$p3Role == null) {
                        this.$p3Role = $('<span>').addClass('p3Role');
                        this.$meta.append(this.$p3Role);
                    }

                    this.$meta.addClass('has-p3Role is-p3' + p3Utils.getHighestRank(a.id));
                    if (specialIconInfo != null) {
                        this.$p3Role.text($('<span>').html(specialIconInfo.title).text()).css({
                            'background-image': 'url("https://plugcubed.net/scripts/alpha/images/icons.p3special.' + specialIconInfo.icon + '.png")'
                        });
                    } else {
                        this.$p3Role.text($('<span>').html(p3Utils.getHighestRankString(a.id)).text());
                    }
                }
            };

            UserRolloverView.clear = function() {
                this._clear();
                if (this.$p3Role != null) {
                    this.$p3Role.empty();
                }
                if (this.$p3UserID != null) {
                    this.$p3UserID.empty();
                }
                if (this.$p3VoteIcon != null) {
                    this.$p3VoteIcon.empty();
                }
                this.$meta.removeClass('has-p3Role is-p3developer is-p3sponsor is-p3special is-p3ambassador is-p3donatorDiamond is-p3donatorPlatinum is-p3donatorGold is-p3donatorSilver is-p3donatorBronze rank-regular rank-residentdj rank-bouncer rank-manager rank-cohost rank--host rank-ambassador rank-admin');
            };
        },
        doRevert: function() {
            if (typeof UserRolloverView._showSimple === 'function') {
                UserRolloverView.showSimple = UserRolloverView._showSimple;
            }

            if (typeof UserRolloverView._clear === 'function') {
                UserRolloverView.clear = UserRolloverView._clear;
            }
        }
    });

    return new Handler();
});
