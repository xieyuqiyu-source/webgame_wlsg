<template>
  <div class="recruitment-queue">
    <!-- 征兵队列说明 -->
    <div class="description-box">
      <p class="description-text">
        当前征兵队列将持续训练各种兵种，完成后自动加入本城直属军队。征兵时间根据兵种数量累计计算。
      </p>
    </div>
    
    <!-- 征兵任务列表 -->
    <div v-if="recruitmentQueue.length === 0" class="empty-queue">
      <span class="empty-text">当前没有征兵任务</span>
    </div>
    
    <div v-else class="queue-tasks">
      <div 
        v-for="(task, index) in recruitmentQueue.slice(0, 5)" 
        :key="task.id || index"
        class="task-item"
      >
        <!-- 任务信息一行展示 -->
        <div class="task-info">
          <span class="unit-icon">{{ getUnitIcon(task.unitId) }}</span>
          <span class="unit-name">{{ task.unitName }}</span>
          <span class="unit-count">×{{ task.count }}</span>
          <span class="time-remaining">{{ getTimeRemaining(task) }}</span>
        </div>
        <!-- 加速按钮在右边 -->
        <div class="task-actions">
          <button 
            class="accelerate-btn"
            @click="handleAccelerate(task)"
            :disabled="getTimeRemaining(task) === '即将完成'"
            :title="getAccelerateCost(task) + ' 金币加速'"
          >
            ⚡
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useMilitaryHelpers } from '@/hooks/useMilitaryHelpers.js'

export default {
  name: 'RecruitmentQueue',
  setup() {
    const { gameStore, getUnitIcon, recruitmentQueue } = useMilitaryHelpers()
    const updateTimer = ref(null)
    const currentTime = ref(Date.now()) // 用于强制触发响应式更新
    
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
    
    //=== 计算加速所需金币
    const getAccelerateCost = (task) => {
      const now = currentTime.value
      const elapsed = now - task.startTime
      const remaining = Math.max(0, task.duration - elapsed)
      const remainingMinutes = Math.ceil(remaining / 60000)
      return Math.max(10, remainingMinutes * 10)
    }
    
    //=== 处理加速征兵
    const handleAccelerate = (task) => {
      const cost = getAccelerateCost(task)
      if (confirm(`确定要花费 ${cost} 金币加速征兵吗？\n将缩短50%的剩余时间`)) {
        gameStore.accelerateRecruitment(task.id)
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
      getProgressPercentage,
      getProgressText,
      getTimeRemaining,
      getAccelerateCost,
      handleAccelerate
    }
  }
}
</script>

<style scoped>
.recruitment-queue {
  @apply bg-transparent p-3 mb-2;
}

/* 说明文字样式 */
.description-box {
  @apply bg-gray-700 bg-opacity-50 border border-green-700 border-opacity-30 rounded p-4 mb-2;
}

.description-text {
  @apply text-white text-sm leading-5 m-0;
}

/* 空队列样式 */
.empty-queue {
  @apply text-center py-2;
}

.empty-text {
  @apply text-sm text-gray-500;
}

/* 征兵任务列表样式 */
.queue-tasks {
  @apply flex gap-2;
}

.task-item {
  @apply flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3;
  /* 5等分宽度固定 */
  width: calc(20% - 0.4rem);
  min-width: 0;
}

/* 任务信息一行展示 */
.task-info {
  @apply flex items-center gap-1 min-w-0 flex-1;
}

.task-actions {
  @apply flex-shrink-0 ml-2;
}

.accelerate-btn {
  @apply bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-sm transition-colors;
}

.unit-icon {
  @apply text-base flex-shrink-0;
}

.unit-name {
  @apply font-medium text-gray-900 text-xs truncate;
}

.unit-count {
  @apply text-xs text-gray-600 flex-shrink-0;
}

.time-remaining {
  @apply text-xs text-green-600 font-medium flex-shrink-0;
}
</style>
