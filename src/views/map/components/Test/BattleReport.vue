<template>

  <div class="battle-report bg-gray-50 min-h-screen p-4">
    <!-- 战报标题 -->
    <div class="text-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        {{ battleReportData?.attacker?.nickname || '未知玩家' }} 攻击 {{ battleReportData?.defender?.nickname || '未知防守者' }}
      </h1>
      <div class="flex items-center justify-center gap-4 mb-2">
        <span class="text-lg font-medium text-gray-600">
          规则: {{ getRuleName(battleReportData?.ruleId) }}
        </span>
        <span class="text-lg font-medium" :class="getResultColor(battleReportData?.battleResult)">
          {{ getResultText(battleReportData?.battleResult) }}
        </span>
      </div>
      <!-- 战斗时间 -->
      <div class="text-sm text-gray-500">
        <span>战斗时间: {{ formatBattleTime(battleReportData?.details?.battleTime) }}</span>
      </div>
    </div>

    <!-- 主要战斗区域 -->
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col gap-6">

        <!-- 进攻方 -->
        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <div class="text-center mb-4">
            
            <div class="bg-red-50 rounded-lg p-3 border-l-4 border-red-500 shadow-sm">
              <div class="flex items-center justify-center gap-3">
                <h2 class="text-xl font-bold text-red-600 mb-2">进攻方</h2>
                <span class="font-semibold text-gray-800 text-lg">{{ battleReportData?.attacker?.nickname || '未知玩家' }}</span>
                <span class="text-sm text-gray-600 bg-white px-2 py-1 rounded-full border">{{ getFactionName(battleReportData?.attacker?.faction) }}</span>
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ battleReportData?.attacker?.uuid || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- 进攻方兵种信息 -->
          <div class="mb-4">
            <h3 class="font-semibold text-gray-700 mb-2">部队详情</h3>
            <div v-if="getAttackerUnitTypes().length > 0" class="bg-gray-50 rounded-lg p-3">
              <!-- 表格 -->
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <!-- 表头 -->
                  <thead>
                    <tr class="border-b border-gray-300">
                      <th class="text-left py-2 px-3 font-semibold text-gray-700">军队</th>
                      <th v-for="unitType in getAttackerUnitTypes()" :key="unitType" 
                          class="text-center py-2 px-3 font-semibold text-gray-700">
                        {{ unitType }}
                      </th>
                    </tr>
                  </thead>
                  <!-- 表体 -->
                  <tbody>
                    <!-- 出征部队行 -->
                    <tr class="border-b border-gray-200">
                      <td class="py-2 px-3 font-medium text-blue-600">出征</td>
                      <td v-for="unitType in getAttackerUnitTypes()" :key="'original-' + unitType" 
                          class="text-center py-2 px-3 text-blue-600 font-medium">
                        {{ getAttackerOriginalCount(unitType) }}
                      </td>
                    </tr>
                    <!-- 阵亡部队行 -->
                    <tr>
                      <td class="py-2 px-3 font-medium text-red-600">阵亡</td>
                      <td v-for="unitType in getAttackerUnitTypes()" :key="'loss-' + unitType" 
                          class="text-center py-2 px-3 text-red-600 font-medium">
                        {{ getAttackerLossCount(unitType) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- 总损失率 -->
              <div class="mt-3 text-center">
                <span class="text-sm text-red-600 font-medium">
                  总损失率: {{ ((battleReportData?.attacker?.lossRatio || 0) * 100).toFixed(1) }}%
                </span>
              </div>
            </div>
            <div v-else class="text-gray-500 text-sm">暂无兵种数据</div>
          </div>

          <!-- 进攻方掠夺收获 -->
          <div>
            <h3 class="font-semibold text-gray-700 mb-2">掠夺收获</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="bg-green-50 rounded p-2">
                <span class="text-green-600">木材: {{ battleReportData?.details?.plundered?.wood || 0 }}</span>
              </div>
              <div class="bg-green-50 rounded p-2">
                <span class="text-green-600">土壤: {{ battleReportData?.details?.plundered?.soil || 0 }}</span>
              </div>
              <div class="bg-green-50 rounded p-2">
                <span class="text-green-600">铁矿: {{ battleReportData?.details?.plundered?.iron || 0 }}</span>
              </div>
              <div class="bg-green-50 rounded p-2">
                <span class="text-green-600">粮食: {{ battleReportData?.details?.plundered?.food || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- VS 中间区域 -->
        <div class="flex items-center justify-center py-6">
          <div class="bg-white rounded-lg shadow-lg p-4 flex items-center gap-6 min-w-full">
            <!-- VS 标识 -->
            <div class="bg-gradient-to-r from-red-500 to-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold shadow-lg flex-shrink-0">
              VS
            </div>
            
            <!-- 战斗详情 - 一行显示 -->
            <div class="flex-1">
              <h3 class="font-semibold text-gray-700 mb-3 text-center">战斗详情</h3>
              <div class="flex items-center justify-between gap-6 text-sm flex-wrap">
                <div class="flex items-center gap-2">
                  <span>总攻击力:</span>
                  <span class="text-red-600 font-medium">{{ battleReportData?.details?.totalAttack || 0 }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span>总防御力:</span>
                  <span class="text-blue-600 font-medium">{{ battleReportData?.details?.totalDefense || 0 }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span>实力比值:</span>
                  <span class="font-medium">{{ (battleReportData?.details?.powerRatio || 0).toFixed(2) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span>行军时间:</span>
                  <span>{{ battleReportData?.details?.marchTime || 0 }} 分钟</span>
                </div>
                <div v-if="battleReportData?.details?.carryCapacity" class="flex items-center gap-2">
                  <span>运载能力:</span>
                  <span>{{ battleReportData.details.carryCapacity }}</span>
                </div>
                <div v-if="battleReportData?.details?.powerComparison" class="flex items-center gap-2">
                  <span>实力对比:</span>
                  <span>{{ battleReportData.details.powerComparison.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 错误信息 -->
          <div v-if="battleReportData?.details?.error"
            class="bg-red-50 border border-red-200 rounded-lg p-4 ml-8">
            <h3 class="font-semibold text-red-700 mb-2 text-center">错误信息</h3>
            <p class="text-red-600 text-sm text-center">{{ battleReportData.details.error }}</p>
          </div>
        </div>

        <!-- 防守方 -->
        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div class="text-center mb-4">
            <h2 class="text-xl font-bold text-blue-600 mb-2">防守方</h2>
            <div class="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500 shadow-sm">
              <div class="flex items-center justify-center gap-3">
                <span class="font-semibold text-gray-800 text-lg">{{ battleReportData?.defender?.nickname || '未知防守者' }}</span>
                <span class="text-sm text-gray-600 bg-white px-2 py-1 rounded-full border">{{ getFactionName(battleReportData?.defender?.faction) }}</span>
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ battleReportData?.defender?.uuid || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- 防守方兵种信息 -->
          <div class="mb-4">
            <h3 class="font-semibold text-gray-700 mb-2">部队详情</h3>
            <div v-if="getDefenderUnitTypes().length > 0" class="bg-gray-50 rounded-lg p-3">
              <!-- 表格 -->
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <!-- 表头 -->
                  <thead>
                    <tr class="border-b border-gray-300">
                      <th class="text-left py-2 px-3 font-semibold text-gray-700">军队</th>
                      <th v-for="unitType in getDefenderUnitTypes()" :key="unitType" 
                          class="text-center py-2 px-3 font-semibold text-gray-700">
                        {{ unitType }}
                      </th>
                    </tr>
                  </thead>
                  <!-- 表体 -->
                  <tbody>
                    <!-- 出征部队行 -->
                    <tr class="border-b border-gray-200">
                      <td class="py-2 px-3 font-medium text-blue-600">出征</td>
                      <td v-for="unitType in getDefenderUnitTypes()" :key="'original-' + unitType" 
                          class="text-center py-2 px-3 text-blue-600 font-medium">
                        {{ getDefenderOriginalCount(unitType) }}
                      </td>
                    </tr>
                    <!-- 阵亡部队行 -->
                    <tr>
                      <td class="py-2 px-3 font-medium text-red-600">阵亡</td>
                      <td v-for="unitType in getDefenderUnitTypes()" :key="'loss-' + unitType" 
                          class="text-center py-2 px-3 text-red-600 font-medium">
                        {{ getDefenderLossCount(unitType) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- 总损失率 -->
              <div class="mt-3 text-center">
                <span class="text-sm text-red-600 font-medium">
                  总损失率: {{ ((battleReportData?.defender?.lossRatio || 0) * 100).toFixed(1) }}%
                </span>
              </div>
            </div>
            <div v-else class="text-gray-500 text-sm">暂无兵种数据</div>
          </div>

          <!-- 防守方原始资源 -->
          <div class="mb-4">
            <h3 class="font-semibold text-gray-700 mb-2">原始资源</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="bg-blue-50 rounded p-2">
                <span class="text-blue-600">木材: {{ battleReportData?.defender?.originalResources?.wood || 0 }}</span>
              </div>
              <div class="bg-blue-50 rounded p-2">
                <span class="text-blue-600">土壤: {{ battleReportData?.defender?.originalResources?.soil || 0 }}</span>
              </div>
              <div class="bg-blue-50 rounded p-2">
                <span class="text-blue-600">铁矿: {{ battleReportData?.defender?.originalResources?.iron || 0 }}</span>
              </div>
              <div class="bg-blue-50 rounded p-2">
                <span class="text-blue-600">粮食: {{ battleReportData?.defender?.originalResources?.food || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- 防守方剩余资源 -->
          <div>
            <h3 class="font-semibold text-gray-700 mb-2">剩余资源</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="bg-green-50 rounded p-2">
                <span class="text-green-600">木材: {{ battleReportData?.defender?.remainingResources?.wood || 0 }}</span>
              </div>
              <div class="bg-green-50 rounded p-2">
                <span class="text-green-600">土壤: {{ battleReportData?.defender?.remainingResources?.soil || 0 }}</span>
              </div>
              <div class="bg-green-50 rounded p-2">
                <span class="text-green-600">铁矿: {{ battleReportData?.defender?.remainingResources?.iron || 0 }}</span>
              </div>
              <div class="bg-green-50 rounded p-2">
                <span class="text-green-600">粮食: {{ battleReportData?.defender?.remainingResources?.food || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="text-center mt-8">
      <button @click="$emit('close')"
        class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
        关闭战报
      </button>
    </div>
  </div>
</template>

<script>
import { getFactionUnits } from '@/config/factionConfig.js'

export default {
  name: 'BattleReport',
  props: {
    // === 战报数据对象 ===
    battleReportData: {
      type: Object,
      default: () => ({
        ruleId: 'PLUNDER',
        battleResult: 'ATTACKER_VICTORY',
        attacker: {
          uuid: 'placeholder-uuid',
          nickname: '占位符玩家',
          faction: 'unknown',
          originalUnits: [],
          losses: [],
          carryResources: { wood: 0, soil: 0, iron: 0, food: 0 },
          lossRatio: 0
        },
        defender: {
          uuid: 'placeholder-uuid',
          nickname: '占位符防守者',
          faction: 'unknown',
          originalUnits: [],
          losses: [],
          remainingResources: { wood: 0, soil: 0, iron: 0, food: 0 },
          lossRatio: 0
        },
        details: {
          totalAttack: 0,
          totalDefense: 0,
          powerRatio: 0,
          marchTime: 0,
          plundered: null,
          carryCapacity: 0,
          powerComparison: 0,
          attackerLosses: [],
          defenderLosses: [],
          error: null
        }
      })
    }
  },
  emits: ['close'],
  methods: {
    // === 获取规则名称 ===
    getRuleName(ruleId) {
      const rules = {
        'PLUNDER': '掠夺规则',
        'COMPREHENSIVE': '综合实力规则'
      }
      return rules[ruleId] || '未知规则'
    },

    // === 获取战斗结果文本 ===
    getResultText(result) {
      const results = {
        'ATTACKER_VICTORY': '进攻方胜利',
        'DEFENDER_VICTORY': '防守方胜利',
        'DRAW': '平局'
      }
      return results[result] || '未知结果'
    },

    // === 获取战斗结果颜色样式 ===
    getResultColor(result) {
      const colors = {
        'ATTACKER_VICTORY': 'text-red-600',
        'DEFENDER_VICTORY': 'text-blue-600',
        'DRAW': 'text-yellow-600'
      }
      return colors[result] || 'text-gray-600'
    },

    // === 获取阵营所有兵种类型 ===
    getFactionAllUnits(faction) {
      // 从配置文件动态获取该阵营的所有兵种
      const units = getFactionUnits(faction);
      return units.map(unit => unit.name);
    },

    // === 获取阵营名称 ===
    getFactionName(faction) {
      const factions = {
        'unknown': '未知阵营',
        'wei': '魏国',
        'shu': '蜀国',
        'wu': '吴国'
      }
      return factions[faction] || '未知阵营'
    },

    // === 格式化战斗时间 ===
    formatBattleTime(timeString) {
      if (!timeString) return '未知时间';
      try {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return '无效时间';
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (error) {
        return '时间格式错误';
      }
    },

    // === 获取进攻方所有兵种类型 ===
    getAttackerUnitTypes() {
      // 获取该阵营的所有兵种类型
      const factionUnits = this.getFactionAllUnits(this.battleReportData?.attacker?.faction);
      return factionUnits;
    },

    // === 获取进攻方指定兵种的原始数量 ===
    getAttackerOriginalCount(unitType) {
      const unit = this.battleReportData?.attacker?.originalUnits?.find(u => u.name === unitType);
      return unit ? unit.count || 0 : 0;
    },

    // === 获取进攻方指定兵种的损失数量 ===
    getAttackerLossCount(unitType) {
      const loss = this.battleReportData?.attacker?.losses?.find(l => l.name === unitType);
      return loss ? loss.count || 0 : 0;
    },

    // === 获取防守方所有兵种类型 ===
    getDefenderUnitTypes() {
      // 获取该阵营的所有兵种类型
      const factionUnits = this.getFactionAllUnits(this.battleReportData?.defender?.faction);
      return factionUnits;
    },

    // === 获取防守方指定兵种的原始数量 ===
    getDefenderOriginalCount(unitType) {
      const unit = this.battleReportData?.defender?.originalUnits?.find(u => u.name === unitType);
      return unit ? unit.count || 0 : 0;
    },

    // === 获取防守方指定兵种的损失数量 ===
    getDefenderLossCount(unitType) {
      const loss = this.battleReportData?.defender?.losses?.find(l => l.name === unitType);
      return loss ? loss.count || 0 : 0;
    }
  }
}
</script>

<style scoped>
/* 自定义样式 */
.battle-report {
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 动画效果 */
.bg-white {
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
</style>