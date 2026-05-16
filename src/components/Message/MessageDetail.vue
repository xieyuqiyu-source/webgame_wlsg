<template>
  <div class="message-detail">
    <!-- 信函详情内容 -->
    <div v-if="messageStore.selectedMessage" class="message-content">
      <!-- 信函头部 -->
      <div class="message-header">
        <div class="header-left">
          <div class="message-type-icon">
            <i :class="getTypeIcon(messageStore.selectedMessage.type)"></i>
          </div>
          <div class="header-info">
            <h2 class="message-title">{{ messageStore.selectedMessage.title }}</h2>
            <div class="message-meta">
              <span class="sender">发件人：{{ messageStore.selectedMessage.sender }}</span>
              <span class="type">类型：{{ getTypeText(messageStore.selectedMessage.type) }}</span>
              <span class="time">时间：{{ formatFullTime(messageStore.selectedMessage.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button 
            @click="archiveMessage"
            v-if="messageStore.selectedMessage.status !== 'archived'"
            class="action-btn archive"
          >
            <i class="icon-archive"></i>
            归档
          </button>
          
          <button 
            @click="deleteMessage"
            class="action-btn delete"
          >
            <i class="icon-delete"></i>
            删除
          </button>
        </div>
      </div>
      
      <!-- 优先级指示器 -->
      <div 
        v-if="messageStore.selectedMessage.priority === 'high'"
        class="priority-indicator high"
      >
        <i class="icon-priority"></i>
        <span>高优先级</span>
      </div>
      
      <!-- 信函正文 -->
      <div class="message-body">
        <div class="content-text" v-html="formatContent(messageStore.selectedMessage.content)"></div>
        
        <!-- 任务数据显示 -->
        <div v-if="messageStore.selectedMessage.taskData" class="task-data">
          <h4>任务信息</h4>
          <div class="task-info">
            <div v-if="messageStore.selectedMessage.taskData.taskName" class="info-item">
              <label>任务名称：</label>
              <span>{{ messageStore.selectedMessage.taskData.taskName }}</span>
            </div>
            <div v-if="messageStore.selectedMessage.taskData.progress" class="info-item">
              <label>完成进度：</label>
              <span>{{ messageStore.selectedMessage.taskData.progress }}%</span>
            </div>
            <div v-if="messageStore.selectedMessage.taskData.reward" class="info-item">
              <label>任务奖励：</label>
              <span>{{ messageStore.selectedMessage.taskData.reward }}</span>
            </div>
          </div>
        </div>
        
        <!-- 战斗数据显示 -->
        <div v-if="messageStore.selectedMessage.battleData" class="battle-data">
          <h4>战斗报告</h4>
          <div class="battle-info">
            <div v-if="messageStore.selectedMessage.battleData.enemy" class="info-item">
              <label>对手：</label>
              <span>{{ messageStore.selectedMessage.battleData.enemy }}</span>
            </div>
            <div v-if="messageStore.selectedMessage.battleData.result" class="info-item">
              <label>战斗结果：</label>
              <span :class="messageStore.selectedMessage.battleData.result">
                {{ getBattleResultText(messageStore.selectedMessage.battleData.result) }}
              </span>
            </div>
            <div v-if="messageStore.selectedMessage.battleData.casualties" class="info-item">
              <label>伤亡情况：</label>
              <span>{{ messageStore.selectedMessage.battleData.casualties }}</span>
            </div>
            <div v-if="messageStore.selectedMessage.battleData.loot" class="info-item">
              <label>战利品：</label>
              <span>{{ messageStore.selectedMessage.battleData.loot }}</span>
            </div>
            <div v-if="messageStore.selectedMessage.battleData.storedLoot" class="info-item">
              <label>入仓资源：</label>
              <span>{{ messageStore.selectedMessage.battleData.storedLoot }}</span>
            </div>
            <div
              v-if="messageStore.selectedMessage.battleData.overflowLoot && messageStore.selectedMessage.battleData.overflowLoot !== '无'"
              class="info-item"
            >
              <label>未入仓：</label>
              <span>{{ messageStore.selectedMessage.battleData.overflowLoot }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 附件列表 -->
      <div v-if="messageStore.selectedMessage.attachments && messageStore.selectedMessage.attachments.length > 0" class="message-attachments">
        <h4>附件</h4>
        <div class="attachment-list">
          <div 
            v-for="(attachment, index) in messageStore.selectedMessage.attachments"
            :key="index"
            class="attachment-item"
          >
            <div class="attachment-icon">
              <i :class="getAttachmentIcon(attachment.type)"></i>
            </div>
            <div class="attachment-info">
              <div class="attachment-name">{{ attachment.name }}</div>
              <div class="attachment-desc">{{ attachment.description }}</div>
            </div>
            <div class="attachment-actions">
              <button 
                @click="claimAttachment(attachment, index)"
                v-if="!attachment.claimed"
                class="claim-btn"
              >
                领取
              </button>
              <span v-else class="claimed-text">已领取</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 信函底部信息 -->
      <div class="message-footer">
        <div class="read-info" v-if="messageStore.selectedMessage.readAt">
          已读时间：{{ formatFullTime(messageStore.selectedMessage.readAt) }}
        </div>
      </div>
    </div>
    
    <!-- 未选择信函时的提示 -->
    <div v-else class="no-selection">
      <i class="icon-message-large"></i>
      <h3>请选择一封信函查看详情</h3>
      <p>从左侧列表中选择一封信函来查看完整内容</p>
    </div>
  </div>
</template>

<script setup>
import { useMessageStore } from '@/store/modules/messageStore.js'
import { useGameStore } from '@/store/modules/gameStore.js'
// 简单的时间格式化函数，替代date-fns
const formatFullTime = (timeString) => {
  try {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return '时间未知'
  }
}

const messageStore = useMessageStore()
const gameStore = useGameStore()

// 归档信函
const archiveMessage = () => {
  if (messageStore.selectedMessage) {
    messageStore.archiveMessage(messageStore.selectedMessage.id)
  }
}

// 删除信函
const deleteMessage = () => {
  if (messageStore.selectedMessage && confirm('确定要删除这封信函吗？')) {
    const messageId = messageStore.selectedMessage.id
    messageStore.deleteMessage(messageId)
    messageStore.selectedMessage = null
  }
}

// 领取附件
const claimAttachment = (attachment, index) => {
  if (attachment.type === 'resource') {
    // 领取资源奖励
    if (attachment.resources) {
      const { stored, overflow } = gameStore.storeLootedResources(attachment.resources)
      const storedTotal = Object.values(stored).reduce((sum, amount) => sum + (amount || 0), 0)
      const overflowTotal = Object.values(overflow).reduce((sum, amount) => sum + (amount || 0), 0)
      const storedText = storedTotal > 0 ? `成功入仓 ${storedTotal}` : '未能入仓'
      const overflowText = overflowTotal > 0 ? `，超出仓库 ${overflowTotal}` : ''
      alert(`领取完成：${attachment.name}，${storedText}${overflowText}`)
    } else {
      alert(`领取完成：${attachment.name}`)
    }
  } else if (attachment.type === 'item') {
    // 领取物品奖励
    // 这里可以添加物品系统的逻辑
    console.log('领取物品:', attachment)
    alert(`成功领取：${attachment.name}`)
  }
  
  // 标记附件为已领取
  attachment.claimed = true
  messageStore.saveMessages()
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

// 获取附件图标
const getAttachmentIcon = (type) => {
  const icons = {
    resource: 'icon-resource',
    item: 'icon-item',
    equipment: 'icon-equipment',
    blueprint: 'icon-blueprint'
  }
  return icons[type] || 'icon-attachment'
}

// 获取战斗结果文本
const getBattleResultText = (result) => {
  const texts = {
    victory: '胜利',
    defeat: '失败',
    draw: '平局'
  }
  return texts[result] || result
}



// 格式化内容（支持简单的HTML）
const formatContent = (content) => {
  if (!content) return ''
  
  // 将换行符转换为<br>
  return content.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.message-detail {
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 信函内容样式 */
.message-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #ffffff;
}

/* 信函头部 */
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.message-type-icon {
  width: 48px;
  height: 48px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #6c757d;
}

.header-info {
  flex: 1;
}

.message-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #212529;
  line-height: 1.3;
}

.message-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #6c757d;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f8f9fa;
}

.action-btn.archive {
  color: #007bff;
  border-color: #007bff;
}

.action-btn.archive:hover {
  background: #007bff;
  color: white;
}

.action-btn.delete {
  color: #dc3545;
  border-color: #dc3545;
}

.action-btn.delete:hover {
  background: #dc3545;
  color: white;
}

/* 优先级指示器 */
.priority-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
}

.priority-indicator.high {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

/* 信函正文 */
.message-body {
  margin-bottom: 24px;
}

.content-text {
  font-size: 16px;
  line-height: 1.6;
  color: #212529;
  margin-bottom: 24px;
}

/* 任务数据样式 */
.task-data,
.battle-data {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.task-data h4,
.battle-data h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #495057;
}

.task-info,
.battle-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item label {
  font-weight: 500;
  color: #6c757d;
  min-width: 80px;
}

.info-item span.victory {
  color: #28a745;
  font-weight: 600;
}

.info-item span.defeat {
  color: #dc3545;
  font-weight: 600;
}

.info-item span.draw {
  color: #ffc107;
  font-weight: 600;
}

/* 附件样式 */
.message-attachments {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.message-attachments h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #495057;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.attachment-icon {
  width: 40px;
  height: 40px;
  background: #e9ecef;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #6c757d;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-weight: 500;
  color: #212529;
  margin-bottom: 2px;
}

.attachment-desc {
  font-size: 14px;
  color: #6c757d;
}

.attachment-actions {
  margin-left: auto;
}

.claim-btn {
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.claim-btn:hover {
  background: #218838;
}

.claimed-text {
  color: #6c757d;
  font-size: 14px;
}

/* 信函底部 */
.message-footer {
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
  font-size: 14px;
  color: #6c757d;
}

/* 未选择状态 */
.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6c757d;
  padding: 48px;
}

.no-selection i {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.no-selection h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: #495057;
}

.no-selection p {
  margin: 0;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-content {
    padding: 16px;
  }
  
  .message-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    align-self: stretch;
    flex-direction: column;
  }
  
  .message-title {
    font-size: 20px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .attachment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .attachment-actions {
    margin-left: 0;
    align-self: stretch;
  }

  .claim-btn {
    width: 100%;
  }

  .no-selection {
    padding: 24px;
  }
}
</style>
