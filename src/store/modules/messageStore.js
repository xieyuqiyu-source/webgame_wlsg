//=== 信函系统状态管理

import { defineStore } from 'pinia'
import { generateUUID } from '@/utils/uuid.js'

// 信函类型枚举
export const MESSAGE_TYPES = {
  SYSTEM: 'system',        // 系统通知
  TASK: 'task',           // 任务相关
  MILITARY: 'military',   // 军情报告
  ACTIVITY: 'activity',   // 活动通知
  REWARD: 'reward',       // 奖励信息
  ALLIANCE: 'alliance'    // 联盟消息
}

// 信函状态枚举
export const MESSAGE_STATUS = {
  UNREAD: 'unread',       // 未读
  READ: 'read',           // 已读
  ARCHIVED: 'archived'    // 已归档
}

const RESOURCE_KEYS = ['wood', 'soil', 'iron', 'food']

const formatResourceBundle = (bundle = {}) => {
  const labels = {
    wood: '木材',
    soil: '泥土',
    iron: '铁矿',
    food: '粮食'
  }

  const items = RESOURCE_KEYS
    .map((key) => [labels[key], Math.floor(bundle?.[key] || 0)])
    .filter(([, amount]) => amount > 0)

  return items.length > 0
    ? items.map(([label, amount]) => `${label} ${amount}`).join(' / ')
    : '无'
}

const getResourceTotal = (bundle = {}) => (
  RESOURCE_KEYS.reduce((sum, key) => sum + Math.max(0, Math.floor(bundle?.[key] || 0)), 0)
)

const getLossTotal = (entries = []) => (
  (entries || []).reduce((sum, entry) => sum + Math.max(0, entry?.count || 0), 0)
)

export const useMessageStore = defineStore('message', {
  state: () => ({
    //=== 信函列表
    messages: [],
    
    //=== 未读信函数量
    unreadCount: 0,
    
    //=== 当前选中的信函
    selectedMessage: null,
    
    //=== 筛选条件
    filterType: 'all', // all, system, task, military, activity, reward, alliance
    filterStatus: 'all' // all, unread, read, archived
  }),
  
  getters: {
    //=== 获取筛选后的信函列表
    filteredMessages: (state) => {
      let filtered = state.messages
      
      // 按类型筛选
      if (state.filterType !== 'all') {
        filtered = filtered.filter(msg => msg.type === state.filterType)
      }
      
      // 按状态筛选
      if (state.filterStatus !== 'all') {
        filtered = filtered.filter(msg => msg.status === state.filterStatus)
      }
      
      // 按时间倒序排列
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
    
    //=== 获取未读信函数量
    getUnreadCount: (state) => {
      return state.messages.filter(msg => msg.status === MESSAGE_STATUS.UNREAD).length
    },
    
    //=== 按类型分组的信函数量
    getMessageCountByType: (state) => {
      const counts = {}
      Object.values(MESSAGE_TYPES).forEach(type => {
        counts[type] = state.messages.filter(msg => msg.type === type).length
      })
      return counts
    }
  },
  
  actions: {
    //=== 添加新信函
    addMessage(messageData) {
      const message = {
        id: generateUUID(),
        type: messageData.type || MESSAGE_TYPES.SYSTEM,
        title: messageData.title,
        content: messageData.content,
        status: MESSAGE_STATUS.UNREAD,
        createdAt: new Date().toISOString(),
        readAt: null,
        attachments: messageData.attachments || [], // 附件（如奖励物品）
        sender: messageData.sender || '系统',
        priority: messageData.priority || 'normal', // low, normal, high
        ...messageData
      }
      
      this.messages.unshift(message)
      this.updateUnreadCount()
      this.saveMessages()
      
      return message
    },
    
    //=== 标记信函为已读
    markAsRead(messageId) {
      const message = this.messages.find(msg => msg.id === messageId)
      if (message && message.status === MESSAGE_STATUS.UNREAD) {
        message.status = MESSAGE_STATUS.READ
        message.readAt = new Date().toISOString()
        this.updateUnreadCount()
        this.saveMessages()
      }
    },
    
    //=== 标记所有信函为已读
    markAllAsRead() {
      const now = new Date().toISOString()
      this.messages.forEach(msg => {
        if (msg.status === MESSAGE_STATUS.UNREAD) {
          msg.status = MESSAGE_STATUS.READ
          msg.readAt = now
        }
      })
      this.updateUnreadCount()
      this.saveMessages()
    },
    
    //=== 归档信函
    archiveMessage(messageId) {
      const message = this.messages.find(msg => msg.id === messageId)
      if (message) {
        message.status = MESSAGE_STATUS.ARCHIVED
        this.updateUnreadCount()
        this.saveMessages()
      }
    },
    
    //=== 删除信函
    deleteMessage(messageId) {
      const index = this.messages.findIndex(msg => msg.id === messageId)
      if (index !== -1) {
        this.messages.splice(index, 1)
        this.updateUnreadCount()
        this.saveMessages()
      }
    },
    
    //=== 批量删除信函
    deleteMessages(messageIds) {
      this.messages = this.messages.filter(msg => !messageIds.includes(msg.id))
      this.updateUnreadCount()
      this.saveMessages()
    },
    
    //=== 设置筛选条件
    setFilter(type, status) {
      if (type !== undefined) this.filterType = type
      if (status !== undefined) this.filterStatus = status
    },
    
    //=== 选择信函
    selectMessage(messageId) {
      this.selectedMessage = this.messages.find(msg => msg.id === messageId) || null
      if (this.selectedMessage) {
        this.markAsRead(messageId)
      }
    },
    
    //=== 更新未读数量
    updateUnreadCount() {
      this.unreadCount = this.getUnreadCount
    },
    
    //=== 保存信函数据到本地存储
    saveMessages() {
      try {
        const messageData = {
          messages: this.messages,
          lastSaveTime: Date.now()
        }
        localStorage.setItem('wlsg_messages', JSON.stringify(messageData))
      } catch (error) {
        console.error('保存信函数据失败:', error)
      }
    },
    
    //=== 从本地存储加载信函数据
    loadMessages() {
      try {
        const savedData = localStorage.getItem('wlsg_messages')
        if (savedData) {
          const messageData = JSON.parse(savedData)
          this.messages = messageData.messages || []
          this.updateUnreadCount()
        }
      } catch (error) {
        console.error('加载信函数据失败:', error)
        this.messages = []
      }
    },
    
    //=== 清空所有信函
    clearAllMessages() {
      this.messages = []
      this.unreadCount = 0
      this.selectedMessage = null
      this.saveMessages()
    },
    
    //=== 添加系统通知信函
    addSystemMessage(title, content, priority = 'normal') {
      return this.addMessage({
        type: MESSAGE_TYPES.SYSTEM,
        title,
        content,
        priority,
        sender: '系统'
      })
    },
    
    //=== 添加任务信函
    addTaskMessage(title, content, taskData = {}) {
      return this.addMessage({
        type: MESSAGE_TYPES.TASK,
        title,
        content,
        sender: '任务系统',
        taskData
      })
    },
    
    //=== 添加军情信函
    addMilitaryMessage(title, content, battleData = {}) {
      return this.addMessage({
        type: MESSAGE_TYPES.MILITARY,
        title,
        content,
        sender: '军情司',
        priority: 'high',
        battleData
      })
    },

    addBattleReportMessage({ task, report, storedResources = {}, overflowResources = {} }) {
      const actionLabel = task?.actionLabel || '出征'
      const targetName = task?.target?.name || '未知目标'
      const attackerWon = report?.battleResult === 'ATTACKER_VICTORY'
      const attackerLosses = getLossTotal(report?.attacker?.losses)
      const defenderLosses = getLossTotal(report?.defender?.losses)
      const plunderedResources = report?.details?.plundered || {}
      const totalLoot = getResourceTotal(plunderedResources)
      const storedTotal = getResourceTotal(storedResources)
      const overflowTotal = getResourceTotal(overflowResources)

      const contentLines = [
        `${actionLabel}${attackerWon ? '完成' : '失利'}，目标：${targetName}`,
        `我军阵亡 ${attackerLosses}，敌军阵亡 ${defenderLosses}`
      ]

      if (totalLoot > 0) {
        contentLines.push(`带回资源：${formatResourceBundle(plunderedResources)}`)
      }
      if (storedTotal > 0) {
        contentLines.push(`实际入仓：${formatResourceBundle(storedResources)}`)
      }
      if (overflowTotal > 0) {
        contentLines.push(`仓库不足未入仓：${formatResourceBundle(overflowResources)}`)
      }

      return this.addMilitaryMessage(
        `${actionLabel}战报：${targetName}`,
        contentLines.join('\n'),
        {
          enemy: targetName,
          result: attackerWon ? 'victory' : 'defeat',
          casualties: `我军 ${attackerLosses} / 敌军 ${defenderLosses}`,
          loot: formatResourceBundle(plunderedResources),
          storedLoot: formatResourceBundle(storedResources),
          overflowLoot: formatResourceBundle(overflowResources),
          rawBattleReport: report
        }
      )
    },
    
    //=== 添加奖励信函
    addRewardMessage(title, content, rewards = []) {
      return this.addMessage({
        type: MESSAGE_TYPES.REWARD,
        title,
        content,
        sender: '奖励系统',
        attachments: rewards
      })
    }
  }
})
