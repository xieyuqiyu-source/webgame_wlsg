<template>
  <div class="npc-buttons">
    <!-- NPC按钮区域 -->
    <div class="button-container">
      <button class="test-button" @click="handleNpcArmyInfo">
        NPC军队信息
      </button>
    </div>
  </div>
</template>

<script>
import { getUnitById } from '@/config/unitsConfig.js'

export default {
  name: 'NpcButtons',
  
  //=== 组件事件定义
  emits: ['show-data'],
  
  //=== 方法定义
  methods: {
    //=== handleNpcArmyInfo 处理NPC军队信息按钮点击
    async handleNpcArmyInfo() {
      // 生成示例NPC军队数据，参考NpcList.vue的数据结构
      const npcArmyData = await this.generateSampleNpcData()
      
      this.$emit('show-data', {
        title: 'NPC军队信息（示例数据）',
        data: npcArmyData
      })
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
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.test-button:hover {
  background: linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.test-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
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