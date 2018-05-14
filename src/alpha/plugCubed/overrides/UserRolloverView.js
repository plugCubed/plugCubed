define(['jquery', 'plugCubed/handlers/OverrideHandler', 'plugCubed/Utils', 'plugCubed/Lang', 'lang/Lang'], function($, OverrideHandler, p3Utils, p3Lang, Lang) {
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
                var actions = this.$el.find('.actions');

                if (rank === 'dj') rank = 'residentdj';

                if (p3Utils.hasPermission(a.id, API.ROLE.COHOST) && !p3Utils.hasPermission(a.id, API.ROLE.HOST) && !p3Utils.hasPermission(a.id, API.ROLE.BOUNCER, true)) {
                    this.$roleIcon.removeClass().addClass('icon icon-chat-cohost');
                }
                if (CurrentUser.hasPermission(API.ROLE.BOUNCER) || CurrentUser.hasPermission(API.ROLE.BOUNCER, true) || p3Utils.isPlugCubedDeveloper() || p3Utils.isPlugCubedAmbassador()) {
                    if (this.$p3VoteIcon == null) {
                        this.$p3VoteIcon = $('<i>');
                    }
                    if (((CurrentUser.get('role') > this.user.get('role')) || CurrentUser.get('gRole') > window.plugCubedModules.GROLE.PLOT) && this.user.get('gRole') < window.plugCubedModules.GROLE.SITEMOD) {
                        this.$quickBan = $('<div>').addClass('action p3-qban').append($('<i>').addClass('icon-p3-qban'));
                        this.$quickMute = $('<div>').addClass('action p3-qmute').append($('<i>').addClass('icon-p3-qmute'));
                        this.$quickInfo = $('<div>').addClass('action p3-qinfo').append($('<i>').addClass('icon icon-user-white'));

                        this.$quickBan.on({
                            click: function() {
                                p3Utils.banUser(this.user.get('id'), API.BAN.PERMA);
                                this.cleanup();
                            }.bind(this)
                        }).attr('title', p3Lang.i18n('tooltip.quickBan'));
                        this.$quickInfo.on({
                            click: function() {
                                p3Utils.getUserInfo(this.user.get('id'));
                                this.cleanup();
                            }.bind(this)
                        }).attr('title', p3Lang.i18n('tooltip.userInfo'));
                        this.$quickMute.on({
                            click: function() {
                                p3Utils.muteUser(this.user.get('id'), API.MUTE.LONG);
                                this.cleanup();
                            }.bind(this)
                        }).attr('title', p3Lang.i18n('tooltip.quickMute'));
                        if (!this.$el.find('.actions .p3-qban').length && !this.$el.find('.actions .rcs-qban').length) {
                            actions.append(this.$quickBan);
                        }
                        if (!this.$el.find('.actions .p3-qmute').length && !this.$el.find('.actions .rcs-qmute').length) {
                            actions.append(this.$quickMute);
                        }
                        if (!this.$el.find('.actions .p3-qinfo').length && !this.$el.find('.actions .rcs-qinfo').length) {
                            actions.append(this.$quickInfo);
                        }
                    }

                    if (a.get('vote') && (a.get('vote') === 1 || a.get('vote') === -1)) {
                        var vote = a.get('vote');
                        var voteType = vote === -1 ? 'meh' : 'woot';

                        this.$p3VoteIcon.removeClass().addClass('p3VoteIcon icon icon-' + voteType).attr('title', Lang.vote[voteType]);
                        this.$meta.append(this.$p3VoteIcon);
                    } else {
                        this.$p3VoteIcon.remove();
                    }
                }

                if (this.$p3UserID == null) {
                    this.$p3UserID = $('<span>').addClass('p3UserID');
                }
                if (CurrentUser.get('gRole') < window.plugCubedModules.GROLE.SITEMOD) {
                    this.$p3UserID.text('User ID: ' + a.id);
                    this.$meta.append(this.$p3UserID);
                } else {
                    this.$p3UserID.remove();
                }
                this.$el.attr('class', function(pos, classes) {
                    return classes.replace(/\bid-\S+/g, '');
                }).addClass('id-' + a.id);
                this.$meta.attr('class', function(pos, classes) {
                    return classes.replace(/\bid-\S+/g, '');
                }).removeClass('rank-regular rank-residentdj rank-bouncer rank-manager rank-cohost rank-host rank-ambassador rank-admin').addClass('rank-' + rank + ' id-' + a.id);

                if (p3Utils.havePlugCubedRank(a.id)) {
                    if (this.$p3Role == null) {
                        this.$p3Role = $('<span>').addClass('p3Role');
                        this.$meta.append(this.$p3Role);
                    }

                    this.$meta.addClass('has-p3Role is-p3' + p3Utils.getHighestRank(a.id));
                    if (specialIconInfo != null) {
                        this.$p3Role.text($('<span>').html(specialIconInfo.title).text()).css({
                            'background-image': 'url("https://plugcubed.net/scripts/alpha/images/ranks/p3special.' + specialIconInfo.icon + '.png")'
                        }).attr('title', specialIconInfo.title);
                    } else {
                        this.$p3Role.text($('<span>').html(p3Utils.getHighestRankString(a.id)).text()).attr('title', p3Utils.getHighestRankString(a.id));
                    }
                }
                p3Utils.initTooltips();
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
                if (this.$quickBan != null) {
                    this.$quickBan.remove();
                }
                if (this.$quickInfo != null) {
                    this.$quickInfo.remove();
                }
                if (this.$quickMute != null) {
                    this.$quickMute.remove();
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
