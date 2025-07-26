/**
 * 武林三国 - 战斗规则使用示例
 * 演示新的综合实力战斗规则的使用方法
 */

import { BATTLE_RULES, BATTLE_RULE_IDS } from '../config/battleRulesConfig.js'
import { UNIT_TYPES } from '../config/factionConfig.js'

//=== 创建示例军队数据
function createExampleArmies() {
  // 进攻方军队：混合步兵和骑兵
  const attackerArmy = {
    units: [
      {
        id: 'qingZhouArmy',
        name: '青州军',
        unitType: UNIT_TYPES.INFANTRY,
        attack: 8,
        infantryDefense: 7,
        cavalryDefense: 10,
        count: 100
      },
      {
        id: 'qiQiYing',
        name: '骑骑营',
        unitType: UNIT_TYPES.CAVALRY,
        attack: 24,
        infantryDefense: 13,
        cavalryDefense: 10,
        count: 50
      }
    ]
  }
  
  // 防守方军队：主要是步兵
  const defenderArmy = {
    units: [
      {
        id: 'greedyWolf',
        name: '贪狼营',
        unitType: UNIT_TYPES.INFANTRY,
        attack: 8,
        infantryDefense: 4,
        cavalryDefense: 1,
        count: 120
      },
      {
        id: 'qilinGuard',
        name: '麒麟卫',
        unitType: UNIT_TYPES.INFANTRY,
        attack: 2,
        infantryDefense: 7,
        cavalryDefense: 12,
        count: 80
      }
    ]
  }
  
  return { attackerArmy, defenderArmy }
}

//=== 演示基础战斗规则
function demonstrateBasicBattle() {
  console.log('\n=== 基础战斗规则演示 ===')
  const { attackerArmy, defenderArmy } = createExampleArmies()
  const basicRule = BATTLE_RULES[BATTLE_RULE_IDS.BASIC]
  
  const damage = basicRule.calculateDamage(attackerArmy, defenderArmy)
  const result = basicRule.calculateBattleResult(damage.attackerDamage, damage.defenderDamage)
  
  console.log('进攻方伤害:', damage.attackerDamage)
  console.log('防守方伤害:', damage.defenderDamage)
  console.log('战斗结果:', result)
}

//=== 演示综合实力战斗规则
function demonstrateComprehensiveBattle() {
  console.log('\n=== 综合实力战斗规则演示 ===')
  const { attackerArmy, defenderArmy } = createExampleArmies()
  const comprehensiveRule = BATTLE_RULES[BATTLE_RULE_IDS.COMPREHENSIVE]
  
  // 计算分兵种攻击力
  const attackerAttack = comprehensiveRule.calculateSeparateAttack(attackerArmy)
  console.log('进攻方攻击力分析:')
  console.log('  步兵攻击力:', attackerAttack.infantry)
  console.log('  骑兵攻击力:', attackerAttack.cavalry)
  console.log('  总攻击力:', attackerAttack.infantry + attackerAttack.cavalry)
  
  // 计算分兵种防御力
  const defenderDefense = comprehensiveRule.calculateSeparateDefense(defenderArmy)
  console.log('\n防守方防御力分析:')
  console.log('  步防:', defenderDefense.infantryDefense)
  console.log('  骑防:', defenderDefense.cavalryDefense)
  console.log('  总防御力:', defenderDefense.infantryDefense + defenderDefense.cavalryDefense)
  
  // 计算实力对比
  const powerComparison = comprehensiveRule.calculatePowerComparison(attackerArmy, defenderArmy)
  console.log('\n实力对比分析:')
  console.log('  步兵攻防比:', powerComparison.infantryRatio.toFixed(2))
  console.log('  骑兵攻防比:', powerComparison.cavalryRatio.toFixed(2))
  console.log('  综合实力比:', powerComparison.overallRatio.toFixed(2))
  
  // 计算战斗结果
  const battleResult = comprehensiveRule.calculateDamage(attackerArmy, defenderArmy)
  console.log('\n战斗结果:')
  console.log('  战斗胜负:', battleResult.battleResult)
  console.log('  进攻方损耗比例:', (battleResult.attackerLossRatio * 100).toFixed(1) + '%')
  console.log('  防守方损耗比例:', (battleResult.defenderLossRatio * 100).toFixed(1) + '%')
  
  // 详细损耗分析
  console.log('\n进攻方详细损耗:')
  battleResult.attackerLosses.forEach(unit => {
    console.log(`  ${unit.name}: ${unit.losses}/${unit.count} (${(unit.lossRatio * 100).toFixed(1)}%)`)
  })
  
  console.log('\n防守方详细损耗:')
  battleResult.defenderLosses.forEach(unit => {
    console.log(`  ${unit.name}: ${unit.losses}/${unit.count} (${(unit.lossRatio * 100).toFixed(1)}%)`)
  })
}

//=== 演示不同实力差距的战斗
function demonstrateDifferentPowerGaps() {
  console.log('\n=== 不同实力差距战斗演示 ===')
  const comprehensiveRule = BATTLE_RULES[BATTLE_RULE_IDS.COMPREHENSIVE]
  
  // 场景1：实力均衡
  console.log('\n场景1：实力均衡 (比例约1.0)')
  const balancedAttacker = {
    units: [{
      unitType: UNIT_TYPES.INFANTRY,
      attack: 10,
      infantryDefense: 5,
      cavalryDefense: 5,
      count: 100
    }]
  }
  const balancedDefender = {
    units: [{
      unitType: UNIT_TYPES.INFANTRY,
      attack: 8,
      infantryDefense: 10,
      cavalryDefense: 10,
      count: 100
    }]
  }
  
  let result = comprehensiveRule.calculateDamage(balancedAttacker, balancedDefender)
  console.log('  综合实力比:', result.powerComparison.overallRatio.toFixed(2))
  console.log('  进攻方损耗:', (result.attackerLossRatio * 100).toFixed(1) + '%')
  console.log('  防守方损耗:', (result.defenderLossRatio * 100).toFixed(1) + '%')
  console.log('  战斗结果:', result.battleResult)
  
  // 场景2：进攻方强势
  console.log('\n场景2：进攻方强势 (比例约2.0)')
  const strongAttacker = {
    units: [{
      unitType: UNIT_TYPES.CAVALRY,
      attack: 30,
      infantryDefense: 10,
      cavalryDefense: 10,
      count: 100
    }]
  }
  const weakDefender = {
    units: [{
      unitType: UNIT_TYPES.INFANTRY,
      attack: 5,
      infantryDefense: 15,
      cavalryDefense: 15,
      count: 100
    }]
  }
  
  result = comprehensiveRule.calculateDamage(strongAttacker, weakDefender)
  console.log('  综合实力比:', result.powerComparison.overallRatio.toFixed(2))
  console.log('  进攻方损耗:', (result.attackerLossRatio * 100).toFixed(1) + '%')
  console.log('  防守方损耗:', (result.defenderLossRatio * 100).toFixed(1) + '%')
  console.log('  战斗结果:', result.battleResult)
  
  // 场景3：防守方强势
  console.log('\n场景3：防守方强势 (比例约0.5)')
  const weakAttacker = {
    units: [{
      unitType: UNIT_TYPES.INFANTRY,
      attack: 8,
      infantryDefense: 5,
      cavalryDefense: 5,
      count: 100
    }]
  }
  const strongDefender = {
    units: [{
      unitType: UNIT_TYPES.INFANTRY,
      attack: 10,
      infantryDefense: 20,
      cavalryDefense: 20,
      count: 100
    }]
  }
  
  result = comprehensiveRule.calculateDamage(weakAttacker, strongDefender)
  console.log('  综合实力比:', result.powerComparison.overallRatio.toFixed(2))
  console.log('  进攻方损耗:', (result.attackerLossRatio * 100).toFixed(1) + '%')
  console.log('  防守方损耗:', (result.defenderLossRatio * 100).toFixed(1) + '%')
  console.log('  战斗结果:', result.battleResult)
}

//=== 主函数：运行所有演示
export function runBattleRuleExamples() {
  console.log('武林三国 - 战斗规则演示')
  console.log('========================')
  
  demonstrateBasicBattle()
  demonstrateComprehensiveBattle()
  demonstrateDifferentPowerGaps()
  
  console.log('\n演示完成！')
}

// 如果直接运行此文件，则执行演示
if (typeof window === 'undefined') {
  runBattleRuleExamples()
}