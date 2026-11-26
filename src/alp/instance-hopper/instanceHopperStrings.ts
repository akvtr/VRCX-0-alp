import { useAlpLocale } from '../shared/useAlpLocale';

const english = {
    title: 'Instance Hopper',
    description:
        'Send yourself invites to the busy public instances of a world, one every few seconds.',
    worldLabel: 'World ID or URL',
    worldPlaceholder: 'wrld_… or https://vrchat.com/home/world/…',
    minUsersLabel: 'Minimum players',
    scan: 'Scan',
    sendAll: 'Invite me to all',
    stop: 'Stop',
    invite: 'Invite me',
    invalidWorld: 'Enter a valid world ID or world URL.',
    scanFailed: 'Could not load the world instances.',
    inviteFailed: 'Could not send the self-invite.',
    noCandidates:
        'No public instances meet the threshold. Only public instances are listed by VRChat.',
    finished: 'Invites sent to every matching instance.',
    sentProgress: 'Sent',
    nextInviteIn: 'Next invite in',
    players: 'players',
    current: 'You are here',
    inviteSent: 'Invited',
    inviteFailedBadge: 'Failed',
    lastScanned: 'Last scanned',
    lastJoined: 'Last joined',
    neverJoined: 'Never joined'
};

type HopperStrings = typeof english;

const japanese: HopperStrings = {
    title: 'インスタンス巡回',
    description:
        'ワールドの人が多い Public インスタンスへ、数秒おきに自分宛ての invite を送ります。',
    worldLabel: 'ワールド ID または URL',
    worldPlaceholder: 'wrld_… または https://vrchat.com/home/world/…',
    minUsersLabel: '最低人数',
    scan: 'スキャン',
    sendAll: '全部に自分を招待',
    stop: '停止',
    invite: '自分を招待',
    invalidWorld: '正しいワールド ID か URL を入力してください。',
    scanFailed: 'インスタンス一覧を取得できませんでした。',
    inviteFailed: '自分宛ての invite を送れませんでした。',
    noCandidates:
        '条件を満たす Public インスタンスがありません。VRChat が一覧に出すのは Public インスタンスだけです。',
    finished: '条件に合うすべてのインスタンスに invite を送りました。',
    sentProgress: '送信済み',
    nextInviteIn: '次の送信まで',
    players: '人',
    current: '現在地',
    inviteSent: '送信済み',
    inviteFailedBadge: '失敗',
    lastScanned: '最終スキャン',
    lastJoined: '最終参加',
    neverJoined: '参加履歴なし'
};

export function useInstanceHopperStrings(): HopperStrings {
    return useAlpLocale() === 'ja' ? japanese : english;
}
