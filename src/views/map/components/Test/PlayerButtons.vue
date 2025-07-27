<template>
  <div class="player-buttons">
    <!-- 玩家按钮区域 -->
    <div class="button-container">
      <button class="test-button" @click="handlePlayerArmyInfo">
        玩家军队信息
      </button>
    </div>
    
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
</template>

<script>
import { useGameStore } from '@/store/modules/gameStore.js'
import { getAllBattleRules, getBattleRule } from '@/config/battleRulesConfig.js'
import { getUnitById } from '@/config/unitsConfig.js'

export default {
  name: 'PlayerButtons',
  
  //=== 组件事件定义
  emits: ['show-data'],
  
  //=== 数据定义
  data() {
    return {
      selectedBattleRule: '', // 选中的战斗规则
      battleRules: [] // 可用的战斗规则列表
    }
  },
  
  //=== 计算属性
  computed: {
    //=== gameStore 游戏状态管理
    gameStore() {
      return useGameStore()
    },
    
    //=== playerArmyData 玩家军队数据
    playerArmyData() {
      const armyData = []
      
      Object.keys(this.gameStore.army).forEach(unitId => {
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
        faction: this.gameStore.userFaction || 'wei',
        totalUnits: armyData.reduce((total, unit) => total + unit.count, 0),
        totalAttack: armyData.reduce((total, unit) => total + (unit.attack * unit.count), 0),
        totalInfantryDefense: armyData.reduce((total, unit) => total + (unit.infantryDefense * unit.count), 0),
        totalCavalryDefense: armyData.reduce((total, unit) => total + (unit.cavalryDefense * unit.count), 0),
        totalCarryCapacity: armyData.reduce((total, unit) => total + (unit.carryCapacity * unit.count), 0),
        slowestSpeed: armyData.length > 0 ? Math.min(...armyData.map(unit => unit.speed)) : 0,
        units: armyData
      }
    }
  },
  
  //=== 生命周期钩子
  mounted() {
    this.loadBattleRules()
  },
  
  //=== 方法定义
  methods: {
    //=== loadBattleRules 加载战斗规则
    loadBattleRules() {
      this.battleRules = getAllBattleRules()
      console.log('加载战斗规则:', this.battleRules)
    },
    
    //=== handlePlayerArmyInfo 处理玩家军队信息按钮点击
    handlePlayerArmyInfo() {
      // 检查是否有军队数据，如果没有则添加测试数据
      if (Object.keys(this.gameStore.army).length === 0) {
        console.log('没有军队数据，添加测试数据...')
        this.gameStore.userFaction = 'wei'
        this.gameStore.army = {
          'qingZhouArmy': 100,      // 青州军
          'jinWeiSoldier': 80,      // 禁卫甲士
          'huWei': 60,              // 虎卫
          'zhanYingTanMa': 40,      // 战鹰探马
          'qiQiYing': 30,           // 骁骑营
          'huBaoQi': 2,             // 虎豹骑
          'chongZhuangChe': 1,      // 冲撞车
          'luLeiChe': 1             // 露雷车
        }
        console.log('已添加测试军队数据:', this.gameStore.army)
      }
      
      this.$emit('show-data', {
        title: '玩家军队信息（战斗功能文档格式）',
        data: this.playerArmyData
      })
      console.log('显示玩家军队信息（真实数据）:', this.playerArmyData)
    },
    

    

    

    
    //=== handleBattleRuleChange 处理战斗规则变化
    handleBattleRuleChange() {
      if (this.selectedBattleRule) {
        const rule = getBattleRule(this.selectedBattleRule)
        this.$emit('show-data', {
          title: '已选择战斗规则',
          data: {
            selectedRule: {
              id: rule.id,
              name: rule.name,
              description: rule.description
            },
            message: '已选择战斗规则，点击"开始对战测试"进行测试'
          }
        })
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
        this.$emit('show-data', {
          title: '对战测试结果',
          data: {
            battleRule: {
              id: battleRule.id,
              name: battleRule.name,
              description: battleRule.description
            },
            battleResult: battleResult
          }
        })
        
        console.log('对战测试完成:', battleResult)
        
      } catch (error) {
        console.error('战斗测试失败:', error)
        this.$emit('show-data', {
          title: '对战测试错误',
          data: {
            error: '战斗测试失败',
            message: error.message,
            stack: error.stack
          }
        })
      }
    },
    
    //=== getPlayerArmyForBattle 获取玩家军队用于战斗
    async getPlayerArmyForBattle() {
      // 确保有军队数据
      if (Object.keys(this.gameStore.army).length === 0) {
        // 自动添加测试数据
        this.gameStore.userFaction = 'wei'
        this.gameStore.army = {
          'qingZhouArmy': 50,       // 青州军
          'jinWeiSoldier': 30,      // 禁卫甲士
          'huWei': 25,              // 虎卫
          'zhanYingTanMa': 20,      // 战鹰探马
          'qiQiYing': 15,           // 骁骑营
          'huBaoQi': 10,            // 虎豹骑
          'chongZhuangChe': 5,      // 冲撞车
          'luLeiChe': 3             // 露雷车
        }
      }
      
      const units = []
      Object.keys(this.gameStore.army).forEach(unitId => {
        const count = this.gameStore.army[unitId]
        if (count > 0) {
          const unitConfig = getUnitById(unitId)
          if (unitConfig) {
            units.push({
              id: unitId,  // 统一使用id字段
              name: unitConfig.name,
              count,
              attack: unitConfig.attack,
              infantryDefense: unitConfig.infantryDefense,
              cavalryDefense: unitConfig.cavalryDefense,
              unitType: unitConfig.unitType,
              speed: unitConfig.speed,
              carryCapacity: unitConfig.carryCapacity,
              faction: this.gameStore.userFaction || 'wei'  // 添加faction字段
            })
          }
        }
      })
      
      return {
        faction: this.gameStore.userFaction || 'wei',
        units,
        playerInfo: {
          userUUID: this.gameStore.userUUID || 'player-uuid',
          nickname: this.gameStore.userNickname || '玩家'
        }
      }
    },
    
    //=== generateNpcArmyForBattle 生成NPC军队用于战斗
    async generateNpcArmyForBattle() {
      const factions = ['wei', 'shu', 'wu']
      const faction = factions[Math.floor(Math.random() * factions.length)]
      const level = 10 + Math.floor(Math.random() * 10) // 10-20级
      
      // 生成随机城池名称
      const cityNames = {
        wei: ['洛阳', '许昌', '邺城', '长安', '汉中'],
        shu: ['成都', '汉中', '江州', '永安', '建宁'],
        wu: ['建业', '吴郡', '会稽', '豫章', '庐江']
      }
      const cityName = cityNames[faction][Math.floor(Math.random() * cityNames[faction].length)]
      
      // 生成随机军队
      const { getFactionUnits } = await import('@/config/factionConfig.js')
      const factionUnits = getFactionUnits(faction)
      
      if (!factionUnits.length) {
        return { 
          faction, 
          units: [],
          npcInfo: {
            id: `npc-${Date.now()}`,
            name: cityName
          }
        }
      }
      
      // 随机选择3-5种兵种
      const selectedCount = 3 + Math.floor(Math.random() * 3)
      const shuffled = [...factionUnits].sort(() => 0.5 - Math.random())
      const selectedUnits = shuffled.slice(0, selectedCount)
      
      const units = selectedUnits.map(unitConfig => {
        const count = Math.floor(level * (5 + Math.random() * 10)) // 根据等级生成数量
        return {
          id: unitConfig.id,  // 统一使用id字段
          name: unitConfig.name,
          count,
          attack: unitConfig.attack,
          infantryDefense: unitConfig.infantryDefense,
          cavalryDefense: unitConfig.cavalryDefense,
          unitType: unitConfig.unitType,
          speed: unitConfig.speed,
          carryCapacity: unitConfig.carryCapacity,
          faction: faction  // 添加faction字段
        }
      })
      
      return { 
        faction, 
        units,
        npcInfo: {
          id: `npc-${Date.now()}`,
          name: cityName
        }
      }
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
    }
  }
}
</script>

<style scoped>
/* 按钮容器样式 */
.button-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* 测试按钮样式 */
.test-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #237C48 0%, #2d8f54 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(35, 124, 72, 0.3);
}

.test-button:hover {
  background: linear-gradient(135deg, #1e6b3e 0%, #237C48 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(35, 124, 72, 0.4);
}

.test-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(35, 124, 72, 0.3);
}

/* 战斗规则容器样式 */
.battle-rule-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.battle-rule-label {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.battle-rule-select {
  padding: 10px 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.3s ease;
}

.battle-rule-select:focus {
  outline: none;
  border-color: #237C48;
  box-shadow: 0 0 0 3px rgba(35, 124, 72, 0.1);
}

.battle-test-btn {
  margin-top: 8px;
}

.battle-test-btn.disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.battle-test-btn.disabled:hover {
  background: #6c757d;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .button-container {
    padding: 16px;
    gap: 12px;
  }
  
  .test-button {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .battle-rule-container {
    padding: 12px;
  }
}
</style>