import { COMBAT_ACTION_TYPES, COMBAT_RESULTS } from './combatConstants.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const getArmyTotalTroops = (army) => (army.units || []).reduce((sum, unit) => sum + (unit.count || 0), 0)

const getLossTotal = (lossEntries) => lossEntries.reduce((sum, entry) => sum + (entry.losses || 0), 0)

const getAttackerTypeWeights = (army) => {
  const total = getArmyTotalTroops(army)
  if (total <= 0) {
    return { infantry: 1, cavalry: 0 }
  }

  const infantry = (army.units || []).reduce((sum, unit) => {
    if (unit.unitType === 'infantry') return sum + (unit.count || 0)
    return sum
  }, 0)

  const cavalry = (army.units || []).reduce((sum, unit) => {
    if (unit.unitType === 'cavalry') return sum + (unit.count || 0)
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
    averageAttack: totalTroops > 0 ? totalAttack / totalTroops : 0,
    totalCarryCapacity: units.reduce((sum, unit) => sum + ((unit.carryCapacity || 0) * (unit.count || 0)), 0)
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

const RESOURCE_KEYS = ['wood', 'soil', 'iron', 'food']

const calculateSurvivingCarryCapacity = (attackerLosses = []) => (
  attackerLosses.reduce((total, entry) => {
    const survivors = Math.max(0, (entry.count || 0) - (entry.losses || 0))
    return total + survivors * (entry.carryCapacity || 0)
  }, 0)
)

const distributeProportionalResources = (capacity, resources, totalResources) => {
  const result = { wood: 0, soil: 0, iron: 0, food: 0 }
  const remainders = []
  let assigned = 0

  RESOURCE_KEYS.forEach((key) => {
    const stock = resources[key] || 0
    const exact = totalResources > 0 ? (capacity * stock) / totalResources : 0
    const floorValue = Math.min(stock, Math.floor(exact))
    result[key] = floorValue
    assigned += floorValue
    remainders.push({
      key,
      remainder: exact - floorValue
    })
  })

  let remaining = Math.max(0, capacity - assigned)

  while (remaining > 0) {
    const candidate = remainders
      .filter(({ key }) => (resources[key] || 0) > result[key])
      .sort((a, b) => {
        if (b.remainder === a.remainder) {
          return (resources[b.key] || 0) - (resources[a.key] || 0)
        }
        return b.remainder - a.remainder
      })[0]

    if (!candidate) break
    result[candidate.key] += 1
    remaining -= 1
    candidate.remainder = 0
  }

  return result
}

const calculatePlunderedResources = (survivingCarryCapacity, defenderResources, battleResult, actionType) => {
  if (battleResult !== COMBAT_RESULTS.ATTACKER_VICTORY) {
    return { wood: 0, soil: 0, iron: 0, food: 0 }
  }

  const carryCapacity = survivingCarryCapacity || 0
  if (carryCapacity <= 0) {
    return { wood: 0, soil: 0, iron: 0, food: 0 }
  }

  const totalResources = (defenderResources.wood || 0) + (defenderResources.soil || 0) + (defenderResources.iron || 0) + (defenderResources.food || 0)
  if (totalResources <= 0) {
    return { wood: 0, soil: 0, iron: 0, food: 0 }
  }

  const plunderFactor = actionType === COMBAT_ACTION_TYPES.PLUNDER ? 1 : 0.6
  const effectiveCapacity = Math.max(0, Math.floor(carryCapacity * plunderFactor))

  if (effectiveCapacity <= 0) {
    return { wood: 0, soil: 0, iron: 0, food: 0 }
  }

  if (totalResources <= effectiveCapacity) {
    return {
      wood: defenderResources.wood || 0,
      soil: defenderResources.soil || 0,
      iron: defenderResources.iron || 0,
      food: defenderResources.food || 0
    }
  }

  return distributeProportionalResources(effectiveCapacity, defenderResources, totalResources)
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
    note,
    survivingCarryCapacity
  } = outcome

  const defenderResources = defenderArmy.resources || { wood: 0, soil: 0, iron: 0, food: 0 }
  const remainingResources = calculateRemainingResources(defenderResources, plundered)

  return {
    ruleId: rule.id,
    actionType: rule.actionType,
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
      carryCapacity: survivingCarryCapacity,
      originalCarryCapacity: attackStats.totalCarryCapacity,
      plundered,
      note
    }
  }
}

const calculateAttackerLossesWhenWinning = ({ attackStats, defenseStats, powerRatio, survivorLossExponent }) => {
  if (attackStats.averageAttack <= 0) return 0

  const theoreticalLosses = defenseStats.totalDefense / attackStats.averageAttack
  const dominanceRatio = Math.max(powerRatio, 1)
  const realizedLosses = theoreticalLosses / Math.pow(dominanceRatio, survivorLossExponent)

  return clamp(Math.round(realizedLosses), 0, Math.max(attackStats.totalTroops - 1, 0))
}

const calculateDefenderLossesWhenHolding = ({ attackStats, defenseStats, powerRatio, survivorLossExponent }) => {
  if (defenseStats.averageDefense <= 0) return 0

  const theoreticalKills = attackStats.totalAttack / defenseStats.averageDefense
  const penetrationShare = attackStats.totalAttack / Math.max(defenseStats.totalDefense, 1)
  const realizedKills = theoreticalKills * Math.pow(clamp(penetrationShare, 0, 1), survivorLossExponent)

  return clamp(Math.round(realizedKills), 0, Math.max(defenseStats.totalTroops - 1, 0))
}

const calculateAttackOutcome = ({ rule, attackerArmy, defenderArmy, attackStats, defenseStats, powerRatio, attackerBreakDefense }) => {
  const battleResult = attackerBreakDefense
    ? COMBAT_RESULTS.ATTACKER_VICTORY
    : COMBAT_RESULTS.DEFENDER_VICTORY
  const battleTier = getBattleTier(attackerBreakDefense ? powerRatio : 1 / Math.max(powerRatio, 0.0001))

  let attackerLossCount = 0
  let defenderLossCount = 0
  let note = ''

  if (attackerBreakDefense) {
    defenderLossCount = defenseStats.totalTroops
    attackerLossCount = calculateAttackerLossesWhenWinning({
      attackStats,
      defenseStats,
      powerRatio,
      survivorLossExponent: rule.config.survivorLossExponent
    })
    note = powerRatio >= 5 ? '攻击池远超守军防御池，形成碾压' : '攻击池打穿守军防御池'
  } else {
    attackerLossCount = attackStats.totalTroops
    defenderLossCount = calculateDefenderLossesWhenHolding({
      attackStats,
      defenseStats,
      powerRatio,
      survivorLossExponent: rule.config.survivorLossExponent
    })
    note = powerRatio <= 0.4 ? '攻击池明显不足，来军被防守方顶住' : '攻击池未能打穿防御池，来军战败'
  }

  return {
    battleResult,
    battleTier,
    attackerLossCount,
    defenderLossCount,
    note
  }
}

const calculatePlunderOutcome = ({ rule, attackStats, defenseStats, powerRatio, attackerBreakDefense }) => {
  const battleResult = attackerBreakDefense
    ? COMBAT_RESULTS.ATTACKER_VICTORY
    : COMBAT_RESULTS.DEFENDER_VICTORY
  const battleTier = getBattleTier(attackerBreakDefense ? powerRatio : 1 / Math.max(powerRatio, 0.0001))

  const attackerLossBase = attackerBreakDefense
    ? attackStats.totalTroops * rule.config.attackerWinAttackerLossRate
    : attackStats.totalTroops * rule.config.defenderHoldAttackerLossRate
  const defenderLossBase = attackerBreakDefense
    ? defenseStats.totalTroops * rule.config.attackerWinDefenderLossRate
    : defenseStats.totalTroops * rule.config.defenderHoldDefenderLossRate

  const dominanceRatio = Math.max(powerRatio, 1)
  const pressureRatio = Math.max(defenseStats.totalDefense / Math.max(attackStats.totalAttack, 1), 0.1)

  const attackerLossCount = attackerBreakDefense
    ? clamp(
      Math.round(attackerLossBase / Math.pow(dominanceRatio, rule.config.survivorLossExponent)),
      0,
      Math.max(attackStats.totalTroops - 1, 0)
    )
    : clamp(
      Math.round(attackerLossBase * Math.pow(pressureRatio, 0.35)),
      0,
      attackStats.totalTroops
    )

  const defenderLossCount = attackerBreakDefense
    ? clamp(
      Math.round(defenderLossBase * Math.pow(clamp(powerRatio, 1, 10), 0.3)),
      0,
      defenseStats.totalTroops
    )
    : clamp(
      Math.round(defenderLossBase * Math.pow(clamp(attackStats.totalAttack / Math.max(defenseStats.totalDefense, 1), 0, 1), 1.2)),
      0,
      Math.max(defenseStats.totalTroops - 1, 0)
    )

  const note = attackerBreakDefense
    ? '掠夺方打穿防御后迅速撤离，优先带走资源'
    : '掠夺未能打穿防御，来军受损后撤'

  return {
    battleResult,
    battleTier,
    attackerLossCount,
    defenderLossCount,
    note
  }
}

export const executeCombat = ({ rule, attackerArmy, defenderArmy }) => {
  const attackStats = calculateAttackPool(attackerArmy)
  const defenseStats = calculateDefensePool(defenderArmy, attackerArmy)
  const defenderResources = defenderArmy.resources || { wood: 0, soil: 0, iron: 0, food: 0 }
  const powerRatio = attackStats.totalAttack / Math.max(defenseStats.totalDefense, 1)
  const attackerBreakDefense = rule.config.attackerBreaksDefenseOnEqual
    ? attackStats.totalAttack >= defenseStats.totalDefense
    : attackStats.totalAttack > defenseStats.totalDefense

  const baseOutcome = rule.actionType === COMBAT_ACTION_TYPES.PLUNDER
    ? calculatePlunderOutcome({ rule, attackStats, defenseStats, powerRatio, attackerBreakDefense })
    : calculateAttackOutcome({ rule, attackerArmy, defenderArmy, attackStats, defenseStats, powerRatio, attackerBreakDefense })

  const attackerLosses = allocateLossesByAbsoluteCount(
    attackerArmy,
    baseOutcome.attackerLossCount,
    rule.config.winnerLossStrategy
  )
  const defenderLosses = allocateLossesByAbsoluteCount(
    defenderArmy,
    baseOutcome.defenderLossCount,
    rule.config.loserLossStrategy
  )

  const attackerLossRatio = attackStats.totalTroops > 0 ? getLossTotal(attackerLosses) / attackStats.totalTroops : 0
  const defenderLossRatio = defenseStats.totalTroops > 0 ? getLossTotal(defenderLosses) / defenseStats.totalTroops : 0
  const survivingCarryCapacity = calculateSurvivingCarryCapacity(attackerLosses)
  const plundered = rule.config.plunderOnVictory
    ? calculatePlunderedResources(survivingCarryCapacity, defenderResources, baseOutcome.battleResult, rule.actionType)
    : { wood: 0, soil: 0, iron: 0, food: 0 }

  return createBattleResult({
    rule,
    attackerArmy,
    defenderArmy,
    outcome: {
      battleResult: baseOutcome.battleResult,
      attackerLosses,
      defenderLosses,
      attackerLossRatio,
      defenderLossRatio,
      attackStats,
      defenseStats,
      powerRatio,
      defenderBreakDefense: attackerBreakDefense,
      battleTier: baseOutcome.battleTier,
      survivingCarryCapacity,
      plundered,
      note: baseOutcome.note
    }
  })
}
