// lang = 'Portuguese - Brazil, Português - Brasil';
define('plugCubed/Lang',function() {
    return {
        disconnected          : "Desconectado de %1!",
        reloading             : "Recarregando a pagina em alguns segundos.",
        running               : 'Rodando plug&#179; versão %1',
        commandsHelp          : 'Use \'/commands\' para explicações sobre os comandos.',
        newVersion            : 'Uma nova versão do plug&#179; foi lançada. Seu script será reiniciado em alguns segundos.',
        automuted             : '%1 auto-mutado.',
        nextsong              : 'Sua proxima musica na fila é %1 de %2',
        isHistory             : 'Atenção: Esta musica ainda está no historico (%1 de %2)',
        enable                : 'Ativo',
        limit                 : 'Limite',
        historyCheck: {
            inHistory         : 'Esta musica esta no historico (%1 of %2)',
            inHistorySkipped  : 'Esta musica esta no historico (%1 of %2), mas foi saltada da ultima vez'
        },
        AFK                   : {
            information       : 'Por favor coloque sua mensagem aqui.\nEssa sera a mensagem de resposta ao @Mensão.',
            default           : 'Estou ausente!'
        },
        commands: {
            header            : 'Comandos do plugCubed',
            userCommands      : 'Comandos do usuario',
            modCommands       : 'Comandos do moderador'
        },
        footer: {
            socket            : 'Status: %1',
            seperator         : ' | ',
            online            : 'Online',
            offline           : 'Offline',
            unknown           : 'Desconhecido'
        },
        notify: {
            header            : 'Notificações de Chat',
            join              : 'Entrada do usuario',
            leave             : 'Saida do usuario',
            curate            : 'Votos do usuario',
            stats             : 'Estatisticas da musica',
            updates           : 'Atualizações da musica',
            message: {
                enabled       : 'Alarta de Entrada/Saida ativo',
                disabled      : 'Alarta de Entrada/Saida desativo',
                curate        : '%1 adicionado %2 - %3',
                stats         : 'Estatisticas:   %1 chatos -- %2 bacanas -- %3 votos',
                updates       : 'Tocando agora: %1 de %2<br />Tocado por: %3',
                join          : '%1 entrou na sala',
                leave: {
                    normal    : '%1 saiu da sala',
                    fan       : 'Seu fã %1 saiu da sala',
                    friend    : 'Seu amigo %1 entrou na sala'
                }
            }
        },
        info: {
            name              : 'Nome',
            title             : 'Titulo',
            specialTitles: {
                developer     : 'plugCubed Developer',
                vip           : 'plugCubed VIP'
            },
            id                : 'ID',
            rank              : 'Rank',
            joined            : 'Hora de entrada',
            status            : 'Status',
            vote              : 'Votos',
            position          : 'Posição',
            points            : 'Pontos',
            pointType: {
                dj            : '%1 Pontos do DJ',
                listener      : '%1 Pontos de ouvinte',
                curator       : '%1 Pontos de voto'
            },
            fans              : 'Fãs',
            wootCount         : 'Conta de Bacanas',
            mehCount          : 'Conta de Chatos',
            ratio             : 'Media de Chatos/Bacanas',
            djing             : 'Tocando atualmente',
            notinlist         : 'Ninguem na lista de espera e na cabine',
            inbooth           : '%1/%2 na cabine',
            inwaitlist        : '%1/%2 na lista de espera',
            userDjing         : '%1 estão tocando atualmente',
            userNextDJ        : '%1 vão tocar',
        },
        ranks: {
            you               : 'Você',
            regular           : 'Normal',
            featureddj        : 'DJ em destaque',
            bouncer           : 'Bouncer',
            manager           : 'Manager',
            cohost            : 'Co-Host',
            host              : 'Host',
            ambassador        : 'Anfitrião',
            admin             : 'Admin'
        },
        menu: {
            autowoot          : 'Auto Bacana',
            autojoin          : 'Auto Fila',
            userlist          : 'Lista de usuarios',
            customchatcolors  : 'Cores customizadas',
            afkstatus         : 'Status Ausente',
            notify            : 'Notificações',
            limitchatlog      : 'Limite no log de chat',
            stream            : 'Stream',
            emoji             : 'Emoji'
        },
        status: {
            available         : 'Disponivel',
            afk               : 'Ausente',
            working           : 'Ocupado',
            sleeping          : 'Adormecido'
        },
        vote: {
            meh               : 'Chato',
            woot              : 'Bacana',
            undecided         : 'Indeciso',
            djing             : 'Tocando'
        },
        ignore: {
            enabled           : 'Agora você está ignorando %1',
            disabled          : 'Agora você nao está ignorando %1'
        },
        automute: {
            registered: '%1 registrado para ser auto-mutado quando tocado novamente.',
            unregistered: '%1 removido dos registros de auto-mutado.'
        },
        error: {
            userNotFound      : 'Usuario nao encontrado',
            ignoreSelf        : 'Você nao pode ignorar você mesmo, idiota!',
            unknownModeration : 'Moderação desconhecida',
            unknownMenuKey    : 'Tecla de menu desconhecida',
            emoji             : 'Erro ao reabilitar Emoji'
        }
    };
});
