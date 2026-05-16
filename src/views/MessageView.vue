<template>
  <div class="message-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <i class="icon-message"></i>
          信函中心
        </h1>
        <div class="unread-badge" v-if="messageStore.unreadCount > 0">
          {{ messageStore.unreadCount }}
        </div>
      </div>
      
      <div class="header-actions">
        <button @click="addTestMessage" class="test-btn">
          <i class="icon-add"></i>
          添加测试信函
        </button>
        <button @click="refreshMessages" class="refresh-btn">
          <i class="icon-refresh"></i>
          刷新
        </button>
      </div>
    </div>
    
    <!-- 信函内容区域 -->
    <div class="message-content">
      <!-- 信函列表 -->
      <div class="message-list-panel">
        <MessageList />
      </div>
      
      <!-- 信函详情 -->
      <div class="message-detail-panel">
        <MessageDetail />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMessageStore, MESSAGE_TYPES } from '@/store/modules/messageStore.js'
import MessageList from '@/components/Message/MessageList.vue'
import MessageDetail from '@/components/Message/MessageDetail.vue'

const messageStore = useMessageStore()

// 页面挂载时加载信函数据
onMounted(() => {
  messageStore.loadMessages()
  
  // 如果是首次访问，添加欢迎信函
  if (messageStore.messages.length === 0) {
    addWelcomeMessage()
  }
})

// 添加欢迎信函
const addWelcomeMessage = () => {
  messageStore.addSystemMessage(
    '欢迎使用信函系统',
    `欢迎来到信函中心！\n\n这里将记录您的所有重要信息：\n• 系统通知和更新\n• 任务进度和奖励\n• 军情报告和战斗结果\n• 活动通知和特殊事件\n• 联盟消息和社交互动\n\n您可以通过左侧的筛选器来查看不同类型的信函，点击信函可以查看详细内容。\n\n祝您游戏愉快！`,
    'normal'
  )
}

// 刷新信函
const refreshMessages = () => {
  messageStore.loadMessages()
  // 这里可以添加从服务器同步信函的逻辑
}

// 添加测试信函（开发用）
const addTestMessage = () => {
  const testMessages = [
    {
      type: MESSAGE_TYPES.SYSTEM,
      title: '系统维护通知',
      content: '系统将于今晚23:00-01:00进行维护，维护期间无法登录游戏，请提前做好准备。',
      priority: 'high'
    },
    {
      type: MESSAGE_TYPES.TASK,
      title: '任务完成奖励',
      content: '恭喜您完成了"建设家园"任务！',
      taskData: {
        taskName: '建设家园',
        progress: 100,
        reward: '木材 x100, 石料 x50'
      },
      attachments: [
        {
          type: 'resource',
          name: '任务奖励',
          description: '木材 x100, 石料 x50',
          resources: { wood: 100, stone: 50 },
          claimed: false
        }
      ]
    },
    {
      type: MESSAGE_TYPES.MILITARY,
      title: '战斗报告',
      content: '您的部队在与敌军的战斗中取得了胜利！',
      battleData: {
        enemy: '野蛮人部落',
        result: 'victory',
        casualties: '轻微伤亡',
        loot: '金币 x200, 装备 x3'
      },
      priority: 'high'
    },
    {
      type: MESSAGE_TYPES.ACTIVITY,
      title: '双倍经验活动开启',
      content: '限时双倍经验活动现已开启，活动期间所有行动获得的经验翻倍！\n\n活动时间：即日起至本周日23:59\n\n快来参与吧！'
    },
    {
      type: MESSAGE_TYPES.REWARD,
      title: '每日登录奖励',
      content: '感谢您的每日登录！这是您今天的登录奖励。',
      attachments: [
        {
          type: 'resource',
          name: '每日奖励',
          description: '金币 x50, 食物 x20',
          resources: { gold: 50, food: 20 },
          claimed: false
        }
      ]
    },
    {
      type: MESSAGE_TYPES.ALLIANCE,
      title: '联盟邀请',
      content: '"钢铁兄弟会"联盟邀请您加入！\n\n联盟等级：15\n成员数量：45/50\n联盟福利：资源产量+20%\n\n是否接受邀请？'
    }
  ]
  
  // 随机选择一个测试信函
  const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)]
  messageStore.addMessage(randomMessage)
}
</script>

<style scoped>
.message-view {
  height: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  padding: 0;
  box-sizing: border-box;
}

/* 页面头部 */
.page-header {
  background: #ffffff;
  padding: 18px 22px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: none;
  margin-bottom: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #212529;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title i {
  font-size: 28px;
  color: #007bff;
}

.unread-badge {
  background: #dc3545;
  color: white;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.test-btn,
.refresh-btn {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.test-btn:hover,
.refresh-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
}

.refresh-btn {
  background: #6c757d;
  border-color: #6c757d;
}

.refresh-btn:hover {
  background: #545b62;
  border-color: #545b62;
}

/* 信函内容区域 */
.message-content {
  flex: 1;
  display: flex;
  min-height: 0;
  gap: 0;
  background: #ffffff;
}

.message-list-panel {
  width: 400px;
  min-width: 350px;
  max-width: 500px;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-left: none;
  border-bottom: none;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-detail-panel {
  flex: 1;
  border-top: none;
  border-right: none;
  border-bottom: none;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .message-list-panel {
    width: 350px;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-left {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .header-actions {
    justify-content: stretch;
    flex-direction: column;
  }
  
  .message-content {
    flex-direction: column;
    gap: 0;
  }
  
  .message-list-panel {
    width: 100%;
    max-width: none;
    min-width: 0;
    height: 46vh;
    border-right: none;
    border-left: none;
  }
  
  .message-detail-panel {
    height: 54vh;
  }
  
  .page-title {
    font-size: 20px;
  }

  .test-btn,
  .refresh-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 8px 12px;
  }
  
  .test-btn,
  .refresh-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .page-title i {
    font-size: 20px;
  }
}

/* 滚动条样式 */
:deep(.message-list),
:deep(.message-detail) {
  scrollbar-width: thin;
  scrollbar-color: #ced4da #f8f9fa;
}

:deep(.message-list)::-webkit-scrollbar,
:deep(.message-detail)::-webkit-scrollbar {
  width: 6px;
}

:deep(.message-list)::-webkit-scrollbar-track,
:deep(.message-detail)::-webkit-scrollbar-track {
  background: #f8f9fa;
}

:deep(.message-list)::-webkit-scrollbar-thumb,
:deep(.message-detail)::-webkit-scrollbar-thumb {
  background: #ced4da;
  border-radius: 3px;
}

:deep(.message-list)::-webkit-scrollbar-thumb:hover,
:deep(.message-detail)::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}
</style>
