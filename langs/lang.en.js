// lang = 'English';
define('plugCubed/Lang',function() {
    return {
        running               : 'Running plug&#179; version %1',
        commandsHelp          : 'Use \'/commands\' to see expanded chat commands.',
        newVersion            : 'A new version of plug&#179; has been released. Your script will reload in a few seconds.',
        automuted             : '%1 automuted.',
        nextsong              : 'Your next queued song is %1 by %2',
        isHistory             : 'Warning: This song is still in the history (%1 of %2)',
        enable                : 'Enable',
        limit                 : 'Limit',
        historyCheck: {
            inHistory         : 'Song is in history (%1 of %2)',
            inHistorySkipped  : 'Song is in history (%1 of %2), but was skipped on the last play'
        },
        AFK                   : {
            information       : 'Please enter your away message here.\nThis is what you will reply via @mention.',
            default           : 'I\'m away from keyboard.'
        },
        commands: {
            header            : 'plug&#179; Commands',
            userCommands      : 'User Commands',
            modCommands       : 'Moderation Commands'
        },
        footer: {
            socket            : 'Socket status: %1',
            seperator         : ' | ',
            online            : 'Online',
            offline           : 'Offline',
            unknown           : 'Unknown'
        },
        notify: {
            header            : 'Chat Notifications',
            join              : 'User Join',
            leave             : 'User Leave',
            curate            : 'User Curate',
            stats             : 'Song Stats',
            updates           : 'Song Updates',
            history           : 'Songs in history',
            message: {
                enabled       : 'Join/leave alerts enabled',
                disabled      : 'Join/leave alerts disabled',
                curate        : '%1 added %2 - %3',
                stats         : 'Stats:   %1 woots -- %2 mehs -- %3 curates',
                updates       : 'Now Playing: %1 by %2<br />Played by: %3',
                join          : '%1 just joined the room',
                leave: {
                    normal    : '%1 just left the room',
                    fan       : 'Your fan %1 just left the room',
                    friend    : 'Your friend %1 just left the room'
                }
            }
        },
        info: {
            header            : 'User Information',
            name              : 'Name',
            title             : 'Title',
            specialTitles: {
                developer     : 'plug&#179; Developer',
                sponsor       : 'plug&#179; Sponsor',
                vip           : 'plug&#179; VIP'
            },
            id                : 'ID',
            rank              : 'Rank',
            joined            : 'Time Joined',
            status            : 'Status',
            vote              : 'Vote',
            position          : 'Position',
            points            : 'Points',
            pointType: {
                dj            : '%1 DJ Points',
                listener      : '%1 Listener Points',
                curator       : '%1 Curator Points'
            },
            fans              : 'Fans',
            wootCount         : 'Woot Count',
            mehCount          : 'Meh Count',
            ratio             : 'Woot/Meh Ratio',
            djing             : 'Currently DJing',
            notinlist         : 'Not in waitlist nor booth',
            inbooth           : '%1/%2 in booth',
            inwaitlist        : '%1/%2 in waitlist',
            userDjing         : '%1 are currently DJing',
            userNextDJ        : '%1 are DJing next',
        },
        ranks: {
            you               : 'You',
            regular           : 'Regular',
            featureddj        : 'Featured DJ',
            bouncer           : 'Bouncer',
            manager           : 'Manager',
            cohost            : 'Co-Host',
            host              : 'Host',
            ambassador        : 'Ambassador',
            admin             : 'Admin'
        },
        menu: {
            autowoot          : 'Autowoot',
            autojoin          : 'Autojoin',
            customchatcolors  : 'Custom Chat Colors',
            afkstatus         : 'AFK Status',
            notify            : 'Notifications',
            limitchatlog      : 'Limit Chat Log',
            stream            : 'Stream',
            emoji             : 'Emoji',
            afktimers         : 'AFK Timers',
            roomsettings      : 'Room Settings'
        },
        status: {
            available         : 'Available',
            afk               : 'AFK',
            working           : 'Working',
            sleeping          : 'Sleeping'
        },
        vote: {
            meh               : 'Meh',
            woot              : 'Woot',
            undecided         : 'Undecided',
            djing             : 'DJing'
        },
        ignore: {
            enabled           : 'You are now ignoring %1',
            disabled          : 'You are no longer ignoring %1'
        },
        automute: {
            registered        : '%1 registered to automute on future plays.',
            unregistered      : '%1 removed from automute registry.'
        },
        error: {
            userNotFound      : 'User not found',
            ignoreSelf        : 'You can\'t ignore yourself',
            unknownModeration : 'Unknown moderation',
            unknownMenuKey    : 'Unknown menu key',
            emoji             : 'Error in reenabling Emoji',
            missingReason     : 'Missing reason'
        }
    };
});