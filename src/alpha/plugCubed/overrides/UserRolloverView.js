define(['jquery', 'plugCubed/handlers/OverrideHandler', 'plugCubed/Utils', 'plugCubed/Lang'], function($, OverrideHandler, p3Utils, p3Lang) {
    var Context, CurrentUser, Handler, UserRolloverView, quickBan, quickMute, quickInfo;

    Context = window.plugCubedModules.context;
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
                    if ((CurrentUser.get('role') > a.get('role')) || CurrentUser.get('gRole') > 0) {
                        quickBan = $('<div>').addClass('action p3-qban').append($('<i>').addClass('icon-p3-qban'));
                        quickMute = $('<div>').addClass('action p3-qmute').append($('<i>').addClass('icon-p3-qmute'));
                        quickInfo = $('<div>').addClass('action p3-qinfo').append($('<i>').addClass('icon icon-user-white'));

                        quickBan.on({
                            click: function() {
                                Context.trigger('tooltip:hide', p3Lang.i18n('tooltip.quickBan'), $(this), true);
                                p3Utils.banUser(a.id, API.BAN.PERMA);
                                this.cleanup();
                            }.bind(this),
                            mouseenter: function() {
                                Context.trigger('tooltip:show', p3Lang.i18n('tooltip.quickBan'), $(this), true);
                            },
                            mouseleave: function() {
                                Context.trigger('tooltip:hide', p3Lang.i18n('tooltip.quickBan'), $(this), true);
                            }
                        });
                        quickInfo.on({
                            click: function() {
                                Context.trigger('tooltip:hide', p3Lang.i18n('tooltip.userInfo'), $(this), true);
                                p3Utils.getUserInfo(a.id);
                                this.cleanup();
                            }.bind(this),
                            mouseenter: function() {
                                Context.trigger('tooltip:show', p3Lang.i18n('tooltip.userInfo'), $(this), true);
                            },
                            mouseleave: function() {
                                Context.trigger('tooltip:hide', p3Lang.i18n('tooltip.userInfo'), $(this), true);
                            }
                        });
                        quickMute.on({
                            click: function() {
                                Context.trigger('tooltip:hide', p3Lang.i18n('tooltip.quickMute'), $(this), true);
                                p3Utils.muteUser(a.id, API.MUTE.LONG);
                                this.cleanup();
                            }.bind(this),
                            mouseenter: function() {
                                Context.trigger('tooltip:show', p3Lang.i18n('tooltip.quickMute'), $(this), true);
                            },
                            mouseleave: function() {
                                Context.trigger('tooltip:hide', p3Lang.i18n('tooltip.quickMute'), $(this), true);
                            }
                        });
                        if (!this.$el.find('.actions .p3-qban').length && !this.$el.find('.actions .rcs-qban').length) {
                            actions.append(quickBan);
                        }
                        if (!this.$el.find('.actions .p3-qmute').length && !this.$el.find('.actions .rcs-qmute').length) {
                            actions.append(quickMute);
                        }
                        if (!this.$el.find('.actions .p3-qinfo').length && !this.$el.find('.actions .rcs-qinfo').length) {
                            actions.append(quickInfo);
                        }
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
                if (quickBan != null) {
                    quickBan.remove();
                }
                if (quickInfo != null) {
                    quickInfo.remove();
                }
                if (quickMute != null) {
                    quickMute.remove();
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
