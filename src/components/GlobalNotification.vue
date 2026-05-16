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
  top: 18px;
  right: 18px;
  z-index: 9999;
  pointer-events: none;
  width: min(100vw - 32px, 392px);
}

.notification-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 28px;
  align-items: start;
  column-gap: 12px;
  width: 100%;
  padding: 14px 14px 14px 12px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(148, 163, 184, 0.22);
  pointer-events: auto;
  transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
  overflow: hidden;
  position: relative;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.18);
}

.notification-success {
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.96), rgba(255, 255, 255, 0.98));
  border-color: rgba(4, 120, 87, 0.16);
}

.notification-warning {
  background: linear-gradient(135deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 0.98));
  border-color: rgba(180, 83, 9, 0.16);
}

.notification-info {
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.96), rgba(255, 255, 255, 0.98));
  border-color: rgba(29, 78, 216, 0.16);
}

.notification-error {
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.96), rgba(255, 255, 255, 0.98));
  border-color: rgba(185, 28, 28, 0.16);
}

.notification-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 999px;
}

.notification-success::before {
  background: #059669;
}

.notification-warning::before {
  background: #d97706;
}

.notification-info::before {
  background: #2563eb;
}

.notification-error::before {
  background: #dc2626;
}

.notification-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
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
  font-size: 13px;
  color: #0f172a;
  margin-bottom: 3px;
  line-height: 1.35;
}

.notification-message {
  font-size: 12px;
  color: #475569;
  line-height: 1.45;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.notification-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(148, 163, 184, 0.12);
  color: #475569;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: rgba(148, 163, 184, 0.22);
  color: #0f172a;
}

.notification-enter-active {
  transition: all 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.notification-leave-active {
  transition: all 0.24s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(24px) scale(0.96);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.96);
}

.notification-move {
  transition: transform 0.3s ease;
}

@media (max-width: 640px) {
  .notification-container {
    top: auto;
    right: 12px;
    left: 12px;
    bottom: calc(86px + env(safe-area-inset-bottom, 0px));
    width: auto;
  }

  .notification-item {
    margin-bottom: 8px;
    grid-template-columns: 16px minmax(0, 1fr) 26px;
    padding: 12px 12px 12px 10px;
    border-radius: 16px;
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.14);
  }

  .notification-item:nth-child(n + 3) {
    display: none;
  }

  .notification-icon {
    width: 16px;
    height: 16px;
    margin-top: 1px;
  }

  .notification-title {
    font-size: 12px;
  }

  .notification-message {
    font-size: 11px;
    -webkit-line-clamp: 2;
  }

  .notification-close {
    width: 26px;
    height: 26px;
    font-size: 16px;
  }

  .notification-enter-from {
    transform: translateY(16px) scale(0.96);
  }

  .notification-leave-to {
    transform: translateY(16px) scale(0.96);
  }
}

@media (min-width: 641px) {
  .notification-item:nth-child(n + 4) {
    display: none;
  }
}
</style>
