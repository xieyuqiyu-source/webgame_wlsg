<template>
  <div class="notification-test-page">
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
        通知系统测试页面
      </h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- 成功通知 -->
        <div class="test-card">
          <h3 class="text-lg font-semibold mb-4 text-green-600">成功通知</h3>
          <button 
            @click="testSuccessNotification"
            class="btn btn-success w-full mb-2"
          >
            建筑升级完成
          </button>
          <button 
            @click="testWarehouseUpgrade"
            class="btn btn-success w-full"
          >
            仓库升级完成
          </button>
        </div>
        
        <!-- 警告通知 -->
        <div class="test-card">
          <h3 class="text-lg font-semibold mb-4 text-yellow-600">警告通知</h3>
          <button 
            @click="testResourceFull"
            class="btn btn-warning w-full mb-2"
          >
            资源爆仓警告
          </button>
          <button 
            @click="testCustomWarning"
            class="btn btn-warning w-full"
          >
            自定义警告
          </button>
        </div>
        
        <!-- 信息通知 -->
        <div class="test-card">
          <h3 class="text-lg font-semibold mb-4 text-blue-600">信息通知</h3>
          <button 
            @click="testInfoNotification"
            class="btn btn-info w-full mb-2"
          >
            升级进行中
          </button>
          <button 
            @click="testMaxLevel"
            class="btn btn-info w-full"
          >
            已达最高等级
          </button>
        </div>
        
        <!-- 错误通知 -->
        <div class="test-card">
          <h3 class="text-lg font-semibold mb-4 text-red-600">错误通知</h3>
          <button 
            @click="testResourceInsufficient"
            class="btn btn-error w-full mb-2"
          >
            资源不足
          </button>
          <button 
            @click="testCustomError"
            class="btn btn-error w-full"
          >
            自定义错误
          </button>
        </div>
      </div>
      
      <!-- 批量测试 -->
      <div class="test-card mb-8">
        <h3 class="text-lg font-semibold mb-4 text-gray-700">批量测试</h3>
        <div class="flex flex-wrap gap-4">
          <button 
            @click="testMultipleNotifications"
            class="btn btn-primary"
          >
            发送多个通知
          </button>
          <button 
            @click="testLongMessage"
            class="btn btn-primary"
          >
            长消息测试
          </button>
          <button 
            @click="clearAllNotifications"
            class="btn btn-secondary"
          >
            清空所有通知
          </button>
        </div>
      </div>
      
      <!-- 返回游戏 -->
      <div class="text-center">
        <router-link to="/" class="btn btn-primary">
          返回游戏
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useNotificationStore } from '../store/modules/notificationStore'

export default defineComponent({
  name: 'NotificationTest',
  setup() {
    const notificationStore = useNotificationStore()
    
    //=== 测试成功通知
    const testSuccessNotification = () => {
      notificationStore.addBuildingUpgradeCompleteNotification('木材厂(1)', 5)
    }
    
    //=== 测试仓库升级通知
    const testWarehouseUpgrade = () => {
      notificationStore.addWarehouseUpgradeCompleteNotification(8)
    }
    
    //=== 测试资源爆仓通知
    const testResourceFull = () => {
      notificationStore.addResourceFullNotification('木材')
    }
    
    //=== 测试自定义警告
    const testCustomWarning = () => {
      notificationStore.addWarningNotification(
        '系统维护提醒',
        '游戏将在30分钟后进行维护，请提前做好准备',
        10000
      )
    }
    
    //=== 测试信息通知
    const testInfoNotification = () => {
      notificationStore.addInfoNotification(
        '升级进行中',
        '该建筑正在升级中，请等待完成',
        3000
      )
    }
    
    //=== 测试最高等级通知
    const testMaxLevel = () => {
      notificationStore.addInfoNotification(
        '已达最高等级',
        '该建筑已达到最高等级',
        3000
      )
    }
    
    //=== 测试资源不足通知
    const testResourceInsufficient = () => {
      notificationStore.addResourceInsufficientNotification('升级木材厂')
    }
    
    //=== 测试自定义错误
    const testCustomError = () => {
      notificationStore.addErrorNotification(
        '网络连接失败',
        '无法连接到服务器，请检查网络连接',
        6000
      )
    }
    
    //=== 测试多个通知
    const testMultipleNotifications = () => {
      setTimeout(() => notificationStore.addSuccessNotification('第一个', '这是第一个通知'), 0)
      setTimeout(() => notificationStore.addWarningNotification('第二个', '这是第二个通知'), 500)
      setTimeout(() => notificationStore.addInfoNotification('第三个', '这是第三个通知'), 1000)
      setTimeout(() => notificationStore.addErrorNotification('第四个', '这是第四个通知'), 1500)
    }
    
    //=== 测试长消息
    const testLongMessage = () => {
      notificationStore.addInfoNotification(
        '这是一个很长的标题用来测试通知组件的文本换行和显示效果',
        '这是一个很长的消息内容，用来测试通知组件在处理长文本时的显示效果和换行处理能力。这个消息包含了很多文字，可以用来验证组件的响应式设计和文本处理能力。',
        8000
      )
    }
    
    //=== 清空所有通知
    const clearAllNotifications = () => {
      notificationStore.clearAllNotifications()
    }
    
    return {
      testSuccessNotification,
      testWarehouseUpgrade,
      testResourceFull,
      testCustomWarning,
      testInfoNotification,
      testMaxLevel,
      testResourceInsufficient,
      testCustomError,
      testMultipleNotifications,
      testLongMessage,
      clearAllNotifications
    }
  }
})
</script>

<style scoped>
.notification-test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.test-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.test-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-success {
  @apply bg-green-500 text-white hover:bg-green-600 focus:ring-green-500;
}

.btn-warning {
  @apply bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500;
}

.btn-info {
  @apply bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500;
}

.btn-error {
  @apply bg-red-500 text-white hover:bg-red-600 focus:ring-red-500;
}

.btn-primary {
  @apply bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500;
}

.btn-secondary {
  @apply bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500;
}
</style>