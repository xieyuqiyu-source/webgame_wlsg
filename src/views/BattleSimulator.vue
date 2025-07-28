<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">⚔️ 战斗模拟器</h1>
        <p class="text-lg text-gray-600">测试不同战斗规则和军队配置的战斗效果</p>
      </div>

      <!-- 战斗规则选择 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">战斗规则</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <label 
            v-for="rule in battleRules" 
            :key="rule.id"
            class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            :class="selectedRule === rule.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
          >
            <input 
              type="radio" 
              :value="rule.id" 
              v-model="selectedRule"
              class="mr-3"
            />
            <div>
              <div class="font-medium">{{ rule.name }}</div>
              <div class="text-sm text-gray-600">{{ rule.description }}</div>
            </div>
          </label>
        </div>

        <!-- 战斗规则详细说明 -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">📋 {{ currentRuleDetails.name }} - 详细说明</h3>
            <button 
              @click="toggleRuleDetails"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {{ showRuleDetails ? '收起' : '展开' }}
            </button>
          </div>
          
          <div v-show="showRuleDetails" class="space-y-4">
            <!-- 规则概述 -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-semibold text-blue-800 mb-2">🎯 规则概述</h4>
              <p class="text-blue-700">{{ currentRuleDetails.overview }}</p>
            </div>

            <!-- 损耗计算规则 -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 class="font-semibold text-yellow-800 mb-3">⚔️ 损耗计算规则</h4>
              <div class="space-y-2">
                <div v-for="(rule, index) in currentRuleDetails.lossRules" :key="index" class="text-yellow-700">
                  <span class="font-medium">{{ rule.condition }}：</span>
                  <span>{{ rule.description }}</span>
                </div>
              </div>
            </div>

            <!-- 特殊机制 -->
            <div v-if="currentRuleDetails.specialMechanics" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 class="font-semibold text-green-800 mb-3">🔧 特殊机制</h4>
              <div class="space-y-2">
                <div v-for="(mechanic, index) in currentRuleDetails.specialMechanics" :key="index" class="text-green-700">
                  <span class="font-medium">{{ mechanic.name }}：</span>
                  <span>{{ mechanic.description }}</span>
                </div>
              </div>
            </div>

            <!-- 计算公式 -->
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 class="font-semibold text-purple-800 mb-3">📊 核心计算公式</h4>
              <div class="space-y-2 font-mono text-sm">
                <div v-for="(formula, index) in currentRuleDetails.formulas" :key="index" class="text-purple-700">
                  <div class="font-semibold">{{ formula.name }}：</div>
                  <div class="bg-white p-2 rounded border ml-4">{{ formula.formula }}</div>
                </div>
              </div>
            </div>

            <!-- 适用场景 -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 class="font-semibold text-gray-800 mb-2">💡 适用场景</h4>
              <p class="text-gray-700">{{ currentRuleDetails.useCase }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 军队配置区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 攻击方配置 -->
        <ArmyConfigurator
          title="🗡️ 攻击方"
          :army="attackerArmy"
          @update:army="attackerArmy = $event"
          color="red"
        />

        <!-- 防守方配置 -->
        <ArmyConfigurator
          title="🛡️ 防守方"
          :army="defenderArmy"
          @update:army="defenderArmy = $event"
          color="blue"
        />
      </div>

      <!-- 战斗控制 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">战斗控制</h2>
        <div class="flex flex-wrap gap-4">
          <button 
            @click="simulateBattle"
            :disabled="!canSimulate"
            class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ⚔️ 开始战斗
          </button>
          <button 
            @click="batchSimulate"
            :disabled="!canSimulate"
            class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            🔄 批量测试 (10次)
          </button>
          <button 
            @click="clearResults"
            :disabled="battleResults.length === 0"
            class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            🗑️ 清空结果
          </button>
        </div>
      </div>

      <!-- 战斗结果 -->
      <BattleResults 
        :results="battleResults"
        @remove-result="removeResult"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { BATTLE_RULE_IDS, BATTLE_RULES, calculateLosses } from '@/config/battleRulesConfig.js'
import { getAllUnits } from '@/config/factionConfig.js'
import ArmyConfigurator from './components/ArmyConfigurator.vue'
import BattleResults from './components/BattleResults.vue'

export default {
  name: 'BattleSimulator',
  components: {
    ArmyConfigurator,
    BattleResults
  },
  setup() {
    //=== 响应式数据
    const selectedRule = ref(BATTLE_RULE_IDS.COMPREHENSIVE)
    const battleResults = ref([])
    const showRuleDetails = ref(false)
    
    // 攻击方军队
    const attackerArmy = ref({
      faction: 'wei',
      units: []
    })
    
    // 防守方军队
    const defenderArmy = ref({
      faction: 'wei',
      units: []
    })

    //=== 战斗规则配置
    const battleRules = ref([
      {
        id: BATTLE_RULE_IDS.COMPREHENSIVE,
        name: '综合实力战斗',
        description: '基于双方综合实力对比的平衡战斗'
      },
      {
        id: BATTLE_RULE_IDS.PLUNDER,
        name: '掠夺战斗',
        description: '快速战斗，损耗较低，适合资源掠夺'
      },
      {
        id: BATTLE_RULE_IDS.KILL_ENEMY,
        name: '杀敌战斗',
        description: '不死不休的激烈战斗，必须分出胜负'
      }
    ])

    //=== 战斗规则详细说明数据
    const ruleDetailsData = ref({
      [BATTLE_RULE_IDS.COMPREHENSIVE]: {
        name: '综合实力战斗',
        overview: '分别计算步兵和骑兵攻防，根据实力差距计算损耗，强者损失少，弱者损失大。考虑兵种克制关系的平衡战斗模式。',
        lossRules: [
          { condition: '实力接近 (0.8-1.25倍)', description: '双方均等损失15%' },
          { condition: '实力差距较大', description: '强者最少5%损失，弱者最多60%损失' },
          { condition: '最大优势限制', description: '最大考虑4倍优势差距' }
        ],
        specialMechanics: [
          { name: '分兵种计算', description: '步兵攻击力 vs 步兵防御力，骑兵攻击力 vs 骑兵防御力' },
          { name: '单位差异化', description: '强单位损耗更小，弱单位损失更大' },
          { name: '兵种克制', description: '根据敌方兵种类型选择对应防御力' }
        ],
        formulas: [
          { name: '实力比值', formula: '总攻击力 / 总防御力' },
          { name: '强者损耗', formula: 'max(0.05, 0.2 / advantage)' },
          { name: '弱者损耗', formula: 'min(0.6, 0.15 * advantage)' }
        ],
        useCase: '适合常规战斗，平衡的战斗模式，既考虑实力差距又保持合理的损耗比例。'
      },
      [BATTLE_RULE_IDS.PLUNDER]: {
        name: '掠夺战斗',
        overview: '专门用于掠夺战斗，考虑运载能力。实力接近时损耗接近，实力差距大时强者损耗小。掠夺战斗损耗不超过10%的基础设定。',
        lossRules: [
          { condition: '实力接近 (0.8-1.25倍)', description: '双方均损耗8%左右' },
          { condition: '攻击方强势 (>1.25倍)', description: '强势方使用指数衰减，最小0.01%；弱势方使用对数增长，最大60%' },
          { condition: '防守方强势 (<0.8倍)', description: '同上规则，角色互换' }
        ],
        specialMechanics: [
          { name: '运载能力', description: '掠夺资源受剩余军队运载能力限制' },
          { name: '掠夺效率', description: '胜利100%效率，平局60%效率，失败30%效率' },
          { name: '单位差异', description: '强势方时强单位优势更明显' }
        ],
        formulas: [
          { name: '强势方损耗', formula: 'max(0.0001, maxLoss / pow(advantage, 2.5))' },
          { name: '弱势方损耗', formula: 'min(0.6, maxLoss * pow(advantage, 1.8))' },
          { name: '掠夺资源', formula: 'min(运载能力 * 效率, 总资源)' }
        ],
        useCase: '适合资源获取战斗，损耗可控，重点在于获取敌方资源而非消灭敌军。'
      },
      [BATTLE_RULE_IDS.KILL_ENEMY]: {
        name: '杀敌战斗',
        overview: '不死不休的杀敌战斗，必须有一方兵种全部打光才结束。奖励更丰厚，经验值翻倍，适合决定性战斗。',
        lossRules: [
          { condition: '实力极其接近 (0.9-1.1倍)', description: '随机决定谁全军覆没，全军覆没方100%损耗，幸存方70%损耗' },
          { condition: '实力差距明显', description: '弱势方100%损耗（全军覆没），强势方最少20%损耗' },
          { condition: '优势计算', description: '优势越大，强势方损耗越小，但最少保持20%' }
        ],
        specialMechanics: [
          { name: '不死不休', description: '必须有一方全军覆没才结束战斗' },
          { name: '无平局', description: '必须分出胜负，不存在平局情况' },
          { name: '奖励翻倍', description: '经验值和荣誉值获得翻倍奖励' }
        ],
        formulas: [
          { name: '强势方损耗', formula: 'max(0.2, 0.8 / advantage)' },
          { name: '弱势方损耗', formula: '1.0 (全军覆没)' },
          { name: '经验奖励', formula: '杀敌数 * 20 (翻倍)' },
          { name: '荣誉奖励', formula: 'floor(杀敌数 / 5) (翻倍)' }
        ],
        useCase: '适合决定性战斗，高风险高回报，用于彻底消灭敌军或获得大量经验奖励。'
      }
    })

    //=== 计算属性
    const canSimulate = computed(() => {
      return attackerArmy.value.units.length > 0 && 
             defenderArmy.value.units.length > 0 &&
             selectedRule.value
    })

    const currentRuleDetails = computed(() => {
      return ruleDetailsData.value[selectedRule.value] || ruleDetailsData.value[BATTLE_RULE_IDS.COMPREHENSIVE]
    })

    //=== 方法
    //=== 切换规则详情显示
    const toggleRuleDetails = () => {
      showRuleDetails.value = !showRuleDetails.value
    }
    //=== 执行单次战斗模拟
    const simulateBattle = () => {
      if (!canSimulate.value) {
        alert('请先配置攻击方和防守方的军队！')
        return
      }

      try {
        const battleRule = BATTLE_RULES[selectedRule.value]
        if (!battleRule) {
          throw new Error(`未找到战斗规则: ${selectedRule.value}`)
        }

        // 准备战斗数据
        const attackerData = prepareArmyData(attackerArmy.value)
        const defenderData = prepareArmyData(defenderArmy.value)

        console.log('开始战斗模拟:', {
          rule: selectedRule.value,
          attacker: attackerData,
          defender: defenderData
        })

        // 执行战斗计算
        const battleResult = battleRule.calculateBattle(attackerData, defenderData)
        
        // 提取损耗比例（适配标准战斗结果结构）
        const attackerLossRatio = battleResult.attacker?.lossRatio || 0
        const defenderLossRatio = battleResult.defender?.lossRatio || 0
        
        // 计算详细损失
        const attackerLosses = calculateLosses(attackerData, attackerLossRatio)
        const defenderLosses = calculateLosses(defenderData, defenderLossRatio)

        // 构建完整结果（转换为模拟器期望的格式）
        const fullResult = {
          // 基本信息
          ruleId: selectedRule.value,
          result: battleResult.battleResult,
          timestamp: new Date().toISOString(),
          
          // 损耗比例（简化格式）
          attackerLossRatio,
          defenderLossRatio,
          
          // 详细损失
          attackerLosses,
          defenderLosses,
          
          // 战斗详情
          details: {
            battleTime: battleResult.details?.battleTime || new Date().toISOString(),
            powerRatio: battleResult.details?.powerRatio || 1,
            attackerPowerRatio: attackerLossRatio < defenderLossRatio ? (1 - attackerLossRatio) : 0.5,
            defenderPowerRatio: defenderLossRatio < attackerLossRatio ? (1 - defenderLossRatio) : 0.5,
            battleEfficiency: battleResult.details?.battleEfficiency || 1,
            totalAttack: battleResult.details?.totalAttack || 0,
            totalDefense: battleResult.details?.totalDefense || 0,
            fightToDeathBonus: battleResult.details?.fightToDeathBonus || false,
            totalKills: battleResult.details?.killRewards?.totalKills || 0,
            totalLosses: (attackerLosses.total || 0) + (defenderLosses.total || 0)
          },
          
          // 奖励信息
          rewards: battleResult.details?.killRewards || null
        }

        console.log('战斗结果:', fullResult)

        // 添加到结果列表
        battleResults.value.unshift(fullResult)

        // 限制结果数量
        if (battleResults.value.length > 50) {
          battleResults.value = battleResults.value.slice(0, 50)
        }

      } catch (error) {
        console.error('战斗模拟失败:', error)
        alert(`战斗模拟失败: ${error.message}`)
      }
    }

    //=== 批量战斗测试
    const batchSimulate = () => {
      if (!canSimulate.value) {
        alert('请先配置攻击方和防守方的军队！')
        return
      }

      const batchCount = 10
      for (let i = 0; i < batchCount; i++) {
        simulateBattle()
      }
    }

    //=== 清空战斗结果
    const clearResults = () => {
      battleResults.value = []
    }

    //=== 移除单个结果
    const removeResult = (index) => {
      battleResults.value.splice(index, 1)
    }

    //=== 准备军队数据
    const prepareArmyData = (army) => {
      const units = army.units.filter(unit => unit.count > 0).map(unit => ({
        id: unit.id,
        count: unit.count,
        attack: unit.attack,
        infantryDefense: unit.infantryDefense,
        cavalryDefense: unit.cavalryDefense,
        speed: unit.speed,
        unitType: unit.unitType,
        name: unit.name
      }))

      return {
        faction: army.faction,
        units
      }
    }

    //=== 初始化默认军队
    const initializeDefaultArmies = () => {
      const allUnits = getAllUnits()
      const weiUnits = allUnits.filter(unit => unit.faction === 'wei')
      
      if (weiUnits.length > 0) {
        // 攻击方默认配置
        attackerArmy.value = {
          faction: 'wei',
          units: [
            { ...weiUnits[0], count: 500 }, // 第一个兵种
            { ...weiUnits[1], count: 300 }  // 第二个兵种
          ].filter(unit => unit.id) // 确保有有效的兵种
        }

        // 防守方默认配置
        defenderArmy.value = {
          faction: 'wei',
          units: [
            { ...weiUnits[0], count: 400 }, // 第一个兵种
            { ...weiUnits[2], count: 200 }  // 第三个兵种
          ].filter(unit => unit.id) // 确保有有效的兵种
        }
      }
    }

    //=== 生命周期
    onMounted(() => {
      initializeDefaultArmies()
    })

    return {
      // 数据
      selectedRule,
      battleResults,
      attackerArmy,
      defenderArmy,
      battleRules,
      showRuleDetails,
      
      // 计算属性
      canSimulate,
      currentRuleDetails,
      
      // 方法
      simulateBattle,
      batchSimulate,
      clearResults,
      removeResult,
      toggleRuleDetails
    }
  }
}
</script>

<style scoped>
/* 自定义样式 */
.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>