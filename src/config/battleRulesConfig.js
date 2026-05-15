/**
 * 兼容层：
 * 战斗规则的真正实现已迁移到 domain/combat。
 * 这里保留旧导出名，避免现有引用一次性全部断掉。
 */

import { COMBAT_RESULTS, COMBAT_RULE_IDS, COMBAT_TIME_CONFIG } from '../domain/combat/combatConstants.js'
import { DEFAULT_COMBAT_RULE_ID } from '../domain/combat/combatRules.js'
import { getAllCombatRules, getCombatRule, isValidCombatRuleId } from '../domain/combat/combatService.js'

export const BATTLE_RULE_IDS = COMBAT_RULE_IDS
export const BATTLE_RESULTS = COMBAT_RESULTS
export const BATTLE_TIME_CONFIG = COMBAT_TIME_CONFIG
export const DEFAULT_BATTLE_RULE = DEFAULT_COMBAT_RULE_ID

export const BATTLE_RULES = getAllCombatRules().reduce((result, rule) => {
  result[rule.id] = rule
  return result
}, {})

export const calculateLosses = (army, lossRatio) => {
  const totalTroops = (army.units || []).reduce((sum, unit) => sum + (unit.count || 0), 0)
  const proportionalLosses = Math.floor(totalTroops * lossRatio)
  return (army.units || []).map((unit) => {
    const exactLoss = totalTroops > 0 ? (proportionalLosses * (unit.count || 0)) / totalTroops : 0
    const losses = Math.min(unit.count || 0, Math.round(exactLoss))
    return {
      ...unit,
      losses,
      lossRatio: (unit.count || 0) > 0 ? losses / unit.count : 0
    }
  })
}

export function getBattleRule(ruleId) {
  return getCombatRule(ruleId)
}

export function getAllBattleRules() {
  return getAllCombatRules()
}

export function isValidBattleRuleId(ruleId) {
  return isValidCombatRuleId(ruleId)
}
