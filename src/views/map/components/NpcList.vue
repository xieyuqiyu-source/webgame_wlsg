<template>
  <div class="npc-list">
    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索NPC城池名称..."
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
      </div>
    </div>
    
    <!-- 刷新控制区域 -->
    <div class="refresh-control">
      <div class="refresh-info">
        <div class="countdown-display">
          <svg class="countdown-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
          </svg>
          <span class="countdown-label">自动刷新:</span>
          <span class="countdown-time">{{ formattedCountdown }}</span>
        </div>
        
        <div class="refresh-cost">
          <svg class="coin-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
          </svg>
          <span class="cost-text">手动刷新: {{ manualRefreshCost }}金币</span>
        </div>
      </div>
      
      <button 
        class="manual-refresh-btn"
        :class="{ 'disabled': !canManualRefresh }"
        :disabled="!canManualRefresh"
        @click="manualRefresh"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
        </svg>
        立即刷新
      </button>
    </div>
    
   
    
    <!-- NPC列表 -->
    <div class="npc-list-container">
      <div 
        v-for="npc in paginatedNpcs" 
        :key="npc.id"
        class="npc-list-item"
        @click="handleNpcClick(npc)"
      >
       <div class="npc-list-items" style="display: flex;">
        <!-- 阵营标识 -->
        <div class="npc-faction">
          <div :class="['faction-badge', npc.faction]">
            {{ getFactionName(npc.faction) }}
          </div>
        </div>
        
        <!-- NPC基本信息 -->
        <div class="npc-basic-info">
          <h3 class="npc-name">{{ npc.name }}</h3>
          <span class="npc-level">Lv.{{ npc.level }}</span>
        </div>
        
        <!-- 资源信息 -->
        <div class="npc-resources">
          <div class="resource-item">
            <img :src="getResourceIcon('wood')" :alt="getResourceName('wood')" class="resource-icon" width="14" height="14" />
            <span class="resource-value">{{ formatNumber(npc.resources.wood) }}</span>
          </div>
          <div class="resource-item">
            <img :src="getResourceIcon('soil')" :alt="getResourceName('soil')" class="resource-icon" width="14" height="14" />
            <span class="resource-value">{{ formatNumber(npc.resources.soil) }}</span>
          </div>
          <div class="resource-item">
            <img :src="getResourceIcon('iron')" :alt="getResourceName('iron')" class="resource-icon" width="14" height="14" />
            <span class="resource-value">{{ formatNumber(npc.resources.iron) }}</span>
          </div>
          <div class="resource-item">
            <img :src="getResourceIcon('food')" :alt="getResourceName('food')" class="resource-icon" width="14" height="14" />
            <span class="resource-value">{{ formatNumber(npc.resources.food) }}</span>
          </div>
        </div>
        
        <!-- 侦查状态信息 -->
        <div class="npc-scout-info">
          <div v-if="npc.scoutedAt" class="scout-status">
            <svg class="scout-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
            </svg>
            <span class="scout-label">已侦查</span>
            <span class="scout-time">{{ formatScoutTime(npc.scoutedAt) }}</span>
          </div>
          <div v-else class="scout-status">
            <svg class="scout-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z"/>
            </svg>
            <span class="scout-label">未侦查</span>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="npc-actions">
          <button class="action-btn scout" @click.stop="handleScout(npc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
            </svg>
            侦查
          </button>
          <button class="action-btn attack" @click.stop="handleAttack(npc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.92,5H5L6.5,6.5L5,8H6.92L8.42,6.5L6.92,5M13,19H11V17.5L2.5,9H4.42L11,15.58V14H13V19M20.5,2.5L19,4L15.5,0.5L17,2L15.5,3.5L19,7L20.5,5.5L22,7L20.5,8.5L17,5L20.5,2.5Z"/>
            </svg>
            攻击
          </button>
        </div>
        </div>
        <div>

<!-- 侦查结果显示 - 横向展示在下方 -->
        <div v-if="npc.scoutedAt && npc.scoutData" class="scout-result">
          <div class="scout-result-header">
            <div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
              </svg>
              <span>侦查情报</span>
            </div>
            <div class="army-summary">
              <span class="army-total">总兵力: {{ npc.scoutData.totalUnits }}</span>
              <span class="army-types">{{ npc.scoutData.unitTypes }}种兵种</span>
            </div>
          </div>
          <div class="army-details">
            <div v-for="unit in npc.scoutData.units" :key="unit.id" class="unit-item">
              <span class="unit-name">{{ unit.name }}</span>
              <span class="unit-count">{{ formatNumber(unit.count) }}</span>
            </div>
          </div>
        </div>
        </div>
        
        
      </div>
    </div>
    
    <!-- 分页组件 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="pagination-btn" 
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        上一页
      </button>
      
      <div class="pagination-numbers">
        <button 
          v-for="page in totalPages" 
          :key="page"
          :class="['pagination-number', { 'active': currentPage === page }]"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        class="pagination-btn" 
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
    
    <!-- 空状态 -->
    <div v-if="filteredNpcs.length === 0" class="empty-state">
      <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
      </svg>
      <h3 class="empty-title">未找到NPC城池</h3>
      <p class="empty-text">尝试调整搜索条件或筛选器</p>
    </div>
  </div>
</template>

<script>
import { formatNumber } from '@/utils/formatters.js'
import { getFactionUnits, UNIT_TYPES, getUnitById } from '@/config/factionConfig.js'
import { useGameStore } from '@/store/modules/gameStore.js'
import { useNotificationStore } from '@/store/modules/notificationStore.js'
import { useNpcStore } from '@/store/modules/npcStore.js'
import { getResourceIcon, getResourceName } from '@/config/resources.js'

export default {
  name: 'NpcList',
  setup() {
    const gameStore = useGameStore()
    const notificationStore = useNotificationStore()
    const npcStore = useNpcStore()
    return {
      gameStore,
      notificationStore,
      npcStore
    }
  },
  data() {
    return {
      //=== searchQuery 搜索关键词
      searchQuery: '',
      //=== selectedFaction 选中的阵营筛选
      selectedFaction: 'all',
      //=== factionFilters 阵营筛选选项
      factionFilters: [
        { key: 'all', label: '全部' },
        { key: 'wei', label: '魏' },
        { key: 'shu', label: '蜀' },
        { key: 'wu', label: '吴' }
      ],
      //=== currentPage 当前页码
      currentPage: 1,
      //=== pageSize 每页显示数量
      pageSize: 12,
      //=== refreshTimer 刷新倒计时定时器
      refreshTimer: null,
      //=== currentTime 用于触发响应式更新
      currentTime: Date.now()
    }
  },
  computed: {
    //=== npcs 从store获取NPC列表
    npcs() {
      return this.npcStore.npcs
    },

    //=== filteredNpcs 过滤后的NPC列表
    filteredNpcs() {
      let filtered = this.npcs
      
      // 按名称搜索
      if (this.searchQuery.trim()) {
        filtered = filtered.filter(npc => 
          npc.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      // 按阵营筛选
      if (this.selectedFaction !== 'all') {
        filtered = filtered.filter(npc => npc.faction === this.selectedFaction)
      }
      
      return filtered
    },
    
    //=== paginatedNpcs 分页后的NPC列表
    paginatedNpcs() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredNpcs.slice(start, end)
    },
    
    //=== totalPages 总页数
    totalPages() {
      return Math.ceil(this.filteredNpcs.length / this.pageSize)
    },
    
    //=== refreshCountdown 刷新倒计时（秒）
    refreshCountdown() {
      // 传入currentTime以触发响应式更新
      return Math.floor(this.npcStore.timeUntilNextRefresh(this.currentTime) / 1000)
    },
    
    //=== 格式化倒计时显示
    formattedCountdown() {
      const totalSeconds = this.refreshCountdown
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
    },
    
    //=== 检查是否可以手动刷新
    canManualRefresh() {
      return this.gameStore.coins >= this.npcStore.manualRefreshCost
    }
  },
  async mounted() {
    //=== 初始化NPC数据
    await this.npcStore.initializeNpcs()
    
    //=== 触发npcs-updated事件，将NPC数据传递给父组件
    this.$emit('npcs-updated', this.npcs)
    
    //=== 启动倒计时定时器
    this.startCountdownTimer()
  },
  
  beforeUnmount() {
    //=== 清理定时器
    this.clearCountdownTimer()
  },
  watch: {
    //=== 监听搜索条件变化，重置分页
    searchQuery() {
      this.resetPagination()
    },
    //=== 监听筛选条件变化，重置分页
    selectedFaction() {
      this.resetPagination()
    }
  },
  methods: {
    //=== handleNpcClick 处理NPC点击事件
    handleNpcClick(npc) {
      console.log('点击NPC:', npc)
      // TODO: 显示NPC详情
    },
    
    //=== handleScout 处理侦查事件
    handleScout(npc) {
      // 检查是否已经侦查过
      if (npc.scoutedAt) {
        this.notificationStore.addNotification({
          type: 'warning',
          title: '侦查失败',
          message: '该城池已经侦查过了'
        })
        return
      }
      
      // 获取玩家阵营
      const playerFaction = this.gameStore.userFaction
      if (!playerFaction) {
        this.notificationStore.addNotification({
          type: 'error',
          title: '侦查失败',
          message: '请先选择阵营'
        })
        return
      }
      
      // 获取对应阵营的侦查兵种ID
      const scoutUnitId = this.getScoutUnitId(playerFaction)
      if (!scoutUnitId) {
        this.notificationStore.addNotification({
          type: 'error',
          title: '侦查失败',
          message: '未找到对应的侦查兵种'
        })
        return
      }
      
      // 计算需要消耗的侦查兵数量
      const requiredScouts = this.calculateRequiredScouts(playerFaction, npc.level)
      
      // 检查是否有足够的侦查兵
      const currentScouts = this.gameStore.army[scoutUnitId] || 0
      if (currentScouts < requiredScouts) {
        this.notificationStore.addNotification({
          type: 'error',
          title: '侦查失败',
          message: `需要${requiredScouts}个侦查兵，当前只有${currentScouts}个`
        })
        return
      }
      
      // 消耗侦查兵
      this.gameStore.army[scoutUnitId] -= requiredScouts
      
      // 执行侦查
      this.npcStore.scoutNpc(npc.id, {
        scoutsUsed: requiredScouts,
        playerFaction: playerFaction
      })
      
      // 保存游戏数据
      this.gameStore.saveGame()
      
      this.notificationStore.addNotification({
        type: 'success',
        title: '侦查成功',
        message: `消耗了${requiredScouts}个侦查兵`
      })
    },
    
    //=== handleAttack 处理攻击事件
    handleAttack(npc) {
      console.log('攻击NPC:', npc)
      // TODO: 实现攻击功能
    },
    
    //=== changePage 切换页码
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    //=== resetPagination 重置分页
    resetPagination() {
      this.currentPage = 1
    },
    
    //=== getScoutUnitId 获取对应阵营的侦查兵种ID
    getScoutUnitId(faction) {
      const scoutUnits = {
        'wei': 'zhanYingTanMa',  // 魏国：战鹰探马
        'shu': 'flyingKite',     // 蜀国：飞鸢
        'wu': 'secretAgent'      // 吴国：密探
      }
      return scoutUnits[faction]
    },
    
    //=== calculateRequiredScouts 计算需要消耗的侦查兵数量
    calculateRequiredScouts(faction, targetLevel) {
      const consumptionRates = {
        'wei': 0.8,   // 魏国：战鹰探马消耗较少
        'shu': 2.5,   // 蜀国：飞鸢消耗最多
        'wu': 1.5     // 吴国：密探消耗中等
      }
      
      // 基础消耗改为指数增长
      const baseConsumption = Math.pow(targetLevel, 1.8) * 2 + targetLevel * 3
      const rate = consumptionRates[faction] || 1.5
      
      return Math.max(2, Math.ceil(baseConsumption * rate))
    },
    
    //=== formatScoutTime 格式化侦查时间
    formatScoutTime(timestamp) {
      const now = Date.now()
      const diff = now - timestamp
      const minutes = Math.floor(diff / (1000 * 60))
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      
      const hours = Math.floor(minutes / 60)
      return `${hours}小时前`
    },
    
    //=== startCountdownTimer 启动倒计时定时器
    startCountdownTimer() {
      this.clearCountdownTimer()
      
      // 启动定时器，每秒更新一次
      this.refreshTimer = setInterval(() => {
        // 更新currentTime以触发响应式更新
        this.currentTime = Date.now()
        
        // 检查是否需要自动刷新，传入currentTime参数
        if (this.npcStore.needsRegeneration(this.currentTime)) {
          this.autoRefresh()
        }
      }, 1000)
    },
    
    //=== clearCountdownTimer 清理倒计时定时器
    clearCountdownTimer() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    
    //=== autoRefresh 自动刷新NPC列表
    autoRefresh() {
      this.npcStore.generateNpcs()
      this.$emit('npcs-updated', this.npcs)
      
      this.notificationStore.addNotification({
        type: 'info',
        title: 'NPC列表刷新',
        message: 'NPC列表已自动刷新，发现新的目标！'
      })
    },
    
    //=== manualRefresh 手动刷新NPC列表
    manualRefresh() {
      // 检查金币是否足够
      if (!this.canManualRefresh) {
        this.notificationStore.addNotification({
          type: 'error',
          title: '刷新失败',
          message: `金币不足！需要${this.npcStore.manualRefreshCost}金币，当前只有${this.gameStore.coins}金币`
        })
        return
      }
      
      // 扣除金币
      this.gameStore.coins -= this.npcStore.manualRefreshCost
      
      // 手动刷新NPC列表
      this.npcStore.manualRefresh()
      this.$emit('npcs-updated', this.npcs)
      
      // 保存游戏数据
      this.gameStore.saveGame()
      
      this.notificationStore.addNotification({
        type: 'success',
        title: '手动刷新成功',
        message: `消耗${this.npcStore.manualRefreshCost}金币，NPC列表已刷新！`
      })
    },

    //=== getFactionName 获取阵营名称
    getFactionName(faction) {
      const names = { wei: '魏', shu: '蜀', wu: '吴' }
      return names[faction] || '未知'
    },
    
    //=== getResourceIcon 获取资源图标URL
    getResourceIcon(resourceType) {
      return getResourceIcon(resourceType)
    },
    
    //=== getResourceName 获取资源名称
    getResourceName(resourceType) {
      return getResourceName(resourceType)
    },
    
    //=== formatNumber 格式化数字
    formatNumber
  }
}
</script>

<style scoped>
.npc-list {
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

/* 刷新控制区域样式 */
.refresh-control {
  background: linear-gradient(135deg, rgba(255, 185, 0, 0.1), rgba(255, 185, 0, 0.05));
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 185, 0, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.refresh-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.countdown-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown-icon {
  color: #FFB900;
  animation: pulse 2s infinite;
}

.countdown-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.countdown-time {
  color: #FFB900;
  font-size: 16px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  background: rgba(255, 185, 0, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 185, 0, 0.3);
}

.refresh-cost {
  display: flex;
  align-items: center;
  gap: 6px;
}

.coin-icon {
  color: #FFB900;
}

.cost-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.manual-refresh-btn {
  background: linear-gradient(135deg, #FFB900, #FF8C00);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 185, 0, 0.3);
}

.manual-refresh-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, #FF8C00, #FFB900);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 185, 0, 0.4);
}

.manual-refresh-btn.disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
  box-shadow: none;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
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

/* NPC列表容器样式 */
.npc-list-container {
  @apply space-y-3;
}

.npc-list-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  /* cursor: pointer; */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: white;
  /* display: flex; */
  align-items: center;
  gap: 16px;
  min-height: 60px;
}
.npc-list-items {
  /* background: rgba(255, 255, 255, 0.05); */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  /* cursor: pointer; */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: white;
  /* display: flex; */
  align-items: center;
  gap: 16px;
  min-height: 60px;
}
.npc-list-item:hover {
  border-color: rgba(255, 185, 0, 0.4);
  box-shadow: 0 4px 12px rgba(255, 185, 0, 0.1);
}

/* 阵营标识样式 */
.npc-faction {
  @apply flex-shrink-0;
}

.faction-badge {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 0px solid rgba(255, 255, 255, 0.2);
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

/* NPC基本信息样式 */
.npc-basic-info {
  @apply flex-shrink-0 min-w-0;
  width: 140px;
}

.npc-name {
  @apply text-base font-bold mb-1 truncate;
  color: #FFB900;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.npc-level {
  @apply text-xs;
  color: rgba(255, 255, 255, 0.7);
}

/* 资源信息样式 */
.npc-resources {
  @apply flex-1 flex items-center gap-4;
}

.resource-item {
  @apply flex items-center gap-1 text-xs;
  color: white;
  font-weight: 500;
}

.resource-icon {
  color: #FFB900;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.resource-value {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 侦查状态信息样式 */
 .npc-scout-info {
   @apply flex-shrink-0 flex flex-col gap-1;
   width: 120px;
 }
 
 .scout-status {
   @apply flex items-center gap-1 text-xs;
   color: white;
   font-weight: 500;
 }
 
 .scout-icon {
   color: #FFB900;
   filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
 }
 
 .scout-label {
   color: rgba(255, 255, 255, 0.7);
 }
 
 .scout-time {
   color: #FFB900;
   font-weight: bold;
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
   font-size: 10px;
 }
 
 /* 侦查结果样式 - 横向布局 */
 .scout-result {
   @apply mt-3 p-3 rounded-lg w-full;
   background: rgba(255, 185, 0, 0.1);
   border: 1px solid rgba(255, 185, 0, 0.3);
   backdrop-filter: blur(10px);
 }
 
 .scout-result-header {
   @apply flex items-center justify-between mb-2 text-sm font-bold;
   color: #FFB900;
 }
 
 .scout-result-header > div:first-child {
   @apply flex items-center gap-2;
 }
 
 .army-summary {
   @apply flex items-center gap-4 text-xs;
   color: rgba(255, 255, 255, 0.8);
 }
 
 .army-total {
   color: #FFB900;
   font-weight: bold;
 }
 
 .army-types {
   color: rgba(255, 255, 255, 0.6);
 }
 
 .army-details {
   @apply flex flex-wrap gap-2;
 }
 
 .unit-item {
   @apply flex items-center gap-2 text-xs px-2 py-1 rounded;
   background: rgba(255, 255, 255, 0.05);
   border: 1px solid rgba(255, 185, 0, 0.2);
   min-width: 80px;
 }
 
 .unit-name {
   color: rgba(255, 255, 255, 0.8);
   font-size: 10px;
 }
 
 .unit-count {
   color: #FFB900;
   font-weight: bold;
   font-size: 10px;
 }

/* 操作按钮样式 */
.npc-actions {
  @apply flex gap-2 flex-shrink-0;
}

.action-btn {
  @apply flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-md;
  backdrop-filter: blur(8px);
  border: 1px solid;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
  min-width: 60px;
}

.action-btn.scout {
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
  border-color: #3B82F6;
  color: white;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.2);
}

.action-btn.scout:hover {
  opacity: 0.9;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.action-btn.attack {
  background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
  border-color: #EF4444;
  color: white;
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.2);
}

.action-btn.attack:hover {
  opacity: 0.9;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

/* 分页组件样式 */
.pagination {
  @apply flex items-center justify-center gap-2 mt-6;
}

.pagination-btn {
  @apply px-3 py-2 rounded-md text-sm font-medium cursor-pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(35, 124, 72, 0.2);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.pagination-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 185, 0, 0.3);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:disabled:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(35, 124, 72, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.pagination-numbers {
  @apply flex gap-1;
}

.pagination-number {
  @apply px-3 py-2 rounded-md text-sm font-medium cursor-pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(35, 124, 72, 0.2);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.pagination-number:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 185, 0, 0.3);
  color: white;
}

.pagination-number.active {
  background: linear-gradient(135deg, #FFB900 0%, #FFA000 100%);
  border-color: #FFB900;
  color: #18181B;
  box-shadow: 0 4px 12px rgba(255, 185, 0, 0.3);
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