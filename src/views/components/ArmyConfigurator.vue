<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4" :class="titleClass">{{ title }}</h2>
    
    <!-- 阵营选择 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">选择阵营</label>
      <select 
        v-model="selectedFaction" 
        @change="onFactionChange"
        class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="wei">魏国 ⚔️</option>
        <option value="shu">蜀国 🛡️</option>
        <option value="wu">吴国 ⚓</option>
      </select>
    </div>

    <!-- 兵种添加区域 -->
    <div class="mb-6">
      <h3 class="text-lg font-medium mb-3">添加兵种</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">选择兵种</label>
          <select 
            v-model="selectedUnitId" 
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">请选择兵种</option>
            <option 
              v-for="unit in availableUnits" 
              :key="unit.id" 
              :value="unit.id"
            >
              {{ unit.icon }} {{ unit.name }} ({{ getUnitTypeText(unit.unitType) }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">数量</label>
          <input 
            v-model.number="unitCount" 
            type="number" 
            min="1" 
            max="10000"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="输入兵种数量"
          />
        </div>
      </div>
      <button 
        @click="addUnit" 
        :disabled="!canAddUnit"
        class="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        ➕ 添加兵种
      </button>
    </div>

    <!-- 当前军队列表 -->
    <div class="mb-4">
      <h3 class="text-lg font-medium mb-3">当前军队 ({{ totalUnits }} 人)</h3>
      <div v-if="army.units.length === 0" class="text-gray-500 text-center py-4">
        暂无兵种，请添加兵种
      </div>
      <div v-else class="space-y-2">
        <div 
          v-for="(unit, index) in army.units" 
          :key="index"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
        >
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ unit.icon }}</span>
            <div>
              <div class="font-medium">{{ unit.name }}</div>
              <div class="text-sm text-gray-600">
                攻击: {{ unit.attack }} | 
                步防: {{ unit.infantryDefense }} | 
                骑防: {{ unit.cavalryDefense }} | 
                速度: {{ unit.speed }}
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <input 
              v-model.number="unit.count" 
              @change="updateArmy"
              type="number" 
              min="0" 
              max="10000"
              class="w-20 p-1 border border-gray-300 rounded text-center"
            />
            <button 
              @click="removeUnit(index)"
              class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              ❌
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 军队统计 -->
    <div class="bg-gray-50 rounded-md p-4">
      <h4 class="font-medium mb-2">军队统计</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-gray-600">总兵力:</span>
          <span class="font-medium ml-1">{{ totalUnits }}</span>
        </div>
        <div>
          <span class="text-gray-600">总攻击:</span>
          <span class="font-medium ml-1">{{ totalAttack }}</span>
        </div>
        <div>
          <span class="text-gray-600">总防御:</span>
          <span class="font-medium ml-1">{{ totalDefense }}</span>
        </div>
        <div>
          <span class="text-gray-600">最慢速度:</span>
          <span class="font-medium ml-1">{{ slowestSpeed }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { getAllUnits, UNIT_TYPES } from '@/config/factionConfig.js'

export default {
  name: 'ArmyConfigurator',
  props: {
    title: {
      type: String,
      required: true
    },
    army: {
      type: Object,
      required: true
    },
    color: {
      type: String,
      default: 'blue'
    }
  },
  emits: ['update:army'],
  setup(props, { emit }) {
    //=== 响应式数据
    const allUnits = ref([])
    const selectedFaction = ref(props.army.faction || 'wei')
    const selectedUnitId = ref('')
    const unitCount = ref(100)

    //=== 计算属性
    const titleClass = computed(() => {
      const colorMap = {
        red: 'text-red-600',
        blue: 'text-blue-600',
        green: 'text-green-600'
      }
      return colorMap[props.color] || 'text-gray-800'
    })

    const availableUnits = computed(() => {
      return allUnits.value.filter(unit => unit.faction === selectedFaction.value)
    })

    const canAddUnit = computed(() => {
      return selectedUnitId.value && unitCount.value > 0
    })

    const totalUnits = computed(() => {
      return props.army.units.reduce((sum, unit) => sum + (unit.count || 0), 0)
    })

    const totalAttack = computed(() => {
      return props.army.units.reduce((sum, unit) => 
        sum + (unit.attack || 0) * (unit.count || 0), 0
      )
    })

    const totalDefense = computed(() => {
      return props.army.units.reduce((sum, unit) => 
        sum + (unit.infantryDefense || 0) * (unit.count || 0), 0
      )
    })

    const slowestSpeed = computed(() => {
      if (props.army.units.length === 0) return 0
      return Math.min(...props.army.units.map(unit => unit.speed || 100))
    })

    //=== 方法
    //=== 获取兵种类型文本
    const getUnitTypeText = (unitType) => {
      const typeMap = {
        [UNIT_TYPES.INFANTRY]: '步兵',
        [UNIT_TYPES.CAVALRY]: '骑兵',
        [UNIT_TYPES.SIEGE]: '攻城',
        [UNIT_TYPES.SPECIAL]: '特殊'
      }
      return typeMap[unitType] || '未知'
    }

    //=== 阵营变更处理
    const onFactionChange = () => {
      selectedUnitId.value = ''
      // 清空当前军队
      const newArmy = {
        ...props.army,
        faction: selectedFaction.value,
        units: []
      }
      emit('update:army', newArmy)
    }

    //=== 添加兵种
    const addUnit = () => {
      if (!canAddUnit.value) return

      const selectedUnit = allUnits.value.find(unit => unit.id === selectedUnitId.value)
      if (!selectedUnit) return

      // 检查是否已存在该兵种
      const existingIndex = props.army.units.findIndex(unit => unit.id === selectedUnitId.value)
      
      const newUnits = [...props.army.units]
      
      if (existingIndex >= 0) {
        // 如果已存在，增加数量
        newUnits[existingIndex].count += unitCount.value
      } else {
        // 如果不存在，添加新兵种
        newUnits.push({
          ...selectedUnit,
          count: unitCount.value
        })
      }

      const newArmy = {
        ...props.army,
        units: newUnits
      }
      
      emit('update:army', newArmy)
      
      // 重置选择
      selectedUnitId.value = ''
      unitCount.value = 100
    }

    //=== 移除兵种
    const removeUnit = (index) => {
      const newUnits = props.army.units.filter((_, i) => i !== index)
      const newArmy = {
        ...props.army,
        units: newUnits
      }
      emit('update:army', newArmy)
    }

    //=== 更新军队
    const updateArmy = () => {
      // 过滤掉数量为0的兵种
      const newUnits = props.army.units.filter(unit => (unit.count || 0) > 0)
      const newArmy = {
        ...props.army,
        units: newUnits
      }
      emit('update:army', newArmy)
    }

    //=== 初始化数据
    const initializeData = () => {
      allUnits.value = getAllUnits()
    }

    //=== 监听阵营变化
    watch(() => props.army.faction, (newFaction) => {
      if (newFaction && newFaction !== selectedFaction.value) {
        selectedFaction.value = newFaction
      }
    }, { immediate: true })

    //=== 生命周期
    onMounted(() => {
      initializeData()
    })

    return {
      // 数据
      selectedFaction,
      selectedUnitId,
      unitCount,
      
      // 计算属性
      titleClass,
      availableUnits,
      canAddUnit,
      totalUnits,
      totalAttack,
      totalDefense,
      slowestSpeed,
      
      // 方法
      getUnitTypeText,
      onFactionChange,
      addUnit,
      removeUnit,
      updateArmy
    }
  }
}
</script>