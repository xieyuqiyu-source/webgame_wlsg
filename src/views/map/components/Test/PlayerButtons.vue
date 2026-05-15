<template>
  <div class="player-buttons">
    <div class="button-container">
      <button @click="handleShowData" class="test-button">
        显示玩家军队信息
      </button>
    </div>
  </div>
</template>

<script>
import { useGameStore } from '@/store/modules/gameStore.js'
import { useMilitaryStore } from '@/store/modules/militaryStore.js'
import { getUnitById } from '@/config/unitsConfig.js'

export default {
  name: 'PlayerButtons',
  
  //=== 组件事件定义
  emits: ['show-data'],
  
  //=== 计算属性
  computed: {
    //=== gameStore 游戏状态管理
    gameStore() {
      return useGameStore()
    },

    militaryStore() {
      return useMilitaryStore()
    },
    
    //=== playerArmyData 玩家军队数据
    playerArmyData() {
      const armyData = []
      
      Object.keys(this.militaryStore.army).forEach(unitId => {
        const count = this.militaryStore.army[unitId]
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
  
  //=== 方法定义
  methods: {
    //=== handleShowData 处理显示数据按钮点击
    handleShowData() {
      // 检查是否有军队数据，如果没有则添加测试数据
      if (Object.keys(this.militaryStore.army).length === 0) {
        console.log('没有军队数据，添加测试数据...')
        this.gameStore.userFaction = 'wei'
        this.militaryStore.setArmy({
          'qingZhouArmy': 100,      // 青州军
          'jinWeiSoldier': 80,      // 禁卫甲士
          'huWei': 60,              // 虎卫
          'zhanYingTanMa': 40,      // 战鹰探马
          'qiQiYing': 30,           // 骁骑营
          'huBaoQi': 2,             // 虎豹骑
          'chongZhuangChe': 1,      // 冲撞车
          'luLeiChe': 1             // 露雷车
        })
        this.gameStore.saveGame()
        console.log('已添加测试军队数据:', this.militaryStore.army)
      }
      
      this.$emit('show-data', {
        title: '玩家军队信息',
        data: this.playerArmyData
      })
      console.log('有数据，显示玩家军队信息:', this.playerArmyData)
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
}
</style>
