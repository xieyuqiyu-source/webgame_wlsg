/**
 * 武林三国 - 战斗规则配置文件
 * 定义各种战斗规则的计算逻辑和参数
 */

// 战斗规则ID常量
export const BATTLE_RULE_IDS = {
  PLUNDER: 'PLUNDER',       // 掠夺战斗规则
  COMPREHENSIVE: 'COMPREHENSIVE',  // 综合实力战斗规则
  KILL_ENEMY: 'KILL_ENEMY'  // 杀敌战斗规则
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
    description: '专门用于掠夺战斗，考虑运载能力，实力接近损耗接近，实力差距大时强者损耗小',
    
    //=== 计算伤害和损耗
    calculateDamage(attackerArmy, defenderArmy) {
      // 计算总攻击力和总防御力
      const attackerTotalAttack = this.calculateArmyAttack(attackerArmy)
      const defenderTotalDefense = this.calculateArmyDefense(defenderArmy, attackerArmy)
      
      // 计算实力比值
      const powerRatio = defenderTotalDefense > 0 ? attackerTotalAttack / defenderTotalDefense : 
                        (attackerTotalAttack > 0 ? 10 : 1)
      
      // 计算损耗比例
      const lossRatios = this.calculateLossRatios(powerRatio)
      
      // 计算各单位具体损耗
      const attackerLosses = this.calculateUnitLosses(attackerArmy, lossRatios.attackerLossRatio)
      const defenderLosses = this.calculateUnitLosses(defenderArmy, lossRatios.defenderLossRatio)
      
      return {
        attackerTotalAttack,
        defenderTotalDefense,
        powerRatio,
        attackerLossRatio: lossRatios.attackerLossRatio,
        defenderLossRatio: lossRatios.defenderLossRatio,
        attackerLosses,
        defenderLosses
      }
    },
    
    //=== 计算损耗比例
    calculateLossRatios(powerRatio) {
      // 掠夺战斗损耗不超过10%的基础设定
      const maxPlunderLoss = 0.10
      
      // 实力接近时（0.8-1.25），损耗接近
      if (powerRatio >= 0.8 && powerRatio <= 1.25) {
        const baseLoss = maxPlunderLoss * 0.8 // 8%左右
        return {
          attackerLossRatio: baseLoss,
          defenderLossRatio: baseLoss
        }
      }
      
      // 实力相差较大时
      if (powerRatio > 1.25) {
        // 攻击方强势
        const advantage = Math.min(powerRatio / 1.25, 10) // 最大10倍优势
        
        // 强势方（攻击方）损耗极小，使用指数衰减
        // 优势越大，损耗越接近0，最小可达0.01%
        const attackerLoss = Math.max(0.0001, maxPlunderLoss / Math.pow(advantage, 2.5))
        
        // 弱势方（防守方）损耗较大，使用对数增长
        // 优势越大，弱势方损耗越大，但不超过60%
        const defenderLoss = Math.min(0.6, maxPlunderLoss * Math.pow(advantage, 1.8))
        
        return {
          attackerLossRatio: attackerLoss,
          defenderLossRatio: defenderLoss
        }
      } else {
        // 防守方强势
        const advantage = Math.min(1.25 / powerRatio, 10) // 最大10倍优势
        
        // 强势方（防守方）损耗极小，使用指数衰减
        const defenderLoss = Math.max(0.0001, maxPlunderLoss / Math.pow(advantage, 2.5))
        
        // 弱势方（攻击方）损耗较大，使用对数增长
        const attackerLoss = Math.min(0.6, maxPlunderLoss * Math.pow(advantage, 1.8))
        
        return {
          attackerLossRatio: attackerLoss,
          defenderLossRatio: defenderLoss
        }
      }
    },
    
    //=== 计算单位损耗（强弱单位损耗不同）
    calculateUnitLosses(army, baseLossRatio) {
      if (!army.units || army.units.length === 0) return []
      
      // 计算军团平均单位实力
      const avgUnitPower = army.units.reduce((sum, unit) => {
        const unitPower = (unit.attack || 0) + (unit.infantryDefense || 0) + (unit.cavalryDefense || 0)
        return sum + unitPower
      }, 0) / army.units.length
      
      return army.units.map(unit => {
        const count = unit.count || 0
        if (count === 0) return { ...unit, losses: 0, lossRatio: 0 }
        
        // 计算单位实力
        const unitPower = (unit.attack || 0) + (unit.infantryDefense || 0) + (unit.cavalryDefense || 0)
        
        // 实力修正系数：强单位损耗少，弱单位损耗多
        // 当基础损耗很小时（强势方），强单位的优势更明显
        let powerModifier
        if (baseLossRatio < 0.01) {
          // 强势方：强单位损耗极少，弱单位损耗相对较多
          powerModifier = avgUnitPower > 0 ? Math.pow(avgUnitPower / Math.max(unitPower, 1), 0.8) : 1
        } else {
          // 弱势方或平局：正常的实力修正
          powerModifier = avgUnitPower > 0 ? Math.pow(avgUnitPower / Math.max(unitPower, 1), 0.4) : 1
        }
        
        // 调整后的损耗比例
        const adjustedLossRatio = baseLossRatio * powerModifier
        
        // 限制损耗比例在合理范围内
        const finalLossRatio = Math.max(0.0001, Math.min(0.8, adjustedLossRatio))
        const losses = Math.floor(count * finalLossRatio)
        
        return {
          ...unit,
          losses: losses,
          lossRatio: finalLossRatio
        }
      })
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
    
    //=== 计算战斗结果
    calculateBattleResult(damage) {
      const { powerRatio, attackerLossRatio, defenderLossRatio } = damage
      
      // 根据实力比值和损耗比例确定胜负
      if (powerRatio >= 0.9 && powerRatio <= 1.1) {
        return BATTLE_RESULTS.DRAW // 实力接近，平局
      } else if (powerRatio > 1.1) {
        return BATTLE_RESULTS.ATTACKER_VICTORY // 攻击方实力强，胜利
      } else {
        return BATTLE_RESULTS.DEFENDER_VICTORY // 防守方实力强，失败
      }
    },
    
    //=== 计算掠夺资源
    calculatePlunderResources(attackerArmy, defenderResources, battleResult, attackerLosses) {
      // 计算剩余军队的运载能力
      const remainingCarryCapacity = this.calculateRemainingCarryCapacity(attackerArmy, attackerLosses)
      
      // 如果没有剩余运载能力，无法带走资源
      if (remainingCarryCapacity <= 0) {
        return { wood: 0, soil: 0, iron: 0, food: 0 }
      }
      
      // 根据战斗结果确定掠夺比例
      let plunderEfficiency = 1.0 // 掠夺效率
      
      if (battleResult === BATTLE_RESULTS.ATTACKER_VICTORY) {
        plunderEfficiency = 1.0 // 胜利时100%效率
      } else if (battleResult === BATTLE_RESULTS.DRAW) {
        plunderEfficiency = 0.6 // 平局时60%效率
      } else {
        plunderEfficiency = 0.3 // 失败时30%效率
      }
      
      // 计算可掠夺的总资源（考虑效率）
      const totalDefenderResources = Object.values(defenderResources).reduce((sum, val) => sum + val, 0)
      const effectiveCarryCapacity = remainingCarryCapacity * plunderEfficiency
      const maxPlunder = Math.min(effectiveCarryCapacity, totalDefenderResources)
      
      // 按比例分配掠夺资源
      const plunderRatio = totalDefenderResources > 0 ? maxPlunder / totalDefenderResources : 0
      
      return {
        wood: Math.floor(defenderResources.wood * plunderRatio),
        soil: Math.floor(defenderResources.soil * plunderRatio),
        iron: Math.floor(defenderResources.iron * plunderRatio),
        food: Math.floor(defenderResources.food * plunderRatio)
      }
    },
    
    //=== 计算剩余军队运载能力
    calculateRemainingCarryCapacity(army, losses) {
      if (!army.units) return 0
      
      return army.units.reduce((total, unit) => {
        const originalCount = unit.count || 0
        const lossCount = losses.find(loss => loss.id === unit.id)?.losses || 0
        const remainingCount = Math.max(0, originalCount - lossCount)
        
        return total + (unit.carryCapacity || 0) * remainingCount
      }, 0)
    },
    
    //=== 计算军团运载能力（原始方法保留）
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
  },

  [BATTLE_RULE_IDS.KILL_ENEMY]: {
    id: BATTLE_RULE_IDS.KILL_ENEMY,
    name: '杀敌战斗',
    description: '不死不休的杀敌战斗，必须有一方兵种全部打光才结束',
    
    //=== 计算伤害和损耗（不死不休机制）
    calculateDamage(attackerArmy, defenderArmy) {
      // 计算总攻击力和总防御力
      const attackerTotalAttack = this.calculateArmyAttack(attackerArmy)
      const defenderTotalDefense = this.calculateArmyDefense(defenderArmy, attackerArmy)
      
      // 计算实力比值
      const powerRatio = defenderTotalDefense > 0 ? attackerTotalAttack / defenderTotalDefense : 
                        (attackerTotalAttack > 0 ? 10 : 1)
      
      // 不死不休：计算损耗比例，必须有一方全军覆没
      const lossRatios = this.calculateFightToDeathLossRatios(powerRatio)
      
      // 计算各单位具体损耗
      const attackerLosses = this.calculateUnitLosses(attackerArmy, lossRatios.attackerLossRatio)
      const defenderLosses = this.calculateUnitLosses(defenderArmy, lossRatios.defenderLossRatio)
      
      return {
        attackerTotalAttack,
        defenderTotalDefense,
        powerRatio,
        attackerLossRatio: lossRatios.attackerLossRatio,
        defenderLossRatio: lossRatios.defenderLossRatio,
        attackerLosses,
        defenderLosses
      }
    },
    
    //=== 计算不死不休损耗比例（必须有一方全军覆没）
    calculateFightToDeathLossRatios(powerRatio) {
      // 不死不休机制：弱势方必须全军覆没（100%损耗）
      // 强势方也会有较高损耗，但能保留部分兵力
      
      if (powerRatio >= 0.9 && powerRatio <= 1.1) {
        // 实力极其接近时，随机决定谁全军覆没
        const random = Math.random()
        if (random < 0.5) {
          // 攻击方全军覆没
          return {
            attackerLossRatio: 1.0, // 100%损耗
            defenderLossRatio: 0.7  // 70%损耗，但保留30%
          }
        } else {
          // 防守方全军覆没
          return {
            attackerLossRatio: 0.7, // 70%损耗，但保留30%
            defenderLossRatio: 1.0  // 100%损耗
          }
        }
      } else if (powerRatio > 1.1) {
        // 攻击方强势，防守方全军覆没
        const advantage = Math.min(powerRatio / 1.1, 5) // 最大5倍优势
        
        // 强势方（攻击方）损耗：优势越大损耗越小，但最少也要20%
        const attackerLoss = Math.max(0.2, 0.8 / advantage)
        
        // 弱势方（防守方）全军覆没
        const defenderLoss = 1.0
        
        return {
          attackerLossRatio: attackerLoss,
          defenderLossRatio: defenderLoss
        }
      } else {
        // 防守方强势，攻击方全军覆没
        const advantage = Math.min(1.1 / powerRatio, 5) // 最大5倍优势
        
        // 强势方（防守方）损耗：优势越大损耗越小，但最少也要20%
        const defenderLoss = Math.max(0.2, 0.8 / advantage)
        
        // 弱势方（攻击方）全军覆没
        const attackerLoss = 1.0
        
        return {
          attackerLossRatio: attackerLoss,
          defenderLossRatio: defenderLoss
        }
      }
    },
    
    //=== 计算单位损耗（不死不休战斗中所有单位按比例损耗）
    calculateUnitLosses(army, baseLossRatio) {
      if (!army.units || army.units.length === 0) return []
      
      return army.units.map(unit => {
        const count = unit.count || 0
        if (count === 0) return { ...unit, losses: 0, lossRatio: 0 }
        
        // 不死不休战斗中，所有单位按统一比例损耗
        // 如果是全军覆没（100%），则所有兵种都死光
        let finalLossRatio = baseLossRatio
        let losses = 0
        
        if (baseLossRatio >= 1.0) {
          // 全军覆没：所有兵种都死光
          finalLossRatio = 1.0
          losses = count
        } else {
          // 部分损耗：按比例计算，但至少损失1个单位（如果有的话）
          losses = Math.max(1, Math.floor(count * baseLossRatio))
          // 确保不超过总数
          losses = Math.min(losses, count)
          finalLossRatio = losses / count
        }
        
        return {
          ...unit,
          losses: losses,
          lossRatio: finalLossRatio
        }
      })
    },
    
    //=== 计算军团攻击力
    calculateArmyAttack(army) {
      if (!army.units) return 0
      return army.units.reduce((total, unit) => {
        return total + (unit.attack || 0) * (unit.count || 0)
      }, 0)
    },
    
    //=== 计算军团防御力
    calculateArmyDefense(army, enemyArmy) {
      if (!army.units) return 0
      return army.units.reduce((total, unit) => {
        // 根据敌方兵种类型选择对应防御力
        const defense = this.getEffectiveDefense(unit, enemyArmy)
        return total + defense * (unit.count || 0)
      }, 0)
    },
    
    //=== 获取有效防御力
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
    
    //=== 计算战斗结果（不死不休必须分出胜负）
    calculateBattleResult(damage) {
      const { attackerLossRatio, defenderLossRatio } = damage
      
      // 不死不休战斗：必须分出胜负，不存在平局
      if (attackerLossRatio >= 1.0 && defenderLossRatio >= 1.0) {
        // 理论上不应该出现双方全军覆没，但如果出现则判定为平局
        return BATTLE_RESULTS.DRAW
      } else if (defenderLossRatio >= 1.0) {
        // 防守方全军覆没，攻击方胜利
        return BATTLE_RESULTS.ATTACKER_VICTORY
      } else if (attackerLossRatio >= 1.0) {
        // 攻击方全军覆没，防守方胜利
        return BATTLE_RESULTS.DEFENDER_VICTORY
      } else {
        // 理论上不应该出现这种情况（不死不休必须有一方全军覆没）
        // 如果出现，则按损耗比例判定
        if (attackerLossRatio < defenderLossRatio) {
          return BATTLE_RESULTS.ATTACKER_VICTORY
        } else {
          return BATTLE_RESULTS.DEFENDER_VICTORY
        }
      }
    },
    
    //=== 计算杀敌奖励（不死不休战斗奖励更丰厚）
    calculateKillRewards(attackerArmy, defenderLosses) {
      // 根据杀敌数量计算经验值或其他奖励
      const totalKills = defenderLosses.reduce((sum, loss) => sum + (loss.losses || 0), 0)
      
      // 不死不休战斗奖励翻倍
      return {
        experience: totalKills * 20, // 每杀一个敌人获得20经验（翻倍）
        honor: Math.floor(totalKills / 5), // 每杀5个敌人获得1荣誉（翻倍）
        totalKills: totalKills,
        fightToDeathBonus: true // 不死不休奖励标记
      }
    }
  }
}

// 默认战斗规则
export const DEFAULT_BATTLE_RULE = BATTLE_RULE_IDS.PLUNDER

//=== 通用战斗计算函数
//=== 计算损失函数
export const calculateLosses = (army, lossRatio) => {
  const units = {}
  let total = 0
  
  if (army.units) {
    Object.entries(army.units).forEach(([unitId, unitData]) => {
      const losses = Math.floor((unitData.count || 0) * lossRatio)
      if (losses > 0) {
        units[unitId] = losses
        total += losses
      }
    })
  }
  
  return {
    units,
    total
  }
}

function createStandardBattleResult(ruleId, attackerArmy, defenderArmy, battleResult, damage, details = {}) {
  // 计算损失兵种
  const calculateLossesInternal = (army, lossRatio) => {
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

  // 生成战斗时间（发生交战的时间）
  const battleTime = details.battleTime || new Date().toISOString()

  return {
    ruleId,
    battleResult,
    battleTime, // 战斗时间：发生交战的时间
    attacker: {
      uuid: attackerArmy.playerInfo?.userUUID || 'player-uuid',
      nickname: attackerArmy.playerInfo?.nickname || '玩家',
      faction: attackerArmy.armyGroup?.faction || attackerArmy.faction || 'unknown',
      originalUnits: attackerArmy.units || [],
      losses: calculateLossesInternal(attackerArmy, attackerLossRatio),
      carryResources: attackerArmy.carryResources || { wood: 0, soil: 0, iron: 0, food: 0 },
      lossRatio: attackerLossRatio
    },
    defender: {
      uuid: defenderArmy.npcInfo?.id || 'npc-uuid',
      nickname: defenderArmy.npcInfo?.name || 'NPC城池',
      faction: defenderArmy.armyGroup?.faction || defenderArmy.faction || 'unknown',
      originalUnits: defenderArmy.units || [],
      losses: calculateLossesInternal(defenderArmy, defenderLossRatio),
      originalResources: defenderArmy.resources || { wood: 10000, soil: 10000, iron: 5000, food: 8000 },
      remainingResources: defenderArmy.remainingResources || { wood: 0, soil: 0, iron: 0, food: 0 },
      lossRatio: defenderLossRatio
    },
    details: {
      totalAttack,
      totalDefense,
      powerRatio: totalDefense > 0 ? totalAttack / totalDefense : (totalAttack > 0 ? 10 : 1),
      marchTime: details.marchTime || 0,
      battleTime, // 在 details 中也保留一份战斗时间
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
          const damageResult = this.calculateDamage(attackerArmy, defenderArmy)
          battleResult = damageResult.battleResult
          
          // 构建损耗数据（只返回比例）
          damage = {
            attackerLossRatio: damageResult.attackerLossRatio,
            defenderLossRatio: damageResult.defenderLossRatio
          }
          
          details = {
            powerComparison: damageResult.powerComparison?.overallRatio || 1,
            battleTime: new Date().toISOString()
          }
        } else if (this.id === BATTLE_RULE_IDS.PLUNDER) {
          // 掠夺战斗规则
          const damageResult = this.calculateDamage(attackerArmy, defenderArmy)
          battleResult = this.calculateBattleResult(damageResult)
          
          // 计算掠夺资源
          const defenderResources = defenderArmy.resources || { wood: 10000, soil: 10000, iron: 5000, food: 8000 }
          const plundered = this.calculatePlunderResources(attackerArmy, defenderResources, battleResult, damageResult.attackerLosses)
          
          // 计算剩余资源
          const remainingResources = {
            wood: defenderResources.wood - (plundered.wood || 0),
            soil: defenderResources.soil - (plundered.soil || 0),
            iron: defenderResources.iron - (plundered.iron || 0),
            food: defenderResources.food - (plundered.food || 0)
          }
          
          // 更新防守方的剩余资源
          defenderArmy.remainingResources = remainingResources
          
          // 构建损耗数据（只返回比例）
          damage = {
            attackerLossRatio: damageResult.attackerLossRatio,
            defenderLossRatio: damageResult.defenderLossRatio
          }
          
          details = {
            plundered: plundered,
            carryCapacity: this.calculateArmyCarryCapacity(attackerArmy),
            remainingCarryCapacity: this.calculateRemainingCarryCapacity(attackerArmy, damageResult.attackerLosses),
            powerRatio: damageResult.powerRatio,
            attackerTotalAttack: damageResult.attackerTotalAttack,
            defenderTotalDefense: damageResult.defenderTotalDefense,
            plunderEfficiency: battleResult === BATTLE_RESULTS.ATTACKER_VICTORY ? 1.0 : 
                              (battleResult === BATTLE_RESULTS.DRAW ? 0.6 : 0.3),
            battleTime: new Date().toISOString()
          }
        } else if (this.id === BATTLE_RULE_IDS.KILL_ENEMY) {
          // 杀敌战斗规则（不死不休）
          const damageResult = this.calculateDamage(attackerArmy, defenderArmy)
          battleResult = this.calculateBattleResult(damageResult)
          
          // 计算杀敌奖励
          const killRewards = this.calculateKillRewards(attackerArmy, damageResult.defenderLosses)
          
          // 构建损耗数据（只返回比例）
          damage = {
            attackerLossRatio: damageResult.attackerLossRatio,
            defenderLossRatio: damageResult.defenderLossRatio
          }
          
          // 计算总杀敌数和总损失数
          const attackerTotalKills = damageResult.defenderLosses.reduce((sum, loss) => sum + (loss.losses || 0), 0)
          const defenderTotalKills = damageResult.attackerLosses.reduce((sum, loss) => sum + (loss.losses || 0), 0)
          const attackerTotalLosses = damageResult.attackerLosses.reduce((sum, loss) => sum + (loss.losses || 0), 0)
          const defenderTotalLosses = damageResult.defenderLosses.reduce((sum, loss) => sum + (loss.losses || 0), 0)
          
          // 不死不休战斗效率：考虑全军覆没的情况
          let battleEfficiency = {
            attackerEfficiency: 1.0, // 默认效率
            defenderEfficiency: 1.0,
            fightToDeathResult: {
              attackerAnnihilated: damageResult.attackerLossRatio >= 1.0,
              defenderAnnihilated: damageResult.defenderLossRatio >= 1.0,
              totalCasualties: attackerTotalLosses + defenderTotalLosses
            }
          }
          
          // 计算战斗效率（杀敌数/自身损失数）
          if (attackerTotalLosses > 0) {
            battleEfficiency.attackerEfficiency = attackerTotalKills / attackerTotalLosses
          } else if (attackerTotalKills > 0) {
            battleEfficiency.attackerEfficiency = 10.0 // 无损失但有杀敌，效率极高
          }
          
          if (defenderTotalLosses > 0) {
            battleEfficiency.defenderEfficiency = defenderTotalKills / defenderTotalLosses
          } else if (defenderTotalKills > 0) {
            battleEfficiency.defenderEfficiency = 10.0 // 无损失但有杀敌，效率极高
          }
          
          details = {
            powerRatio: damageResult.powerRatio,
            attackerTotalAttack: damageResult.attackerTotalAttack,
            defenderTotalDefense: damageResult.defenderTotalDefense,
            killRewards: killRewards,
            battleEfficiency: battleEfficiency,
            fightToDeathBonus: true, // 不死不休战斗标记
            battleTime: new Date().toISOString()
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