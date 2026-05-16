<template>
  <div
    class="building-card game-card p-3 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 relative min-h-[120px] flex flex-col justify-between"
    :data-testid="`building-card-${buildingType}-${buildingIndex}`"
  >
    <!-- 建筑等级 -->
    <div class="absolute top-2 right-2 bg-green-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
      {{ currentLevel }}
    </div>
    
    <!-- 建筑图标和信息 -->
    <div class="flex flex-col items-center flex-1">
      <div class="building-icon-center mb-1">
        <div v-if="icon" v-html="icon" class="resource-icon"></div>
        <img v-else :src="building.icon" :alt="building.name" class="w-10 h-10 object-contain" />
      </div>
      
      <!-- 建筑名称 -->
      <h3 class="text-xs font-medium text-center mb-1 text-gray-400">{{ buildingName }}</h3>
      
      <!-- 产出信息 -->
      <div class="text-xs text-green-600 text-center mb-1">
        +{{ currentProduction }}/h
      </div>
    </div>
    
    <!-- 升级按钮 -->
    <div class="w-full">
      <HoverCard
        class="upgrade-button-container"
        :show="showTooltip"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
      >
        <template #trigger>
        <button
          @click.stop="upgradeBuilding"
          :disabled="!canUpgrade || isUpgrading"
          class="w-full py-1.5 px-2 text-xs rounded-md transition-all duration-200 relative overflow-hidden"
          :class="getButtonClass"
          :data-testid="`building-upgrade-button-${buildingType}-${buildingIndex}`"
        >
          <!-- 进度条背景 -->
          <div 
            v-if="isUpgrading" 
            class="absolute inset-0 bg-green-500 transition-all duration-100 ease-linear"
            :style="{ width: upgradeProgress + '%' }"
          ></div>
          
          <!-- 按钮文字 -->
          <span class="relative z-10">
            {{ getButtonText }}
          </span>
        </button>
        </template>
        
        <!-- 浮动提醒 -->
        <BuildingUpgradeHoverContent
          v-if="showTooltip"
          :get-resource-name="getResourceName"
          :is-max-level="currentLevel >= maxLevel"
          :is-upgrading="isUpgrading"
          :production-gain="productionGain"
          :remaining-time-text="remainingTimeText"
          :resources="gameStore.resources"
          :title="buildingName"
          :upgrade-cost="upgradeCost"
          :upgrade-duration-text="upgradeDurationText"
        />
        <div v-if="false" class="building-tooltip">
          <div class="tooltip-arrow"></div>
          <div class="tooltip-header">{{ isUpgrading ? '升级进度' : canUpgrade ? '升级信息' : '升级条件' }}</div>
          <div v-if="isUpgrading" class="tooltip-content">
            <div class="tooltip-item upgrading">建筑正在升级中...</div>
            <div class="tooltip-item">
              <div class="text-blue-400 text-center mt-1">剩余时间: {{ remainingTimeText }}</div>
            </div>
          </div>
          <div v-else-if="currentLevel >= maxLevel" class="tooltip-content">
            <div class="tooltip-item max-level">建筑已达到最大等级</div>
          </div>
          <div v-else-if="canUpgrade" class="tooltip-content">
            <div class="resource-requirement sufficient">
              <span class="resource-name">产量提升:</span>
              <span class="resource-amount">+{{ productionGain }}/h</span>
            </div>
            <div class="resource-requirement sufficient">
              <span class="resource-name">升级耗时:</span>
              <span class="resource-amount">{{ upgradeDurationText }}</span>
            </div>
            <div class="tooltip-item">
              <div class="text-green-400 text-center mb-2">点击升级到 {{ currentLevel + 1 }} 级</div>
              <div class="tooltip-item" v-for="(cost, resourceType) in upgradeCost" :key="resourceType">
                <div class="resource-requirement sufficient">
                  <span class="resource-name">{{ getResourceName(resourceType) }}:</span>
                  <span class="resource-amount">{{ cost }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="tooltip-content">
            <div class="tooltip-item" v-for="(cost, resourceType) in upgradeCost" :key="resourceType">
              <div class="resource-requirement" :class="{ 'insufficient': gameStore.resources[resourceType] < cost }">
                <span class="resource-name">{{ getResourceName(resourceType) }}:</span>
                <span class="resource-amount">{{ gameStore.resources[resourceType] }}/{{ cost }}</span>
              </div>
            </div>
          </div>
        </div>
      </HoverCard>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { useGameStore } from '@/store/modules/gameStore.js'
import { getResourceName } from '@/config/resources.js'
import BuildingUpgradeHoverContent from '@/components/hover/BuildingUpgradeHoverContent.vue'
import HoverCard from '@/components/hover/HoverCard.vue'
import { 
  BUILDING_CONFIG, 
  calculateProduction, 
  calculateUpgradeCost,
  calculateUpgradeTime
} from '@/config/gameConfig.js'

export default {
  name: 'BuildingCard',
  components: {
    BuildingUpgradeHoverContent,
    HoverCard
  },
  props: {
    //=== building 建筑数据对象
    building: {
      type: Object,
      required: true
    },
    //=== icon SVG图标字符串
    icon: {
      type: String,
      default: ''
    },
    //=== buildingType 建筑类型
    buildingType: {
      type: String,
      required: true
    },
    //=== resourceType 资源类型
    resourceType: {
      type: String,
      required: true
    },
    //=== buildingIndex 建筑索引
    buildingIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['click'],
  setup(props) {
    const gameStore = useGameStore()
    const upgradeProgress = ref(0)
    const remainingTime = ref(0)
    const showTooltip = ref(false)
    let progressTimer = null
    
    //=== 当前建筑等级
    const currentLevel = computed(() => {
      return gameStore.buildings[props.buildingType][props.buildingIndex] || 0
    })
    
    //=== 建筑最大等级
    const maxLevel = computed(() => {
      const config = BUILDING_CONFIG[props.buildingType]
      return config?.maxLevel || config?.productionByLevel?.length - 1 || 10
    })
    
    //=== 建筑名称
    const buildingName = computed(() => {
      return props.building.name || '未知建筑'
    })
    
    //=== 当前产出
    const currentProduction = computed(() => {
      if (currentLevel.value === 0) return 0
      return calculateProduction(props.buildingType, currentLevel.value)
    })

    const nextProduction = computed(() => {
      if (currentLevel.value >= maxLevel.value) return currentProduction.value
      return calculateProduction(props.buildingType, currentLevel.value + 1)
    })

    const productionGain = computed(() => {
      return Math.max(0, nextProduction.value - currentProduction.value)
    })
    
    //=== 升级成本
    const upgradeCost = computed(() => {
      return calculateUpgradeCost(props.buildingType, currentLevel.value)
    })
    
    //=== 是否可以升级
    const canUpgrade = computed(() => {
      return gameStore.canUpgradeBuilding(props.buildingType, props.buildingIndex)
    })
    
    //=== 是否正在升级
    const isUpgrading = computed(() => {
      return gameStore.isBuildingUpgrading(props.buildingType, props.buildingIndex)
    })
    
    //=== 升级时间
    const upgradeTime = computed(() => {
      return calculateUpgradeTime(props.buildingType, currentLevel.value)
    })
    
    //=== 按钮样式类
    const getButtonClass = computed(() => {
      if (isUpgrading.value) {
        return 'bg-blue-600 text-white border border-blue-400'
      } else if (canUpgrade.value) {
        return 'bg-blue-500 text-white hover:bg-blue-600 border border-blue-300'
      } else {
        return 'bg-gray-600 text-gray-300 cursor-not-allowed border border-gray-500'
      }
    })
    
    //=== 按钮文字
    const getButtonText = computed(() => {
      if (isUpgrading.value) {
        return `升级中... ${Math.round(upgradeProgress.value)}%`
      } else {
        return `升级 (${currentLevel.value} → ${currentLevel.value + 1})`
      }
    })
    
    //=== 剩余时间文字
    const remainingTimeText = computed(() => {
      const upgrade = gameStore.buildingUpgrades[props.buildingType]?.[props.buildingIndex]
      if (!upgrade) return ''
      
      const now = Date.now()
      const elapsed = now - upgrade.startTime
      const remaining = Math.max(0, upgrade.duration - elapsed)
      
      if (remaining === 0) return '即将完成'
      
      const seconds = Math.ceil(remaining / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      
      if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟`
      } else if (minutes > 0) {
        return `${minutes}分钟${seconds % 60}秒`
      } else {
        return `${seconds}秒`
      }
    })

    const upgradeDurationText = computed(() => {
      const seconds = upgradeTime.value
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (hours > 0) return `${hours}小时${minutes % 60}分钟`
      if (minutes > 0) return `${minutes}分钟${seconds % 60}秒`
      return `${seconds}秒`
    })
    
    //=== 更新进度
    const updateProgress = () => {
      const upgrade = gameStore.buildingUpgrades[props.buildingType]?.[props.buildingIndex]
      if (!upgrade) {
        upgradeProgress.value = 0
        remainingTime.value = 0
        return
      }
      
      const now = Date.now()
      const elapsed = now - upgrade.startTime
      const progress = Math.min((elapsed / upgrade.duration) * 100, 100)
      const remaining = Math.max(Math.ceil((upgrade.duration - elapsed) / 1000), 0)
      
      upgradeProgress.value = progress
      remainingTime.value = remaining
    }
    
    //=== 启动进度定时器
    const startProgressTimer = () => {
      if (progressTimer) {
        clearInterval(progressTimer)
      }
      progressTimer = setInterval(updateProgress, 100)
    }
    
    //=== 停止进度定时器
    const stopProgressTimer = () => {
      if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
      }
    }
    
    //=== 升级建筑操作
    const upgradeBuilding = () => {
      const success = gameStore.upgradeBuilding(props.buildingType, props.buildingIndex)
      if (success) {
        console.log(`${buildingName.value}升级开始!`)
        startProgressTimer()
      } else {
        console.log('资源不足，无法升级建筑')
      }
    }
    
    //=== 监听升级状态变化
    const watchUpgradeStatus = () => {
      if (isUpgrading.value) {
        startProgressTimer()
      } else {
        stopProgressTimer()
        upgradeProgress.value = 0
        remainingTime.value = 0
      }
    }
    
    onMounted(() => {
      watchUpgradeStatus()
      // 监听升级状态变化
      watchEffect(() => {
        watchUpgradeStatus()
      })
    })
    
    onUnmounted(() => {
      stopProgressTimer()
    })
    
    return {
      gameStore,
      currentLevel,
      maxLevel,
      buildingName,
      currentProduction,
      productionGain,
      upgradeCost,
      canUpgrade,
      isUpgrading,
      upgradeTime,
      upgradeProgress,
      remainingTime,
      showTooltip,
      getButtonClass,
      getButtonText,
      remainingTimeText,
      upgradeDurationText,
      upgradeBuilding,
      getResourceName
    }
  },
  methods: {
    //=== handleClick 处理点击事件
    handleClick() {
      this.$emit('click', this.building)
    }
  }
}
</script>

<style scoped>
.building-card {
  @apply bg-gray-700 bg-opacity-70 border border-green-700 border-opacity-50 rounded p-3;
  @apply flex flex-col items-center gap-2 transition-all duration-200 hover:border-green-600 hover:border-opacity-70;
  @apply cursor-pointer relative;
  /* height: 100px; */
  /* 自定义修改 */
  background-color: #18181B
}

.building-level {
  @apply bg-green-500 text-black text-xs font-bold rounded-full w-6 h-6;
  @apply flex items-center justify-center absolute top-2 right-2;
}

.building-icon-center {
  @apply w-10 h-10 flex items-center justify-center mt-2;
}

.building-icon-center img {
  @apply w-10 h-10 object-contain;
}

.resource-icon {
  @apply w-12 h-12 flex items-center justify-center;
}

.resource-icon :deep(svg) {
  @apply w-full h-full;
}

.building-name {
  @apply text-white text-sm text-center;
}

.building-progress {
  @apply flex gap-2 justify-center;
}

.progress-dot {
  @apply w-6 h-2 bg-gray-600 rounded;
}

.progress-dot.active {
  @apply bg-green-500;
}

/* 浮动提醒样式 */
.upgrade-button-container {
  @apply relative;
}

.building-tooltip {
  @apply absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2;
  @apply bg-gray-800 bg-opacity-95 backdrop-blur-sm;
  @apply border border-green-500 border-opacity-50 rounded-lg;
  @apply p-3 min-w-[200px] max-w-[280px];
  @apply text-xs text-white;
  @apply shadow-lg shadow-black/50;
  @apply z-50;
  animation: tooltipFadeIn 0.2s ease-out;
}

.tooltip-arrow {
  @apply absolute top-full left-1/2 transform -translate-x-1/2;
  @apply w-0 h-0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(34, 197, 94, 0.5);
}

.tooltip-header {
  @apply text-green-400 font-semibold mb-2 text-center;
}

.tooltip-content {
  @apply space-y-1;
}

.tooltip-item {
  @apply flex flex-col;
}

.tooltip-item.upgrading {
  @apply text-blue-400 text-center;
}

.tooltip-item.max-level {
  @apply text-yellow-400 text-center;
}

.resource-requirement {
  @apply flex justify-between items-center;
  @apply py-1 px-2 rounded;
  @apply bg-gray-700 bg-opacity-50;
}

.resource-requirement.insufficient {
  @apply bg-red-900 bg-opacity-30 text-red-300;
}

.resource-requirement:not(.insufficient) {
  @apply text-green-300;
}

.resource-requirement.sufficient {
  @apply bg-green-900 bg-opacity-30 text-green-300;
}

.resource-name {
  @apply font-medium;
}

.resource-amount {
  @apply font-mono text-right;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .building-card {
    min-height: 104px !important;
    padding: 0.75rem !important;
  }

  .building-icon-center {
    @apply w-9 h-9 mt-1;
  }

  .resource-icon {
    @apply w-10 h-10;
  }
}
</style>
