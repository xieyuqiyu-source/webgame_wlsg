<template>
  <div class="game-sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- 折叠/展开按钮 -->
    <div class="sidebar-toggle" @click="toggleSidebar">
      <div class="toggle-icon">
        <svg v-if="!isCollapsed" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
        </svg>
      </div>
    </div>

    <!-- 侧边栏内容 -->
    <div class="sidebar-content" v-show="!isCollapsed">
      <!-- 可滚动的主要内容区域 -->
      <div class="scrollable-content">
        <!-- 城池信息卡片 -->
        <div class="city-info-card">
          <div class="city-header">
            <div class="city-title">新的城池p0sg (101|38)</div>
            <div class="city-details">
              <div class="detail-item">
                <div class="status-dot red"></div>
                <span>城池文明度: {{ formatCivilization(gameStore.citycivilization) }}</span>
              </div>
              <div class="detail-item">
                <div class="status-dot" :class="gameStore.civilizationLevel.statusColor || 'blue'"></div>
                <span :class="gameStore.civilizationLevel.color">{{ gameStore.civilizationLevel.level }}</span>
              </div>
              <div class="detail-item">
                <div class="status-dot yellow"></div>
                <span>首次充值赠送100礼金券</span>
              </div>
              <div class="detail-item">
                <div class="status-dot green"></div>
                <span>社区群组上线，邀您共加入</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 资源信息 -->
        <div class="section">
          <div class="section-header">本城资源</div>
          <div class="resource-list">
            <div class="resource-item" v-for="resource in resources" :key="resource.name">
              <div class="resource-info">
                <img v-if="resource.icon" :src="resource.icon" :alt="resource.name" class="resource-icon" />
                <div v-else class="resource-icon resource-icon-fallback"></div>
                <span class="resource-name">{{ resource.name }}</span>
              </div>
              <div class="resource-value">{{ resource.current }}/{{ resource.max }}</div>
            </div>
          </div>
        </div>

        <!-- 生产力信息 -->
        <div class="section">
          <div class="section-header">城池生产力</div>
          <div class="production-list">
            <div class="production-item" v-for="production in productions" :key="production.name">
              <div class="production-info">
                <img v-if="production.icon" :src="production.icon" :alt="production.name" class="production-icon" />
                <div v-else class="production-icon production-icon-fallback"></div>
                <span class="production-name">{{ production.name }}</span>
              </div>
              <div class="production-details">
                <span class="production-rate">{{ production.rate }} 每小时</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 仓库管理 -->
        <div class="section">
          <div class="section-header">仓库管理</div>
          <div class="warehouse-info">
            <div class="warehouse-level">
              <span class="warehouse-label">仓库等级:</span>
              <span class="warehouse-value">{{ gameStore.warehouseLevel }}/12</span>
            </div>
            <div class="warehouse-upgrade-container" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
              <button
                @mouseenter="showTooltip = true"
                @mouseleave="showTooltip = false"
                @click="upgradeWarehouse"
                :disabled="!gameStore.canUpgradeWarehouse || isWarehouseUpgrading"
                class="warehouse-upgrade-btn relative overflow-hidden"
                :class="gameStore.canUpgradeWarehouse && !isWarehouseUpgrading ? 'enabled' : 'disabled'"
              >
                <!-- 进度条背景 -->
                <div 
                  v-if="isWarehouseUpgrading" 
                  class="absolute inset-0 bg-blue-500 transition-all duration-100 ease-linear"
                  :style="{ width: warehouseUpgradeProgress + '%' }"
                ></div>
                
                <!-- 按钮文字 -->
                <span class="relative z-10">
                  <template v-if="isWarehouseUpgrading">
                    升级中... {{ Math.round(warehouseUpgradeProgress) }}%
                  </template>
                  <template v-else>
                    {{ gameStore.warehouseLevel >= 12 ? '已满级' : `升级 (${gameStore.warehouseLevel} → ${gameStore.warehouseLevel + 1})` }}
                  </template>
                </span>
              </button>
              
              <!-- 升级时间显示 -->
              <div v-if="isWarehouseUpgrading" class="text-xs text-blue-400 text-center mt-1">
                剩余时间: {{ formatTime(warehouseUpgradeTimeLeft) }}
              </div>
              
              <!-- 浮动提醒 -->
              <div v-if="showTooltip && (!gameStore.canUpgradeWarehouse || isWarehouseUpgrading)" class="upgrade-tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-header">升级条件</div>
                <div v-if="isWarehouseUpgrading" class="tooltip-content">
                  <div class="tooltip-item upgrading">仓库正在升级中...</div>
                </div>
                <div v-else-if="gameStore.warehouseLevel >= 12" class="tooltip-content">
                  <div class="tooltip-item max-level">仓库已达到最大等级</div>
                </div>
                <div v-else class="tooltip-content">
                  <div class="tooltip-item" v-for="(cost, resourceType) in warehouseUpgradeCost" :key="resourceType">
                    <div class="resource-requirement" :class="{ 'insufficient': gameStore.resources[resourceType] < cost }">
                      <span class="resource-name">{{ getResourceName(resourceType) }}:</span>
                      <span class="resource-amount">{{ gameStore.resources[resourceType] }}/{{ cost }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 军队信息 -->
        <div class="section">
          <div class="section-header">
            <span>本城直属军队</span>
            <span class="army-count">查看详情</span>
          </div>
          <div class="army-grid">
            <div class="army-item" v-for="army in armies" :key="army.id">
              <div class="army-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path :d="army.iconPath"/>
                </svg>
              </div>
              <span class="army-name text-sm">{{ army.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 固定在底部的导航区域 -->
      <div class="bottom-nav">
        <div class="nav-buttons">
          <div class="nav-button" @click="handleNavClick('city')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
              </svg>
            </div>
            <span class="nav-label">城池</span>
          </div>
          <div class="nav-button" @click="handleNavClick('military')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L22 9L17 14L18.18 22.74L12 19.27L5.82 22.74L7 14L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <span class="nav-label">军事</span>
          </div>
          <div class="nav-button" @click="handleNavClick('map')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3Z"/>
              </svg>
            </div>
            <span class="nav-label">地图</span>
          </div>
          <div class="nav-button" @click="handleNavClick('settings')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
              </svg>
            </div>
            <span class="nav-label">设置</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { RESOURCE_ICONS, getResourceIcon, getResourceName } from '@/config/resources.js'
import { useGameStore } from '@/store/modules/gameStore.js'
import { computed, ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { calculateWarehouseUpgradeTime, calculateWarehouseUpgradeCost } from '@/config/gameConfig.js'
import { formatCivilization, formatTime } from '@/utils/formatters.js'

export default {
  name: 'GameSidebar',
  emits: ['toggle', 'nav-click'],
  setup() {
    const gameStore = useGameStore()
    
    // 仓库升级相关状态
    const isWarehouseUpgrading = ref(false)
    const warehouseUpgradeTimeLeft = ref(0)
    const warehouseUpgradeProgress = ref(0)
    const showTooltip = ref(false)
    let warehouseUpgradeTimer = null
    
    //=== 计算资源数据
    const resources = computed(() => {
      const resourceTypes = ['wood', 'soil', 'iron', 'food']
      return resourceTypes.map(type => ({
        name: getResourceName(type),
        type,
        icon: getResourceIcon(type),
        current: Math.floor(gameStore.resources[type] || 0),
        max: Math.floor(gameStore.warehouseCapacity || 0)
      }))
    })
    
    //=== 计算生产力数据
    const productions = computed(() => {
      const resourceTypes = ['wood', 'soil', 'iron', 'food']
      return resourceTypes.map(type => ({
        name: getResourceName(type),
        type,
        icon: getResourceIcon(type),
        rate: Math.floor(gameStore.hourlyProduction[type] || 0)
      }))
    })
    
    //=== 计算仓库升级成本
    const warehouseUpgradeCost = computed(() => {
      return calculateWarehouseUpgradeCost(gameStore.warehouseLevel)
    })
    
    // 格式化时间显示
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`
      }
    }
    
    // 开始仓库升级倒计时
    const startWarehouseUpgradeTimer = (duration) => {
      isWarehouseUpgrading.value = true
      warehouseUpgradeTimeLeft.value = duration
      const totalDuration = duration
      
      warehouseUpgradeTimer = setInterval(() => {
        warehouseUpgradeTimeLeft.value--
        warehouseUpgradeProgress.value = ((totalDuration - warehouseUpgradeTimeLeft.value) / totalDuration) * 100
        
        if (warehouseUpgradeTimeLeft.value <= 0) {
          clearInterval(warehouseUpgradeTimer)
          isWarehouseUpgrading.value = false
          warehouseUpgradeProgress.value = 0
          // 升级完成，更新仓库等级
          gameStore.completeWarehouseUpgrade()
        }
      }, 1000)
    }
    
    // 清理定时器
    onUnmounted(() => {
      if (warehouseUpgradeTimer) {
        clearInterval(warehouseUpgradeTimer)
      }
    })
    
    return {
      gameStore,
      resources,
      productions,
      isWarehouseUpgrading,
      warehouseUpgradeTimeLeft,
      warehouseUpgradeProgress,
      showTooltip,
      warehouseUpgradeCost,
      getResourceName,
      formatTime,
      formatCivilization,
      startWarehouseUpgradeTimer
    }
  },
  data() {
    return {
      //=== isCollapsed 侧边栏折叠状态
      isCollapsed: false,
      //=== armies 军队数据
      armies: [
        { id: 1, name: '影卫', iconPath: 'M12 2L13.09 8.26L22 9L17 14L18.18 22.74L12 19.27L5.82 22.74L7 14L2 9L10.91 8.26L12 2Z' },
        { id: 2, name: '虎豹骑', iconPath: 'M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z' },
        { id: 3, name: '朱雀', iconPath: 'M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z' },
        { id: 4, name: '青龙', iconPath: 'M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3Z' },
        { id: 5, name: '白虎', iconPath: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' },
        { id: 6, name: '玄武', iconPath: 'M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z' },
        { id: 7, name: '飞熊', iconPath: 'M7 14l5-5 5 5z' },
        { id: 8, name: '神机', iconPath: 'M12 2L13.09 8.26L22 9L17 14L18.18 22.74L12 19.27L5.82 22.74L7 14L2 9L10.91 8.26L12 2Z' },
        { id: 9, name: '天策', iconPath: 'M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z' }
      ]
    }
  },
  methods: {
    //=== toggleSidebar 切换侧边栏展开/折叠状态
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed
      this.$emit('toggle', this.isCollapsed)
    },
    //=== upgradeWarehouse 升级仓库
    upgradeWarehouse() {
      this.gameStore.upgradeWarehouse()
    },
    //=== handleNavClick 处理底部导航按钮点击事件
    handleNavClick(navType) {
      console.log('导航点击:', navType)
      this.$emit('nav-click', navType)
      
      // 根据navType进行路由跳转
      const routeMap = {
        'city': '/city',
        'military': '/military', 
        'map': '/map',
        'settings': '/settings' // 设置按钮跳转到设置页面
      }
      
      const targetRoute = routeMap[navType]
      if (targetRoute && this.$router.currentRoute.value.path !== targetRoute) {
        this.$router.push(targetRoute)
      }
    }
  }
}
</script>

<style scoped>
.game-sidebar {
  @apply fixed left-0 top-0 h-full z-50 transition-all duration-300;
  width: 300px;
  background: rgba(31, 41, 55, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(35, 124, 72, 0.3);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.game-sidebar.collapsed {
  width: 60px;
}

.sidebar-toggle {
  @apply absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full;
  @apply bg-gray-700 hover:bg-gray-600 rounded-r-md p-2 cursor-pointer transition-colors;
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-left: none;
}

.toggle-icon {
  @apply text-white w-4 h-4 flex items-center justify-center;
}

.sidebar-content {
  @apply h-full flex flex-col;
}

.scrollable-content {
  @apply flex-1 p-4 overflow-y-auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(35, 124, 72, 0.5) transparent;
}

.scrollable-content::-webkit-scrollbar {
  width: 4px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(35, 124, 72, 0.5);
  border-radius: 2px;
}

.city-info-card {
  @apply mb-6 p-4 rounded-md;
  background: rgba(55, 65, 81, 0.5);
  border: 1px solid rgba(35, 124, 72, 0.3);
}

.city-header {
  @apply space-y-3;
}

.city-title {
  @apply text-white text-sm font-medium text-center;
  line-height: 20px;
}

.city-details {
  @apply space-y-2;
}

.detail-item {
  @apply flex items-center gap-2 text-white text-sm;
  line-height: 20px;
}

.status-dot {
  @apply w-2 h-2 rounded-full flex-shrink-0;
}

.status-dot.red {
  background-color: #FF6367;
}

.status-dot.yellow {
  background-color: #FFB900;
}

.status-dot.green {
  background-color: #237C48;
}

.status-dot.blue {
  background-color: #3B82F6;
}

.section {
  @apply mb-6;
}

.section-header {
  @apply text-white font-medium text-sm mb-3 pb-2 flex justify-between items-center;
  border-bottom: 1px solid #374151;
  line-height: 24px;
}

.army-count {
  @apply text-green-600 text-sm cursor-pointer hover:text-green-500;
}

.resource-list,
.production-list {
  @apply space-y-2;
}

.resource-item {
  @apply flex justify-between items-center px-3;
}

.resource-info {
  @apply flex items-center gap-2;
}

.resource-icon {
  @apply w-4 h-4 rounded-sm flex-shrink-0;
}

.resource-icon-fallback {
  @apply bg-gray-500;
}

.resource-name {
  @apply text-white text-sm;
  line-height: 24px;
  width: 32px;
}

.resource-value {
  @apply text-yellow-400 text-sm;
  line-height: 24px;
}

.production-item {
  @apply flex justify-between items-center px-3;
}

.production-info {
  @apply flex items-center gap-2;
}

.production-icon {
  @apply w-4 h-4 rounded-sm flex-shrink-0;
}

.production-icon-fallback {
  @apply bg-gray-500;
}

.production-name {
  @apply text-white text-sm;
  line-height: 24px;
  width: 32px;
}

.production-details {
  @apply flex items-center gap-2;
}

.production-rate {
  @apply text-red-400 text-sm;
  line-height: 24px;
  width: 80px;
  text-align: right;
  white-space: nowrap;
}

.upgrade-btn {
  @apply bg-green-700 hover:bg-green-600 rounded p-1 cursor-pointer transition-colors;
  @apply flex items-center justify-center;
  width: 20px;
  height: 20px;
}

/* 仓库管理样式 */
.warehouse-info {
  @apply space-y-3;
}

.warehouse-level {
  @apply flex justify-between items-center;
}

.warehouse-label {
  @apply text-sm text-gray-300;
}

.warehouse-value {
  @apply text-sm text-white font-medium;
}

.warehouse-upgrade-btn {
  @apply w-full px-3 py-2 text-xs rounded-md transition-all duration-200;
}

.warehouse-upgrade-btn.enabled {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.warehouse-upgrade-btn.disabled {
  @apply bg-gray-600 text-gray-400 cursor-not-allowed;
}

/* 仓库升级容器样式 */
.warehouse-upgrade-container {
  @apply relative;
}



/* 浮动提醒样式 */
.upgrade-tooltip {
  @apply absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2;
  @apply bg-gray-800 bg-opacity-95 backdrop-blur-sm;
  @apply border border-green-500 border-opacity-50 rounded-lg;
  @apply p-3 min-w-[200px] max-w-[280px];
  @apply text-xs text-white;
  @apply shadow-lg shadow-black/50;
  @apply z-50;
  animation: tooltipFadeIn 0.2s ease-out;
}

.tooltip-arrow {
  @apply absolute top-full left-1/2 transform -translate-x-1/2;
  @apply w-0 h-0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(34, 197, 94, 0.5);
}

.tooltip-header {
  @apply text-green-400 font-semibold mb-2 text-center;
}

.tooltip-content {
  @apply space-y-1;
}

.tooltip-item {
  @apply flex flex-col;
}

.tooltip-item.upgrading {
  @apply text-blue-400 text-center;
}

.tooltip-item.max-level {
  @apply text-yellow-400 text-center;
}

.resource-requirement {
  @apply flex justify-between items-center;
  @apply py-1 px-2 rounded;
  @apply bg-gray-700 bg-opacity-50;
}

.resource-requirement.insufficient {
  @apply bg-red-900 bg-opacity-30 text-red-300;
}

.resource-requirement:not(.insufficient) {
  @apply text-green-300;
}

.resource-name {
  @apply font-medium;
}

.resource-amount {
  @apply font-mono text-right;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 底部导航样式 */
.bottom-nav {
  @apply flex-shrink-0 p-4;
  border-top: 1px solid rgba(35, 124, 72, 0.3);
  background: rgba(31, 41, 55, 0.95);
}

.nav-buttons {
  @apply grid grid-cols-2 gap-3;
}

.nav-button {
  @apply flex flex-col items-center justify-center p-3 rounded-md cursor-pointer transition-all duration-200;
  background: rgba(55, 65, 81, 0.3);
  border: 1px solid rgba(35, 124, 72, 0.2);
  min-height: 60px;
}

.nav-button:hover {
  background: rgba(35, 124, 72, 0.4);
  border-color: rgba(35, 124, 72, 0.5);
  transform: translateY(-1px);
}

.nav-button:active {
  transform: translateY(0);
}

.nav-icon {
  @apply text-green-400 mb-1;
}

.nav-button:hover .nav-icon {
  @apply text-green-300;
}

.nav-label {
  @apply text-white text-xs font-medium;
  line-height: 16px;
}

/* 军队网格样式 */
.army-grid {
  @apply grid grid-cols-3 gap-2 mt-3;
}

.army-item {
  @apply flex flex-col items-center justify-center p-2 rounded-md cursor-pointer transition-all duration-200;
  background: rgba(55, 65, 81, 0.3);
  border: 1px solid rgba(35, 124, 72, 0.2);
  min-height: 50px;
}

.army-item:hover {
  background: rgba(35, 124, 72, 0.4);
  border-color: rgba(35, 124, 72, 0.5);
  transform: translateY(-1px);
}

.army-item:active {
  transform: translateY(0);
}

.army-icon {
  @apply text-green-400 mb-1;
}

.army-item:hover .army-icon {
  @apply text-green-300;
}

.army-name {
  @apply text-white text-center;
  line-height: 14px;
}
</style>