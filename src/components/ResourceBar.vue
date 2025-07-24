<template>
  <div class="resource-bar bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4 mb-4">
    <div class="flex justify-between items-center">
      <!-- 资源显示 -->
      <div class="flex space-x-6">
        <div 
          v-for="(amount, resourceType) in gameStore.resources" 
          :key="resourceType"
          class="flex items-center space-x-2"
        >
          <!-- 资源图标 -->
          <div class="w-8 h-8 flex items-center justify-center">
            <div v-html="getResourceIcon(resourceType)" class="w-6 h-6"></div>
          </div>
          
          <!-- 资源信息 -->
          <div class="flex flex-col">
            <div class="flex items-center space-x-1">
              <span class="font-bold text-gray-800">{{ formatNumber(amount) }}</span>
              <span class="text-xs text-gray-500">/{{ formatNumber(gameStore.warehouseCapacity) }}</span>
            </div>
            <div class="text-xs text-green-600">
              +{{ formatNumber(gameStore.hourlyProduction[resourceType]) }}/h
            </div>
          </div>
        </div>
      </div>
      
      <!-- 仓库信息 -->
      <div class="flex items-center space-x-4">
        <div class="text-sm text-gray-600">
          <span class="font-medium">仓库等级:</span>
          <span class="ml-1 font-bold text-blue-600">{{ gameStore.warehouseLevel }}</span>
        </div>
        
        <!-- 升级仓库按钮 -->
        <button
          @click="upgradeWarehouse"
          :disabled="!gameStore.canUpgradeWarehouse"
          class="px-3 py-1 text-xs rounded-md transition-all duration-200"
          :class="gameStore.canUpgradeWarehouse 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
        >
          升级仓库
        </button>
        
        <!-- 暂停/恢复按钮 -->
        <button
          @click="togglePause"
          class="px-3 py-1 text-xs rounded-md transition-all duration-200"
          :class="gameStore.isPaused 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-yellow-500 text-white hover:bg-yellow-600'"
        >
          {{ gameStore.isPaused ? '恢复' : '暂停' }}
        </button>
      </div>
    </div>
    
    <!-- 仓库升级成本提示 -->
    <div v-if="gameStore.canUpgradeWarehouse" class="mt-2 text-xs text-gray-500">
      升级成本: 
      <span v-for="(cost, resource) in warehouseUpgradeCost" :key="resource" class="mr-2">
        {{ getResourceName(resource) }}: {{ formatNumber(cost) }}
      </span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '@/store/modules/gameStore.js'
import { getResourceName } from '@/config/resources.js'
import { calculateWarehouseUpgradeCost } from '@/config/gameConfig.js'

export default {
  name: 'ResourceBar',
  setup() {
    const gameStore = useGameStore()
    
    //=== 获取资源图标 - 返回SVG图标字符串
    const getResourceIcon = (resourceType) => {
      const iconMap = {
        wood: '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="8" height="3" fill="#8B4513"/><path d="M3 2 L9 2 L8 8 L4 8 Z" fill="#228B22"/><circle cx="6" cy="4" r="1" fill="#32CD32"/></svg>',
        soil: '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="6" width="10" height="5" fill="#8B4513"/><circle cx="3" cy="8" r="0.5" fill="#A0522D"/><circle cx="7" cy="9" r="0.5" fill="#A0522D"/><circle cx="9" cy="7" r="0.5" fill="#A0522D"/></svg>',
        iron: '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 3 L10 3 L9 9 L3 9 Z" fill="#708090"/><rect x="4" y="5" width="4" height="2" fill="#C0C0C0"/><circle cx="6" cy="6" r="0.5" fill="#FFD700"/></svg>',
        food: '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="6" cy="8" rx="4" ry="2" fill="#DAA520"/><path d="M4 4 Q6 2 8 4 Q6 6 4 4" fill="#32CD32"/><line x1="6" y1="4" x2="6" y2="8" stroke="#228B22" stroke-width="0.5"/></svg>'
      }
      return iconMap[resourceType] || ''
    }
    
    //=== 格式化数字显示 - 大数字使用K、M等单位
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    }
    
    //=== 计算仓库升级成本
    const warehouseUpgradeCost = computed(() => {
      return calculateWarehouseUpgradeCost(gameStore.warehouseLevel)
    })
    
    //=== 升级仓库操作
    const upgradeWarehouse = () => {
      const success = gameStore.upgradeWarehouse()
      if (success) {
        console.log('仓库升级成功!')
      } else {
        console.log('资源不足，无法升级仓库')
      }
    }
    
    //=== 暂停/恢复游戏
    const togglePause = () => {
      gameStore.togglePause()
    }
    
    return {
      gameStore,
      getResourceIcon,
      getResourceName,
      formatNumber,
      warehouseUpgradeCost,
      upgradeWarehouse,
      togglePause
    }
  }
}
</script>

<style scoped>
/* 资源图标样式 */
:deep(svg) {
  width: 100%;
  height: 100%;
}

/* 按钮悬停效果 */
button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 禁用按钮样式 */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>