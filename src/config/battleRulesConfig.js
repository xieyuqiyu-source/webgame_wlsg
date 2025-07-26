/**
 * 武林三国 - 战斗规则配置文件
 * 定义各种战斗规则的计算逻辑和参数
 */

// 战斗规则ID常量
export const BATTLE_RULE_IDS = {
  BASIC: 'BASIC',           // 基础战斗规则
  PLUNDER: 'PLUNDER',       // 掠夺战斗规则
  EXPONENT: 'EXPONENT'      // 指数伤亡规则
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
  [BATTLE_RULE_IDS.BASIC]: {
    id: BATTLE_RULE_IDS.BASIC,
    name: '基础战斗',
    description: '简单的攻防计算，适合快速战斗',
    
    //=== 计算伤害
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
    
    //=== 计算战斗结果
    calculateBattleResult(attackerDamage, defenderDamage) {
      const damageDiff = attackerDamage - defenderDamage
      
      if (Math.abs(damageDiff) < attackerDamage * 0.1) {
        return 'draw' // 平局
      } else if (damageDiff > 0) {
        return 'victory' // 胜利
      } else {
        return 'defeat' // 失败
      }
    }
  },
  
  [BATTLE_RULE_IDS.PLUNDER]: {
    id: BATTLE_RULE_IDS.PLUNDER,
    name: '掠夺战斗',
    description: '专门用于掠夺战斗，考虑运载能力',
    
    //=== 继承基础战斗的计算方法
    ...BATTLE_RULES[BATTLE_RULE_IDS.BASIC],
    
    //=== 计算掠夺资源
    calculatePlunderResources(attackerArmy, defenderResources, battleResult) {
      // 只有胜利才能掠夺
      if (battleResult !== 'victory') {
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
  
  [BATTLE_RULE_IDS.EXPONENT]: {
    id: BATTLE_RULE_IDS.EXPONENT,
    name: '指数伤亡',
    description: '使用指数公式计算损耗比例，更真实的战损模拟',
    
    //=== 继承基础战斗的部分方法
    calculateArmyAttack: BATTLE_RULES[BATTLE_RULE_IDS.BASIC].calculateArmyAttack,
    calculateArmyDefense: BATTLE_RULES[BATTLE_RULE_IDS.BASIC].calculateArmyDefense,
    getEffectiveDefense: BATTLE_RULES[BATTLE_RULE_IDS.BASIC].getEffectiveDefense,
    
    //=== 指数伤害计算
    calculateDamage(attackerArmy, defenderArmy) {
      const attackerPower = this.calculateArmyAttack(attackerArmy)
      const defenderPower = this.calculateArmyDefense(defenderArmy, attackerArmy)
      
      // 指数公式：损耗比例 = (防御力/攻击力)^1.422
      const attackerLossRatio = defenderPower > 0 ? Math.pow(defenderPower / attackerPower, 1.422) : 0
      const defenderLossRatio = attackerPower > 0 ? Math.pow(attackerPower / defenderPower, 1.422) : 0
      
      // 限制损耗比例在合理范围内
      const maxLossRatio = 0.8 // 最大80%损耗
      const minLossRatio = 0.1 // 最小10%损耗
      
      const attackerDamage = Math.min(maxLossRatio, Math.max(minLossRatio, attackerLossRatio)) * attackerPower
      const defenderDamage = Math.min(maxLossRatio, Math.max(minLossRatio, defenderLossRatio)) * defenderPower
      
      return {
        attackerDamage,
        defenderDamage,
        attackerLossRatio: attackerDamage / attackerPower,
        defenderLossRatio: defenderDamage / defenderPower
      }
    },
    
    //=== 计算战斗结果
    calculateBattleResult(attackerDamage, defenderDamage, attackerPower, defenderPower) {
      const attackerLossRatio = attackerDamage / attackerPower
      const defenderLossRatio = defenderDamage / defenderPower
      
      const ratioDiff = defenderLossRatio - attackerLossRatio
      
      if (Math.abs(ratioDiff) < 0.1) {
        return 'draw' // 平局
      } else if (ratioDiff > 0) {
        return 'victory' // 胜利
      } else {
        return 'defeat' // 失败
      }
    }
  }
}

// 默认战斗规则
export const DEFAULT_BATTLE_RULE = BATTLE_RULE_IDS.BASIC

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