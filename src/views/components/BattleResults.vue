<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4">战斗结果</h2>
    
    <!-- 无结果状态 -->
    <div v-if="results.length === 0" class="text-center py-8 text-gray-500">
      <div class="text-4xl mb-2">⚔️</div>
      <p>暂无战斗结果，请配置军队并开始战斗</p>
    </div>

    <!-- 结果列表 -->
    <div v-else class="space-y-4">
      <div 
        v-for="(result, index) in results" 
        :key="index"
        class="border rounded-lg p-4"
        :class="getResultBorderClass(result.result)"
      >
        <!-- 战斗头部信息 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ getResultIcon(result.result) }}</span>
            <div>
              <h3 class="font-semibold text-lg">
                第 {{ index + 1 }} 场战斗 - {{ getResultText(result.result) }}
              </h3>
              <p class="text-sm text-gray-600">
                规则: {{ getBattleRuleText(result.ruleId) }} | 
                时间: {{ formatBattleTime(result.details.battleTime) }}
              </p>
            </div>
          </div>
          <button 
            @click="removeResult(index)"
            class="px-2 py-1 text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            ❌
          </button>
        </div>

        <!-- 损耗比例 -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-red-50 rounded-md p-3">
            <h4 class="font-medium text-red-700 mb-2">🗡️ 攻击方损耗</h4>
            <div class="text-2xl font-bold text-red-600">
              {{ (result.attackerLossRatio * 100).toFixed(1) }}%
            </div>
            <div class="text-sm text-gray-600 mt-1">
              损失: {{ result.attackerLosses?.total || 0 }} 人
            </div>
          </div>
          <div class="bg-blue-50 rounded-md p-3">
            <h4 class="font-medium text-blue-700 mb-2">🛡️ 防守方损耗</h4>
            <div class="text-2xl font-bold text-blue-600">
              {{ (result.defenderLossRatio * 100).toFixed(1) }}%
            </div>
            <div class="text-sm text-gray-600 mt-1">
              损失: {{ result.defenderLosses?.total || 0 }} 人
            </div>
          </div>
        </div>

        <!-- 详细损失信息 -->
        <div v-if="result.attackerLosses?.units || result.defenderLosses?.units" class="mb-4">
          <h4 class="font-medium mb-2">详细损失</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 攻击方损失 -->
            <div v-if="result.attackerLosses?.units" class="bg-gray-50 rounded-md p-3">
              <h5 class="font-medium text-red-700 mb-2">攻击方损失</h5>
              <div class="space-y-1 text-sm">
                <div 
                  v-for="(loss, unitId) in result.attackerLosses.units" 
                  :key="unitId"
                  class="flex justify-between"
                >
                  <span>{{ getUnitName(unitId) }}:</span>
                  <span class="font-medium">{{ loss }}</span>
                </div>
              </div>
            </div>
            
            <!-- 防守方损失 -->
            <div v-if="result.defenderLosses?.units" class="bg-gray-50 rounded-md p-3">
              <h5 class="font-medium text-blue-700 mb-2">防守方损失</h5>
              <div class="space-y-1 text-sm">
                <div 
                  v-for="(loss, unitId) in result.defenderLosses.units" 
                  :key="unitId"
                  class="flex justify-between"
                >
                  <span>{{ getUnitName(unitId) }}:</span>
                  <span class="font-medium">{{ loss }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 战斗统计 -->
        <div v-if="result.details" class="bg-gray-50 rounded-md p-3">
          <h4 class="font-medium mb-2">战斗统计</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div v-if="result.details.attackerPowerRatio !== undefined">
              <span class="text-gray-600">攻击方实力比:</span>
              <span class="font-medium ml-1">{{ (result.details.attackerPowerRatio * 100).toFixed(1) }}%</span>
            </div>
            <div v-if="result.details.defenderPowerRatio !== undefined">
              <span class="text-gray-600">防守方实力比:</span>
              <span class="font-medium ml-1">{{ (result.details.defenderPowerRatio * 100).toFixed(1) }}%</span>
            </div>
            <div v-if="result.details.battleEfficiency !== undefined">
              <span class="text-gray-600">战斗效率:</span>
              <span class="font-medium ml-1">{{ (result.details.battleEfficiency * 100).toFixed(1) }}%</span>
            </div>
            <div v-if="result.details.fightToDeathBonus">
              <span class="text-red-600">不死不休:</span>
              <span class="font-medium ml-1 text-red-600">✓</span>
            </div>
          </div>
          
          <!-- 杀敌战斗特殊统计 -->
          <div v-if="result.details.totalKills || result.details.totalLosses" class="mt-3 pt-3 border-t">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div v-if="result.details.totalKills">
                <span class="text-gray-600">总杀敌:</span>
                <span class="font-medium ml-1 text-green-600">{{ result.details.totalKills }}</span>
              </div>
              <div v-if="result.details.totalLosses">
                <span class="text-gray-600">总损失:</span>
                <span class="font-medium ml-1 text-red-600">{{ result.details.totalLosses }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 奖励信息 -->
        <div v-if="result.rewards" class="mt-4 bg-yellow-50 rounded-md p-3">
          <h4 class="font-medium text-yellow-700 mb-2">🏆 战斗奖励</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div v-if="result.rewards.experience">
              <span class="text-gray-600">经验:</span>
              <span class="font-medium ml-1 text-blue-600">+{{ result.rewards.experience }}</span>
            </div>
            <div v-if="result.rewards.honor">
              <span class="text-gray-600">荣誉:</span>
              <span class="font-medium ml-1 text-purple-600">+{{ result.rewards.honor }}</span>
            </div>
            <div v-if="result.rewards.resources">
              <span class="text-gray-600">资源:</span>
              <span class="font-medium ml-1 text-green-600">+{{ result.rewards.resources }}</span>
            </div>
            <div v-if="result.rewards.multiplier && result.rewards.multiplier > 1">
              <span class="text-gray-600">奖励倍数:</span>
              <span class="font-medium ml-1 text-orange-600">×{{ result.rewards.multiplier }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量结果统计 -->
    <div v-if="results.length > 1" class="mt-6 bg-gray-50 rounded-lg p-4">
      <h3 class="font-semibold mb-3">批量战斗统计</h3>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="bg-green-100 rounded-md p-3">
          <div class="text-2xl font-bold text-green-600">{{ winCount }}</div>
          <div class="text-sm text-gray-600">胜利</div>
        </div>
        <div class="bg-red-100 rounded-md p-3">
          <div class="text-2xl font-bold text-red-600">{{ loseCount }}</div>
          <div class="text-sm text-gray-600">失败</div>
        </div>
        <div class="bg-gray-100 rounded-md p-3">
          <div class="text-2xl font-bold text-gray-600">{{ drawCount }}</div>
          <div class="text-sm text-gray-600">平局</div>
        </div>
      </div>
      <div class="mt-3 text-center text-sm text-gray-600">
        胜率: {{ winRate }}% | 平均攻击方损耗: {{ avgAttackerLoss }}% | 平均防守方损耗: {{ avgDefenderLoss }}%
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { BATTLE_RULE_IDS, BATTLE_RESULTS } from '@/config/battleRulesConfig.js'
import { getAllUnits } from '@/config/factionConfig.js'

export default {
  name: 'BattleResults',
  props: {
    results: {
      type: Array,
      default: () => []
    }
  },
  emits: ['remove-result'],
  setup(props, { emit }) {
    //=== 获取所有兵种数据
    const allUnits = getAllUnits()
    const unitMap = allUnits.reduce((map, unit) => {
      map[unit.id] = unit
      return map
    }, {})

    //=== 计算属性
    const winCount = computed(() => {
      return props.results.filter(r => r.result === BATTLE_RESULTS.ATTACKER_WIN).length
    })

    const loseCount = computed(() => {
      return props.results.filter(r => r.result === BATTLE_RESULTS.DEFENDER_WIN).length
    })

    const drawCount = computed(() => {
      return props.results.filter(r => r.result === BATTLE_RESULTS.DRAW).length
    })

    const winRate = computed(() => {
      if (props.results.length === 0) return 0
      return ((winCount.value / props.results.length) * 100).toFixed(1)
    })

    const avgAttackerLoss = computed(() => {
      if (props.results.length === 0) return 0
      const total = props.results.reduce((sum, r) => sum + r.attackerLossRatio, 0)
      return ((total / props.results.length) * 100).toFixed(1)
    })

    const avgDefenderLoss = computed(() => {
      if (props.results.length === 0) return 0
      const total = props.results.reduce((sum, r) => sum + r.defenderLossRatio, 0)
      return ((total / props.results.length) * 100).toFixed(1)
    })

    //=== 方法
    const getResultIcon = (result) => {
      const iconMap = {
        [BATTLE_RESULTS.ATTACKER_WIN]: '🏆',
        [BATTLE_RESULTS.DEFENDER_WIN]: '🛡️',
        [BATTLE_RESULTS.DRAW]: '🤝'
      }
      return iconMap[result] || '❓'
    }

    const getResultText = (result) => {
      const textMap = {
        [BATTLE_RESULTS.ATTACKER_WIN]: '攻击方胜利',
        [BATTLE_RESULTS.DEFENDER_WIN]: '防守方胜利',
        [BATTLE_RESULTS.DRAW]: '平局'
      }
      return textMap[result] || '未知结果'
    }

    const getResultBorderClass = (result) => {
      const classMap = {
        [BATTLE_RESULTS.ATTACKER_WIN]: 'border-green-300 bg-green-50',
        [BATTLE_RESULTS.DEFENDER_WIN]: 'border-red-300 bg-red-50',
        [BATTLE_RESULTS.DRAW]: 'border-gray-300 bg-gray-50'
      }
      return classMap[result] || 'border-gray-300'
    }

    const getBattleRuleText = (ruleId) => {
      const ruleMap = {
        [BATTLE_RULE_IDS.PLUNDER]: '掠夺战斗',
        [BATTLE_RULE_IDS.COMPREHENSIVE]: '综合实力',
        [BATTLE_RULE_IDS.KILL_ENEMY]: '杀敌战斗'
      }
      return ruleMap[ruleId] || '未知规则'
    }

    const getUnitName = (unitId) => {
      return unitMap[unitId]?.name || unitId
    }

    const formatBattleTime = (battleTime) => {
      if (!battleTime) return '未知'
      return `${battleTime}秒`
    }

    const removeResult = (index) => {
      emit('remove-result', index)
    }

    return {
      // 计算属性
      winCount,
      loseCount,
      drawCount,
      winRate,
      avgAttackerLoss,
      avgDefenderLoss,
      
      // 方法
      getResultIcon,
      getResultText,
      getResultBorderClass,
      getBattleRuleText,
      getUnitName,
      formatBattleTime,
      removeResult
    }
  }
}
</script>