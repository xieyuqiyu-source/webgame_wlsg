import { COMBAT_ACTION_TYPES, COMBAT_RULE_IDS } from './combatConstants.js'

export const COMBAT_RULE_DEFINITIONS = {
  [COMBAT_RULE_IDS.CLASSIC_CRUSH]: {
    id: COMBAT_RULE_IDS.CLASSIC_CRUSH,
    name: '武林式碾压',
    description: '进攻方只看攻击池，防守方只看对应防御池。攻击池打穿防御池则守军覆灭，否则来军覆灭。',
    actionType: COMBAT_ACTION_TYPES.ATTACK,
    config: {
      survivorLossExponent: 1.45,
      attackerBreaksDefenseOnEqual: true,
      plunderOnVictory: true,
      winnerLossStrategy: 'weak-first',
      loserLossStrategy: 'proportional'
    }
  },
  [COMBAT_RULE_IDS.PLUNDER_STRIKE]: {
    id: COMBAT_RULE_IDS.PLUNDER_STRIKE,
    name: '掠夺试探',
    description: '掠夺不是不死不休。打穿防御后优先带走资源，双方伤亡明显低于正式进攻；未打穿时来军折损后撤。',
    actionType: COMBAT_ACTION_TYPES.PLUNDER,
    config: {
      survivorLossExponent: 1.85,
      attackerBreaksDefenseOnEqual: true,
      plunderOnVictory: true,
      winnerLossStrategy: 'proportional',
      loserLossStrategy: 'proportional',
      attackerWinDefenderLossRate: 0.45,
      attackerWinAttackerLossRate: 0.35,
      defenderHoldAttackerLossRate: 0.55,
      defenderHoldDefenderLossRate: 0.18
    }
  }
}

export const DEFAULT_COMBAT_RULE_ID = COMBAT_RULE_IDS.CLASSIC_CRUSH
