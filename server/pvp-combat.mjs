const COMBAT_RULE_IDS = {
  CLASSIC_CRUSH: 'CLASSIC_CRUSH',
  PLUNDER_STRIKE: 'PLUNDER_STRIKE'
}

const COMBAT_ACTION_TYPES = {
  ATTACK: 'ATTACK',
  PLUNDER: 'PLUNDER'
}

const COMBAT_RESULTS = {
  ATTACKER_VICTORY: 'ATTACKER_VICTORY',
  DEFENDER_VICTORY: 'DEFENDER_VICTORY'
}

const RESOURCE_KEYS = ['wood', 'soil', 'iron', 'food']

const UNIT_CATALOG = {
  qingZhouArmy: { id: 'qingZhouArmy', name: '青州军', attack: 8, infantryDefense: 7, cavalryDefense: 10, speed: 6, carryCapacity: 80, unitType: 'infantry', faction: 'wei' },
  jinWeiSoldier: { id: 'jinWeiSoldier', name: '禁卫甲士', attack: 6, infantryDefense: 13, cavalryDefense: 7, speed: 5, carryCapacity: 40, unitType: 'infantry', faction: 'wei' },
  huWei: { id: 'huWei', name: '虎卫', attack: 14, infantryDefense: 8, cavalryDefense: 5, speed: 7, carryCapacity: 100, unitType: 'infantry', faction: 'wei' },
  zhanYingTanMa: { id: 'zhanYingTanMa', name: '战鹰探马', attack: 0, infantryDefense: 4, cavalryDefense: 2, speed: 16, carryCapacity: 0, unitType: 'cavalry', faction: 'wei' },
  qiQiYing: { id: 'qiQiYing', name: '骁骑营1', attack: 24, infantryDefense: 13, cavalryDefense: 10, speed: 14, carryCapacity: 200, unitType: 'cavalry', faction: 'wei' },
  huBaoQi: { id: 'huBaoQi', name: '虎豹骑', attack: 36, infantryDefense: 16, cavalryDefense: 21, speed: 10, carryCapacity: 140, unitType: 'cavalry', faction: 'wei' },
  chongZhuangChe: { id: 'chongZhuangChe', name: '冲撞车', attack: 12, infantryDefense: 6, cavalryDefense: 15, speed: 4, carryCapacity: 0, unitType: 'siege', faction: 'wei' },
  luLeiChe: { id: 'luLeiChe', name: '露雷车', attack: 15, infantryDefense: 12, cavalryDefense: 2, speed: 3, carryCapacity: 0, unitType: 'siege', faction: 'wei' },
  jianzhuShi: { id: 'jianzhuShi', name: '建筑师', attack: 10, infantryDefense: 160, cavalryDefense: 160, speed: 5, carryCapacity: 9999, unitType: 'special', faction: 'wei' },
  tuZu: { id: 'tuZu', name: '土族', attack: 100, infantryDefense: 80, cavalryDefense: 60, speed: 4, carryCapacity: 0, unitType: 'special', faction: 'wei' },
  weiMerchant: { id: 'weiMerchant', name: '魏国商人', attack: 0, infantryDefense: 0, cavalryDefense: 0, speed: 16, carryCapacity: 1000, unitType: 'special', faction: 'wei' },
  greedyWolf: { id: 'greedyWolf', name: '贪狼营', attack: 8, infantryDefense: 4, cavalryDefense: 1, speed: 7, carryCapacity: 120, unitType: 'infantry', faction: 'shu' },
  qilinGuard: { id: 'qilinGuard', name: '麒麟卫', attack: 2, infantryDefense: 7, cavalryDefense: 12, speed: 7, carryCapacity: 80, unitType: 'infantry', faction: 'shu' },
  azureDragon: { id: 'azureDragon', name: '青龙军', attack: 12, infantryDefense: 6, cavalryDefense: 6, speed: 6, carryCapacity: 100, unitType: 'infantry', faction: 'shu' },
  flyingKite: { id: 'flyingKite', name: '飞鸢', attack: 0, infantryDefense: 2, cavalryDefense: 1, speed: 9, carryCapacity: 0, unitType: 'infantry', faction: 'shu' },
  xiLiangCavalry: { id: 'xiLiangCavalry', name: '西凉铁骑', attack: 11, infantryDefense: 20, cavalryDefense: 8, speed: 10, carryCapacity: 220, unitType: 'cavalry', faction: 'shu' },
  southernElephant: { id: 'southernElephant', name: '南蛮象', attack: 30, infantryDefense: 10, cavalryDefense: 15, speed: 9, carryCapacity: 160, unitType: 'cavalry', faction: 'shu' },
  siegeTower: { id: 'siegeTower', name: '临冲车', attack: 13, infantryDefense: 6, cavalryDefense: 16, speed: 4, carryCapacity: 0, unitType: 'siege', faction: 'shu' },
  thunderBolt: { id: 'thunderBolt', name: '霹天雷', attack: 10, infantryDefense: 12, cavalryDefense: 2, speed: 3, carryCapacity: 0, unitType: 'siege', faction: 'shu' },
  woodenOx: { id: 'woodenOx', name: '木牛流马', attack: 20, infantryDefense: 160, cavalryDefense: 160, speed: 5, carryCapacity: 9999, unitType: 'special', faction: 'shu' },
  hanRoyalty: { id: 'hanRoyalty', name: '汉室宗亲', attack: 80, infantryDefense: 120, cavalryDefense: 80, speed: 4, carryCapacity: 0, unitType: 'special', faction: 'shu' },
  shuMerchant: { id: 'shuMerchant', name: '蜀国商人', attack: 0, infantryDefense: 0, cavalryDefense: 0, speed: 12, carryCapacity: 2000, unitType: 'special', faction: 'shu' },
  shadowGuard: { id: 'shadowGuard', name: '影卫', attack: 3, infantryDefense: 8, cavalryDefense: 10, speed: 7, carryCapacity: 60, unitType: 'infantry', faction: 'wu' },
  xiuLuo: { id: 'xiuLuo', name: '修罗', attack: 13, infantryDefense: 7, cavalryDefense: 4, speed: 6, carryCapacity: 90, unitType: 'infantry', faction: 'wu' },
  secretAgent: { id: 'secretAgent', name: '密探', attack: 0, infantryDefense: 4, cavalryDefense: 2, speed: 17, carryCapacity: 0, unitType: 'cavalry', faction: 'wu' },
  divineWind: { id: 'divineWind', name: '神风', attack: 18, infantryDefense: 5, cavalryDefense: 8, speed: 19, carryCapacity: 150, unitType: 'cavalry', faction: 'wu' },
  zhuQueRider: { id: 'zhuQueRider', name: '朱雀骑', attack: 9, infantryDefense: 23, cavalryDefense: 11, speed: 16, carryCapacity: 70, unitType: 'cavalry', faction: 'wu' },
  overlordRider: { id: 'overlordRider', name: '霸王骑', attack: 28, infantryDefense: 10, cavalryDefense: 33, speed: 13, carryCapacity: 130, unitType: 'cavalry', faction: 'wu' },
  chongChe: { id: 'chongChe', name: '冲撞车', attack: 10, infantryDefense: 6, cavalryDefense: 21, speed: 4, carryCapacity: 0, unitType: 'siege', faction: 'wu' },
  juShiChe: { id: 'juShiChe', name: '巨石车', attack: 14, infantryDefense: 9, cavalryDefense: 2, speed: 3, carryCapacity: 0, unitType: 'siege', faction: 'wu' },
  fengShuiMaster: { id: 'fengShuiMaster', name: '风水师', attack: 10, infantryDefense: 160, cavalryDefense: 160, speed: 5, carryCapacity: 9999, unitType: 'special', faction: 'wu' },
  taiPingShi: { id: 'taiPingShi', name: '太平士', attack: 80, infantryDefense: 100, cavalryDefense: 100, speed: 5, carryCapacity: 0, unitType: 'special', faction: 'wu' },
  wuMerchant: { id: 'wuMerchant', name: '吴国商人', attack: 0, infantryDefense: 0, cavalryDefense: 0, speed: 24, carryCapacity: 1500, unitType: 'special', faction: 'wu' }
}

const COMBAT_RULE_DEFINITIONS = {
  [COMBAT_RULE_IDS.CLASSIC_CRUSH]: {
    id: COMBAT_RULE_IDS.CLASSIC_CRUSH,
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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const floorNumber = (value) => Math.max(0, Math.floor(Number(value) || 0))

export const getUnitById = (unitId) => UNIT_CATALOG[unitId] || null

export const enrichArmyMap = (armyMap = {}, faction = 'unknown') => (
  Object.entries(armyMap)
    .map(([unitId, count]) => {
      const unit = getUnitById(unitId)
      if (!unit) return null
      return {
        ...unit,
        faction: unit.faction || faction,
        count: floorNumber(count)
      }
    })
    .filter((unit) => unit && unit.count > 0)
)

export const normalizeResourceBundle = (resources = {}) => (
  Object.fromEntries(RESOURCE_KEYS.map((key) => [key, floorNumber(resources[key])]))
)

export const applyLossesToArmyMap = (armyMap = {}, losses = []) => {
  const nextArmy = { ...armyMap }
  losses.forEach((loss) => {
    const unitId = loss.id
    const current = floorNumber(nextArmy[unitId])
    const remaining = Math.max(0, current - floorNumber(loss.count))
    if (remaining > 0) {
      nextArmy[unitId] = remaining
    } else {
      delete nextArmy[unitId]
    }
  })
  return nextArmy
}

export const subtractResources = (resources = {}, plundered = {}) => (
  Object.fromEntries(RESOURCE_KEYS.map((key) => [
    key,
    Math.max(0, floorNumber(resources[key]) - floorNumber(plundered[key]))
  ]))
)

const getArmyTotalTroops = (army) => (army.units || []).reduce((sum, unit) => sum + floorNumber(unit.count), 0)

const getLossTotal = (lossEntries) => lossEntries.reduce((sum, entry) => sum + floorNumber(entry.losses), 0)

const getAttackerTypeWeights = (army) => {
  const total = getArmyTotalTroops(army)
  if (total <= 0) return { infantry: 1, cavalry: 0 }

  const infantry = (army.units || []).reduce((sum, unit) => unit.unitType === 'infantry' ? sum + floorNumber(unit.count) : sum, 0)
  const cavalry = (army.units || []).reduce((sum, unit) => unit.unitType === 'cavalry' ? sum + floorNumber(unit.count) : sum, 0)
  const infantryWeight = infantry / total
  const cavalryWeight = cavalry / total
  if (infantryWeight === 0 && cavalryWeight === 0) return { infantry: 1, cavalry: 0 }
  return { infantry: infantryWeight, cavalry: cavalryWeight }
}

const getRelevantDefense = (unit, attackerTypeWeights) => (
  (unit.infantryDefense || 0) * attackerTypeWeights.infantry +
  (unit.cavalryDefense || 0) * attackerTypeWeights.cavalry
)

const calculateAttackPool = (army) => {
  const units = army.units || []
  const totalTroops = getArmyTotalTroops(army)
  const totalAttack = units.reduce((sum, unit) => sum + ((unit.attack || 0) * floorNumber(unit.count)), 0)
  return {
    totalTroops,
    totalAttack,
    averageAttack: totalTroops > 0 ? totalAttack / totalTroops : 0,
    totalCarryCapacity: units.reduce((sum, unit) => sum + ((unit.carryCapacity || 0) * floorNumber(unit.count)), 0)
  }
}

const calculateDefensePool = (defenderArmy, attackerArmy) => {
  const units = defenderArmy.units || []
  const totalTroops = getArmyTotalTroops(defenderArmy)
  const attackerTypeWeights = getAttackerTypeWeights(attackerArmy)
  const totalDefense = units.reduce(
    (sum, unit) => sum + (getRelevantDefense(unit, attackerTypeWeights) * floorNumber(unit.count)),
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
    __count: floorNumber(unit.count),
    __durability: (unit.infantryDefense || 0) + (unit.cavalryDefense || 0)
  }))
  if (units.length === 0) return []

  const cappedTarget = clamp(Math.floor(targetLosses), 0, units.reduce((sum, unit) => sum + unit.__count, 0))
  if (cappedTarget <= 0) {
    return units.map((unit) => ({ ...unit, losses: 0, lossRatio: 0 }))
  }

  const losses = new Array(units.length).fill(0)
  if (strategy === 'weak-first') {
    let remaining = cappedTarget
    for (const unit of [...units].sort((a, b) => a.__durability === b.__durability ? a.__index - b.__index : a.__durability - b.__durability)) {
      if (remaining <= 0) break
      const casualties = Math.min(unit.__count, remaining)
      losses[unit.__index] = casualties
      remaining -= casualties
    }
  } else {
    const totalWeight = units.reduce((sum, unit) => sum + unit.__count, 0)
    const exactLosses = units.map((unit, index) => {
      const exact = totalWeight > 0 ? (cappedTarget * unit.__count) / totalWeight : 0
      return { index, floor: Math.min(unit.__count, Math.floor(exact)), remainder: exact - Math.floor(exact) }
    })
    let assigned = 0
    exactLosses.forEach((entry) => {
      losses[entry.index] = entry.floor
      assigned += entry.floor
    })

    let remaining = cappedTarget - assigned
    for (const entry of [...exactLosses].sort((a, b) => b.remainder === a.remainder ? a.index - b.index : b.remainder - a.remainder)) {
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
    .filter((entry) => floorNumber(entry.losses) > 0)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      count: floorNumber(entry.losses),
      lossRatio: entry.lossRatio
    }))
)

const calculateRemainingResources = (resources, plundered) => (
  Object.fromEntries(RESOURCE_KEYS.map((key) => [
    key,
    Math.max(0, floorNumber(resources[key]) - floorNumber(plundered[key]))
  ]))
)

const calculateSurvivingCarryCapacity = (attackerLosses = []) => (
  attackerLosses.reduce((total, entry) => {
    const survivors = Math.max(0, floorNumber(entry.count) - floorNumber(entry.losses))
    return total + survivors * (entry.carryCapacity || 0)
  }, 0)
)

const distributeProportionalResources = (capacity, resources, totalResources) => {
  const result = { wood: 0, soil: 0, iron: 0, food: 0 }
  const remainders = []
  let assigned = 0

  RESOURCE_KEYS.forEach((key) => {
    const stock = floorNumber(resources[key])
    const exact = totalResources > 0 ? (capacity * stock) / totalResources : 0
    const floorValue = Math.min(stock, Math.floor(exact))
    result[key] = floorValue
    assigned += floorValue
    remainders.push({ key, remainder: exact - floorValue })
  })

  let remaining = Math.max(0, capacity - assigned)
  while (remaining > 0) {
    const candidate = remainders
      .filter(({ key }) => floorNumber(resources[key]) > result[key])
      .sort((a, b) => b.remainder === a.remainder ? floorNumber(resources[b.key]) - floorNumber(resources[a.key]) : b.remainder - a.remainder)[0]
    if (!candidate) break
    result[candidate.key] += 1
    remaining -= 1
    candidate.remainder = 0
  }
  return result
}

const calculatePlunderedResources = (survivingCarryCapacity, defenderResources, battleResult, actionType) => {
  if (battleResult !== COMBAT_RESULTS.ATTACKER_VICTORY) return { wood: 0, soil: 0, iron: 0, food: 0 }
  const carryCapacity = floorNumber(survivingCarryCapacity)
  if (carryCapacity <= 0) return { wood: 0, soil: 0, iron: 0, food: 0 }

  const resources = normalizeResourceBundle(defenderResources)
  const totalResources = RESOURCE_KEYS.reduce((sum, key) => sum + resources[key], 0)
  if (totalResources <= 0) return { wood: 0, soil: 0, iron: 0, food: 0 }

  const plunderFactor = actionType === COMBAT_ACTION_TYPES.PLUNDER ? 1 : 0.6
  const effectiveCapacity = Math.max(0, Math.floor(carryCapacity * plunderFactor))
  if (effectiveCapacity <= 0) return { wood: 0, soil: 0, iron: 0, food: 0 }
  if (totalResources <= effectiveCapacity) return resources
  return distributeProportionalResources(effectiveCapacity, resources, totalResources)
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

const calculateAttackOutcome = ({ rule, attackStats, defenseStats, powerRatio, attackerBreakDefense }) => {
  const battleResult = attackerBreakDefense ? COMBAT_RESULTS.ATTACKER_VICTORY : COMBAT_RESULTS.DEFENDER_VICTORY
  const battleTier = getBattleTier(attackerBreakDefense ? powerRatio : 1 / Math.max(powerRatio, 0.0001))
  if (attackerBreakDefense) {
    return {
      battleResult,
      battleTier,
      attackerLossCount: calculateAttackerLossesWhenWinning({
        attackStats,
        defenseStats,
        powerRatio,
        survivorLossExponent: rule.config.survivorLossExponent
      }),
      defenderLossCount: defenseStats.totalTroops,
      note: powerRatio >= 5 ? '攻击池远超守军防御池，形成碾压' : '攻击池打穿守军防御池'
    }
  }

  return {
    battleResult,
    battleTier,
    attackerLossCount: attackStats.totalTroops,
    defenderLossCount: calculateDefenderLossesWhenHolding({
      attackStats,
      defenseStats,
      powerRatio,
      survivorLossExponent: rule.config.survivorLossExponent
    }),
    note: powerRatio <= 0.4 ? '攻击池明显不足，来军被防守方顶住' : '攻击池未能打穿防御池，来军战败'
  }
}

const calculatePlunderOutcome = ({ rule, attackStats, defenseStats, powerRatio, attackerBreakDefense }) => {
  const battleResult = attackerBreakDefense ? COMBAT_RESULTS.ATTACKER_VICTORY : COMBAT_RESULTS.DEFENDER_VICTORY
  const battleTier = getBattleTier(attackerBreakDefense ? powerRatio : 1 / Math.max(powerRatio, 0.0001))
  const attackerLossBase = attackerBreakDefense
    ? attackStats.totalTroops * rule.config.attackerWinAttackerLossRate
    : attackStats.totalTroops * rule.config.defenderHoldAttackerLossRate
  const defenderLossBase = attackerBreakDefense
    ? defenseStats.totalTroops * rule.config.attackerWinDefenderLossRate
    : defenseStats.totalTroops * rule.config.defenderHoldDefenderLossRate
  const dominanceRatio = Math.max(powerRatio, 1)
  const pressureRatio = Math.max(defenseStats.totalDefense / Math.max(attackStats.totalAttack, 1), 0.1)

  return {
    battleResult,
    battleTier,
    attackerLossCount: attackerBreakDefense
      ? clamp(Math.round(attackerLossBase / Math.pow(dominanceRatio, rule.config.survivorLossExponent)), 0, Math.max(attackStats.totalTroops - 1, 0))
      : clamp(Math.round(attackerLossBase * Math.pow(pressureRatio, 0.35)), 0, attackStats.totalTroops),
    defenderLossCount: attackerBreakDefense
      ? clamp(Math.round(defenderLossBase * Math.pow(clamp(powerRatio, 1, 10), 0.3)), 0, defenseStats.totalTroops)
      : clamp(Math.round(defenderLossBase * Math.pow(clamp(attackStats.totalAttack / Math.max(defenseStats.totalDefense, 1), 0, 1), 1.2)), 0, Math.max(defenseStats.totalTroops - 1, 0)),
    note: attackerBreakDefense ? '掠夺方打穿防御后迅速撤离，优先带走资源' : '掠夺未能打穿防御，来军受损后撤'
  }
}

export const resolveCombat = ({ ruleId, attackerArmy, defenderArmy }) => {
  const rule = COMBAT_RULE_DEFINITIONS[ruleId] || COMBAT_RULE_DEFINITIONS[COMBAT_RULE_IDS.CLASSIC_CRUSH]
  const attackStats = calculateAttackPool(attackerArmy)
  const defenseStats = calculateDefensePool(defenderArmy, attackerArmy)
  const defenderResources = normalizeResourceBundle(defenderArmy.resources)
  const powerRatio = attackStats.totalAttack / Math.max(defenseStats.totalDefense, 1)
  const attackerBreakDefense = rule.config.attackerBreaksDefenseOnEqual
    ? attackStats.totalAttack >= defenseStats.totalDefense
    : attackStats.totalAttack > defenseStats.totalDefense
  const baseOutcome = rule.actionType === COMBAT_ACTION_TYPES.PLUNDER
    ? calculatePlunderOutcome({ rule, attackStats, defenseStats, powerRatio, attackerBreakDefense })
    : calculateAttackOutcome({ rule, attackStats, defenseStats, powerRatio, attackerBreakDefense })
  const attackerLosses = allocateLossesByAbsoluteCount(attackerArmy, baseOutcome.attackerLossCount, rule.config.winnerLossStrategy)
  const defenderLosses = allocateLossesByAbsoluteCount(defenderArmy, baseOutcome.defenderLossCount, rule.config.loserLossStrategy)
  const attackerLossRatio = attackStats.totalTroops > 0 ? getLossTotal(attackerLosses) / attackStats.totalTroops : 0
  const defenderLossRatio = defenseStats.totalTroops > 0 ? getLossTotal(defenderLosses) / defenseStats.totalTroops : 0
  const survivingCarryCapacity = calculateSurvivingCarryCapacity(attackerLosses)
  const plundered = rule.config.plunderOnVictory
    ? calculatePlunderedResources(survivingCarryCapacity, defenderResources, baseOutcome.battleResult, rule.actionType)
    : { wood: 0, soil: 0, iron: 0, food: 0 }

  return {
    ruleId: rule.id,
    actionType: rule.actionType,
    battleResult: baseOutcome.battleResult,
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
      uuid: defenderArmy.playerInfo?.userUUID || 'defender-uuid',
      nickname: defenderArmy.playerInfo?.nickname || '防守方',
      faction: defenderArmy.faction || 'unknown',
      originalUnits: defenderArmy.units || [],
      losses: buildLossList(defenderLosses),
      originalResources: defenderResources,
      remainingResources: calculateRemainingResources(defenderResources, plundered),
      lossRatio: defenderLossRatio
    },
    details: {
      totalAttack: attackStats.totalAttack,
      totalDefense: defenseStats.totalDefense,
      powerRatio,
      marchTime: 0,
      battleTime: new Date().toISOString(),
      powerComparison: powerRatio,
      battleTier: baseOutcome.battleTier,
      defenderBreakDefense: attackerBreakDefense,
      attackerTotalTroops: attackStats.totalTroops,
      defenderTotalTroops: defenseStats.totalTroops,
      attackerEffectiveDefense: 0,
      defenderEffectiveDefense: defenseStats.totalDefense,
      carryCapacity: survivingCarryCapacity,
      originalCarryCapacity: attackStats.totalCarryCapacity,
      plundered,
      note: baseOutcome.note
    }
  }
}
