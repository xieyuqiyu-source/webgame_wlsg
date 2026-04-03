<template>
  <div class="test-list">
    <!-- 测试按钮区域 -->
    <PlayerButtons ref="playerButtonsRef" @show-data="handleShowData" />
    <!-- 添加一个下拉选项 -->
    
    
    <!-- NPC按钮区域 -->
    <NpcButtons ref="npcButtonsRef" @show-data="handleShowData" :npc-list="npcList" @npc-selected="handleNpcSelected" />
    
    <!-- 战斗测试区域 -->
    <div class="battle-test-container">
      <div class="battle-rule-selector">
        <label for="battleRule" class="rule-label">选择战斗规则：</label>
        <select 
          id="battleRule" 
          v-model="selectedBattleRule" 
          class="rule-select"
          :disabled="!canBattle"
        >
          <option 
            v-for="rule in availableBattleRules" 
            :key="rule.id" 
            :value="rule.id"
          >
            {{ rule.name }} - {{ rule.description }}
          </option>
        </select>
      </div>
      
      <button 
        @click="testBattleCalculation" 
        :disabled="!canBattle || !selectedBattleRule"
        :class="['test-button', 'battle-button', { 'disabled': !canBattle || !selectedBattleRule }]"
        :title="getButtonTitle()"
      >
        {{ getButtonText() }}
      </button>
    </div>
    
    <!-- 隐藏的NpcList组件，用于生成NPC数据 -->
    <NpcList ref="npcListRef" @npcs-updated="handleNpcsUpdated" style="display: none;" />
  
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
      
      <!-- JSON数据展示 -->
      <pre class="json-display">{{ formattedData }}</pre>
    </div>
  </div>
</template>

<script>
import { useGameStore } from '@/store/modules/gameStore.js'
import { getUnitById, getFactionConfig, getFactionUnits } from '@/config/factionConfig.js'
import { getBattleRule, BATTLE_RULES, BATTLE_RULE_IDS } from '@/config/battleRulesConfig.js'
import PlayerButtons from './Test/PlayerButtons.vue'
import NpcButtons from './Test/NpcButtons.vue'
import NpcList from './NpcList.vue'
import BattleReport from './Test/BattleReport.vue'

export default {
  name: 'TestList',
  
  components: {
    PlayerButtons,
    NpcButtons,
    NpcList,
    BattleReport
  },
  data() {
    return {
      //=== showData 是否显示数据
      showData: false,
      //=== dataTitle 数据标题
      dataTitle: '',
      //=== currentData 当前显示的数据
      currentData: null,
      //=== npcList NPC城池列表数据
      npcList: [],
      //=== selectedNpc 选中的NPC数据
      selectedNpc: null,
      //=== showBattleReport 是否显示战报
      showBattleReport: false,
      //=== battleReportData 战报数据
      battleReportData: null,
      //=== selectedBattleRule 选中的战斗规则ID
      selectedBattleRule: BATTLE_RULE_IDS.CLASSIC_CRUSH // 默认选择新版规则
    }
  },
  computed: {
    //=== gameStore 游戏状态管理
    gameStore() {
      return useGameStore()
    },
    
    //=== formattedData 格式化的JSON数据
    formattedData() {
      return this.currentData ? JSON.stringify(this.currentData, null, 2) : ''
    },
    
    //=== canBattle 是否可以进行战斗
    canBattle() {
      return this.selectedNpc !== null
    },
    
    //=== availableBattleRules 可用的战斗规则列表
    availableBattleRules() {
      return Object.values(BATTLE_RULES).map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description
      }))
    }
  },
  methods: {
    //=== handleShowData 处理显示数据
    handleShowData(data, title = '数据详情1') {
      this.currentData = data 
      this.dataTitle = title
      this.showData = true
      console.log('显示数据:', data)
    },
    
    //=== closeData 关闭数据显示
    closeData() {
      this.showData = false
      this.currentData = null
      this.dataTitle = ''
    },
    
    //=== closeBattleReport 关闭战报显示
    closeBattleReport() {
      this.showBattleReport = false
      this.battleReportData = null
    },
    
    //=== testBattleCalculation 测试战斗计算（通用方法）
    testBattleCalculation() {
      // 检查是否选中了NPC和战斗规则
      if (!this.selectedNpc) {
        console.warn('未选中NPC目标，无法进行战斗')
        this.handleShowData({ error: '请先选择一个NPC目标进行战斗' }, '战斗计算错误')
        return
      }
      
      if (!this.selectedBattleRule) {
        console.warn('未选择战斗规则，无法进行战斗')
        this.handleShowData({ error: '请先选择一个战斗规则' }, '战斗计算错误')
        return
      }
      
      // 获取玩家军队数据
      const playerArmyData = this.getPlayerArmyData()
      
      // 获取NPC军队数据
      const npcArmyData = this.getNpcArmyData()
      
      if (!playerArmyData.units || playerArmyData.units.length === 0) {
        console.warn('玩家军队数据为空，无法进行战斗计算')
        this.handleShowData({ error: '玩家军队数据为空，请先添加军队数据' }, '战斗计算错误')
        return
      }
      
      if (!npcArmyData.units || npcArmyData.units.length === 0) {
        console.warn('选中的NPC军队数据为空，无法进行战斗')
        this.handleShowData({ error: '选中的NPC没有防守军队，无法进行战斗' }, '战斗计算错误')
        return
      }
      
      // 创建攻击方军队数据（玩家）
      const attackerArmy = {
        playerInfo: playerArmyData.playerInfo,
        faction: playerArmyData.faction,
        units: playerArmyData.units,
        resources: this.gameStore.resources || { wood: 0, soil: 0, iron: 0, food: 0 }
      }
      
      // 创建防守方军队数据（选中的NPC）
      const defenderArmy = {
        npcInfo: npcArmyData.npcInfo,
        faction: npcArmyData.faction,
        units: npcArmyData.units,
        resources: npcArmyData.resources
      }
      
      // 根据选择的战斗规则进行计算
      const battleRule = getBattleRule(this.selectedBattleRule)
      const result = battleRule.calculateBattle(attackerArmy, defenderArmy)
      
      // 输出到控制台
      console.log(`${battleRule.name}计算结果:`, result)
      console.log('攻击方数据:', attackerArmy)
      console.log('防守方数据:', defenderArmy)
      console.log('选中的NPC:', this.selectedNpc)
      console.log('使用的战斗规则:', battleRule)
      
      // 设置战报数据并显示战报
      this.battleReportData = result
      this.showBattleReport = true
      
      // 关闭JSON数据显示（如果正在显示）
      this.closeData()
    },
    
    //=== getButtonText 获取按钮文本
    getButtonText() {
      if (!this.canBattle) {
        return '请先选择NPC目标'
      }
      if (!this.selectedBattleRule) {
        return '请选择战斗规则'
      }
      
      const rule = BATTLE_RULES[this.selectedBattleRule]
      return `测试${rule?.name || '战斗'}计算`
    },
    
    //=== getButtonTitle 获取按钮提示文本
    getButtonTitle() {
      if (!this.canBattle) {
        return '请先选择一个NPC目标'
      }
      if (!this.selectedBattleRule) {
        return '请先选择一个战斗规则'
      }
      
      const rule = BATTLE_RULES[this.selectedBattleRule]
      return `开始${rule?.name || '战斗'}计算`
    },

    //=== testPlunderBattle 测试掠夺战斗计算（保留兼容性）
    testPlunderBattle() {
      this.selectedBattleRule = BATTLE_RULE_IDS.CLASSIC_CRUSH
      this.testBattleCalculation()
    },
    
    //=== getPlayerArmyData 获取玩家军队数据
    getPlayerArmyData() {
      // 通过ref获取PlayerButtons组件的军队数据
      if (this.$refs.playerButtonsRef && this.$refs.playerButtonsRef.playerArmyData) {
        return this.$refs.playerButtonsRef.playerArmyData
      }
      
      // 如果无法通过ref获取，直接从gameStore构建
      const armyData = []
      
      Object.keys(this.gameStore.army || {}).forEach(unitId => {
        const count = this.gameStore.army[unitId]
        if (count > 0) {
          const unitConfig = getUnitById(unitId)
          if (unitConfig) {
            armyData.push({
              id: unitId,
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
        playerInfo: {
          userUUID: this.gameStore.userUUID || 'player-001',
          nickname: this.gameStore.userNickname || '魏国小子'
        },
        faction: this.gameStore.userFaction || 'wei',
        units: armyData
      }
    },
    
    //=== getNpcArmyData 获取NPC军队数据
    getNpcArmyData() {
      // 如果有选中的NPC，使用选中的NPC数据
      if (this.selectedNpc) {
        return {
          npcInfo: {
            id: this.selectedNpc.id,
            name: this.selectedNpc.name
          },
          faction: this.selectedNpc.faction,
          units: this.selectedNpc.defenseArmy ? this.selectedNpc.defenseArmy.units : [],
          resources: this.selectedNpc.resources || { wood: 5000, soil: 4000, iron: 3000, food: 6000 }
        }
      }
      
      // 如果没有选中NPC，返回空数据
      return {
        npcInfo: null,
        faction: 'shu',
        units: [],
        resources: { wood: 5000, soil: 4000, iron: 3000, food: 6000 }
      }
    },
    
    //=== handleNpcsUpdated 处理NPC数据更新
    handleNpcsUpdated(npcs) {
      this.npcList = npcs
      console.log('NPC数据已更新:', npcs)
    },
    
    //=== handleNpcSelected 处理NPC选择事件
    handleNpcSelected(npc) {
      this.selectedNpc = npc
      console.log('TestList: 选中的NPC:', npc)
    },
    
    //=== selectNpc 选择NPC目标
    selectNpc(npc) {
      this.selectedNpc = npc
      console.log('选中NPC:', npc)
    },
    
    //=== clearSelectedNpc 清除选中的NPC
    clearSelectedNpc() {
      this.selectedNpc = null
      console.log('清除选中的NPC')
    },
    

  },
  
  //=== mounted 组件挂载后的初始化
  mounted() {
    // NPC数据已从其他地方获取，无需手动初始化
  }
}
</script>

<style scoped>
.test-list {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 10px;
}

/* 战斗测试容器样式 */
.battle-test-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 15px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 战斗规则选择器样式 */
.battle-rule-selector {
  margin-bottom: 15px;
}

.rule-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.rule-select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  color: #374151;
  transition: all 0.2s ease;
}

.rule-select:focus {
  outline: none;
  border-color: #237C48;
  box-shadow: 0 0 0 3px rgba(35, 124, 72, 0.1);
}

.rule-select:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

/* 按钮样式 */
.test-button {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.battle-button {
  background: linear-gradient(135deg, #237C48 0%, #2d8f55 100%);
  color: white;
}

.battle-button:hover:not(.disabled) {
  background: linear-gradient(135deg, #1e6b3e 0%, #26804a 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(35, 124, 72, 0.3);
}

.battle-button.disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 数据显示区域样式 */
.data-display {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.close-button {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.close-button:hover {
  background: #dc2626;
}

.json-display {
  padding: 20px;
  background: #1f2937;
  color: #f3f4f6;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
  max-height: 60vh;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-list {
    padding: 15px;
    margin: 5px;
  }
  
  .battle-test-container {
    padding: 15px;
  }
  
  .rule-select {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .test-button {
    font-size: 14px;
    padding: 10px 16px;
  }
  
  .data-display {
    max-width: 95vw;
    max-height: 85vh;
  }
  
  .json-display {
    font-size: 11px;
    padding: 15px;
  }
}
</style>
