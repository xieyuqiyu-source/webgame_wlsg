/**
 * 武林三国风格战斗规则
 * 核心：
 * 1. 进攻方只计算攻击池
 * 2. 防守方只计算对应防御池（步防 / 骑防）
 * 3. 攻防池比值决定守军是否被打穿，以及胜方会付出多少冲阵代价
 */

export const BATTLE_RULE_IDS = {
  CLASSIC_CRUSH: 'CLASSIC_CRUSH'
}

export const BATTLE_RESULTS = {
  ATTACKER_VICTORY: 'ATTACKER_VICTORY',
  DEFENDER_VICTORY: 'DEFENDER_VICTORY'
}

export const BATTLE_TIME_CONFIG = {
  BASE_MARCH_TIME: 2,

  calculateMarchTime(distance, army) {
    const slowestSpeed = this.getArmySlowestSpeed(army)
    const baseTime = distance * this.BASE_MARCH_TIME
    const speedModifier = slowestSpeed / 100
    return Math.ceil(baseTime / Math.max(speedModifier, 0.1))
  },

  getArmySlowestSpeed(army) {
    if (!army.units || army.units.length === 0) return 100
    return Math.min(...army.units.map((unit) => unit.speed || 100))
  }
}

const SURVIVOR_LOSS_EXPONENT = 1.45
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const getArmyTotalTroops = (army) => (army.units || []).reduce((sum, unit) => sum + (unit.count || 0), 0)

const getLossTotal = (lossEntries) => lossEntries.reduce((sum, entry) => sum + (entry.losses || 0), 0)

const getAttackerTypeWeights = (army) => {
  const total = getArmyTotalTroops(army)
  if (total <= 0) {
    return { infantry: 1, cavalry: 0 }
  }

  const infantry = (army.units || []).reduce((sum, unit) => {
    if (unit.unitType === 'infantry') {
      return sum + (unit.count || 0)
    }
    return sum
  }, 0)

  const cavalry = (army.units || []).reduce((sum, unit) => {
    if (unit.unitType === 'cavalry') {
      return sum + (unit.count || 0)
    }
    return sum
  }, 0)

  const infantryWeight = infantry / total
  const cavalryWeight = cavalry / total

  if (infantryWeight === 0 && cavalryWeight === 0) {
    return { infantry: 1, cavalry: 0 }
  }

  return {
    infantry: infantryWeight,
    cavalry: cavalryWeight
  }
}

const getRelevantDefense = (unit, attackerTypeWeights) => (
  (unit.infantryDefense || 0) * attackerTypeWeights.infantry +
  (unit.cavalryDefense || 0) * attackerTypeWeights.cavalry
)

const calculateAttackPool = (army) => {
  const units = army.units || []
  const totalTroops = getArmyTotalTroops(army)
  const totalAttack = units.reduce((sum, unit) => sum + ((unit.attack || 0) * (unit.count || 0)), 0)

  return {
    totalTroops,
    totalAttack,
    averageAttack: totalTroops > 0 ? totalAttack / totalTroops : 0
  }
}

const calculateDefensePool = (defenderArmy, attackerArmy) => {
  const units = defenderArmy.units || []
  const totalTroops = getArmyTotalTroops(defenderArmy)
  const attackerTypeWeights = getAttackerTypeWeights(attackerArmy)
  const totalDefense = units.reduce(
    (sum, unit) => sum + (getRelevantDefense(unit, attackerTypeWeights) * (unit.count || 0)),
    0
  )

  return {
    totalTroops,
    totalDefense,
    averageDefense: totalTroops > 0 ? totalDefense / totalTroops : 0
  }
}

const getBattleTier = (ratio) => {
  if (ratio >= 10) return 'ANNIHILATION'
  if (ratio >= 5) return 'CRUSH'
  if (ratio >= 2.5) return 'DOMINATE'
  if (ratio >= 1.25) return 'ADVANTAGE'
  return 'DESPERATE'
}

const allocateLossesByAbsoluteCount = (army, targetLosses, strategy = 'proportional') => {
  const units = (army.units || []).map((unit, index) => ({
    ...unit,
    __index: index,
    __count: unit.count || 0,
    __durability: (unit.infantryDefense || 0) + (unit.cavalryDefense || 0)
  }))

  if (units.length === 0) return []

  const cappedTarget = clamp(Math.floor(targetLosses), 0, units.reduce((sum, unit) => sum + unit.__count, 0))
  if (cappedTarget <= 0) {
    return units.map((unit) => ({
      ...unit,
      losses: 0,
      lossRatio: 0
    }))
  }

  const losses = new Array(units.length).fill(0)

  if (strategy === 'weak-first') {
    const sorted = [...units].sort((a, b) => {
      if (a.__durability === b.__durability) return a.__index - b.__index
      return a.__durability - b.__durability
    })

    let remaining = cappedTarget
    for (const unit of sorted) {
      if (remaining <= 0) break
      const casualties = Math.min(unit.__count, remaining)
      losses[unit.__index] = casualties
      remaining -= casualties
    }
  } else {
    const weights = units.map((unit) => unit.__count)
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    const exactLosses = weights.map((weight, index) => {
      const exact = totalWeight > 0 ? (cappedTarget * weight) / totalWeight : 0
      return {
        index,
        floor: Math.min(units[index].__count, Math.floor(exact)),
        remainder: exact - Math.floor(exact)
      }
    })

    let assigned = 0
    exactLosses.forEach((entry) => {
      losses[entry.index] = entry.floor
      assigned += entry.floor
    })

    let remaining = cappedTarget - assigned
    const sortedRemainders = [...exactLosses].sort((a, b) => {
      if (b.remainder === a.remainder) return a.index - b.index
      return b.remainder - a.remainder
    })

    for (const entry of sortedRemainders) {
      if (remaining <= 0) break
      if (losses[entry.index] < units[entry.index].__count) {
        losses[entry.index] += 1
        remaining -= 1
      }
    }
  }

  return units.map((unit, index) => ({
    ...unit,
    losses: losses[index],
    lossRatio: unit.__count > 0 ? losses[index] / unit.__count : 0
  }))
}

const buildLossList = (lossEntries) => (
  lossEntries
    .filter((entry) => (entry.losses || 0) > 0)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      count: entry.losses,
      lossRatio: entry.lossRatio
    }))
)

const calculateRemainingResources = (resources, plundered) => ({
  wood: Math.max(0, (resources.wood || 0) - (plundered.wood || 0)),
  soil: Math.max(0, (resources.soil || 0) - (plundered.soil || 0)),
  iron: Math.max(0, (resources.iron || 0) - (plundered.iron || 0)),
  food: Math.max(0, (resources.food || 0) - (plundered.food || 0))
})

const calculatePlunderedResources = (attackStats, defenderResources, battleResult) => {
  if (battleResult !== BATTLE_RESULTS.ATTACKER_VICTORY) {
    return { wood: 0, soil: 0, iron: 0, food: 0 }
  }

  const carryCapacity = attackStats.totalCarryCapacity || 0
  if (carryCapacity <= 0) {
    return { wood: 0, soil: 0, iron: 0, food: 0 }
  }

  const totalResources = (defenderResources.wood || 0) + (defenderResources.soil || 0) + (defenderResources.iron || 0) + (defenderResources.food || 0)
  if (totalResources <= 0) {
    return { wood: 0, soil: 0, iron: 0, food: 0 }
  }

  const plunderRatio = Math.min(carryCapacity, totalResources) / totalResources

  return {
    wood: Math.floor((defenderResources.wood || 0) * plunderRatio),
    soil: Math.floor((defenderResources.soil || 0) * plunderRatio),
    iron: Math.floor((defenderResources.iron || 0) * plunderRatio),
    food: Math.floor((defenderResources.food || 0) * plunderRatio)
  }
}

const createBattleResult = ({ rule, attackerArmy, defenderArmy, outcome }) => {
  const {
    battleResult,
    attackerLosses,
    defenderLosses,
    attackerLossRatio,
    defenderLossRatio,
    attackStats,
    defenseStats,
    powerRatio,
    defenderBreakDefense,
    battleTier,
    plundered,
    note
  } = outcome

  const defenderResources = defenderArmy.resources || { wood: 0, soil: 0, iron: 0, food: 0 }
  const remainingResources = calculateRemainingResources(defenderResources, plundered)

  return {
    ruleId: rule.id,
    battleResult,
    battleTime: new Date().toISOString(),
    attacker: {
      uuid: attackerArmy.playerInfo?.userUUID || 'player-uuid',
      nickname: attackerArmy.playerInfo?.nickname || '攻击方',
      faction: attackerArmy.faction || 'unknown',
      originalUnits: attackerArmy.units || [],
      losses: buildLossList(attackerLosses),
      carryResources: attackerArmy.carryResources || { wood: 0, soil: 0, iron: 0, food: 0 },
      lossRatio: attackerLossRatio
    },
    defender: {
      uuid: defenderArmy.npcInfo?.id || defenderArmy.playerInfo?.userUUID || 'defender-uuid',
      nickname: defenderArmy.npcInfo?.name || defenderArmy.playerInfo?.nickname || '防守方',
      faction: defenderArmy.faction || 'unknown',
      originalUnits: defenderArmy.units || [],
      losses: buildLossList(defenderLosses),
      originalResources: defenderResources,
      remainingResources,
      lossRatio: defenderLossRatio
    },
    details: {
      totalAttack: attackStats.totalAttack,
      totalDefense: defenseStats.totalDefense,
      powerRatio,
      marchTime: 0,
      battleTime: new Date().toISOString(),
      powerComparison: powerRatio,
      battleTier,
      defenderBreakDefense,
      attackerTotalTroops: attackStats.totalTroops,
      defenderTotalTroops: defenseStats.totalTroops,
      attackerEffectiveDefense: 0,
      defenderEffectiveDefense: defenseStats.totalDefense,
      carryCapacity: attackStats.totalCarryCapacity,
      plundered,
      note
    }
  }
}

const calculateAttackerLossesWhenWinning = ({ attackStats, defenseStats, powerRatio }) => {
  if (attackStats.averageAttack <= 0) return 0

  const theoreticalLosses = defenseStats.totalDefense / attackStats.averageAttack
  const dominanceRatio = Math.max(powerRatio, 1)
  const realizedLosses = theoreticalLosses / Math.pow(dominanceRatio, SURVIVOR_LOSS_EXPONENT)

  return clamp(Math.round(realizedLosses), 0, Math.max(attackStats.totalTroops - 1, 0))
}

const calculateDefenderLossesWhenHolding = ({ attackStats, defenseStats, powerRatio }) => {
  if (defenseStats.averageDefense <= 0) return 0

  const theoreticalKills = attackStats.totalAttack / defenseStats.averageDefense
  const penetrationShare = attackStats.totalAttack / Math.max(defenseStats.totalDefense, 1)
  const realizedKills = theoreticalKills * Math.pow(clamp(penetrationShare, 0, 1), SURVIVOR_LOSS_EXPONENT)

  return clamp(Math.round(realizedKills), 0, Math.max(defenseStats.totalTroops - 1, 0))
}

const CLASSIC_CRUSH_RULE = {
  id: BATTLE_RULE_IDS.CLASSIC_CRUSH,
  name: '武林式碾压',
  description: '进攻方只看攻击池，防守方只看对应防御池。攻击池打穿防御池则守军覆灭，否则来军覆灭。',

  calculateBattle(attackerArmy, defenderArmy) {
    const attackStats = {
      ...calculateAttackPool(attackerArmy),
      totalCarryCapacity: (attackerArmy.units || []).reduce((sum, unit) => sum + ((unit.carryCapacity || 0) * (unit.count || 0)), 0)
    }
    const defenseStats = calculateDefensePool(defenderArmy, attackerArmy)
    const defenderResources = defenderArmy.resources || { wood: 0, soil: 0, iron: 0, food: 0 }

    const powerRatio = attackStats.totalAttack / Math.max(defenseStats.totalDefense, 1)
    const attackerBreakDefense = attackStats.totalAttack >= defenseStats.totalDefense
    const battleResult = attackerBreakDefense
      ? BATTLE_RESULTS.ATTACKER_VICTORY
      : BATTLE_RESULTS.DEFENDER_VICTORY
    const battleTier = getBattleTier(attackerBreakDefense ? powerRatio : 1 / Math.max(powerRatio, 0.0001))

    let attackerLossCount = 0
    let defenderLossCount = 0
    let note = ''

    if (attackerBreakDefense) {
      defenderLossCount = defenseStats.totalTroops
      attackerLossCount = calculateAttackerLossesWhenWinning({ attackStats, defenseStats, powerRatio })
      note = powerRatio >= 5 ? '攻击池远超守军防御池，形成碾压' : '攻击池打穿守军防御池'
    } else {
      attackerLossCount = attackStats.totalTroops
      defenderLossCount = calculateDefenderLossesWhenHolding({ attackStats, defenseStats, powerRatio })
      note = powerRatio <= 0.4 ? '攻击池明显不足，来军被防守方顶住' : '攻击池未能打穿防御池，来军战败'
    }

    const attackerLosses = allocateLossesByAbsoluteCount(attackerArmy, attackerLossCount, 'weak-first')
    const defenderLosses = allocateLossesByAbsoluteCount(defenderArmy, defenderLossCount, 'weighted-defense')
    const attackerLossRatio = attackStats.totalTroops > 0 ? getLossTotal(attackerLosses) / attackStats.totalTroops : 0
    const defenderLossRatio = defenseStats.totalTroops > 0 ? getLossTotal(defenderLosses) / defenseStats.totalTroops : 0
    const plundered = calculatePlunderedResources(attackStats, defenderResources, battleResult)

    return createBattleResult({
      rule: this,
      attackerArmy,
      defenderArmy,
      outcome: {
        battleResult,
        attackerLosses,
        defenderLosses,
        attackerLossRatio,
        defenderLossRatio,
        attackStats,
        defenseStats,
        powerRatio,
        defenderBreakDefense: attackerBreakDefense,
        battleTier,
        plundered,
        note
      }
    })
  }
}

export const BATTLE_RULES = {
  [BATTLE_RULE_IDS.CLASSIC_CRUSH]: CLASSIC_CRUSH_RULE
}

export const DEFAULT_BATTLE_RULE = BATTLE_RULE_IDS.CLASSIC_CRUSH

export const calculateLosses = (army, lossRatio) => {
  const totalTroops = getArmyTotalTroops(army)
  return allocateLossesByAbsoluteCount(army, Math.floor(totalTroops * lossRatio), 'proportional')
}

export function getBattleRule(ruleId) {
  return BATTLE_RULES[ruleId] || BATTLE_RULES[DEFAULT_BATTLE_RULE]
}

export function getAllBattleRules() {
  return Object.values(BATTLE_RULES)
}

export function isValidBattleRuleId(ruleId) {
  return Object.values(BATTLE_RULE_IDS).includes(ruleId)
}
