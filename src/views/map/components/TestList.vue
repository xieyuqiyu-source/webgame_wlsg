<template>
  <div class="test-list">
    <!-- 测试按钮区域 -->
    <PlayerButtons @show-data="handleShowData" />
    
    <!-- NPC按钮区域 -->
    <NpcButtons @show-data="handleShowData" :npc-list="npcList" />
    
    <!-- 隐藏的NpcList组件，用于生成NPC数据 -->
    <NpcList ref="npcListRef" @npcs-updated="handleNpcsUpdated" style="display: none;" />
    
    <!-- 数据显示区域 -->
    <div v-if="showData" class="data-display">
      <div class="data-header">
        <h3 class="data-title">{{ dataTitle }}</h3>
        <button class="close-button" @click="closeData">×</button>
      </div>
      
      <!-- 战斗结果特殊展示 -->
      <div v-if="dataTitle === '对战测试结果' && currentData.battleResult" class="battle-result-display">
        <!-- 第一段：攻击标题 -->
        <div class="battle-title-section">
          <span class="attacker-name">{{ currentData.battleResult.attacker.nickname }}</span>
          <span class="attack-text">进攻</span>
          <span class="defender-name">{{ currentData.battleResult.defender.nickname }}</span>
        </div>
        
        <!-- 第二段：进攻方信息 -->
        <div class="participant-info-section">
          <!-- 第一行：基础信息 -->
          <div class="info-row">
            <span class="label">进攻方：</span>
            <span class="participant-basic">{{ currentData.battleResult.attacker.nickname }} ({{ currentData.battleResult.attacker.faction }}) 战损: {{ (currentData.battleResult.attacker.lossRatio * 100).toFixed(1) }}%</span>
          </div>
          
          <!-- 第二行：出动兵种 -->
          <div class="info-row">
            <span class="label">出动兵种：</span>
            <span class="units-info">
              <span v-for="(unit, index) in getAllUnitsWithCounts(currentData.battleResult.attacker.originalUnits)" :key="unit.id">
                {{ unit.name }}{{ unit.count }}{{ index < getAllUnitsWithCounts(currentData.battleResult.attacker.originalUnits).length - 1 ? '，' : '' }}
              </span>
            </span>
          </div>
          
          <!-- 第三行：阵亡兵种 -->
          <div class="info-row">
            <span class="label">阵亡兵种：</span>
            <span class="units-loss">
              <span v-if="getAllUnitsWithLosses(currentData.battleResult.attacker.originalUnits, currentData.battleResult.attacker.losses).filter(unit => unit.lossCount > 0).length === 0">无</span>
              <span v-else>
                <span v-for="(unit, index) in getAllUnitsWithLosses(currentData.battleResult.attacker.originalUnits, currentData.battleResult.attacker.losses).filter(unit => unit.lossCount > 0)" :key="unit.id">
                  {{ unit.name }}{{ unit.lossCount }}{{ index < getAllUnitsWithLosses(currentData.battleResult.attacker.originalUnits, currentData.battleResult.attacker.losses).filter(unit => unit.lossCount > 0).length - 1 ? '，' : '' }}
                </span>
              </span>
            </span>
          </div>
          
          <!-- 第四行：掠夺资源 -->
          <div class="info-row">
            <span class="label">掠夺资源：</span>
            <span class="plunder-info">
              <span>木材{{ getPlunderedResource('wood') }}</span>
              <span>泥土{{ getPlunderedResource('soil') }}</span>
              <span>铁{{ getPlunderedResource('iron') }}</span>
              <span>食物{{ getPlunderedResource('food') }}</span>
            </span>
          </div>
        </div>
        
        <!-- 第三段：VS分隔符 -->
        <div class="vs-section">
          <span class="vs-text">VS</span>
        </div>
        
        <!-- 第四段：防守方信息 -->
        <div class="participant-info-section">
          <!-- 第一行：基础信息 -->
          <div class="info-row">
            <span class="label">防守方：</span>
            <span class="participant-basic">{{ currentData.battleResult.defender.nickname }} ({{ currentData.battleResult.defender.faction }}) 战损: {{ (currentData.battleResult.defender.lossRatio * 100).toFixed(1) }}%</span>
          </div>
          
          <!-- 第二行：出动兵种 -->
          <div class="info-row">
            <span class="label">出动兵种：</span>
            <span class="units-info">
              <span v-for="(unit, index) in getAllUnitsWithCounts(currentData.battleResult.defender.originalUnits)" :key="unit.id">
                {{ unit.name }}{{ unit.count }}{{ index < getAllUnitsWithCounts(currentData.battleResult.defender.originalUnits).length - 1 ? '，' : '' }}
              </span>
            </span>
          </div>
          
          <!-- 第三行：阵亡兵种 -->
          <div class="info-row">
            <span class="label">阵亡兵种：</span>
            <span class="units-loss">
              <span v-if="getAllUnitsWithLosses(currentData.battleResult.defender.originalUnits, currentData.battleResult.defender.losses).filter(unit => unit.lossCount > 0).length === 0">无</span>
              <span v-else>
                <span v-for="(unit, index) in getAllUnitsWithLosses(currentData.battleResult.defender.originalUnits, currentData.battleResult.defender.losses).filter(unit => unit.lossCount > 0)" :key="unit.id">
                  {{ unit.name }}{{ unit.lossCount }}{{ index < getAllUnitsWithLosses(currentData.battleResult.defender.originalUnits, currentData.battleResult.defender.losses).filter(unit => unit.lossCount > 0).length - 1 ? '，' : '' }}
                </span>
              </span>
            </span>
          </div>
        </div>
        
        <!-- 掠夺资源显示 -->
        <div v-if="currentData.battleResult.details.plundered" class="plunder-section">
          <h5 class="section-title">
            <span class="plunder-icon">💰</span>
            掠夺资源
          </h5>
          <div class="plunder-resources">
            <div class="resource-item" v-if="currentData.battleResult.details.plundered.wood > 0">
              <span class="resource-icon">🪵</span>
              <span class="resource-label">木材</span>
              <span class="resource-value">+{{ currentData.battleResult.details.plundered.wood }}</span>
            </div>
            <div class="resource-item" v-if="currentData.battleResult.details.plundered.soil > 0">
              <span class="resource-icon">🧱</span>
              <span class="resource-label">泥土</span>
              <span class="resource-value">+{{ currentData.battleResult.details.plundered.soil }}</span>
            </div>
            <div class="resource-item" v-if="currentData.battleResult.details.plundered.iron > 0">
              <span class="resource-icon">⚒️</span>
              <span class="resource-label">铁</span>
              <span class="resource-value">+{{ currentData.battleResult.details.plundered.iron }}</span>
            </div>
            <div class="resource-item" v-if="currentData.battleResult.details.plundered.food > 0">
              <span class="resource-icon">🌾</span>
              <span class="resource-label">食物</span>
              <span class="resource-value">+{{ currentData.battleResult.details.plundered.food }}</span>
            </div>
          </div>
          <div class="plunder-summary">
            <span class="summary-text">
              总掠夺价值: {{ calculatePlunderValue(currentData.battleResult.details.plundered) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 其他数据的JSON展示 -->
      <pre v-else class="json-display">{{ formattedData }}</pre>
    </div>
    
    <!-- 战斗结果完整数据展示区域 -->
    <div v-if="currentData && currentData.battleResult" class="battle-result-data-section">
      <div class="section-header">
        <h3 class="section-title">🔍 战斗结果完整数据</h3>
        <p class="section-desc">展示战斗计算的所有详细数据</p>
      </div>
      
      <!-- 战斗基础信息 -->
      <div class="data-card">
        <h4 class="data-card-title">⚔️ 战斗基础信息</h4>
        <div class="data-grid">
          <div class="data-item">
            <span class="data-label">战斗结果:</span>
            <span class="data-value" :class="getBattleResultClass(currentData.battleResult.result)">{{ getBattleResultTitle(currentData.battleResult.result) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">战斗规则:</span>
            <span class="data-value">{{ currentData.battleResult.rule || '未知' }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">战斗时间:</span>
            <span class="data-value">{{ new Date().toLocaleString() }}</span>
          </div>
        </div>
      </div>
      
      <!-- 攻击方数据 -->
      <div class="data-card" v-if="currentData.attacker && currentData.attacker.playerInfo">
        <h4 class="data-card-title">🗡️ 攻击方数据</h4>
        <div class="participant-data">
          <div class="basic-info">
            <div class="data-item">
              <span class="data-label">玩家:</span>
              <span class="data-value">{{ currentData.attacker.playerInfo?.nickname || '未知' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">阵营:</span>
              <span class="data-value">{{ currentData.attacker.playerInfo?.factionName || '未知' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">总兵力:</span>
              <span class="data-value">{{ currentData.attacker.armyStatistics?.totalUnits || 0 }}</span>
            </div>
          </div>
          <div class="army-stats">
            <div class="stat-item">
              <span class="stat-label">总攻击力:</span>
              <span class="stat-value">{{ currentData.attacker.armyStatistics?.totalAttack || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">步兵防御:</span>
              <span class="stat-value">{{ currentData.attacker.armyStatistics?.totalInfantryDefense || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">骑兵防御:</span>
              <span class="stat-value">{{ currentData.attacker.armyStatistics?.totalCavalryDefense || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">运载能力:</span>
              <span class="stat-value">{{ currentData.attacker.armyStatistics?.totalCarryCapacity || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最慢速度:</span>
              <span class="stat-value">{{ currentData.attacker.armyStatistics?.slowestSpeed || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 防守方数据 -->
      <div class="data-card" v-if="currentData.defender && currentData.defender.playerInfo">
        <h4 class="data-card-title">🛡️ 防守方数据</h4>
        <div class="participant-data">
          <div class="basic-info">
            <div class="data-item">
              <span class="data-label">玩家:</span>
              <span class="data-value">{{ currentData.defender.playerInfo?.nickname || '未知' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">阵营:</span>
              <span class="data-value">{{ currentData.defender.playerInfo?.factionName || '未知' }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">总兵力:</span>
              <span class="data-value">{{ currentData.defender.armyStatistics?.totalUnits || 0 }}</span>
            </div>
          </div>
          <div class="army-stats">
            <div class="stat-item">
              <span class="stat-label">总攻击力:</span>
              <span class="stat-value">{{ currentData.defender.armyStatistics?.totalAttack || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">步兵防御:</span>
              <span class="stat-value">{{ currentData.defender.armyStatistics?.totalInfantryDefense || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">骑兵防御:</span>
              <span class="stat-value">{{ currentData.defender.armyStatistics?.totalCavalryDefense || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">运载能力:</span>
              <span class="stat-value">{{ currentData.defender.armyStatistics?.totalCarryCapacity || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最慢速度:</span>
              <span class="stat-value">{{ currentData.defender.armyStatistics?.slowestSpeed || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 战斗详细结果 -->
      <div class="data-card">
        <h4 class="data-card-title">📊 战斗详细结果</h4>
        <div class="battle-details-data">
          <div class="detail-section" v-if="currentData.attacker && currentData.attacker.armyGroup && currentData.attacker.armyGroup.units">
            <h5 class="detail-title">攻击方损失</h5>
            <div class="loss-data">
              <div v-for="unit in currentData.attacker.armyGroup.units" :key="'attacker-loss-' + unit.id" class="loss-item">
                <span class="unit-name">{{ unit.name }}:</span>
                <span class="loss-count">{{ getLossCount(currentData.battleResult?.details?.attackerLosses, unit.id) }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="currentData.defender && currentData.defender.armyGroup && currentData.defender.armyGroup.units">
            <h5 class="detail-title">防守方损失</h5>
            <div class="loss-data">
              <div v-for="unit in currentData.defender.armyGroup.units" :key="'defender-loss-' + unit.id" class="loss-item">
                <span class="unit-name">{{ unit.name }}:</span>
                <span class="loss-count">{{ getLossCount(currentData.battleResult?.details?.defenderLosses, unit.id) }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="currentData.battleResult && currentData.battleResult.details && currentData.battleResult.details.plundered">
            <h5 class="detail-title">掠夺资源</h5>
            <div class="plunder-data">
              <div class="plunder-item">
                <span class="resource-name">木材:</span>
                <span class="resource-amount">{{ currentData.battleResult.details.plundered?.wood || 0 }}</span>
              </div>
              <div class="plunder-item">
                <span class="resource-name">泥土:</span>
                <span class="resource-amount">{{ currentData.battleResult.details.plundered?.soil || 0 }}</span>
              </div>
              <div class="plunder-item">
                <span class="resource-name">铁:</span>
                <span class="resource-amount">{{ currentData.battleResult.details.plundered?.iron || 0 }}</span>
              </div>
              <div class="plunder-item">
                <span class="resource-name">食物:</span>
                <span class="resource-amount">{{ currentData.battleResult.details.plundered?.food || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 原始JSON数据 -->
      <div class="data-card">
        <h4 class="data-card-title">📋 原始JSON数据</h4>
        <div class="json-container">
          <div class="json-toolbar">
            <button @click="copyJsonToClipboard" class="json-btn copy-btn">
              <span class="btn-icon">📋</span>
              <span class="btn-text">复制</span>
            </button>
            <button @click="toggleJsonCollapse" class="json-btn collapse-btn">
              <span class="btn-icon">{{ isJsonCollapsed ? '📖' : '📕' }}</span>
              <span class="btn-text">{{ isJsonCollapsed ? '展开' : '折叠' }}</span>
            </button>
            <button @click="downloadJson" class="json-btn download-btn">
              <span class="btn-icon">💾</span>
              <span class="btn-text">下载</span>
            </button>
          </div>
          <div class="json-display-wrapper" :class="{ 'collapsed': isJsonCollapsed }">
            <pre class="json-raw-display" v-html="highlightedJson"></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGameStore } from '@/store/modules/gameStore.js'
import { getUnitById, getFactionConfig, getFactionUnits } from '@/config/factionConfig.js'
import { getAllBattleRules, getBattleRule } from '@/config/battleRulesConfig.js'
import PlayerButtons from './Test/PlayerButtons.vue'
import NpcButtons from './Test/NpcButtons.vue'
import NpcList from './NpcList.vue'

export default {
  name: 'TestList',
  
  components: {
    PlayerButtons,
    NpcButtons,
    NpcList
  },
  data() {
    return {
      //=== showData 是否显示数据
      showData: false,
      //=== dataTitle 数据标题
      dataTitle: '',
      //=== currentData 当前显示的数据
      currentData: null,
      //=== isJsonCollapsed JSON是否折叠
      isJsonCollapsed: false,
      //=== npcList NPC城池列表数据
      npcList: []
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
    },
    
    //=== highlightedJson 语法高亮的JSON数据
    highlightedJson() {
      if (!this.currentData) return ''
      const jsonString = JSON.stringify(this.currentData, null, 2)
      return this.syntaxHighlight(jsonString)
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
    
    //=== calculatePlunderValue 计算掠夺资源总价值
    calculatePlunderValue(plundered) {
      if (!plundered) return 0
      // 按照游戏中的资源价值比例计算（木材:泥土:铁:食物 = 1:1:2:0.5）
      const woodValue = plundered.wood || 0
      const clayValue = plundered.soil || 0
      const ironValue = (plundered.iron || 0) * 2
      const foodValue = (plundered.food || 0) * 0.5
      return Math.floor(woodValue + clayValue + ironValue + foodValue)
    },
    
    //=== getLossCount 计算损失数量
    getLossCount(losses, unitId) {
      if (!losses || !unitId) return 0
      return losses[unitId] || 0
    },
    
    //=== getUnitsWithLoss 获取有损失的兵种列表
    getUnitsWithLoss(originalUnits, losses) {
      return originalUnits.map(unit => {
        const lossCount = this.getLossCount(losses, unit.id)
        return {
          ...unit,
          lossCount
        }
      }).filter(unit => unit.lossCount > 0)
    },
    
    //=== getAllUnitsWithCounts 获取所有兵种及其数量（包括数量为0的）
    getAllUnitsWithCounts(originalUnits) {
      // 如果没有原始兵种数据，返回空数组
      if (!originalUnits || originalUnits.length === 0) {
        return []
      }
      
      // 从原始兵种数据中获取阵营信息
      const faction = originalUnits[0]?.faction || this.gameStore.userFaction || 'wei'
      
      // 获取该阵营的所有兵种类型
      const allFactionUnits = getFactionUnits(faction)
      
      // 创建一个包含所有兵种的数组，没有的兵种数量为0
      return allFactionUnits.map(unitConfig => {
        const existingUnit = originalUnits.find(unit => unit.id === unitConfig.id)
        return {
          id: unitConfig.id,
          name: unitConfig.name,
          count: existingUnit ? existingUnit.count : 0
        }
      })
    },
    
    //=== getAllUnitsWithLosses 获取所有兵种的阵亡数量（按出动-损耗计算）
    getAllUnitsWithLosses(originalUnits, losses) {
      // 如果没有原始兵种数据，返回空数组
      if (!originalUnits || originalUnits.length === 0) {
        return []
      }
      
      // 从原始兵种数据中获取阵营信息
      const faction = originalUnits[0]?.faction || this.gameStore.userFaction || 'wei'
      
      // 获取该阵营的所有兵种类型
      const allFactionUnits = getFactionUnits(faction)
      
      // 创建一个包含所有兵种阵亡数量的数组
      return allFactionUnits.map(unitConfig => {
        const existingUnit = originalUnits.find(unit => unit.id === unitConfig.id)
        const originalCount = existingUnit ? existingUnit.count : 0
        const lossCount = this.getLossCount(losses, unitConfig.id)
        
        return {
          id: unitConfig.id,
          name: unitConfig.name,
          lossCount: lossCount
        }
      })
    },
    
    //=== getPlunderedResource 获取掠夺的资源数量（没有就返回0）
    getPlunderedResource(resourceType) {
      if (!this.currentData || !this.currentData.battleResult || !this.currentData.battleResult.details) {
        return 0
      }
      
      const plundered = this.currentData.battleResult.details.plundered
      if (!plundered) {
        return 0
      }
      
      return plundered[resourceType] || 0
    },
    
    //=== handleShowData 处理子组件显示数据事件
    handleShowData(data) {
      this.dataTitle = data.title
      this.currentData = data.data
      this.showData = true
    },
    


    
    //=== getResourceName 获取资源名称
    getResourceName(resource) {
      const resourceNames = {
        wood: '木材',
        soil: '土壤', 
        iron: '铁矿',
        food: '粮食'
      }
      return resourceNames[resource] || resource
    },
    
    //=== closeData 关闭数据显示
    closeData() {
      this.showData = false
      this.currentData = null
      this.dataTitle = ''
    },
    
    //=== syntaxHighlight JSON语法高亮
    syntaxHighlight(json) {
      if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2)
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return json.replace(/"([^"]+)":/g, '<span class="json-key">"$1":</span>')
        .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/: (null)/g, ': <span class="json-null">$1</span>')
    },
    
    //=== copyJsonToClipboard 复制JSON到剪贴板
    async copyJsonToClipboard() {
      if (!this.currentData) return
      
      try {
        const jsonString = JSON.stringify(this.currentData, null, 2)
        await navigator.clipboard.writeText(jsonString)
        
        // 显示复制成功提示
        this.$message?.success?.('JSON数据已复制到剪贴板') || 
        alert('JSON数据已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        this.$message?.error?.('复制失败') || 
        alert('复制失败')
      }
    },
    
    //=== toggleJsonCollapse 切换JSON折叠状态
    toggleJsonCollapse() {
      this.isJsonCollapsed = !this.isJsonCollapsed
    },
    
    //=== downloadJson 下载JSON文件
    downloadJson() {
      if (!this.currentData) return
      
      try {
        const jsonString = JSON.stringify(this.currentData, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `battle-data-${new Date().getTime()}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        URL.revokeObjectURL(url)
        
        this.$message?.success?.('JSON文件下载成功') || 
        console.log('JSON文件下载成功')
      } catch (error) {
        console.error('下载失败:', error)
        this.$message?.error?.('下载失败') || 
        alert('下载失败')
      }
    },
    
    //=== handleNpcsUpdated 处理NPC数据更新
    handleNpcsUpdated(npcs) {
      this.npcList = npcs
      console.log('NPC数据已更新:', npcs)
    },
    
    //=== initializeNpcData 初始化NPC数据
    initializeNpcData() {
      // 通过ref调用NpcList组件的生成方法
      if (this.$refs.npcListRef) {
        this.$refs.npcListRef.generateNpcs()
      }
    }
  },
  
  //=== mounted 组件挂载后初始化NPC数据
  mounted() {
    this.$nextTick(() => {
      this.initializeNpcData()
    })
  }
}
</script>

<style scoped>
.test-list {
  width: 100%;
}

.button-container {
  display: flex;
  gap: 16px;
  padding: 24px;
  background-color: rgba(31, 41, 55, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(75, 85, 99, 0.3);
  max-width: 800px;
}

.test-button {
  padding: 12px 24px;
  background-color: #059669;
  color: white;
  font-weight: bold;
  border-radius: 8px;
  border: 1px solid #10b981;
  cursor: pointer;
}

.test-button:hover {
  background-color: #047857;
}

.battle-rule-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.battle-rule-label {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.battle-rule-select {
  padding: 8px 16px;
  background-color: #374151;
  color: white;
  border: 1px solid #4b5563;
  border-radius: 8px;
}

.data-display {
  margin-top: 24px;
  background-color: rgba(17, 24, 39, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(75, 85, 99, 0.4);
  max-height: 600px;
  overflow-y: auto;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.data-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.close-button {
  width: 32px;
  height: 32px;
  background-color: #dc2626;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.json-display {
  padding: 16px;
  color: #10b981;
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.battle-result-display {
  padding: 24px;
}

.battle-result-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  margin-bottom: 24px;
}

.result-victory {
  background-color: rgba(34, 197, 94, 0.2);
  border-left-color: #22c55e;
}

.result-defeat {
  background-color: rgba(239, 68, 68, 0.2);
  border-left-color: #ef4444;
}

.result-draw {
  background-color: rgba(251, 191, 36, 0.2);
  border-left-color: #fbbf24;
}

.result-icon {
  font-size: 36px;
}

.result-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
}

.result-summary {
  color: #d1d5db;
  font-size: 14px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 12px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: #d1d5db;
  margin-bottom: 8px;
}

.participant-section {
  background-color: rgba(31, 41, 55, 0.5);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(75, 85, 99, 0.3);
  margin-bottom: 16px;
}

.participant-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.stat-label {
  color: #d1d5db;
  font-size: 14px;
}

.stat-value {
  color: white;
  font-weight: bold;
}

.units-section {
  margin-bottom: 16px;
}

.unit-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.unit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 1px solid rgba(75, 85, 99, 0.2);
}

.unit-name {
  color: white;
  font-weight: 500;
  flex: 1;
}

.unit-count {
  color: #fbbf24;
  font-weight: bold;
  margin-left: 8px;
}

.battle-details {
  background-color: rgba(31, 41, 55, 0.5);
  border-radius: 8px;
  padding: 16px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border: 1px solid rgba(75, 85, 99, 0.2);
}

.detail-label {
  color: #d1d5db;
  font-weight: 500;
}

.detail-value {
  color: white;
  font-weight: bold;
}

.battle-rule-info {
  background-color: rgba(31, 41, 55, 0.5);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.rule-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rule-name {
  color: #22c55e;
  font-weight: bold;
}

.rule-desc {
  color: #9ca3af;
  font-size: 14px;
}

/* 掠夺资源样式 */
.plunder-section {
  background-color: rgba(31, 41, 55, 0.5);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.plunder-icon {
  margin-right: 8px;
}

.plunder-resources {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: rgba(251, 191, 36, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.resource-icon {
  font-size: 18px;
}

.resource-label {
  color: #d1d5db;
  font-weight: 500;
  flex: 1;
}

.resource-value {
  color: #fbbf24;
  font-weight: bold;
  font-size: 16px;
}

.plunder-summary {
  text-align: center;
  padding: 12px;
  background-color: rgba(251, 191, 36, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.summary-text {
  color: #fbbf24;
  font-weight: bold;
  font-size: 16px;
}

/* 四段式战报样式 */
.battle-title-section {
  text-align: center;
  padding: 15px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.1));
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.attacker-name, .defender-name {
  font-weight: bold;
  color: #FFD700;
  font-size: 16px;
}

.attack-text {
  margin: 0 15px;
  color: #ff6b6b;
  font-weight: bold;
  font-size: 14px;
}

.participant-info-section {
  margin: 15px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  line-height: 1.5;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  min-width: 80px;
  color: #FFD700;
  font-weight: bold;
  flex-shrink: 0;
}

.participant-basic {
  color: #fff;
}

.units-info, .units-loss {
  color: #fff;
  flex: 1;
}

.units-info span, .units-loss span {
  margin-right: 5px;
}

.plunder-info {
  color: #4CAF50;
}

.plunder-info span {
  margin-right: 10px;
}

.vs-section {
  text-align: center;
  padding: 10px;
  margin: 20px 0;
}

.vs-text {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b6b;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

/* 紧凑战斗详情样式 */
.battle-details-compact {
  background-color: rgba(31, 41, 55, 0.5);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.details-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(75, 85, 99, 0.2);
  min-width: 120px;
}

.detail-label {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.detail-value {
  color: white;
  font-weight: bold;
  font-size: 16px;
}

/* 战斗结果完整数据展示样式 */
.battle-result-data-section {
  margin-top: 32px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9));
  border-radius: 12px;
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.section-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(34, 197, 94, 0.3);
}

.section-title {
  color: #22c55e;
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.section-desc {
  color: #9ca3af;
  font-size: 14px;
  margin: 0;
}

.data-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(75, 85, 99, 0.2);
}

.data-card:last-child {
  margin-bottom: 0;
}

.data-card-title {
  color: #fbbf24;
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(251, 191, 36, 0.3);
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.data-label {
  color: #d1d5db;
  font-weight: 500;
  flex-shrink: 0;
}

.data-value {
  color: #ffffff;
  font-weight: bold;
  text-align: right;
}

.participant-data {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.basic-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.army-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.stat-label {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  color: #22c55e;
  font-size: 16px;
  font-weight: bold;
}

.battle-details-data {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.detail-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-title {
  color: #fbbf24;
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(251, 191, 36, 0.3);
}

.loss-data, .plunder-data {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loss-item, .plunder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 1px solid rgba(75, 85, 99, 0.2);
}

.unit-name, .resource-name {
  color: #d1d5db;
  font-weight: 500;
}

.loss-count {
  color: #ef4444;
  font-weight: bold;
}

.resource-amount {
  color: #22c55e;
  font-weight: bold;
}

/* JSON容器样式 */
.json-container {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(75, 85, 99, 0.3);
  overflow: hidden;
}

/* JSON工具栏样式 */
.json-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.json-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.copy-btn {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.copy-btn:hover {
  background: rgba(34, 197, 94, 0.3);
  transform: translateY(-1px);
}

.collapse-btn {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.collapse-btn:hover {
  background: rgba(251, 191, 36, 0.3);
  transform: translateY(-1px);
}

.download-btn {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.download-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 14px;
}

.btn-text {
  font-size: 12px;
}

/* JSON显示区域样式 */
.json-display-wrapper {
  position: relative;
  transition: all 0.3s ease;
}

.json-display-wrapper.collapsed {
  max-height: 100px;
  overflow: hidden;
}

.json-display-wrapper.collapsed::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  pointer-events: none;
}

.json-raw-display {
  background: rgba(0, 0, 0, 0.5);
  color: #e5e7eb;
  padding: 16px;
  margin: 0;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  max-height: 500px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* JSON语法高亮样式 */
.json-key {
  color: #fbbf24;
  font-weight: 600;
}

.json-string {
  color: #22c55e;
}

.json-number {
  color: #3b82f6;
  font-weight: 600;
}

.json-boolean {
  color: #f59e0b;
  font-weight: 600;
}

.json-null {
  color: #ef4444;
  font-weight: 600;
  font-style: italic;
}

/* 滚动条美化 */
.json-raw-display::-webkit-scrollbar {
  width: 8px;
}

.json-raw-display::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.json-raw-display::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
  border-radius: 4px;
}

.json-raw-display::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .participant-data {
    grid-template-columns: 1fr;
  }
  
  .army-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .battle-details-data {
    grid-template-columns: 1fr;
  }
  
  .data-grid {
    grid-template-columns: 1fr;
  }
}
</style>