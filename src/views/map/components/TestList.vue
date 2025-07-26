<template>
  <div class="test-list">
    <!-- 测试页面按钮区域 -->
    <div class="button-container">
      <button class="test-button" @click="handlePlayerArmyInfo">
        玩家军队信息
      </button>
      
      <button class="test-button" @click="handleNpcArmyInfo">
        NPC军队信息
      </button>
      
      <button class="test-button" @click="handleBattleRuleSelect">
        战斗规则选择
      </button>
    </div>
    
    <!-- 数据显示区域 -->
    <div v-if="showData" class="data-display">
      <div class="data-header">
        <h3 class="data-title">{{ dataTitle }}</h3>
        <button class="close-button" @click="closeData">×</button>
      </div>
      <pre class="json-display">{{ formattedData }}</pre>
    </div>
  </div>
</template>

<script>
import { useGameStore } from '@/store/modules/gameStore.js'
import { getUnitById, getFactionConfig } from '@/config/factionConfig.js'

export default {
  name: 'TestList',
  data() {
    return {
      //=== showData 是否显示数据
      showData: false,
      //=== dataTitle 数据标题
      dataTitle: '',
      //=== currentData 当前显示的数据
      currentData: null
    }
  },
  computed: {
    //=== gameStore 游戏状态管理
    gameStore() {
      return useGameStore()
    },
    
    //=== playerArmyData 根据战斗功能说明文档格式化的玩家军队数据
    playerArmyData() {
      const store = this.gameStore
      
      // 构建兵种实例数组
      const units = []
      Object.keys(store.army).forEach(unitId => {
        const count = store.army[unitId]
        if (count > 0) {
          const unitConfig = getUnitById(unitId)
          if (unitConfig) {
            units.push({
              id: unitId,
              name: unitConfig.name,
              unitType: unitConfig.unitType,
              attack: unitConfig.attack,
              infantryDefense: unitConfig.infantryDefense,
              cavalryDefense: unitConfig.cavalryDefense,
              speed: unitConfig.speed,
              carryCapacity: unitConfig.carryCapacity,
              count: count,
              faction: store.userFaction,
              icon: unitConfig.icon || '⚔️',
              description: unitConfig.description || '',
              cost: unitConfig.cost,
              totalCost: unitConfig.totalCost,
              trainTime: unitConfig.trainTime
            })
          }
        }
      })
      
      // 获取阵营配置
      const factionConfig = getFactionConfig(store.userFaction)
      
      // 按照战斗功能说明文档的ArmyGroup格式构建数据
      return {
        // 玩家基础信息
        playerInfo: {
          userUUID: store.userUUID,
          nickname: store.userNickname || '未设置昵称',
          faction: store.userFaction,
          factionName: factionConfig?.name || '未知阵营'
        },
        
        // 军团组合（ArmyGroup）
        armyGroup: {
          faction: store.userFaction,
          units: units
        },
        
        // 军队统计信息
        armyStatistics: {
          totalUnits: store.totalArmyCount,
          totalAttack: this.calculateTotalAttack(units),
          totalInfantryDefense: this.calculateTotalInfantryDefense(units),
          totalCavalryDefense: this.calculateTotalCavalryDefense(units),
          totalCarryCapacity: this.calculateTotalCarryCapacity(units),
          slowestSpeed: this.getSlowestSpeed(units)
        }
      }
    },
    
    //=== formattedData 格式化的JSON数据
    formattedData() {
      return this.currentData ? JSON.stringify(this.currentData, null, 2) : ''
    }
  },
  methods: {
    //=== calculateTotalAttack 计算总攻击力
    calculateTotalAttack(units) {
      return units.reduce((total, unit) => total + (unit.attack * unit.count), 0)
    },
    
    //=== calculateTotalInfantryDefense 计算总步兵防御力
    calculateTotalInfantryDefense(units) {
      return units.reduce((total, unit) => total + (unit.infantryDefense * unit.count), 0)
    },
    
    //=== calculateTotalCavalryDefense 计算总骑兵防御力
    calculateTotalCavalryDefense(units) {
      return units.reduce((total, unit) => total + (unit.cavalryDefense * unit.count), 0)
    },
    
    //=== calculateTotalCarryCapacity 计算总运载能力
    calculateTotalCarryCapacity(units) {
      return units.reduce((total, unit) => total + (unit.carryCapacity * unit.count), 0)
    },
    
    //=== getSlowestSpeed 获取最慢速度
    getSlowestSpeed(units) {
      if (units.length === 0) return 0
      return Math.min(...units.map(unit => unit.speed))
    },
    
    //=== handlePlayerArmyInfo 处理玩家军队信息按钮点击
    handlePlayerArmyInfo() {
      // 如果军队数据为空，添加一些测试数据
      if (Object.keys(this.gameStore.army).length === 0) {
        console.log('军队数据为空，添加测试数据...')
        // 设置用户阵营为魏国（如果还没设置）
        if (!this.gameStore.userFaction) {
          this.gameStore.userFaction = 'wei'
        }
        // 添加一些测试军队数据
        this.gameStore.army = {
          'wei_qingzhou': 10,     // 青州军
          'wei_guard': 5,         // 禁卫甲士
          'wei_tiger': 3,         // 虎卫
          'wei_scout': 8,         // 战鹰探马
          'wei_cavalry': 4,       // 骑骑营
          'wei_elite_cavalry': 2, // 虎豹骑
          'wei_ram': 1,           // 冲撞车
          'wei_catapult': 1       // 露雷车
        }
        console.log('已添加测试军队数据:', this.gameStore.army)
      }
      
      this.dataTitle = '玩家军队信息（战斗功能文档格式）'
      this.currentData = this.playerArmyData
      this.showData = true
      console.log('显示玩家军队信息（真实数据）:', this.playerArmyData)
    },
    
    //=== handleNpcArmyInfo 处理NPC军队信息按钮点击
    async handleNpcArmyInfo() {
      // 生成示例NPC军队数据，参考NpcList.vue的数据结构
      const npcArmyData = await this.generateSampleNpcData()
      
      this.dataTitle = 'NPC军队信息（示例数据）'
      this.currentData = npcArmyData
      this.showData = true
      console.log('显示NPC军队信息:', npcArmyData)
    },
    
    //=== generateSampleNpcData 生成示例NPC数据
    async generateSampleNpcData() {
      // 随机选择一个阵营
      const factions = ['wei', 'shu', 'wu']
      const faction = factions[Math.floor(Math.random() * factions.length)]
      const level = Math.floor(Math.random() * 20) + 1
      
      // 生成NPC基础信息
      const npcInfo = {
        id: `npc_sample_${Date.now()}`,
        name: `示例城池${Math.floor(Math.random() * 999) + 1}`,
        faction: faction,
        level: level
      }
      
      // 生成防守军队
      const defenseArmy = await this.generateSampleNpcArmy(faction, level)
      
      // 生成资源信息
      const baseResource = level * 2000 + 10000
      const resources = {
        wood: Math.floor(baseResource + Math.random() * baseResource * 0.5),
        soil: Math.floor(baseResource + Math.random() * baseResource * 0.5),
        iron: Math.floor(baseResource + Math.random() * baseResource * 0.5),
        food: Math.floor(baseResource + Math.random() * baseResource * 0.5)
      }
      
      // 计算军队统计信息
      const armyStatistics = {
        totalUnits: defenseArmy.units.reduce((total, unit) => total + unit.count, 0),
        totalAttack: defenseArmy.units.reduce((total, unit) => total + (unit.attack * unit.count), 0),
        totalInfantryDefense: defenseArmy.units.reduce((total, unit) => total + (unit.infantryDefense * unit.count), 0),
        totalCavalryDefense: defenseArmy.units.reduce((total, unit) => total + (unit.cavalryDefense * unit.count), 0),
        totalCarryCapacity: defenseArmy.units.reduce((total, unit) => total + (unit.carryCapacity * unit.count), 0),
        slowestSpeed: defenseArmy.units.length > 0 ? Math.min(...defenseArmy.units.map(unit => unit.speed)) : 0
      }
      
      return {
        // NPC基础信息
        npcInfo: npcInfo,
        
        // 防守军队信息
        defenseArmy: defenseArmy,
        
        // 资源信息
        resources: resources,
        
        // 军队统计信息
        armyStatistics: armyStatistics
      }
    },
    
    //=== generateSampleNpcArmy 生成示例NPC军队
    async generateSampleNpcArmy(faction, level) {
      // 根据阵营获取可用兵种
      const { getFactionUnits, UNIT_TYPES } = await import('@/config/factionConfig.js')
      const factionUnits = getFactionUnits(faction)
      
      if (!factionUnits.length) return { faction, units: [] }
      
      // 根据等级确定军队规模
      const armyScale = Math.max(1, Math.floor(level / 3))
      const maxUnits = Math.min(4, 1 + armyScale)
      
      // 按兵种类型分组
      const infantryUnits = factionUnits.filter(unit => unit.unitType === UNIT_TYPES.INFANTRY)
      const cavalryUnits = factionUnits.filter(unit => unit.unitType === UNIT_TYPES.CAVALRY)
      const siegeUnits = factionUnits.filter(unit => unit.unitType === UNIT_TYPES.SIEGE)
      const specialUnits = factionUnits.filter(unit => unit.unitType === UNIT_TYPES.SPECIAL)
      
      const selectedUnits = []
      
      // 确保至少有一个步兵单位（基础防守）
      if (infantryUnits.length > 0) {
        const randomInfantry = infantryUnits[Math.floor(Math.random() * infantryUnits.length)]
        const count = Math.floor((level * 10 + Math.random() * level * 5))
        selectedUnits.push({
          ...randomInfantry,
          count
        })
      }
      
      // 根据等级添加其他兵种
      if (level >= 5 && cavalryUnits.length > 0 && selectedUnits.length < maxUnits) {
        const randomCavalry = cavalryUnits[Math.floor(Math.random() * cavalryUnits.length)]
        const count = Math.floor((level * 5 + Math.random() * level * 3))
        selectedUnits.push({
          ...randomCavalry,
          count
        })
      }
      
      // 高等级添加攻城武器
      if (level >= 10 && siegeUnits.length > 0 && selectedUnits.length < maxUnits) {
        const randomSiege = siegeUnits[Math.floor(Math.random() * siegeUnits.length)]
        const count = Math.floor((level * 2 + Math.random() * level))
        selectedUnits.push({
          ...randomSiege,
          count
        })
      }
      
      // 极高等级添加特殊兵种
      if (level >= 15 && specialUnits.length > 0 && selectedUnits.length < maxUnits) {
        const randomSpecial = specialUnits[Math.floor(Math.random() * specialUnits.length)]
        const count = Math.floor((level + Math.random() * level * 0.5))
        selectedUnits.push({
          ...randomSpecial,
          count
        })
      }
      
      return {
        faction,
        units: selectedUnits
      }
    },
    
    //=== handleBattleRuleSelect 处理战斗规则选择按钮点击
    handleBattleRuleSelect() {
      console.log('点击了战斗规则选择按钮')
    },
    
    //=== closeData 关闭数据显示
    closeData() {
      this.showData = false
      this.currentData = null
      this.dataTitle = ''
    }
  }
}
</script>

<style scoped>
.test-list {
  @apply w-full;
}

.button-container {
  @apply flex flex-row gap-4 p-6;
  @apply bg-gray-800 bg-opacity-50 rounded-lg;
  @apply border border-gray-600 border-opacity-30;
  backdrop-filter: blur(10px);
  max-width: 800px;
}

.test-button {
  @apply px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg;
  @apply transition-all duration-200 transform hover:scale-105;
  @apply border border-green-500 hover:border-green-400;
  @apply shadow-lg hover:shadow-xl;
  background: linear-gradient(135deg, #237C48 0%, #2d8f5a 100%);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(35, 124, 72, 0.3);
}

.test-button:hover {
  background: linear-gradient(135deg, #2d8f5a 0%, #237C48 100%);
  box-shadow: 0 6px 20px rgba(35, 124, 72, 0.4);
}

.test-button:active {
  @apply transform scale-95;
  box-shadow: 0 2px 10px rgba(35, 124, 72, 0.3);
}

.data-display {
  @apply mt-6 bg-gray-900 bg-opacity-70 rounded-lg border border-gray-600 border-opacity-40;
  backdrop-filter: blur(15px);
  max-height: 600px;
  overflow: hidden;
}

.data-header {
  @apply flex justify-between items-center p-4 border-b border-gray-600 border-opacity-30;
}

.data-title {
  @apply text-lg font-bold text-white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.close-button {
  @apply w-8 h-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full;
  @apply transition-all duration-200 transform hover:scale-110;
  @apply flex items-center justify-center;
  font-size: 18px;
  line-height: 1;
}

.json-display {
  @apply p-4 text-sm text-green-300 font-mono;
  @apply overflow-auto;
  max-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>