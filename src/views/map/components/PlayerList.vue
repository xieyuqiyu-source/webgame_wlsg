<template>
  <div class="player-list">
    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索玩家城池名称..."
          class="search-input"
        />
      </div>
      
      <div class="filter-buttons">
        <button 
          v-for="faction in factionFilters" 
          :key="faction.key"
          :class="['filter-btn', { 'active': selectedFaction === faction.key }]"
          @click="selectedFaction = selectedFaction === faction.key ? 'all' : faction.key"
        >
          {{ faction.label }}
        </button>
        
        <button 
          :class="['filter-btn', { 'active': onlineOnly }]"
          @click="onlineOnly = !onlineOnly"
        >
          仅在线
        </button>
      </div>
    </div>
    
    <!-- 在线玩家统计 -->
    <div class="online-stats">
      <div class="stat-item">
        <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L13.5 7H10.5L9 4L3 7V9H5V20H7V14H9V20H11V9H13V20H15V14H17V20H19V9H21Z"/>
        </svg>
        <span class="stat-label">在线玩家:</span>
        <span class="stat-value">{{ onlinePlayers.length }}</span>
      </div>
      
      <div class="stat-item">
        <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
        </svg>
        <span class="stat-label">可攻击:</span>
        <span class="stat-value">{{ attackablePlayers.length }}</span>
      </div>
    </div>
    
    <!-- 玩家列表 -->
    <div class="player-grid">
      <div 
        v-for="player in filteredPlayers" 
        :key="player.id"
        class="player-card"
        @click="handlePlayerClick(player)"
      >
        <!-- 玩家头像和基本信息 -->
        <div class="player-header">
          <div class="player-avatar">
            <div :class="['faction-badge', player.faction]">
              {{ getFactionName(player.faction) }}
            </div>
            <div v-if="player.isOnline" class="online-indicator"></div>
          </div>
          <div class="player-info">
            <h3 class="player-name">{{ player.name }}</h3>
            <p class="player-level">等级 {{ player.level }}</p>
            <p class="last-active">{{ getLastActiveText(player.lastActive) }}</p>
          </div>
          <div class="player-status">
            <span :class="['status-badge', player.isOnline ? 'online' : 'offline']">
              {{ player.isOnline ? '在线' : '离线' }}
            </span>
          </div>
        </div>
        
        <!-- 城池信息 -->
        <div class="player-city">
          <div class="city-name">
            <svg class="city-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19Z"/>
            </svg>
            <span>{{ player.cityName }}</span>
          </div>
          <div class="civilization-level">
            <span class="civilization-text">文明度: {{ player.civilization }}</span>
          </div>
        </div>
        
        <!-- 军队信息 -->
        <div class="player-army">
          <div class="army-power">
            <svg class="army-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
            </svg>
            <span>战力: {{ formatNumber(player.armyPower) }}</span>
          </div>
          <div class="protection-status" v-if="player.hasProtection">
            <svg class="protection-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
            </svg>
            <span class="protection-text">新手保护</span>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="player-actions">
          <button class="action-btn scout" @click.stop="handleScout(player)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
            </svg>
            侦查
          </button>
          <button 
            class="action-btn attack" 
            :disabled="!player.isOnline || player.hasProtection"
            @click.stop="handleAttack(player)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.92,5H5L6.5,6.5L5,8H6.92L8.42,6.5L6.92,5M13,19H11V17.5L2.5,9H4.42L11,15.58V14H13V19M20.5,2.5L19,4L15.5,0.5L17,2L15.5,3.5L19,7L20.5,5.5L22,7L20.5,8.5L17,5L20.5,2.5Z"/>
            </svg>
            {{ player.hasProtection ? '保护中' : '攻击' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="filteredPlayers.length === 0" class="empty-state">
      <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12S12 10.2 12 8S13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8 4C10.2 4 12 5.8 12 8C12 10.2 10.2 12 8 12C5.8 12 4 10.2 4 8C4 5.8 5.8 4 8 4M8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z"/>
      </svg>
      <h3 class="empty-title">{{ onlineOnly ? '暂无在线玩家' : '未找到玩家城池' }}</h3>
      <p class="empty-text">{{ onlineOnly ? '当前没有其他玩家在线' : '尝试调整搜索条件或筛选器' }}</p>
    </div>
  </div>
</template>

<script>
import { formatNumber } from '@/utils/formatters.js'

export default {
  name: 'PlayerList',
  data() {
    return {
      //=== searchQuery 搜索关键词
      searchQuery: '',
      //=== selectedFaction 选中的阵营筛选
      selectedFaction: 'all',
      //=== onlineOnly 仅显示在线玩家
      onlineOnly: true,
      //=== factionFilters 阵营筛选选项
      factionFilters: [
        { key: 'all', label: '全部' },
        { key: 'wei', label: '魏' },
        { key: 'shu', label: '蜀' },
        { key: 'wu', label: '吴' }
      ],
      //=== players 玩家数据
      players: []
    }
  },
  computed: {
    //=== onlinePlayers 在线玩家列表
    onlinePlayers() {
      return this.players.filter(player => player.isOnline)
    },
    
    //=== attackablePlayers 可攻击的玩家列表
    attackablePlayers() {
      return this.onlinePlayers.filter(player => !player.hasProtection)
    },
    
    //=== filteredPlayers 过滤后的玩家列表
    filteredPlayers() {
      let filtered = this.players
      
      // 仅在线玩家筛选
      if (this.onlineOnly) {
        filtered = filtered.filter(player => player.isOnline)
      }
      
      // 按名称搜索
      if (this.searchQuery.trim()) {
        filtered = filtered.filter(player => 
          player.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          player.cityName.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      // 按阵营筛选
      if (this.selectedFaction !== 'all') {
        filtered = filtered.filter(player => player.faction === this.selectedFaction)
      }
      
      return filtered
    }
  },
  mounted() {
    //=== 生成随机玩家数据
    this.generatePlayers()
    //=== 定时更新在线状态
    this.startOnlineStatusUpdate()
  },
  beforeUnmount() {
    //=== 清理定时器
    if (this.onlineTimer) {
      clearInterval(this.onlineTimer)
    }
  },
  methods: {
    //=== generatePlayers 生成随机玩家数据
    generatePlayers() {
      const factions = ['wei', 'shu', 'wu']
      const playerNames = [
        '曹操', '刘备', '孙权', '诸葛亮', '关羽', '张飞', '赵云', '马超', '黄忠',
        '周瑜', '陆逊', '甘宁', '太史慈', '吕蒙', '司马懿', '夏侯惇', '张辽',
        '徐晃', '于禁', '乐进', '张郃', '庞德', '魏延', '姜维', '马岱'
      ]
      const cityNames = [
        '龙城', '凤凰城', '麒麟城', '白虎城', '玄武城', '青龙城', '朱雀城', '天狼城',
        '神鹰城', '烈火城', '寒冰城', '雷霆城', '疾风城', '大地城', '星辰城'
      ]
      
      this.players = []
      
      for (let i = 0; i < 30; i++) {
        const faction = factions[Math.floor(Math.random() * factions.length)]
        const name = playerNames[Math.floor(Math.random() * playerNames.length)] + (Math.floor(Math.random() * 999) + 1)
        const cityName = cityNames[Math.floor(Math.random() * cityNames.length)] + (Math.floor(Math.random() * 999) + 1)
        const level = Math.floor(Math.random() * 30) + 1
        const isOnline = Math.random() > 0.6 // 40% 在线率
        const hasProtection = level <= 5 && Math.random() > 0.7 // 低等级玩家有保护
        
        this.players.push({
          id: `player_${i + 1}`,
          name,
          cityName,
          faction,
          level,
          civilization: Math.floor(Math.random() * 1000) + 100,
          armyPower: Math.floor(Math.random() * 200000) + 50000,
          isOnline,
          hasProtection,
          lastActive: isOnline ? Date.now() : Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000) // 最近24小时内
        })
      }
    },
    
    //=== startOnlineStatusUpdate 开始在线状态更新
    startOnlineStatusUpdate() {
      this.onlineTimer = setInterval(() => {
        // 随机更新一些玩家的在线状态
        this.players.forEach(player => {
          if (Math.random() < 0.1) { // 10% 概率改变状态
            player.isOnline = !player.isOnline
            if (!player.isOnline) {
              player.lastActive = Date.now()
            }
          }
        })
      }, 30000) // 每30秒更新一次
    },
    
    //=== getFactionName 获取阵营名称
    getFactionName(faction) {
      const names = {
        wei: '魏',
        shu: '蜀', 
        wu: '吴'
      }
      return names[faction] || '未知'
    },
    
    //=== getLastActiveText 获取最后活跃时间文本
    getLastActiveText(lastActive) {
      const now = Date.now()
      const diff = now - lastActive
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      if (minutes < 1) {
        return '刚刚在线'
      } else if (minutes < 60) {
        return `${minutes}分钟前`
      } else if (hours < 24) {
        return `${hours}小时前`
      } else {
        return '1天前'
      }
    },
    
    //=== formatNumber 格式化数字
    formatNumber,
    
    //=== handlePlayerClick 处理玩家点击事件
    handlePlayerClick(player) {
      console.log('点击玩家:', player)
      // TODO: 显示玩家详情
    },
    
    //=== handleScout 处理侦查事件
    handleScout(player) {
      console.log('侦查玩家:', player)
      // TODO: 实现侦查功能
    },
    
    //=== handleAttack 处理攻击事件
    handleAttack(player) {
      if (!player.isOnline) {
        alert('只能攻击在线玩家！')
        return
      }
      if (player.hasProtection) {
        alert('该玩家处于新手保护状态！')
        return
      }
      console.log('攻击玩家:', player)
      // TODO: 实现攻击功能
    }
  }
}
</script>

<style scoped>
.player-list {
  @apply space-y-6;
}

/* 搜索栏样式 - 参考军事页面设计 */
.search-bar {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 640px) {
  .search-bar {
    flex-direction: row;
  }
}

.search-input-wrapper {
  @apply relative flex-1;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2;
  color: rgba(255, 255, 255, 0.6);
}

.search-input {
  @apply w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(35, 124, 72, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  outline: none;
  border-color: #FFB900;
  box-shadow: 0 0 0 2px rgba(255, 185, 0, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.filter-buttons {
  @apply flex gap-2 flex-wrap;
}

.filter-btn {
  @apply px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(35, 124, 72, 0.3);
  backdrop-filter: blur(10px);
}

.filter-btn:hover {
  background: rgba(255, 185, 0, 0.2);
  border-color: #FFB900;
  transform: translateY(-1px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #FFB900 0%, #FFA000 100%);
  color: #18181B;
  border-color: #FFB900;
  box-shadow: 0 4px 12px rgba(255, 185, 0, 0.3);
}

/* 在线统计样式 */
.online-stats {
  background: rgba(35, 124, 72, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-item {
  @apply flex items-center gap-3;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(35, 124, 72, 0.2);
}

.stat-icon {
  color: #FFB900;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.stat-label {
  @apply text-sm font-medium;
  color: rgba(255, 255, 255, 0.8);
}

.stat-value {
  @apply text-sm font-bold;
  color: #FFB900;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 玩家网格样式 */
.player-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.player-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: white;
  position: relative;
  will-change: border-color, box-shadow;
}

.player-card:hover {
  border-color: rgba(255, 185, 0, 0.4);
  box-shadow: 0 6px 20px rgba(255, 185, 0, 0.1);
}

/* 玩家头部样式 */
.player-header {
  @apply flex items-center justify-between mb-4;
}

.player-avatar {
  @apply relative;
}

.faction-badge {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.faction-badge.wei {
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
}

.faction-badge.shu {
  background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
}

.faction-badge.wu {
  background: linear-gradient(135deg, #237C48 0%, #166534 100%);
}

.online-indicator {
  @apply absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.online-indicator.pulse {
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.player-info {
  @apply flex-1 ml-3;
}

.player-name {
  @apply text-lg font-bold mb-1;
  color: #FFB900;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.player-level {
  @apply text-sm;
  color: rgba(255, 255, 255, 0.8);
}

.last-active {
  @apply text-xs;
  color: rgba(255, 255, 255, 0.6);
}

.player-status {
  @apply flex flex-col items-end;
}

.status-badge {
  @apply px-3 py-1 text-xs font-bold rounded-full;
}

.status-badge.online {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.status-badge.offline {
  background: rgba(107, 114, 128, 0.3);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(107, 114, 128, 0.5);
}

/* 城池信息样式 */
.player-city {
  @apply mb-4 space-y-2;
}

.city-name {
  @apply flex items-center gap-2 text-sm p-3 rounded-lg;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: white;
  font-weight: bold;
}

.city-icon {
  color: #3B82F6;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.civilization-level {
  @apply text-sm p-2 rounded;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.civilization-text {
  font-weight: bold;
}

/* 军队信息样式 */
.player-army {
  @apply mb-4 space-y-2;
}

.army-power {
  @apply flex items-center gap-2 text-sm p-3 rounded-lg;
  background: rgba(255, 99, 103, 0.1);
  border: 1px solid rgba(255, 99, 103, 0.2);
  color: white;
  font-weight: bold;
}

.army-icon {
  color: #FF6367;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.protection-status {
  @apply flex items-center gap-2 text-sm p-2 rounded;
  background: rgba(255, 185, 0, 0.1);
  border: 1px solid rgba(255, 185, 0, 0.2);
}

.protection-icon {
  color: #FFB900;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.protection-text {
  color: #FFB900;
  font-weight: bold;
}

/* 操作按钮样式 */
.player-actions {
  @apply flex gap-3;
}

.action-btn {
  @apply flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-lg;
  backdrop-filter: blur(8px);
  border: 1px solid;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
  will-change: opacity, box-shadow;
}

.action-btn.scout {
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
  border-color: #3B82F6;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.action-btn.scout:hover {
  opacity: 0.9;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.attack {
  background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
  border-color: #EF4444;
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.action-btn.attack:hover:not(:disabled) {
  opacity: 0.9;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.action-btn:disabled {
  background: rgba(107, 114, 128, 0.2) !important;
  border-color: rgba(107, 114, 128, 0.3) !important;
  color: rgba(255, 255, 255, 0.4) !important;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 空状态样式 */
.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 16px;
  margin: 20px 0;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.empty-title {
  @apply text-xl font-bold mb-2;
  color: #FFB900;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.empty-text {
  color: rgba(255, 255, 255, 0.7);
}
</style>