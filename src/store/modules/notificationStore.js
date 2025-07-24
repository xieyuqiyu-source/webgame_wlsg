//=== 通知系统状态管理 Store

import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    //=== 通知列表
    notifications: [],
    //=== 通知ID计数器
    notificationIdCounter: 0,
    //=== 默认自动关闭时间（毫秒）
    defaultDuration: 5000,
    //=== 定时器映射表
    timers: new Map()
  }),
  
  actions: {
    /**
     * 添加通知
     * @param {Object} notification - 通知对象
     * @param {string} notification.type - 通知类型：success, warning, info, error
     * @param {string} notification.title - 通知标题
     * @param {string} notification.message - 通知内容
     * @param {number} notification.duration - 自动关闭时间（毫秒），0表示不自动关闭
     */
    addNotification({ type = 'info', title, message, duration = null }) {
      const id = ++this.notificationIdCounter
      const notification = {
        id,
        type,
        title,
        message,
        duration: duration !== null ? duration : this.defaultDuration,
        createdAt: Date.now()
      }
      
      // 添加到通知列表开头
      this.notifications.unshift(notification)
      
      // 限制通知数量，最多显示5个
      if (this.notifications.length > 5) {
        this.notifications = this.notifications.slice(0, 5)
      }
      
      // 设置自动关闭
      if (notification.duration > 0) {
        const timer = setTimeout(() => {
          this.removeNotification(id)
        }, notification.duration)
        
        // 保存定时器引用
        this.timers.set(id, timer)
      }
      
      return id
    },
    
    /**
     * 移除指定通知
     * @param {number} id - 通知ID
     */
    removeNotification(id) {
      console.log('移除通知，ID:', id, '当前通知数量:', this.notifications.length)
      
      // 清除对应的定时器
      if (this.timers.has(id)) {
        clearTimeout(this.timers.get(id))
        this.timers.delete(id)
      }
      
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
        console.log('通知已移除，剩余通知数量:', this.notifications.length)
      } else {
        console.log('未找到要移除的通知，ID:', id)
      }
    },
    
    /**
     * 清空所有通知
     */
    clearAllNotifications() {
      // 清除所有定时器
      this.timers.forEach(timer => clearTimeout(timer))
      this.timers.clear()
      
      this.notifications = []
    },
    
    /**
     * 添加成功通知
     * @param {string} title - 标题
     * @param {string} message - 内容
     * @param {number} duration - 持续时间
     */
    addSuccessNotification(title, message, duration = null) {
      return this.addNotification({
        type: 'success',
        title,
        message,
        duration
      })
    },
    
    /**
     * 添加警告通知
     * @param {string} title - 标题
     * @param {string} message - 内容
     * @param {number} duration - 持续时间
     */
    addWarningNotification(title, message, duration = null) {
      return this.addNotification({
        type: 'warning',
        title,
        message,
        duration
      })
    },
    
    /**
     * 添加信息通知
     * @param {string} title - 标题
     * @param {string} message - 内容
     * @param {number} duration - 持续时间
     */
    addInfoNotification(title, message, duration = null) {
      return this.addNotification({
        type: 'info',
        title,
        message,
        duration
      })
    },
    
    /**
     * 添加错误通知
     * @param {string} title - 标题
     * @param {string} message - 内容
     * @param {number} duration - 持续时间
     */
    addErrorNotification(title, message, duration = null) {
      return this.addNotification({
        type: 'error',
        title,
        message,
        duration
      })
    },
    
    /**
     * 添加建筑升级完成通知
     * @param {string} buildingName - 建筑名称
     * @param {number} level - 升级后等级
     */
    addBuildingUpgradeCompleteNotification(buildingName, level) {
      return this.addSuccessNotification(
        '建筑升级完成',
        `${buildingName} 已升级至 ${level} 级`,
        6000
      )
    },
    
    /**
     * 添加仓库升级完成通知
     * @param {number} level - 升级后等级
     */
    addWarehouseUpgradeCompleteNotification(level) {
      return this.addSuccessNotification(
        '仓库升级完成',
        `仓库已升级至 ${level} 级，存储容量增加`,
        6000
      )
    },
    
    /**
     * 添加资源爆仓通知
     * @param {string} resourceName - 资源名称
     */
    addResourceFullNotification(resourceName) {
      return this.addWarningNotification(
        '资源爆仓警告',
        `${resourceName} 已达到仓库上限，请及时升级仓库或消耗资源`,
        8000
      )
    },
    
    /**
     * 添加资源不足通知
     * @param {string} action - 操作名称
     */
    addResourceInsufficientNotification(action) {
      return this.addErrorNotification(
        '资源不足',
        `${action} 所需资源不足，请等待资源产出`,
        4000
      )
    }
  }
})