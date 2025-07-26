/**
 * 武林三国 - 战斗规则配置文件
 * 定义各种战斗规则的计算逻辑和参数
 */

// 战斗规则ID常量
export const BATTLE_RULE_IDS = {
  PLUNDER: 'PLUNDER',       // 掠夺战斗规则
  COMPREHENSIVE: 'COMPREHENSIVE'  // 综合实力战斗规则
}

//=== 战斗结果常量
export const BATTLE_RESULTS = {
  ATTACKER_VICTORY: 'ATTACKER_VICTORY',
  DEFENDER_VICTORY: 'DEFENDER_VICTORY', 
  DRAW: 'DRAW'
}

// 战斗时间配置
export const BATTLE_TIME_CONFIG = {
  // 基础行军时间（分钟/公里）
  BASE_MARCH_TIME: 2,
  
  // 计算行军时间
  calculateMarchTime(distance, army) {
    const slowestSpeed = this.getArmySlowestSpeed(army)
    const baseTime = distance * this.BASE_MARCH_TIME
    const speedModifier = slowestSpeed / 100 // 速度修正
    return Math.ceil(baseTime / speedModifier)
  },
  
  // 获取军团最慢速度
  getArmySlowestSpeed(army) {
    if (!army.units || army.units.length === 0) return 100
    return Math.min(...army.units.map(unit => unit.speed || 100))
  }
}

// 战斗规则配置
export const BATTLE_RULES = {
  
  [BATTLE_RULE_IDS.PLUNDER]: {
    id: BATTLE_RULE_IDS.PLUNDER,
    name: '掠夺战斗',
    description: '专门用于掠夺战斗，考虑运载能力',
    
    //=== 计算伤害（复制自基础战斗）
    calculateDamage(attackerArmy, defenderArmy) {
      const attackerPower = this.calculateArmyAttack(attackerArmy)
      const defenderPower = this.calculateArmyDefense(defenderArmy, attackerArmy)
      
      // 基础伤害计算：攻击力 - 防御力
      const attackerDamage = Math.max(0, attackerPower - defenderPower * 0.5)
      const defenderDamage = Math.max(0, defenderPower - attackerPower * 0.3)
      
      return {
        attackerDamage,
        defenderDamage
      }
    },
    
    //=== 计算军团攻击力（复制自基础战斗）
    calculateArmyAttack(army) {
      if (!army.units) return 0
      return army.units.reduce((total, unit) => {
        return total + (unit.attack || 0) * (unit.count || 0)
      }, 0)
    },
    
    //=== 计算军团防御力（复制自基础战斗）
    calculateArmyDefense(army, enemyArmy) {
      if (!army.units) return 0
      return army.units.reduce((total, unit) => {
        // 根据敌方兵种类型选择对应防御力
        const defense = this.getEffectiveDefense(unit, enemyArmy)
        return total + defense * (unit.count || 0)
      }, 0)
    },
    
    //=== 获取有效防御力（复制自基础战斗）
    getEffectiveDefense(unit, enemyArmy) {
      if (!enemyArmy.units) return unit.infantryDefense || 0
      
      // 计算敌方兵种类型占比
      const totalEnemyCount = enemyArmy.units.reduce((sum, u) => sum + (u.count || 0), 0)
      if (totalEnemyCount === 0) return unit.infantryDefense || 0
      
      let weightedDefense = 0
      enemyArmy.units.forEach(enemyUnit => {
        const ratio = (enemyUnit.count || 0) / totalEnemyCount
        if (enemyUnit.unitType === 'cavalry') {
          weightedDefense += (unit.cavalryDefense || 0) * ratio
        } else {
          weightedDefense += (unit.infantryDefense || 0) * ratio
        }
      })
      
      return weightedDefense
    },
    
    //=== 计算战斗结果（复制自基础战斗）
    calculateBattleResult(attackerDamage, defenderDamage) {
      const damageDiff = attackerDamage - defenderDamage
      
      if (Math.abs(damageDiff) < attackerDamage * 0.1) {
        return BATTLE_RESULTS.DRAW // 平局
      } else if (damageDiff > 0) {
        return BATTLE_RESULTS.ATTACKER_VICTORY // 胜利
      } else {
        return BATTLE_RESULTS.DEFENDER_VICTORY // 失败
      }
    },
    
    //=== 计算掠夺资源
    calculatePlunderResources(attackerArmy, defenderResources, battleResult) {
      // 只有胜利才能掠夺
      if (battleResult !== BATTLE_RESULTS.ATTACKER_VICTORY) {
        return { wood: 0, soil: 0, iron: 0, food: 0 }
      }
      
      // 计算运载能力
      const carryCapacity = this.calculateArmyCarryCapacity(attackerArmy)
      
      // 计算可掠夺的总资源
      const totalDefenderResources = Object.values(defenderResources).reduce((sum, val) => sum + val, 0)
      const maxPlunder = Math.min(carryCapacity, totalDefenderResources)
      
      // 按比例分配掠夺资源
      const plunderRatio = maxPlunder / totalDefenderResources
      
      return {
        wood: Math.floor(defenderResources.wood * plunderRatio),
        soil: Math.floor(defenderResources.soil * plunderRatio),
        iron: Math.floor(defenderResources.iron * plunderRatio),
        food: Math.floor(defenderResources.food * plunderRatio)
      }
    },
    
    //=== 计算军团运载能力
    calculateArmyCarryCapacity(army) {
      if (!army.units) return 0
      return army.units.reduce((total, unit) => {
        return total + (unit.carryCapacity || 0) * (unit.count || 0)
      }, 0)
    }
  },
  

  
  [BATTLE_RULE_IDS.COMPREHENSIVE]: {
    id: BATTLE_RULE_IDS.COMPREHENSIVE,
    name: '综合实力战斗',
    description: '分别计算步兵和骑兵攻防，根据实力差距计算损耗，强者损失少，弱者损失大',
    
    //=== 计算分兵种攻击力
    calculateSeparateAttack(army) {
      if (!army.units) return { infantry: 0, cavalry: 0 }
      
      let infantryAttack = 0
      let cavalryAttack = 0
      
      army.units.forEach(unit => {
        const attack = (unit.attack || 0) * (unit.count || 0)
        if (unit.unitType === 'cavalry') {
          cavalryAttack += attack
        } else {
          infantryAttack += attack
        }
      })
      
      return { infantry: infantryAttack, cavalry: cavalryAttack }
    },
    
    //=== 计算分兵种防御力
    calculateSeparateDefense(army) {
      if (!army.units) return { infantryDefense: 0, cavalryDefense: 0 }
      
      let infantryDefense = 0
      let cavalryDefense = 0
      
      army.units.forEach(unit => {
        const count = unit.count || 0
        infantryDefense += (unit.infantryDefense || 0) * count
        cavalryDefense += (unit.cavalryDefense || 0) * count
      })
      
      return { infantryDefense, cavalryDefense }
    },
    
    //=== 计算综合实力对比
    calculatePowerComparison(attackerArmy, defenderArmy) {
      const attackerAttack = this.calculateSeparateAttack(attackerArmy)
      const defenderDefense = this.calculateSeparateDefense(defenderArmy)
      
      // 步兵攻击 vs 步防
      const infantryPowerRatio = defenderDefense.infantryDefense > 0 
        ? attackerAttack.infantry / defenderDefense.infantryDefense 
        : (attackerAttack.infantry > 0 ? 10 : 1)
      
      // 骑兵攻击 vs 骑防
      const cavalryPowerRatio = defenderDefense.cavalryDefense > 0 
        ? attackerAttack.cavalry / defenderDefense.cavalryDefense 
        : (attackerAttack.cavalry > 0 ? 10 : 1)
      
      // 综合实力比
      const totalAttack = attackerAttack.infantry + attackerAttack.cavalry
      const totalDefense = defenderDefense.infantryDefense + defenderDefense.cavalryDefense
      const overallRatio = totalDefense > 0 ? totalAttack / totalDefense : (totalAttack > 0 ? 10 : 1)
      
      return {
        infantryRatio: infantryPowerRatio,
        cavalryRatio: cavalryPowerRatio,
        overallRatio: overallRatio,
        attackerAttack,
        defenderDefense
      }
    },
    
    //=== 计算损耗比例
    calculateLossRatio(powerRatio) {
      // 实力相差不大时（0.8-1.25），双方均等损失
      if (powerRatio >= 0.8 && powerRatio <= 1.25) {
        return { winner: 0.15, loser: 0.15 } // 均等损失15%
      }
      
      // 实力差距较大时，强者损失少，弱者损失大
      if (powerRatio > 1.25) {
        // 进攻方强势
        const advantage = Math.min(powerRatio / 1.25, 4) // 最大4倍优势
        const winnerLoss = Math.max(0.05, 0.2 / advantage) // 强者最少5%损失
        const loserLoss = Math.min(0.6, 0.15 * advantage) // 弱者最多60%损失
        return { winner: winnerLoss, loser: loserLoss }
      } else {
        // 防守方强势
        const advantage = Math.min(1.25 / powerRatio, 4) // 最大4倍优势
        const winnerLoss = Math.max(0.05, 0.2 / advantage) // 强者最少5%损失
        const loserLoss = Math.min(0.6, 0.15 * advantage) // 弱者最多60%损失
        return { winner: winnerLoss, loser: loserLoss }
      }
    },
    
    //=== 计算单位损耗
    calculateUnitLosses(army, lossRatio) {
      if (!army.units) return []
      
      return army.units.map(unit => {
        const count = unit.count || 0
        if (count === 0) return { ...unit, losses: 0 }
        
        // 单数值强的兵种损耗更小，单数值弱的兵种损失更大
        const unitPower = (unit.attack || 0) + (unit.infantryDefense || 0) + (unit.cavalryDefense || 0)
        const avgPower = army.units.reduce((sum, u) => {
          return sum + ((u.attack || 0) + (u.infantryDefense || 0) + (u.cavalryDefense || 0))
        }, 0) / army.units.length
        
        // 实力修正系数：强兵种损耗减少，弱兵种损耗增加
        const powerModifier = avgPower > 0 ? Math.pow(unitPower / avgPower, 0.3) : 1
        const adjustedLossRatio = lossRatio / powerModifier
        
        // 限制损耗比例在合理范围内
        const finalLossRatio = Math.max(0.02, Math.min(0.8, adjustedLossRatio))
        const losses = Math.floor(count * finalLossRatio)
        
        return {
          ...unit,
          losses: losses,
          lossRatio: finalLossRatio
        }
      })
    },
    
    //=== 主要伤害计算函数
    calculateDamage(attackerArmy, defenderArmy) {
      const powerComparison = this.calculatePowerComparison(attackerArmy, defenderArmy)
      const { overallRatio } = powerComparison
      
      // 计算损耗比例
      const lossRatios = this.calculateLossRatio(overallRatio)
      
      // 确定胜负
      const attackerWins = overallRatio > 1
      const attackerLossRatio = attackerWins ? lossRatios.winner : lossRatios.loser
      const defenderLossRatio = attackerWins ? lossRatios.loser : lossRatios.winner
      
      // 计算各单位损耗
      const attackerLosses = this.calculateUnitLosses(attackerArmy, attackerLossRatio)
      const defenderLosses = this.calculateUnitLosses(defenderArmy, defenderLossRatio)
      
      return {
        attackerLosses,
        defenderLosses,
        attackerLossRatio,
        defenderLossRatio,
        powerComparison,
        battleResult: this.calculateBattleResult(overallRatio)
      }
    },
    
    //=== 计算战斗结果
    calculateBattleResult(overallRatio) {
      if (overallRatio >= 0.9 && overallRatio <= 1.1) {
        return BATTLE_RESULTS.DRAW // 平局
      } else if (overallRatio > 1.1) {
        return BATTLE_RESULTS.ATTACKER_VICTORY // 胜利
      } else {
        return BATTLE_RESULTS.DEFENDER_VICTORY // 失败
      }
    }
  }
}

// 默认战斗规则
export const DEFAULT_BATTLE_RULE = BATTLE_RULE_IDS.PLUNDER

//=== 通用战斗计算函数
function createStandardBattleResult(ruleId, attackerArmy, defenderArmy, battleResult, damage, details = {}) {
  // 计算损失兵种
  const calculateLosses = (army, lossRatio) => {
    if (!army.units) return []
    return army.units.map(unit => ({
      id: unit.id,
      name: unit.name,
      count: Math.floor((unit.count || 0) * lossRatio),
      lossRatio: lossRatio
    })).filter(loss => loss.count > 0)
  }

  // 计算总攻击力和防御力
  const totalAttack = attackerArmy.units ? attackerArmy.units.reduce((sum, unit) => 
    sum + (unit.attack || 0) * (unit.count || 0), 0) : 0
  const totalDefense = defenderArmy.units ? defenderArmy.units.reduce((sum, unit) => 
    sum + (unit.infantryDefense || 0) * (unit.count || 0), 0) : 0

  const attackerLossRatio = damage.attackerLossRatio || 0.1
  const defenderLossRatio = damage.defenderLossRatio || 0.1

  return {
    ruleId,
    battleResult,
    attacker: {
      uuid: attackerArmy.playerInfo?.userUUID || 'player-uuid',
      nickname: attackerArmy.playerInfo?.nickname || '玩家',
      faction: attackerArmy.armyGroup?.faction || attackerArmy.faction || 'unknown',
      originalUnits: attackerArmy.units || [],
      losses: calculateLosses(attackerArmy, attackerLossRatio),
      carryResources: attackerArmy.carryResources || { wood: 0, soil: 0, iron: 0, food: 0 },
      lossRatio: attackerLossRatio
    },
    defender: {
      uuid: defenderArmy.npcInfo?.id || 'npc-uuid',
      nickname: defenderArmy.npcInfo?.name || 'NPC城池',
      faction: defenderArmy.armyGroup?.faction || defenderArmy.faction || 'unknown',
      originalUnits: defenderArmy.units || [],
      losses: calculateLosses(defenderArmy, defenderLossRatio),
      remainingResources: defenderArmy.remainingResources || { wood: 0, soil: 0, iron: 0, food: 0 },
      lossRatio: defenderLossRatio
    },
    details: {
      totalAttack,
      totalDefense,
      powerRatio: totalDefense > 0 ? totalAttack / totalDefense : (totalAttack > 0 ? 10 : 1),
      marchTime: details.marchTime || 0,
      plundered: details.plundered || null,
      ...details
    }
  }
}

// 为每个战斗规则添加统一的 calculateBattle 方法
Object.values(BATTLE_RULES).forEach(rule => {
  if (!rule.calculateBattle) {
    rule.calculateBattle = function(attackerArmy, defenderArmy, options = {}) {
      try {
        let damage, battleResult, details = {}
        
        if (this.id === BATTLE_RULE_IDS.COMPREHENSIVE) {
          // 综合实力战斗规则
          damage = this.calculateDamage(attackerArmy, defenderArmy)
          battleResult = damage.battleResult
          details = {
            powerComparison: damage.powerComparison?.overallRatio || 1,
            attackerLosses: damage.attackerLosses || [],
            defenderLosses: damage.defenderLosses || []
          }
        } else if (this.id === BATTLE_RULE_IDS.PLUNDER) {
          // 掠夺战斗规则
          damage = this.calculateDamage(attackerArmy, defenderArmy)
          battleResult = this.calculateBattleResult(damage.attackerDamage, damage.defenderDamage)
          
          // 计算掠夺资源
          const defenderResources = defenderArmy.resources || { wood: 10000, soil: 10000, iron: 5000, food: 8000 }
          const plundered = this.calculatePlunderResources(attackerArmy, defenderResources, battleResult)
          
          details = {
            plundered: battleResult === BATTLE_RESULTS.ATTACKER_VICTORY ? plundered : null,
            carryCapacity: this.calculateArmyCarryCapacity(attackerArmy)
          }
          
          // 计算损失比例 - 修复过高损耗问题
          const attackerPower = this.calculateArmyAttack(attackerArmy)
          const defenderPower = this.calculateArmyDefense(defenderArmy, attackerArmy)
          
          // 基础损失比例：根据伤害与总实力的比值，但限制在合理范围内
          const baseLossRatio = 0.15 // 基础损失15%
          const maxLossRatio = 0.4   // 最大损失40%
          const minLossRatio = 0.05  // 最小损失5%
          
          // 根据实力对比调整损失比例
          const powerRatio = defenderPower > 0 ? attackerPower / defenderPower : 2
          
          if (battleResult === BATTLE_RESULTS.ATTACKER_VICTORY) {
            // 攻击方胜利：攻击方损失少，防守方损失多
            damage.attackerLossRatio = Math.max(minLossRatio, baseLossRatio / Math.sqrt(powerRatio))
            damage.defenderLossRatio = Math.min(maxLossRatio, baseLossRatio * Math.sqrt(powerRatio))
          } else if (battleResult === BATTLE_RESULTS.DEFENDER_VICTORY) {
            // 防守方胜利：防守方损失少，攻击方损失多
            damage.attackerLossRatio = Math.min(maxLossRatio, baseLossRatio * Math.sqrt(1/powerRatio))
            damage.defenderLossRatio = Math.max(minLossRatio, baseLossRatio / Math.sqrt(1/powerRatio))
          } else {
            // 平局：双方损失相等
            damage.attackerLossRatio = baseLossRatio
            damage.defenderLossRatio = baseLossRatio
          }
        }
        
        return createStandardBattleResult(this.id, attackerArmy, defenderArmy, battleResult, damage, details)
      } catch (error) {
        console.error(`战斗计算错误 (${this.id}):`, error)
        return createStandardBattleResult(this.id, attackerArmy, defenderArmy, 'error', {
          attackerLossRatio: 0,
          defenderLossRatio: 0
        }, { error: error.message })
      }
    }
  }
})

//=== 获取战斗规则
export function getBattleRule(ruleId) {
  return BATTLE_RULES[ruleId] || BATTLE_RULES[DEFAULT_BATTLE_RULE]
}

//=== 获取所有战斗规则列表
export function getAllBattleRules() {
  return Object.values(BATTLE_RULES)
}

//=== 验证战斗规则ID
export function isValidBattleRuleId(ruleId) {
  return Object.values(BATTLE_RULE_IDS).includes(ruleId)
}