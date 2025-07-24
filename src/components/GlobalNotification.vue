<template>
  <div class="notification-container">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'notification-item',
          `notification-${notification.type}`
        ]"
      >
        <div class="notification-icon">
          <NotificationIcons :name="getIcon(notification.type)" />
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button 
          class="notification-close"
          @click="removeNotification(notification.id)"
        >
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useNotificationStore } from '../store/modules/notificationStore'
import { storeToRefs } from 'pinia'
import NotificationIcons from './icons/NotificationIcons.vue'

export default defineComponent({
  name: 'GlobalNotification',
  components: {
    NotificationIcons
  },
  setup() {
    const notificationStore = useNotificationStore()
    
    // 使用 storeToRefs 确保响应式
    const { notifications } = storeToRefs(notificationStore)
    
    //=== 获取通知图标
    const getIcon = (type) => {
      const icons = {
        success: 'CheckCircleIcon',
        warning: 'ExclamationTriangleIcon', 
        info: 'InformationCircleIcon',
        error: 'XCircleIcon'
      }
      return icons[type] || 'InformationCircleIcon'
    }
    
    //=== 移除通知
    const removeNotification = (id) => {
      console.log('点击关闭通知，ID:', id)
      notificationStore.removeNotification(id)
    }
    
    return {
      notifications,
      getIcon,
      removeNotification
    }
  }
})
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 400px;
  padding: 16px;
  margin-bottom: 12px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border-left: 5px solid;
  border: 1px solid rgba(0, 0, 0, 0.12);
  pointer-events: auto;
  transition: all 0.3s ease;
}

.notification-item:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* 不同类型的通知样式 */
.notification-success {
  border-left-color: #047857;
  background: linear-gradient(135deg, rgba(4, 120, 87, 0.05), #ffffff);
  border-color: rgba(4, 120, 87, 0.2);
}

.notification-warning {
  border-left-color: #b45309;
  background: linear-gradient(135deg, rgba(180, 83, 9, 0.05), #ffffff);
  border-color: rgba(180, 83, 9, 0.2);
}

.notification-info {
  border-left-color: #1d4ed8;
  background: linear-gradient(135deg, rgba(29, 78, 216, 0.05), #ffffff);
  border-color: rgba(29, 78, 216, 0.2);
}

.notification-error {
  border-left-color: #b91c1c;
  background: linear-gradient(135deg, rgba(185, 28, 28, 0.05), #ffffff);
  border-color: rgba(185, 28, 28, 0.2);
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-top: 2px;
}

.notification-success .notification-icon {
  color: #047857;
}

.notification-warning .notification-icon {
  color: #b45309;
}

.notification-info .notification-icon {
  color: #1d4ed8;
}

.notification-error .notification-icon {
  color: #b91c1c;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 700;
  font-size: 14px;
  color: #000000;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-message {
  font-size: 13px;
  color: #1f2937;
  line-height: 1.4;
  word-wrap: break-word;
}

.notification-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: #4b5563;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.12);
  color: #000000;
}

/* 动画效果 */
.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(-100%) scale(0.8);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(-100%) scale(0.8);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .notification-container {
    top: 10px;
    left: 10px;
    right: 10px;
  }
  
  .notification-item {
    min-width: auto;
    max-width: none;
    margin-bottom: 8px;
  }
}
</style>