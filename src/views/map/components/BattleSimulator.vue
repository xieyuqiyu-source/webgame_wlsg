<template>
  <div class="battle-simulator">
    <!-- 标题区域 -->
    <div class="simulator-header">
      <h2 class="title">⚔️ 战斗模拟器</h2>
      <p class="subtitle">自定义军队配置，模拟战斗结果</p>
    </div>

    <!-- 军队配置区域 -->
    <div class="army-config-container">
      <!-- 攻击方配置 -->
      <div class="army-config attacker">
        <h3 class="army-title">🗡️ 攻击方</h3>
        
        <!-- 阵营选择 -->
        <div class="faction-selector">
          <label class="config-label">选择阵营：</label>
          <select v-model="attackerFaction" class="faction-select">
            <option v-for="faction in availableFactions" :key="faction.id" :value="faction.id">
              {{ faction.icon }} {{ faction.name }}
            </option>
          </select>
        </div>

        <!-- 兵种配置 -->
        <div class="units-config">
          <h4 class="units-title">兵种配置</h4>
          <div class="unit-categories">
            <div v-for="category in unitCategories" :key="category.type" class="category-section">
              <h5 class="category-title">{{ category.icon }} {{ category.name }}</h5>
              <div class="units-list">
                <div v-for="unit in getUnitsByCategory(attackerFaction, category.type)" :key="unit.id" class="unit-item">
                  <div class="unit-info">
                    <span class="unit-icon">{{ unit.icon }}</span>
                    <span class="unit-name">{{ unit.name }}</span>
                    <span class="unit-stats">攻击:{{ unit.attack }} 步防:{{ unit.infantryDefense }} 骑防:{{ unit.cavalryDefense }} 速度:{{ unit.speed }}</span>
                  </div>
                  <div class="unit-controls">
                    <input 
                      type="number" 
                      v-model.number="attackerUnits[unit.id]" 
                      min="0" 
                      max="9999"
                      class="unit-count-input"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 攻击方总计 -->
        <div class="army-summary">
          <div class="summary-item">
            <span class="summary-label">总兵力：</span>
            <span class="summary-value">{{ getArmyTotalUnits(attackerUnits) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">总攻击力：</span>
            <span class="summary-value">{{ getArmyTotalAttack(attackerFaction, attackerUnits) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">步兵防御：</span>
            <span class="summary-value">{{ getArmyTotalInfantryDefense(attackerFaction, attackerUnits) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">骑兵防御：</span>
            <span class="summary-value">{{ getArmyTotalCavalryDefense(attackerFaction, attackerUnits) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">总载重：</span>
            <span class="summary-value">{{ getArmyTotalCarryCapacity(attackerFaction, attackerUnits) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">最慢速度：</span>
            <span class="summary-value">{{ getArmySlowestSpeed(attackerFaction, attackerUnits) }}</span>
          </div>
        </div>
      </div>

      <!-- 防守方配置 -->
      <div class="army-config defender">
        <h3 class="army-title">🛡️ 防守方</h3>
        
        <!-- 阵营选择 -->
        <div class="faction-selector">
          <label class="config-label">选择阵营：</label>
          <select v-model="defenderFaction" class="faction-select">
            <option v-for="faction in availableFactions" :key="faction.id" :value="faction.id">
              {{ faction.icon }} {{ faction.name }}
            </option>
          </select>
        </div>

        <!-- 兵种配置 -->
        <div class="units-config">
          <h4 class="units-title">兵种配置</h4>
          <div class="unit-categories">
            <div v-for="category in unitCategories" :key="category.type" class="category-section">
              <h5 class="category-title">{{ category.icon }} {{ category.name }}</h5>
              <div class="units-list">
                <div v-for="unit in getUnitsByCategory(defenderFaction, category.type)" :key="unit.id" class="unit-item">
                  <div class="unit-info">
                    <span class="unit-icon">{{ unit.icon }}</span>
                    <span class="unit-name">{{ unit.name }}</span>
                    <span class="unit-stats">攻击:{{ unit.attack }} 步防:{{ unit.infantryDefense }} 骑防:{{ unit.cavalryDefense }} 速度:{{ unit.speed }}</span>
                  </div>
                  <div class="unit-controls">
                    <!-- 去掉上下点击的 -->
                    <input 
                      type="number" 
                      v-model.number="defenderUnits[unit.id]" 
                      min="0" 
                      max="9999"
                      class="unit-count-input"
                      placeholder="0"
                    />
                  </div>
               
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 防守方总计 -->
        <div class="army-summary">
          <div class="summary-item">
            <span class="summary-label">总兵力：</span>
            <span class="summary-value">{{ getArmyTotalUnits(defenderUnits) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">总攻击力：</span>
            <span class="summary-value">{{ getArmyTotalAttack(defenderFaction, defenderUnits) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">步兵防御：</span>
            <span class="summary-value">{{ getArmyTotalInfantryDefense(defenderFaction, defenderUnits) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">骑兵防御：</span>
            <span class="summary-value">{{ getArmyTotalCavalryDefense(defenderFaction, defenderUnits) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">总载重：</span>
            <span class="summary-value">{{ getArmyTotalCarryCapacity(defenderFaction, defenderUnits) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">最慢速度：</span>
            <span class="summary-value">{{ getArmySlowestSpeed(defenderFaction, defenderUnits) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 战斗配置区域 -->
    <div class="battle-config">
      <div class="battle-rule-selector">
        <label class="config-label">战斗规则：</label>
        <select v-model="selectedBattleRule" class="rule-select">
          <option v-for="rule in availableBattleRules" :key="rule.id" :value="rule.id">
            {{ rule.name }} - {{ rule.description }}
          </option>
        </select>
      </div>

      <div class="battle-actions">
        <button @click="clearAllUnits" class="action-button clear-button">
          🗑️ 清空配置
        </button>
        <button @click="randomizeArmies" class="action-button random-button">
          🎲 随机配置
        </button>
        <button 
          @click="startBattle" 
          :disabled="!canStartBattle"
          :class="['action-button', 'battle-button', { 'disabled': !canStartBattle }]"
        >
          ⚔️ 开始战斗
        </button>
      </div>
    </div>

    <!-- 战报显示区域 -->
    <BattleReport 
      v-if="showBattleReport" 
      :battle-report-data="battleReportData" 
      @close="closeBattleReport" 
    />

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
import { FACTION_CONFIG, FACTION_TYPES, UNIT_CATEGORIES, UNIT_TYPES } from '@/config/factionConfig.js'
import { getBattleRule, BATTLE_RULES, BATTLE_RULE_IDS } from '@/config/battleRulesConfig.js'
import BattleReport from './Test/BattleReport.vue'

export default {
  name: 'BattleSimulator',
  
  components: {
    BattleReport
  },

  data() {
    return {
      //=== 攻击方配置
      attackerFaction: FACTION_TYPES.WEI,
      attackerUnits: {},
      
      //=== 防守方配置
      defenderFaction: FACTION_TYPES.SHU,
      defenderUnits: {},
      
      //=== 战斗配置
      selectedBattleRule: BATTLE_RULE_IDS.PLUNDER,
      
      //=== 显示控制
      showBattleReport: false,
      battleReportData: null,
      showData: false,
      dataTitle: '',
      currentData: null
    }
  },

  computed: {
    //=== availableFactions 可用阵营列表
    availableFactions() {
      return Object.values(FACTION_CONFIG).map(faction => ({
        id: faction.id,
        name: faction.name,
        icon: faction.icon
      }))
    },

    //=== unitCategories 兵种分类
    unitCategories() {
      return Object.entries(UNIT_CATEGORIES).map(([type, category]) => ({
        type,
        name: category.name,
        icon: category.icon
      }))
    },

    //=== availableBattleRules 可用战斗规则
    availableBattleRules() {
      return Object.values(BATTLE_RULES).map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description
      }))
    },

    //=== canStartBattle 是否可以开始战斗
    canStartBattle() {
      const attackerHasUnits = this.getArmyTotalUnits(this.attackerUnits) > 0
      const defenderHasUnits = this.getArmyTotalUnits(this.defenderUnits) > 0
      return attackerHasUnits && defenderHasUnits && this.selectedBattleRule
    },

    //=== formattedData 格式化数据
    formattedData() {
      return this.currentData ? JSON.stringify(this.currentData, null, 2) : ''
    }
  },

  methods: {
    
    //=== getUnitsByCategory 根据阵营和兵种类型获取兵种列表
    getUnitsByCategory(factionId, unitType) {
      // 直接从配置文件获取阵营兵种
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return []
      }
      
      const factionUnits = factionConfig.units
      return Object.entries(factionUnits)
        .filter(([_, unit]) => unit.unitType === unitType)
        .map(([unitId, unit]) => ({
          id: unitId,
          name: unit.name,
          attack: unit.attack,
          infantryDefense: unit.infantryDefense,
          cavalryDefense: unit.cavalryDefense,
          speed: unit.speed,
          carryCapacity: unit.carryCapacity,
          unitType: unit.unitType,
          cost: unit.cost,
          totalCost: unit.totalCost,
          trainTime: unit.trainTime,
          icon: unit.icon,
          description: unit.description
        }))
    },

    //=== getArmyTotalUnits 计算军队总兵力
    getArmyTotalUnits(units) {
      return Object.values(units).reduce((total, count) => total + (count || 0), 0)
    },

    //=== getArmyTotalAttack 计算军队总攻击力
    getArmyTotalAttack(factionId, units) {
      // 直接从配置文件获取阵营兵种数据
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return 0
      }
      
      const factionUnits = factionConfig.units
      return Object.entries(units).reduce((total, [unitId, count]) => {
        if (count > 0 && factionUnits[unitId]) {
          return total + (factionUnits[unitId].attack * count)
        }
        return total
      }, 0)
    },

    //=== getArmyTotalInfantryDefense 计算军队总步兵防御力
    getArmyTotalInfantryDefense(factionId, units) {
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return 0
      }
      
      const factionUnits = factionConfig.units
      return Object.entries(units).reduce((total, [unitId, count]) => {
        if (count > 0 && factionUnits[unitId]) {
          return total + (factionUnits[unitId].infantryDefense * count)
        }
        return total
      }, 0)
    },

    //=== getArmyTotalCavalryDefense 计算军队总骑兵防御力
    getArmyTotalCavalryDefense(factionId, units) {
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return 0
      }
      
      const factionUnits = factionConfig.units
      return Object.entries(units).reduce((total, [unitId, count]) => {
        if (count > 0 && factionUnits[unitId]) {
          return total + (factionUnits[unitId].cavalryDefense * count)
        }
        return total
      }, 0)
    },

    //=== getArmyTotalCarryCapacity 计算军队总载重
    getArmyTotalCarryCapacity(factionId, units) {
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return 0
      }
      
      const factionUnits = factionConfig.units
      return Object.entries(units).reduce((total, [unitId, count]) => {
        if (count > 0 && factionUnits[unitId]) {
          return total + (factionUnits[unitId].carryCapacity * count)
        }
        return total
      }, 0)
    },

    //=== getArmySlowestSpeed 计算军队最慢速度
    getArmySlowestSpeed(factionId, units) {
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return 0
      }
      
      const factionUnits = factionConfig.units
      let slowestSpeed = Infinity
      
      Object.entries(units).forEach(([unitId, count]) => {
        if (count > 0 && factionUnits[unitId]) {
          const unitSpeed = factionUnits[unitId].speed
          if (unitSpeed < slowestSpeed) {
            slowestSpeed = unitSpeed
          }
        }
      })
      
      return slowestSpeed === Infinity ? 0 : slowestSpeed
    },

    //=== generateUUID 生成UUID
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },

    //=== clearAllUnits 清空所有兵种配置
    clearAllUnits() {
      this.attackerUnits = {}
      this.defenderUnits = {}
    },

    //=== randomizeArmies 随机配置军队
    randomizeArmies() {
      console.log('🎲 开始随机配置军队')
      
      // 清空现有配置
      this.clearAllUnits()
      
      // 为攻击方随机配置 - 从配置文件获取兵种
      const attackerFactionConfig = FACTION_CONFIG[this.attackerFaction]
      const attackerUnits = attackerFactionConfig.units
      const attackerUnitIds = Object.keys(attackerUnits)
      const attackerRandomCount = Math.floor(Math.random() * 3) + 2 // 2-4种兵种
      
      for (let i = 0; i < attackerRandomCount; i++) {
        const randomUnitId = attackerUnitIds[Math.floor(Math.random() * attackerUnitIds.length)]
        const randomCount = Math.floor(Math.random() * 50) + 10 // 10-59个
        this.attackerUnits[randomUnitId] = randomCount
      }
      
      // 为防守方随机配置 - 从配置文件获取兵种
      const defenderFactionConfig = FACTION_CONFIG[this.defenderFaction]
      const defenderUnits = defenderFactionConfig.units
      const defenderUnitIds = Object.keys(defenderUnits)
      const defenderRandomCount = Math.floor(Math.random() * 3) + 2 // 2-4种兵种
      
      for (let i = 0; i < defenderRandomCount; i++) {
        const randomUnitId = defenderUnitIds[Math.floor(Math.random() * defenderUnitIds.length)]
        const randomCount = Math.floor(Math.random() * 50) + 10 // 10-59个
        this.defenderUnits[randomUnitId] = randomCount
      }
      
      console.log('🎲 随机配置完成', {
        攻击方: this.attackerUnits,
        防守方: this.defenderUnits
      })
    },

    //=== startBattle 开始战斗
    startBattle() {
      if (!this.canStartBattle) {
        console.warn('无法开始战斗：缺少必要条件')
        return
      }

      console.log('🔥 ========== 战斗模拟器开始 ==========')
      console.log('⚔️ 战斗规则:', this.selectedBattleRule)
      console.log('📅 战斗时间:', new Date().toLocaleString())

      // 构建攻击方军队数据
      const attackerArmyData = this.buildArmyData(this.attackerFaction, this.attackerUnits, '攻击方')
      
      // 构建防守方军队数据
      const defenderArmyData = this.buildArmyData(this.defenderFaction, this.defenderUnits, '防守方')

      // 创建攻击方军队数据（与TestList.vue格式一致）
      const attackerArmy = {
        playerInfo: attackerArmyData.data.playerInfo,
        faction: attackerArmyData.data.faction,
        units: attackerArmyData.data.units,
        resources: { wood: 0, soil: 0, iron: 0, food: 0 }
      }
      
      // 创建防守方军队数据（与TestList.vue格式一致）
      const defenderArmy = {
        ...defenderArmyData.data,
        resources: { wood: 5000, soil: 4000, iron: 3000, food: 6000 }
      }

      // 根据选择的战斗规则进行计算（与TestList.vue完全一致）
      const battleRule = getBattleRule(this.selectedBattleRule)
      const result = battleRule.calculateBattle(attackerArmy, defenderArmy)
      
      // 输出到控制台（与TestList.vue一致）
      console.log(`${battleRule.name}计算结果:`, result)
      console.log('攻击方数据:', attackerArmy)
      console.log('防守方数据:', defenderArmy)
      console.log('使用的战斗规则:', battleRule)

      // 设置战报数据并显示战报（与TestList.vue一致）
      this.battleReportData = result
      this.showBattleReport = true
      
      console.log('🏁 ========== 战斗模拟器结束 ==========')
    },

    //=== buildArmyData 构建军队数据
    buildArmyData(factionId, units, armyName) {
      console.log(`🏗️ ========== 开始构建${armyName}数据 ==========`)
      console.log(`🏛️ 阵营ID: ${factionId}`)
      console.log(`👥 军队名称: ${armyName}`)
      console.log(`📊 原始兵种数据:`, units)
      
      // 从配置文件获取阵营配置
      const factionConfig = FACTION_CONFIG[factionId]
      console.log(`🏛️ 阵营配置:`, factionConfig)
      
      if (!factionConfig) {
        console.error(`❌ 未找到阵营配置: ${factionId}`)
        return null
      }
      
      // 从配置文件获取该阵营的所有兵种
      const availableUnits = factionConfig.units
      console.log(`⚔️ 阵营可用兵种:`, Object.keys(availableUnits))
      
      // 构建军队兵种数据 - 只使用配置文件中的兵种
      const armyUnits = []
      let totalUnits = 0
      let totalAttack = 0
      let totalInfantryDefense = 0
      let totalCavalryDefense = 0
      let totalCarryCapacity = 0
      let slowestSpeed = Infinity
      
      Object.entries(units).forEach(([unitId, count]) => {
        if (count > 0 && availableUnits[unitId]) {
          const unitConfig = availableUnits[unitId]
          const unitData = {
            id: unitId,
            name: unitConfig.name,
            count: count,
            attack: unitConfig.attack,
            infantryDefense: unitConfig.infantryDefense,
            cavalryDefense: unitConfig.cavalryDefense,
            unitType: unitConfig.unitType,
            speed: unitConfig.speed,
            carryCapacity: unitConfig.carryCapacity
          }
          armyUnits.push(unitData)
          
          // 计算总计数据
          totalUnits += count
          totalAttack += unitConfig.attack * count
          totalInfantryDefense += unitConfig.infantryDefense * count
          totalCavalryDefense += unitConfig.cavalryDefense * count
          totalCarryCapacity += unitConfig.carryCapacity * count
          
          // 找到最慢的速度
          if (unitConfig.speed < slowestSpeed) {
            slowestSpeed = unitConfig.speed
          }
        }
      })
      
      // 如果没有兵种，设置最慢速度为0
      if (slowestSpeed === Infinity) {
        slowestSpeed = 0
      }
      
      console.log(`🪖 过滤后的军队兵种:`, armyUnits)
      console.log(`📈 ${armyName}总兵力: ${totalUnits}`)
      console.log(`⚔️ ${armyName}总攻击力: ${totalAttack}`)
      console.log(`🛡️ ${armyName}总步兵防御: ${totalInfantryDefense}`)
      console.log(`🐎 ${armyName}总骑兵防御: ${totalCavalryDefense}`)
      console.log(`📦 ${armyName}总载重: ${totalCarryCapacity}`)
      console.log(`🐌 ${armyName}最慢速度: ${slowestSpeed}`)
      
      // 构建最终军队数据 - 按照指定格式
      const armyData = {
        title: `${armyName}军队信息`,
        data: {
          playerInfo: {
            userUUID: this.generateUUID(),
            nickname: factionConfig.name
          },
          faction: factionId,
          totalUnits: totalUnits,
          totalAttack: totalAttack,
          totalInfantryDefense: totalInfantryDefense,
          totalCavalryDefense: totalCavalryDefense,
          totalCarryCapacity: totalCarryCapacity,
          slowestSpeed: slowestSpeed,
          units: armyUnits
        }
      }
      
      console.log(`✅ ${armyName}最终数据:`, armyData)
      console.log(`🏗️ ========== ${armyName}数据构建完成 ==========`)
      
      return armyData
    },



    //=== closeBattleReport 关闭战报
    closeBattleReport() {
      this.showBattleReport = false
      this.battleReportData = null
    },

    //=== closeData 关闭数据显示
    closeData() {
      this.showData = false
      this.currentData = null
      this.dataTitle = ''
    }
  },

  //=== 初始化默认配置
  mounted() {
    // 初始化攻击方默认兵种
    this.attackerUnits = {
      qingZhouArmy: 20,
      huBaoQi: 10
    }
    
    // 初始化防守方默认兵种
    this.defenderUnits = {
      qingZhouArmy: 15,
      jinWeiSoldier: 12
    }
  }
}
</script>

<style scoped>
.battle-simulator {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.simulator-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  color: #6b7280;
  font-size: 1.125rem;
}

.army-config-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .army-config-container {
    grid-template-columns: 1fr 1fr;
  }
}

.army-config {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  border: 2px solid;
}

.army-config.attacker {
  border-color: #fca5a5;
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
}

.army-config.defender {
  border-color: #93c5fd;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.army-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}

.army-config.attacker .army-title {
  color: #b91c1c;
}

.army-config.defender .army-title {
  color: #1d4ed8;
}

.faction-selector {
  margin-bottom: 24px;
}

.config-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.faction-select, .rule-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  background-color: white;
  color: #111827;
  font-size: 14px;
}

.faction-select:focus, .rule-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.units-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.units-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.category-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9fafb;
}

.category-title {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
}

.units-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.unit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s;
}

.unit-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.unit-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.unit-icon {
  font-size: 1.125rem;
}

.unit-name {
  font-weight: 500;
  color: #1f2937;
  min-width: 100px;
}

.unit-stats {
  font-size: 0.875rem;
  color: #6b7280;
}

.unit-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-count-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.unit-count-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.army-summary {
  margin-top: 24px;
  padding: 16px;
  background-color: #f3f4f6;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.summary-label {
  font-weight: 500;
  color: #374151;
}

.summary-value {
  font-weight: bold;
  color: #059669;
}

.battle-config {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.battle-rule-selector {
  display: flex;
  align-items: center;
  gap: 16px;
}

.battle-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.action-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.action-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.clear-button {
  background-color: #6b7280;
  color: white;
}

.clear-button:hover {
  background-color: #4b5563;
}

.random-button {
  background-color: #f59e0b;
  color: white;
}

.random-button:hover {
  background-color: #d97706;
}

.battle-button {
  background-color: #059669;
  color: white;
}

.battle-button:hover:not(.disabled) {
  background-color: #047857;
}

.battle-button.disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.data-display {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  z-index: 1000;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.data-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  color: #6b7280;
  font-size: 1.25rem;
  font-weight: bold;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.json-display {
  background-color: #f3f4f6;
  padding: 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
  overflow: auto;
  max-height: 384px;
  margin: 0;
  border: 1px solid #e5e7eb;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .battle-simulator {
    padding: 16px;
    gap: 16px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .army-config {
    padding: 16px;
  }
  
  .battle-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-button {
    width: 100%;
  }
  
  .data-display {
    max-width: 95vw;
    max-height: 85vh;
  }
}
</style>