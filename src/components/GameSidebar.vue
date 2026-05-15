<template>
  <div
    v-if="isMobile && mobileOpen"
    class="sidebar-backdrop"
    @click="$emit('close-mobile')"
  />

  <div class="game-sidebar" :class="sidebarClasses">
    <div v-if="!isMobile" class="sidebar-toggle" @click="toggleSidebar">
      <div class="toggle-icon">
        <svg v-if="!isCollapsed" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
        </svg>
      </div>
    </div>

    <div class="sidebar-content" v-show="isMobile || !isCollapsed">
      <div v-if="isMobile" class="mobile-sidebar-header">
        <div class="mobile-sidebar-title">功能菜单</div>
        <button class="mobile-sidebar-close" type="button" @click="$emit('close-mobile')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71L12 12L5.71 5.71L4.29 7.12L10.59 13.41L4.29 19.71L5.71 21.12L12 14.83L18.3 21.12L19.71 19.71L13.41 13.41L19.71 7.12L18.3 5.71Z" />
          </svg>
        </button>
      </div>

      <div class="scrollable-content">
        <SidebarCityInfo
          :citycivilization="gameStore.citycivilization"
          :civilization-level="gameStore.civilizationLevel"
          :coins="gameStore.coins"
          :format-civilization="formatCivilization"
          @coins-click="handleCoinsClick"
        />

        <SidebarResources
          :coins="gameStore.coins"
          :format-number="formatNumber"
          :format-time="formatTime"
          :is-warehouse-boost-active="isWarehouseBoostActive"
          :resources="resources"
          :show-boost-tooltip="showBoostTooltip"
          :show-fill-tooltip="showFillTooltip"
          :warehouse-boost-cost="warehouseBoostCost"
          :warehouse-boost-time-left="warehouseBoostTimeLeft"
          :warehouse-capacity="gameStore.warehouseCapacity"
          @activate-warehouse-boost="activateWarehouseBoost"
          @fill-warehouse="fillWarehouse"
          @update:show-boost-tooltip="showBoostTooltip = $event"
          @update:show-fill-tooltip="showFillTooltip = $event"
        />

        <SidebarProduction
          :format-time="formatTime"
          :is-production-boost-active="gameStore.isProductionBoostActive"
          :productions="productions"
          :production-boost-time-left="gameStore.productionBoostTimeLeft"
          :show-production-tooltip="showProductionTooltip"
          :user-faction="gameStore.userFaction"
          @open-boost-dialog="showBoostDialog = true"
          @update:show-production-tooltip="showProductionTooltip = $event"
        />

        <SidebarWarehouse
          :can-upgrade-warehouse="gameStore.canUpgradeWarehouse"
          :format-time="formatTime"
          :get-resource-name="getResourceName"
          :is-warehouse-upgrading="isWarehouseUpgrading"
          :resource-amounts="gameStore.resources"
          :show-tooltip="showTooltip"
          :warehouse-level="gameStore.warehouseLevel"
          :warehouse-max-level="WAREHOUSE_CONFIG.maxLevel"
          :warehouse-upgrade-cost="warehouseUpgradeCost"
          :warehouse-upgrade-progress="warehouseUpgradeProgress"
          :warehouse-upgrade-time-left="warehouseUpgradeTimeLeft"
          @upgrade-warehouse="upgradeWarehouse"
          @update:show-tooltip="showTooltip = $event"
        />

        <SidebarArmy
          :army="gameStore.army"
          :get-unit-icon="getUnitIcon"
          :get-unit-name="getUnitName"
          :total-army-count="gameStore.totalArmyCount"
        />
      </div>

      <SidebarBoostDialog
        :boost-options="boostOptions"
        :coins="gameStore.coins"
        :format-time="formatTime"
        :is-production-boost-active="gameStore.isProductionBoostActive"
        :production-boost-time-left="gameStore.productionBoostTimeLeft"
        :show="showBoostDialog"
        @close="showBoostDialog = false"
        @start-boost="startBoost"
      />

      <SidebarBottomNav :nav-items="NAV_ITEMS" @nav-click="handleNavClick" />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import SidebarArmy from '@/components/sidebar/SidebarArmy.vue'
import SidebarBottomNav from '@/components/sidebar/SidebarBottomNav.vue'
import SidebarBoostDialog from '@/components/sidebar/SidebarBoostDialog.vue'
import SidebarCityInfo from '@/components/sidebar/SidebarCityInfo.vue'
import SidebarProduction from '@/components/sidebar/SidebarProduction.vue'
import SidebarResources from '@/components/sidebar/SidebarResources.vue'
import SidebarWarehouse from '@/components/sidebar/SidebarWarehouse.vue'
import { useGameSidebar } from '@/hooks/useGameSidebar.js'

export default {
  name: 'GameSidebar',
  components: {
    SidebarArmy,
    SidebarBottomNav,
    SidebarBoostDialog,
    SidebarCityInfo,
    SidebarProduction,
    SidebarResources,
    SidebarWarehouse
  },
  props: {
    isMobile: {
      type: Boolean,
      default: false
    },
    mobileOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle', 'nav-click', 'close-mobile'],
  setup(props, { emit }) {
    const sidebarState = useGameSidebar(props, emit)
    const sidebarClasses = computed(() => ({
      collapsed: sidebarState.isCollapsed.value,
      'mobile-open': props.isMobile && props.mobileOpen
    }))

    return {
      ...sidebarState,
      sidebarClasses
    }
  }
}
</script>

<style>
.sidebar-backdrop {
  @apply fixed inset-0 z-40;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
}

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

.mobile-sidebar-header {
  @apply flex items-center justify-between px-4 py-3 text-white;
  border-bottom: 1px solid rgba(35, 124, 72, 0.3);
}

.mobile-sidebar-title {
  @apply text-sm font-semibold tracking-wide;
}

.mobile-sidebar-close {
  @apply inline-flex h-9 w-9 items-center justify-center rounded-md text-white;
  background: rgba(55, 65, 81, 0.75);
  border: 1px solid rgba(35, 124, 72, 0.3);
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

.city-title-row {
  @apply flex justify-between items-center mb-3;
}

.city-title {
  @apply text-white text-sm font-medium;
  line-height: 20px;
}

.coins-display {
  @apply flex items-center gap-1 cursor-pointer hover:bg-yellow-600 hover:bg-opacity-20 px-2 py-1 rounded transition-colors;
}

.coins-icon {
  @apply text-sm;
}

.coins-amount {
  @apply text-yellow-400 text-sm font-bold;
  color: #FFB900;
}

.city-details {
  @apply space-y-2;
}

.detail-item {
  @apply flex items-center gap-2 text-white text-sm;
  line-height: 20px;
}

.civilization-row {
  @apply justify-between;
}

.civilization-left,
.civilization-right {
  @apply flex items-center gap-2;
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
  @apply flex justify-between items-center px-3 relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.production-item:hover {
  background-color: rgba(55, 65, 81, 0.3);
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

/* 生产力提示框样式 */
.production-tooltip {
  @apply absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50;
  @apply border border-green-500/50 rounded-md shadow-2xl;
  @apply text-white text-sm;
  min-width: 200px;
  max-width: 280px;
  /* 毛玻璃效果 */
  background: rgba(31, 41, 55, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.production-tooltip .tooltip-arrow {
  @apply absolute top-full left-1/2 transform -translate-x-1/2;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(16, 185, 129, 0.5);
}

.production-tooltip .tooltip-header {
  @apply px-3 py-2 text-white font-medium rounded-t-md;
  background: rgba(34, 197, 94, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-size: 12px;
}

.production-tooltip .tooltip-content {
  @apply p-3 space-y-2;
}

.production-tooltip .tooltip-item {
  @apply flex justify-between items-center;
  font-size: 11px;
  line-height: 16px;
  /* 不换行 */
}

.production-tooltip .tooltip-item.total {
  @apply border-t border-white/20 pt-2 mt-2;
  font-weight: 500;
}

.production-tooltip .tooltip-label {
  @apply text-gray-300;
}

.production-tooltip .tooltip-value {
  @apply text-white font-medium;
}

/* 淡入淡出动画 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.95);
}

.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.95);
}

.tooltip-fade-enter-to,
.tooltip-fade-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

/* 资源标题区域样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* 资源管理小圆点样式 */
.resource-dots-container {
  display: flex;
  gap: 8px;
}

.resource-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.resource-dot:hover {
  transform: scale(1.1);
}

.resource-dot.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resource-dot.disabled:hover {
  transform: none;
}

/* 一键爆仓小圆点 */
.fill-dot {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.fill-dot:hover:not(.disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* 容量加成小圆点 */
.boost-dot {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.boost-dot:hover:not(.disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.boost-dot.active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  animation: pulse-boost 2s infinite;
}

@keyframes pulse-boost {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
  }
}

.resource-dot svg {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
}

/* 资源小圆点悬浮提示样式 */
.resource-tooltip {
  @apply absolute bottom-full mb-2;
  @apply border border-green-500/50 rounded-md shadow-2xl;
  @apply text-white text-sm;
  min-width: 200px;
  max-width: 280px;
  z-index: 9999;
  /* 向左偏移，避免被右侧遮挡 */
  right: 0;
  transform: translateX(-20px);
  /* 毛玻璃效果 */
  background: rgba(31, 41, 55, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 移除三角形箭头样式 */

.resource-tooltip .tooltip-content {
  @apply p-3 space-y-2;
}

.resource-tooltip .tooltip-item {
  @apply flex flex-col space-y-1;
  font-size: 12px;
  line-height: 16px;
}

.resource-tooltip .tooltip-item.active {
  @apply text-green-400;
}

.resource-tooltip .tooltip-item.insufficient {
  @apply text-red-400;
}

.resource-tooltip .tooltip-label {
  @apply font-medium text-white;
}

.resource-tooltip .tooltip-value {
  @apply text-gray-300;
}

/* 悬浮提示过渡动画 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
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
  @apply grid grid-cols-3 gap-2;
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
  @apply space-y-2 mt-3;
}

.empty-army {
  @apply text-center py-4;
}

.empty-text {
  @apply text-gray-400 text-sm;
}

.army-item {
  @apply flex items-center gap-2 p-2 rounded-md transition-all duration-200;
  background: rgba(55, 65, 81, 0.3);
  border: 1px solid rgba(35, 124, 72, 0.2);
}

.army-item:hover {
  background: rgba(35, 124, 72, 0.4);
  border-color: rgba(35, 124, 72, 0.5);
}

.army-icon {
  @apply text-green-400 text-lg;
}

.army-info {
  @apply flex-1 flex justify-between items-center;
}

.army-name {
  @apply text-white text-sm;
}

.army-count-text {
  @apply text-green-300 text-sm font-medium;
}

/* 生产力加速按钮样式 */
.boost-btn {
  @apply flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200;
  @apply bg-yellow-600 bg-opacity-20 text-yellow-400 border border-yellow-600 border-opacity-30;
  @apply hover:bg-yellow-600 hover:bg-opacity-30 hover:border-opacity-50;
}

.boost-btn.boost-active {
  @apply bg-green-600 bg-opacity-30 text-green-400 border-green-600;
  @apply animate-pulse;
}

.boost-text {
  @apply font-medium;
}

/* 生产力加速弹窗样式 */
.boost-dialog-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
  backdrop-filter: blur(4px);
}

.boost-dialog {
  @apply bg-gray-800 rounded-lg shadow-xl border border-gray-600 max-w-md w-full mx-4;
  max-height: 80vh;
  overflow-y: auto;
}

.boost-dialog-header {
  @apply flex justify-between items-center p-4 border-b border-gray-600;
}

.boost-dialog-header h3 {
  @apply text-white text-lg font-semibold;
}

.close-btn {
  @apply text-gray-400 hover:text-white text-2xl font-bold cursor-pointer transition-colors;
  @apply w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700;
}

.boost-dialog-content {
  @apply p-4 space-y-4;
}

.boost-info {
  @apply space-y-2;
}

.boost-description {
  @apply text-gray-300 text-sm;
}

.current-coins {
  @apply flex justify-between items-center p-2 bg-gray-700 rounded-md;
}

.coins-label {
  @apply text-gray-400 text-sm;
}

.coins-value {
  @apply text-yellow-400 font-bold;
}

.boost-options {
  @apply space-y-2;
}

.boost-option {
  @apply p-3 bg-gray-700 rounded-md cursor-pointer transition-all duration-200;
  @apply border border-gray-600 hover:border-yellow-500 hover:bg-gray-600;
}

.boost-option.disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply hover:border-gray-600 hover:bg-gray-700;
}

.option-header {
  @apply flex justify-between items-center mb-1;
}

.option-duration {
  @apply text-white font-semibold;
}

.option-cost {
  @apply text-yellow-400 font-bold;
}

.option-description {
  @apply text-gray-400 text-sm;
}

.current-boost {
  @apply p-3 bg-green-900 bg-opacity-30 border border-green-600 border-opacity-50 rounded-md;
}

.current-boost-info {
  @apply flex justify-between items-center mb-2;
}

.boost-status {
  @apply text-green-400 font-semibold text-sm;
}

.boost-remaining {
  @apply text-green-300 text-sm;
}

.boost-note {
  @apply text-green-200 text-xs opacity-80;
}

@media (max-width: 1024px) {
  .game-sidebar {
    width: min(88vw, 320px);
    transform: translateX(-100%);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
  }

  .game-sidebar.mobile-open {
    transform: translateX(0);
  }

  .scrollable-content {
    @apply px-3 pb-4 pt-3;
  }
}
</style>
