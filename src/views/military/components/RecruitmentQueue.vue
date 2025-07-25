<template>
  <div class="recruitment-queue">
    <!-- 简化的一行显示 -->
    <div v-if="recruitmentQueue.length === 0" class="empty-queue">
      <span class="empty-text">当前没有征兵任务</span>
    </div>
    
    <div v-else class="queue-item">
      <div class="task-info">
        <div class="unit-icon">{{ getUnitIcon(recruitmentQueue[0].unitId) }}</div>
        <span class="unit-name">{{ recruitmentQueue[0].unitName }}</span>
        <span class="unit-count">×{{ recruitmentQueue[0].count }}</span>
      </div>
      
      <div class="task-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: getProgressPercentage(recruitmentQueue[0]) + '%' }"
          ></div>
        </div>
        <span class="time-remaining">{{ getTimeRemaining(recruitmentQueue[0]) }}</span>
      </div>
      
      <div v-if="recruitmentQueue.length > 1" class="queue-more">
        +{{ recruitmentQueue.length - 1 }}个任务
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../../../store/modules/gameStore.js'
import { getUnitById } from '../../../config/factionConfig.js'

export default {
  name: 'RecruitmentQueue',
  setup() {
    const gameStore = useGameStore()
    const updateTimer = ref(null)
    const currentTime = ref(Date.now()) // 用于强制触发响应式更新
    
    //=== 获取征兵队列
    const recruitmentQueue = computed(() => gameStore.recruitmentQueue)
    
    //=== 获取兵种图标
    const getUnitIcon = (unitId) => {
      const unit = getUnitById(unitId)
      return unit?.icon || '⚔️'
    }
    
    //=== 获取资源图标
    const getResourceIcon = (resource) => {
      const icons = {
        wood: '🪵',
        soil: '🏔️',
        iron: '⚒️',
        food: '🌾'
      }
      return icons[resource] || '❓'
    }
    
    //=== 计算进度百分比
    const getProgressPercentage = (task) => {
      // 使用currentTime.value来确保响应式更新
      const now = currentTime.value
      const elapsed = now - task.startTime
      const progress = Math.min(100, (elapsed / task.duration) * 100)
      return Math.max(0, progress)
    }
    
    //=== 获取进度文本
    const getProgressText = (task) => {
      const percentage = getProgressPercentage(task)
      return `进度: ${Math.floor(percentage)}%`
    }
    
    //=== 计算剩余时间
    const getTimeRemaining = (task) => {
      // 使用currentTime.value来确保响应式更新
      const now = currentTime.value
      const elapsed = now - task.startTime
      const remaining = Math.max(0, task.duration - elapsed)
      
      if (remaining === 0) {
        return '即将完成'
      }
      
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      
      if (minutes > 0) {
        return `${minutes}分${seconds}秒`
      } else {
        return `${seconds}秒`
      }
    }
    
    //=== 启动定时器更新进度
    const startUpdateTimer = () => {
      updateTimer.value = setInterval(() => {
        // 更新当前时间，触发响应式更新
        currentTime.value = Date.now()
      }, 1000)
    }
    
    //=== 停止定时器
    const stopUpdateTimer = () => {
      if (updateTimer.value) {
        clearInterval(updateTimer.value)
        updateTimer.value = null
      }
    }
    
    //=== 组件挂载时启动定时器
    onMounted(() => {
      startUpdateTimer()
    })
    
    //=== 组件卸载时清理定时器
    onUnmounted(() => {
      stopUpdateTimer()
    })
    
    return {
      recruitmentQueue,
      getUnitIcon,
      getResourceIcon,
      getProgressPercentage,
      getProgressText,
      getTimeRemaining
    }
  }
}
</script>

<style scoped>
.recruitment-queue {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-3;
}

/* 空队列样式 */
.empty-queue {
  @apply text-center;
}

.empty-text {
  @apply text-sm text-gray-500;
}

/* 简化的队列项样式 */
.queue-item {
  @apply flex items-center justify-between gap-3;
}

.task-info {
  @apply flex items-center gap-2;
}

.unit-icon {
  @apply text-lg;
}

.unit-name {
  @apply font-medium text-gray-900 text-sm;
}

.unit-count {
  @apply text-sm text-gray-600;
}

.task-progress {
  @apply flex items-center gap-2 flex-1 max-w-xs;
}

.progress-bar {
  @apply flex-1 bg-gray-200 rounded-full h-2 overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-out;
}

.time-remaining {
  @apply text-xs text-green-600 font-medium whitespace-nowrap;
}

.queue-more {
  @apply text-xs text-gray-500 whitespace-nowrap;
}
</style>