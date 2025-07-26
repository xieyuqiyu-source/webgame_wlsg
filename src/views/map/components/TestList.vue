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
      
      <div class="battle-rule-container">
        <label for="battleRule" class="battle-rule-label">战斗规则选择：</label>
        <select 
          id="battleRule" 
          v-model="selectedBattleRule" 
          @change="handleBattleRuleChange" 
          class="battle-rule-select"
        >
          <option value="" disabled>请选择战斗规则</option>
          <option v-for="rule in battleRules" :key="rule.id" :value="rule.id">
            {{ rule.name }} - {{ rule.description }}
          </option>
        </select>
        <button 
          @click="startBattleTest" 
          :disabled="!selectedBattleRule" 
          class="test-button battle-test-btn"
          :class="{ 'disabled': !selectedBattleRule }"
        >
          开始对战测试
        </button>
      </div>
    </div>
    
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
              <span v-for="(unit, index) in currentData.battleResult.attacker.originalUnits" :key="unit.id">
                {{ unit.name }}{{ unit.count }}{{ index < currentData.battleResult.attacker.originalUnits.length - 1 ? '，' : '' }}
              </span>
            </span>
          </div>
          
          <!-- 第三行：阵亡兵种 -->
          <div class="info-row">
            <span class="label">阵亡兵种：</span>
            <span class="units-loss">
              <span v-for="(unit, index) in getUnitsWithLoss(currentData.battleResult.attacker.originalUnits, currentData.battleResult.attacker.losses)" :key="unit.id">
                {{ unit.name }}{{ unit.lossCount }}{{ index < getUnitsWithLoss(currentData.battleResult.attacker.originalUnits, currentData.battleResult.attacker.losses).length - 1 ? '，' : '' }}
              </span>
              <span v-if="getUnitsWithLoss(currentData.battleResult.attacker.originalUnits, currentData.battleResult.attacker.losses).length === 0">无</span>
            </span>
          </div>
          
          <!-- 第四行：掠夺资源 -->
          <div class="info-row" v-if="currentData.battleResult.details.plundered">
            <span class="label">掠夺资源：</span>
            <span class="plunder-info">
              <span v-if="currentData.battleResult.details.plundered.wood > 0">木材{{ currentData.battleResult.details.plundered.wood }}</span>
              <span v-if="currentData.battleResult.details.plundered.clay > 0">泥土{{ currentData.battleResult.details.plundered.clay }}</span>
              <span v-if="currentData.battleResult.details.plundered.iron > 0">铁{{ currentData.battleResult.details.plundered.iron }}</span>
              <span v-if="currentData.battleResult.details.plundered.food > 0">食物{{ currentData.battleResult.details.plundered.food }}</span>
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
              <span v-for="(unit, index) in currentData.battleResult.defender.originalUnits" :key="unit.id">
                {{ unit.name }}{{ unit.count }}{{ index < currentData.battleResult.defender.originalUnits.length - 1 ? '，' : '' }}
              </span>
            </span>
          </div>
          
          <!-- 第三行：阵亡兵种 -->
          <div class="info-row">
            <span class="label">阵亡兵种：</span>
            <span class="units-loss">
              <span v-for="(unit, index) in getUnitsWithLoss(currentData.battleResult.defender.originalUnits, currentData.battleResult.defender.losses)" :key="unit.id">
                {{ unit.name }}{{ unit.lossCount }}{{ index < getUnitsWithLoss(currentData.battleResult.defender.originalUnits, currentData.battleResult.defender.losses).length - 1 ? '，' : '' }}
              </span>
              <span v-if="getUnitsWithLoss(currentData.battleResult.defender.originalUnits, currentData.battleResult.defender.losses).length === 0">无</span>
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
            <div class="resource-item" v-if="currentData.battleResult.details.plundered.clay > 0">
              <span class="resource-icon">🧱</span>
              <span class="resource-label">泥土</span>
              <span class="resource-value">+{{ currentData.battleResult.details.plundered.clay }}</span>
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
  </div>
</template>

<script>
import { useGameStore } from '@/store/modules/gameStore.js'
import { getUnitById, getFactionConfig } from '@/config/factionConfig.js'
import { getAllBattleRules, getBattleRule } from '@/config/battleRulesConfig.js'

export default {
  name: 'TestList',
  data() {
    return {
      //=== showData 是否显示数据
      showData: false,
      //=== dataTitle 数据标题
      dataTitle: '',
      //=== currentData 当前显示的数据
      currentData: null,
      //=== selectedBattleRule 选中的战斗规则
      selectedBattleRule: '',
      //=== battleRules 战斗规则列表
      battleRules: getAllBattleRules()
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
    
    //=== calculatePlunderValue 计算掠夺资源总价值
    calculatePlunderValue(plundered) {
      if (!plundered) return 0
      // 按照游戏中的资源价值比例计算（木材:泥土:铁:食物 = 1:1:2:0.5）
      const woodValue = plundered.wood || 0
      const clayValue = plundered.clay || 0
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
    
    //=== handleBattleRuleChange 处理战斗规则变化
    handleBattleRuleChange() {
      if (this.selectedBattleRule) {
        const rule = getBattleRule(this.selectedBattleRule)
        this.dataTitle = '已选择战斗规则'
        this.currentData = {
          selectedRule: {
            id: rule.id,
            name: rule.name,
            description: rule.description
          },
          message: '已选择战斗规则，点击"开始对战测试"进行测试'
        }
        this.showData = true
        console.log('选择了战斗规则:', rule)
      }
    },
    
    //=== startBattleTest 开始对战测试
    async startBattleTest() {
      if (!this.selectedBattleRule) return
      
      try {
        console.log('开始对战测试...')
        
        // 获取玩家军队数据
        const playerArmy = await this.getPlayerArmyForBattle()
        
        // 生成NPC军队数据
        const npcArmy = await this.generateNpcArmyForBattle()
        
        // 获取战斗规则
        const battleRule = getBattleRule(this.selectedBattleRule)
        
        // 执行战斗计算
        const battleResult = this.calculateBattle(playerArmy, npcArmy, battleRule)
        
        // 显示战斗结果
        this.dataTitle = '对战测试结果'
        this.currentData = {
          battleRule: {
            id: battleRule.id,
            name: battleRule.name,
            description: battleRule.description
          },
          battleResult: battleResult
        }
        this.showData = true
        
        console.log('对战测试完成:', battleResult)
        
      } catch (error) {
        console.error('战斗测试失败:', error)
        this.dataTitle = '对战测试错误'
        this.currentData = {
          error: '战斗测试失败',
          message: error.message,
          stack: error.stack
        }
        this.showData = true
      }
    },
    
    //=== getPlayerArmyForBattle 获取玩家军队用于战斗
    async getPlayerArmyForBattle() {
      // 确保有军队数据
      if (Object.keys(this.gameStore.army).length === 0) {
        // 自动添加测试数据
        this.gameStore.userFaction = 'wei'
        this.gameStore.army = {
          'wei_qingzhou': 50,
          'wei_guard': 30,
          'wei_tiger': 25,
          'wei_scout': 20,
          'wei_cavalry': 15,
          'wei_elite_cavalry': 10,
          'wei_ram': 5,
          'wei_catapult': 3
        }
      }
      
      const units = []
      Object.keys(this.gameStore.army).forEach(unitId => {
        const count = this.gameStore.army[unitId]
        if (count > 0) {
          const unitConfig = getUnitById(unitId)
          if (unitConfig) {
            units.push({
              unitId,
              name: unitConfig.name,
              count,
              attack: unitConfig.attack,
              infantryDefense: unitConfig.infantryDefense,
              cavalryDefense: unitConfig.cavalryDefense,
              unitType: unitConfig.unitType,
              speed: unitConfig.speed,
              carryCapacity: unitConfig.carryCapacity
            })
          }
        }
      })
      
      return {
        faction: this.gameStore.userFaction || 'wei',
        units
      }
    },
    
    //=== generateNpcArmyForBattle 生成NPC军队用于战斗
    async generateNpcArmyForBattle() {
      const factions = ['wei', 'shu', 'wu']
      const faction = factions[Math.floor(Math.random() * factions.length)]
      const level = 10 + Math.floor(Math.random() * 10) // 10-20级
      
      // 生成随机军队
      const { getFactionUnits } = await import('@/config/factionConfig.js')
      const factionUnits = getFactionUnits(faction)
      
      if (!factionUnits.length) {
        return { faction, units: [] }
      }
      
      // 随机选择3-5种兵种
      const selectedCount = 3 + Math.floor(Math.random() * 3)
      const shuffled = [...factionUnits].sort(() => 0.5 - Math.random())
      const selectedUnits = shuffled.slice(0, selectedCount)
      
      const units = selectedUnits.map(unitConfig => {
        const count = Math.floor(level * (5 + Math.random() * 10)) // 根据等级生成数量
        return {
          unitId: unitConfig.id,
          name: unitConfig.name,
          count,
          attack: unitConfig.attack,
          infantryDefense: unitConfig.infantryDefense,
          cavalryDefense: unitConfig.cavalryDefense,
          unitType: unitConfig.unitType,
          speed: unitConfig.speed,
          carryCapacity: unitConfig.carryCapacity
        }
      })
      
      return { faction, units }
    },
    
    //=== calculateBattle 计算战斗结果
    calculateBattle(playerArmy, npcArmy, battleRule) {
      try {
        console.log('计算战斗:', { playerArmy, npcArmy, battleRule })
        
        // 使用新的统一 calculateBattle 方法
        const battleResult = battleRule.calculateBattle(playerArmy, npcArmy)
        console.log('战斗结果:', battleResult)
        
        return battleResult
      } catch (error) {
        console.error('战斗计算错误:', error)
        return {
          result: 'error',
          summary: '战斗计算出错: ' + error.message,
          details: { error: error.message },
          ruleUsed: battleRule.id
        }
      }
    },
    
    //=== getBattleResultClass 获取战斗结果样式类
    getBattleResultClass(result) {
      switch (result) {
        case 'ATTACKER_VICTORY':
          return 'result-victory'
        case 'DEFENDER_VICTORY':
          return 'result-defeat'
        case 'DRAW':
          return 'result-draw'
        default:
          return 'result-error'
      }
    },
    
    //=== getBattleResultIcon 获取战斗结果图标
    getBattleResultIcon(result) {
      switch (result) {
        case 'ATTACKER_VICTORY':
          return '🏆'
        case 'DEFENDER_VICTORY':
          return '💀'
        case 'DRAW':
          return '⚖️'
        default:
          return '❌'
      }
    },
    
    //=== getBattleResultTitle 获取战斗结果标题
    getBattleResultTitle(result) {
      switch (result) {
        case 'ATTACKER_VICTORY':
          return '进攻方胜利！'
        case 'DEFENDER_VICTORY':
          return '防守方胜利！'
        case 'DRAW':
          return '平局！'
        default:
          return '错误！'
      }
    },
    
    //=== formatDetailLabel 格式化详情标签
    formatDetailLabel(key) {
      const labelMap = {
        attackerDamage: '玩家造成伤害',
        defenderDamage: 'NPC造成伤害',
        attackerLosses: '玩家损失兵力',
        defenderLosses: 'NPC损失兵力',
        attackerLossRatio: '玩家损失率',
        defenderLossRatio: 'NPC损失率',
        playerPower: '玩家战力',
        npcPower: 'NPC战力',
        powerComparison: '战力对比',
        error: '错误信息'
      }
      return labelMap[key] || key
    },
    
    //=== formatDetailValue 格式化详情值
    formatDetailValue(key, value) {
      // 检查值是否为 null、undefined 或非数字
      if (value === null || value === undefined || (typeof value !== 'number' && isNaN(Number(value)))) {
        return value || '未知'
      }
      
      // 确保 value 是数字类型
      const numValue = typeof value === 'number' ? value : Number(value)
      
      if (key.includes('Ratio')) {
        return `${(numValue * 100).toFixed(1)}%`
      }
      if (key === 'powerComparison') {
        return `${numValue.toFixed(2)}:1`
      }
      if (typeof numValue === 'number' && !isNaN(numValue)) {
        return Math.floor(numValue).toLocaleString()
      }
      return value
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
    }
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
</style>