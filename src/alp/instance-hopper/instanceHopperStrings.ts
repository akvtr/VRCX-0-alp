import { useTranslation } from 'react-i18next';

// Kept inside the module instead of the shared locale files so the feature
// can be added or removed without touching upstream translations.
const english = {
    title: 'Instance Hopper',
    description:
        'Visit busy public instances of a world one by one with self-invites.',
    worldLabel: 'World ID or URL',
    worldPlaceholder: 'wrld_… or https://vrchat.com/home/world/…',
    minUsersLabel: 'Minimum players',
    dwellLabel: 'Auto-advance after (minutes, 0 = manual)',
    scan: 'Scan',
    start: 'Start hopping',
    next: 'Next instance',
    stop: 'Stop',
    invite: 'Invite me',
    invalidWorld: 'Enter a valid world ID or world URL.',
    scanFailed: 'Could not load the world instances.',
    inviteFailed: 'Could not send the self-invite.',
    noCandidates:
        'No public instances meet the threshold. Only public instances are listed by VRChat.',
    finished: 'Every matching instance has been visited.',
    statusIdle: 'Idle',
    statusInvited: 'Invite sent, waiting for you to join',
    statusArrived: 'In the target instance',
    statusAdvanceIn: 'Next in',
    players: 'players',
    visited: 'Visited',
    current: 'You are here',
    target: 'Target',
    lastScanned: 'Last scanned'
};

type HopperStrings = typeof english;

const japanese: HopperStrings = {
    title: 'インスタンス巡回',
    description:
        'ワールドの人が多い Public インスタンスを、自分宛ての invite で順番に巡ります。',
    worldLabel: 'ワールド ID または URL',
    worldPlaceholder: 'wrld_… または https://vrchat.com/home/world/…',
    minUsersLabel: '最低人数',
    dwellLabel: '自動で次へ進むまでの時間（分、0 = 手動）',
    scan: 'スキャン',
    start: '巡回開始',
    next: '次のインスタンスへ',
    stop: '停止',
    invite: '自分を招待',
    invalidWorld: '正しいワールド ID か URL を入力してください。',
    scanFailed: 'インスタンス一覧を取得できませんでした。',
    inviteFailed: '自分宛ての invite を送れませんでした。',
    noCandidates:
        '条件を満たす Public インスタンスがありません。VRChat が一覧に出すのは Public インスタンスだけです。',
    finished: '条件に合うインスタンスはすべて巡回しました。',
    statusIdle: '待機中',
    statusInvited: 'invite 送信済み、参加待ち',
    statusArrived: '目的のインスタンスにいます',
    statusAdvanceIn: '次へ進むまで',
    players: '人',
    visited: '訪問済み',
    current: '現在地',
    target: '目的地',
    lastScanned: '最終スキャン'
};

export function useInstanceHopperStrings(): HopperStrings {
    const { i18n } = useTranslation();
    return i18n.language?.startsWith('ja') ? japanese : english;
}
