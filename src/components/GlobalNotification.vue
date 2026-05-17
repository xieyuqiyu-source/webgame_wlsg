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
        @click="removeNotification(notification.id)"
      >
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button
          class="notification-close"
          type="button"
          aria-label="关闭通知"
          @click.stop="removeNotification(notification.id)"
        >
          x
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '../store/modules/notificationStore'

export default defineComponent({
  name: 'GlobalNotification',
  setup() {
    const notificationStore = useNotificationStore()
    const { notifications } = storeToRefs(notificationStore)

    const removeNotification = (id) => {
      notificationStore.removeNotification(id)
    }

    return {
      notifications,
      removeNotification
    }
  }
})
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 22px;
  right: 22px;
  z-index: 9999;
  pointer-events: none;
  width: min(100vw - 44px, 420px);
}

.notification-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24px;
  align-items: start;
  column-gap: 12px;
  width: 100%;
  min-height: 64px;
  padding: 11px 14px;
  margin-bottom: 10px;
  border-radius: 7px;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.notification-item:hover {
  transform: translateY(-1px);
}

.notification-success {
  background: #1f815f;
}

.notification-warning {
  background: #9a650f;
}

.notification-info {
  background: #235a98;
}

.notification-error {
  background: #9a3d42;
}

.notification-content {
  min-width: 0;
}

.notification-title {
  margin-bottom: 3px;
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
}

.notification-message {
  color: rgba(255, 255, 255, 0.96);
  font-size: 14px;
  line-height: 1.35;
  word-wrap: break-word;
}

.notification-close {
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: rgba(8, 22, 18, 0.96);
  cursor: pointer;
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
  transition: opacity 0.2s ease;
}

.notification-close:hover {
  opacity: 0.72;
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
    grid-template-columns: minmax(0, 1fr) 24px;
    min-height: 60px;
    margin-bottom: 8px;
    padding: 12px 14px;
  }

  .notification-item:nth-child(n + 3) {
    display: none;
  }

  .notification-title {
    font-size: 16px;
  }

  .notification-message {
    font-size: 13px;
  }

  .notification-close {
    width: 24px;
    height: 24px;
    font-size: 24px;
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
