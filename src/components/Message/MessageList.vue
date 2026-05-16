<template>
  <div class="message-list">
    <!-- 信函筛选器 -->
    <div class="message-filters">
      <div class="filter-group">
        <label>类型筛选：</label>
        <select v-model="messageStore.filterType" @change="onFilterChange">
          <option value="all">全部</option>
          <option value="system">系统通知</option>
          <option value="task">任务相关</option>
          <option value="military">军情报告</option>
          <option value="activity">活动通知</option>
          <option value="reward">奖励信息</option>
          <option value="alliance">联盟消息</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>状态筛选：</label>
        <select v-model="messageStore.filterStatus" @change="onFilterChange">
          <option value="all">全部</option>
          <option value="unread">未读</option>
          <option value="read">已读</option>
          <option value="archived">已归档</option>
        </select>
      </div>
      
      <div class="filter-actions">
        <button @click="markAllAsRead" :disabled="messageStore.unreadCount === 0">
          全部标记已读
        </button>
        <button @click="clearMessages" class="danger">
          清空信函
        </button>
      </div>
    </div>
    
    <!-- 信函统计 -->
    <div class="message-stats">
      <span class="total-count">总计：{{ messageStore.messages.length }} 封</span>
      <span class="unread-count" v-if="messageStore.unreadCount > 0">
        未读：{{ messageStore.unreadCount }} 封
      </span>
    </div>
    
    <!-- 信函列表 -->
    <div class="message-items">
      <div 
        v-for="message in messageStore.filteredMessages" 
        :key="message.id"
        class="message-item"
        :class="{
          'unread': message.status === 'unread',
          'selected': messageStore.selectedMessage?.id === message.id,
          'high-priority': message.priority === 'high'
        }"
        @click="selectMessage(message)"
      >
        <!-- 信函状态指示器 -->
        <div class="message-status">
          <div 
            class="status-dot"
            :class="message.status"
          ></div>
        </div>
        
        <!-- 信函类型图标 -->
        <div class="message-type">
          <i :class="getTypeIcon(message.type)"></i>
        </div>
        
        <!-- 信函内容 -->
        <div class="message-content">
          <div class="message-header">
            <h4 class="message-title">{{ message.title }}</h4>
            <span class="message-time">{{ formatTime(message.createdAt) }}</span>
          </div>
          
          <div class="message-meta">
            <span class="message-sender">{{ message.sender }}</span>
            <span class="message-type-text">{{ getTypeText(message.type) }}</span>
          </div>
          
          <p class="message-preview">{{ getContentPreview(message.content) }}</p>
          
          <!-- 附件指示器 -->
          <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
            <i class="icon-attachment"></i>
            <span>{{ message.attachments.length }} 个附件</span>
          </div>
        </div>
        
        <!-- 信函操作 -->
        <div class="message-actions">
          <button 
            @click.stop="archiveMessage(message.id)"
            v-if="message.status !== 'archived'"
            class="action-btn archive"
            title="归档"
          >
            <i class="icon-archive"></i>
          </button>
          
          <button 
            @click.stop="deleteMessage(message.id)"
            class="action-btn delete"
            title="删除"
          >
            <i class="icon-delete"></i>
          </button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="messageStore.filteredMessages.length === 0" class="empty-state">
        <i class="icon-empty"></i>
        <p>暂无信函</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMessageStore, MESSAGE_TYPES } from '@/store/modules/messageStore.js'
// 简单的时间格式化函数，替代date-fns
const formatDistanceToNow = (date) => {
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

const messageStore = useMessageStore()

// 选择信函
const selectMessage = (message) => {
  messageStore.selectMessage(message.id)
}

// 归档信函
const archiveMessage = (messageId) => {
  messageStore.archiveMessage(messageId)
}

// 删除信函
const deleteMessage = (messageId) => {
  if (confirm('确定要删除这封信函吗？')) {
    messageStore.deleteMessage(messageId)
  }
}

// 全部标记已读
const markAllAsRead = () => {
  messageStore.markAllAsRead()
}

// 清空信函
const clearMessages = () => {
  if (confirm('确定要清空所有信函吗？此操作不可恢复！')) {
    messageStore.clearAllMessages()
  }
}

// 筛选变化
const onFilterChange = () => {
  // 筛选变化时的处理逻辑
}

// 获取类型图标
const getTypeIcon = (type) => {
  const icons = {
    system: 'icon-system',
    task: 'icon-task',
    military: 'icon-military',
    activity: 'icon-activity',
    reward: 'icon-reward',
    alliance: 'icon-alliance'
  }
  return icons[type] || 'icon-message'
}

// 获取类型文本
const getTypeText = (type) => {
  const texts = {
    system: '系统通知',
    task: '任务相关',
    military: '军情报告',
    activity: '活动通知',
    reward: '奖励信息',
    alliance: '联盟消息'
  }
  return texts[type] || '未知类型'
}

// 格式化时间
const formatTime = (timeString) => {
  try {
    return formatDistanceToNow(new Date(timeString))
  } catch (error) {
    return '时间未知'
  }
}

// 获取内容预览
const getContentPreview = (content) => {
  if (!content) return ''
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}
</script>

<style scoped>
.message-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

/* 筛选器样式 */
.message-filters {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #6c757d;
  white-space: nowrap;
}

.filter-group select {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.filter-actions button {
  padding: 6px 12px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.filter-actions button:hover {
  background: #0056b3;
}

.filter-actions button:disabled {
  background: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

.filter-actions button.danger {
  background: #dc3545;
  border-color: #dc3545;
}

.filter-actions button.danger:hover {
  background: #c82333;
}

/* 统计信息样式 */
.message-stats {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6c757d;
}

.unread-count {
  color: #dc3545;
  font-weight: bold;
}

/* 信函列表样式 */
.message-items {
  flex: 1;
  overflow-y: auto;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s;
}

.message-item:hover {
  background: #f8f9fa;
}

.message-item.selected {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.message-item.unread {
  background: #fff3cd;
}

.message-item.high-priority {
  border-left: 4px solid #dc3545;
}

/* 状态指示器 */
.message-status {
  margin-right: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c757d;
}

.status-dot.unread {
  background: #dc3545;
}

.status-dot.read {
  background: #28a745;
}

.status-dot.archived {
  background: #6c757d;
}

/* 类型图标 */
.message-type {
  margin-right: 12px;
  font-size: 20px;
  color: #6c757d;
}

/* 信函内容 */
.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 12px;
  color: #6c757d;
  white-space: nowrap;
}

.message-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #6c757d;
}

.message-preview {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-attachments {
  margin-top: 8px;
  font-size: 12px;
  color: #007bff;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 操作按钮 */
.message-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e9ecef;
}

.action-btn.archive {
  color: #007bff;
}

.action-btn.delete {
  color: #dc3545;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 64px 16px;
  color: #6c757d;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .filter-group select {
    width: 100%;
  }
  
  .filter-actions {
    margin-left: 0;
    justify-content: stretch;
    flex-direction: column;
  }

  .filter-actions button {
    width: 100%;
  }
  
  .message-item {
    padding: 12px;
    align-items: flex-start;
    gap: 10px;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .message-meta {
    flex-direction: column;
    gap: 4px;
  }

  .message-stats {
    flex-direction: column;
    gap: 6px;
  }

  .message-actions {
    margin-left: 0;
    align-self: stretch;
    justify-content: flex-end;
  }
}
</style>
