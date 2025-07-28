<template>
  <div class="npc-buttons">
    <!-- NPC城池选择下拉框 -->
    <div class="dropdown-container">
      <div class="dropdown-header">
        <h3 class="dropdown-title">NPC城池选择</h3>
        <p class="dropdown-desc">选择一个NPC城池查看其详细信息</p>
      </div>
      
      <div class="dropdown-wrapper">
        <label class="dropdown-label">选择NPC城池：</label>
        <select 
          v-model="selectedNpcId" 
          @change="handleNpcSelection" 
          class="npc-dropdown"
        >
          <option value="">请选择NPC城池</option>
          <option 
            v-for="npc in npcList" 
            :key="npc.id" 
            :value="npc.id"
          >
            {{ npc.name }} ({{ getFactionName(npc.faction) }}) - 等级{{ npc.level }}
          </option>
        </select>
      </div>
      
      <!-- 选中NPC信息显示 -->
      <div v-if="selectedNpcId" class="selected-info">
        <div class="info-badge">
          <span class="badge-label">已选择：</span>
          <span class="badge-value">{{ getSelectedNpcName() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUnitById } from '@/config/unitsConfig.js'

export default {
  name: 'NpcButtons',
  
  //=== 组件事件定义
  emits: ['show-data', 'npc-selected'],
  
  //=== props 接收父组件传递的NPC列表数据
  props: {
    npcList: {
      type: Array,
      default: () => []
    }
  },
  
  //=== 数据定义
  data() {
    return {
      //=== selectedNpcId 选中的NPC ID
      selectedNpcId: ''
    }
  },
  
  //=== 方法定义
  methods: {
    //=== handleNpcSelection 处理NPC选择
    handleNpcSelection() {
      if (!this.selectedNpcId) {
        // 如果没有选中NPC，通知父组件清除选择
        this.$emit('npc-selected', null)
        return
      }
      
      const selectedNpc = this.npcList.find(npc => npc.id === this.selectedNpcId)
      if (selectedNpc) {
        console.log('选中的NPC城池:', selectedNpc)
        
        // 通知父组件选中的NPC
        this.$emit('npc-selected', selectedNpc)
        
        // 构建完整的NPC数据，包含军队、资源、建筑等信息
        const npcData = {
          id: selectedNpc.id,
          name: selectedNpc.name,
          faction: selectedNpc.faction,
          level: selectedNpc.level,
          resources: selectedNpc.resources,
          defenseArmy: selectedNpc.defenseArmy,
          defenderResources: selectedNpc.defenderResources,
          // 添加额外的城池信息
          cityInfo: {
            population: Math.floor(selectedNpc.level * 1000 + Math.random() * 2000),
            prosperity: Math.floor(selectedNpc.level * 10 + Math.random() * 20),
            defense: Math.floor(selectedNpc.level * 50 + Math.random() * 100)
          },
          // 添加建筑信息
          buildings: this.generateBuildingData(selectedNpc.level),
          // 添加时间戳
          generatedAt: new Date().toISOString(),
          dataSource: 'NpcList组件生成'
        }
        
        // 触发事件，传递NPC数据给父组件
        this.$emit('show-data', {
          title: 'NPC城池信息',
          data: npcData
        })
      }
    },
    
    //=== generateBuildingData 根据等级生成建筑数据
    generateBuildingData(level) {
      const buildings = {
        townHall: Math.min(20, Math.floor(level * 0.8) + 1),
        barracks: Math.min(20, Math.floor(level * 0.6) + 1),
        warehouse: Math.min(20, Math.floor(level * 0.7) + 1),
        wall: Math.min(20, Math.floor(level * 0.5) + 1)
      }
      
      // 资源建筑
      buildings.lumberMill = Math.min(20, Math.floor(level * 0.6) + Math.floor(Math.random() * 3))
      buildings.soilMine = Math.min(20, Math.floor(level * 0.6) + Math.floor(Math.random() * 3))
      buildings.ironMine = Math.min(20, Math.floor(level * 0.6) + Math.floor(Math.random() * 3))
      buildings.farm = Math.min(20, Math.floor(level * 0.6) + Math.floor(Math.random() * 3))
      
      return buildings
    },
    
    //=== getFactionName 获取阵营名称
    getFactionName(faction) {
      const names = {
        wei: '魏',
        shu: '蜀', 
        wu: '吴'
      }
      return names[faction] || '未知'
    },
    
    //=== getSelectedNpcName 获取选中NPC的名称
    getSelectedNpcName() {
      if (!this.selectedNpcId) return ''
      const selectedNpc = this.npcList.find(npc => npc.id === this.selectedNpcId)
      return selectedNpc ? `${selectedNpc.name} (${this.getFactionName(selectedNpc.faction)}) - 等级${selectedNpc.level}` : ''
    },
    
    //=== handleNpcArmyInfo 处理NPC军队信息按钮点击（保留兼容性）
    async handleNpcArmyInfo() {
      // 生成示例NPC军队数据，参考NpcList.vue的数据结构
      const npcArmyData = await this.generateSampleNpcData()
      
      this.$emit('show-data', {
        title: 'NPC军队信息（示例数据）',
        data: npcArmyData
      })
      console.log('显示NPC军队信息:', npcArmyData)
    },
    
    //=== generateSampleNpcData 生成示例NPC数据（保留兼容性）
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
    
    //=== generateSampleNpcArmy 生成示例NPC军队（保留兼容性）
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
/* 下拉容器样式 */
.dropdown-container {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* 下拉头部样式 */
.dropdown-header {
  margin-bottom: 20px;
}

.dropdown-title {
  font-size: 18px;
  font-weight: 700;
  color: #237C48;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-desc {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

/* 下拉选择器包装 */
.dropdown-wrapper {
  margin-bottom: 16px;
}

.dropdown-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

/* 下拉选择器样式 */
.npc-dropdown {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  color: #495057;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.npc-dropdown:hover {
  border-color: #237C48;
}

.npc-dropdown:focus {
  border-color: #237C48;
  box-shadow: 0 0 0 3px rgba(35, 124, 72, 0.1);
}

.npc-dropdown option {
  padding: 8px;
  font-size: 14px;
}

/* 选中信息显示 */
.selected-info {
  margin-top: 12px;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #237C48 0%, #1e6b3e 100%);
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(35, 124, 72, 0.2);
}

.info-badge svg {
  opacity: 0.9;
}

/* 保留原有按钮样式（兼容性） */
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
  .dropdown-container {
    padding: 16px;
  }
  
  .dropdown-title {
    font-size: 16px;
  }
  
  .dropdown-desc {
    font-size: 13px;
  }
  
  .npc-dropdown {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .info-badge {
    font-size: 12px;
    padding: 6px 10px;
  }
  
  .button-container {
    padding: 16px;
    gap: 12px;
  }
  
  .test-button {
    padding: 10px 20px;
    font-size: 14px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .dropdown-container {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  }
  
  .dropdown-title {
    color: #68d391;
  }
  
  .dropdown-desc {
    color: #a0aec0;
  }
  
  .dropdown-label {
    color: #e2e8f0;
  }
  
  .npc-dropdown {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .npc-dropdown:hover,
  .npc-dropdown:focus {
    border-color: #68d391;
  }
  
  .npc-dropdown:focus {
    box-shadow: 0 0 0 3px rgba(104, 211, 145, 0.1);
  }
}
</style>