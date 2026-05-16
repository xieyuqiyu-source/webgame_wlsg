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
  background: rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(10px);
}

.game-sidebar {
  position: fixed;
  left: 16px;
  top: 16px;
  z-index: 50;
  width: 304px;
  height: calc(100vh - 32px);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(22px);
  border: 1px solid rgba(229, 231, 235, 0.96);
  border-radius: 30px;
  box-shadow: 0 24px 60px -22px rgba(15, 23, 42, 0.25);
  color: #111827;
  font-family: 'Inter', 'PingFang SC', sans-serif;
}

.game-sidebar.collapsed {
  width: 76px;
}

.sidebar-toggle {
  position: absolute;
  right: -14px;
  top: 40px;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.96);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: #4f46e5;
}

.sidebar-content {
  @apply h-full flex flex-col;
}

.mobile-sidebar-header {
  @apply flex items-center justify-between px-5 py-4;
  border-bottom: 1px solid rgba(229, 231, 235, 0.92);
}

.mobile-sidebar-title {
  @apply text-sm font-semibold tracking-wide;
  color: #111827;
}

.mobile-sidebar-close {
  @apply inline-flex h-10 w-10 items-center justify-center rounded-full;
  color: #111827;
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.92);
}

.scrollable-content {
  @apply flex-1 overflow-y-auto px-4 py-5;
  scrollbar-width: none;
}

.scrollable-content::-webkit-scrollbar {
  display: none;
}

.city-info-card {
  @apply mb-4 rounded-[24px] p-5;
  background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 55%, rgba(255, 255, 255, 0.96) 100%);
  border: 1px solid rgba(199, 210, 254, 0.88);
  box-shadow: 0 10px 28px rgba(79, 70, 229, 0.08);
}

.city-header,
.city-details {
  @apply space-y-3;
}

.city-title-row,
.civilization-row,
.warehouse-level,
.current-coins,
.current-boost-info,
.option-header,
.section-header,
.army-info {
  @apply flex items-center justify-between;
}

.city-title {
  @apply text-sm font-semibold;
  color: #111827;
  line-height: 20px;
}

.coins-display {
  @apply flex items-center gap-1 rounded-full px-3 py-1.5 transition-colors;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(229, 231, 235, 0.88);
}

.coins-icon {
  @apply text-sm;
}

.coins-amount {
  @apply text-sm font-bold;
  color: #d97706;
}

.detail-item,
.resource-item,
.production-item,
.tooltip-item {
  @apply flex items-center gap-2 text-sm;
  color: #6b7280;
  line-height: 20px;
}

.civilization-left,
.civilization-right,
.resource-info,
.production-info,
.production-details {
  @apply flex items-center gap-2;
}

.status-dot {
  @apply w-2 h-2 rounded-full flex-shrink-0;
}

.status-dot.red { background: #ef4444; }
.status-dot.yellow { background: #f59e0b; }
.status-dot.green { background: #10b981; }
.status-dot.blue { background: #3b82f6; }

.section {
  @apply mb-4 rounded-[24px] p-4;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(229, 231, 235, 0.92);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.section-header {
  @apply text-sm font-semibold mb-3 pb-2;
  color: #111827;
  border-bottom: 1px solid rgba(229, 231, 235, 0.96);
  line-height: 24px;
}

.army-count {
  @apply text-sm cursor-pointer;
  color: #4f46e5;
}

.resource-list,
.production-list,
.warehouse-info,
.boost-info,
.boost-options,
.gm-section,
.army-grid {
  @apply space-y-2;
}

.resource-item,
.production-item {
  @apply px-3 py-2 rounded-2xl;
}

.production-item {
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.production-item:hover {
  background: rgba(99, 102, 241, 0.05);
}

.resource-icon,
.production-icon {
  @apply w-4 h-4 rounded-sm flex-shrink-0;
}

.resource-icon-fallback,
.production-icon-fallback {
  @apply bg-gray-300;
}

.resource-name,
.production-name,
.warehouse-label {
  @apply text-sm;
  color: #6b7280;
}

.resource-name,
.production-name {
  width: 32px;
}

.resource-value,
.warehouse-value {
  @apply text-sm font-semibold;
  color: #111827;
}

.production-rate {
  @apply text-sm font-semibold;
  color: #4f46e5;
  width: 92px;
  text-align: right;
  white-space: nowrap;
}

.resource-dots-container {
  display: flex;
  gap: 8px;
}

.resource-dot {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(229, 231, 235, 0.96);
}

.resource-dot:hover {
  transform: translateY(-1px);
}

.resource-dot.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fill-dot {
  background: linear-gradient(135deg, #34d399, #059669);
  color: white;
}

.boost-dot {
  background: linear-gradient(135deg, #818cf8, #4f46e5);
  color: white;
}

.boost-dot.active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  animation: pulse-boost 2s infinite;
}

@keyframes pulse-boost {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45); }
  50% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
}

.resource-dot svg {
  width: 12px;
  height: 12px;
}

.boost-btn,
.warehouse-upgrade-btn.enabled {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  box-shadow: 0 10px 24px rgba(79, 70, 229, 0.18);
}

.boost-btn {
  @apply flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all duration-200;
}

.boost-btn.boost-active {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.boost-text {
  @apply font-semibold;
}

.warehouse-upgrade-btn {
  @apply w-full px-3 py-2.5 text-xs rounded-2xl transition-all duration-200;
}

.warehouse-upgrade-btn.disabled {
  background: rgba(226, 232, 240, 0.85);
  color: #94a3b8;
  cursor: not-allowed;
}

.warehouse-upgrade-container {
  @apply relative;
}

.army-item {
  @apply flex items-center gap-3 p-3 rounded-2xl transition-all duration-200;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(229, 231, 235, 0.92);
}

.army-icon {
  font-size: 1.125rem;
}

.army-name {
  @apply text-sm font-medium;
  color: #111827;
}

.army-count-text {
  @apply text-sm font-semibold;
  color: #4f46e5;
}

.empty-army {
  @apply text-center py-4;
}

.empty-text {
  @apply text-sm;
  color: #94a3b8;
}

.resource-tooltip,
.production-tooltip,
.upgrade-tooltip {
  min-width: 200px;
  max-width: 280px;
  z-index: 9999;
  color: white;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(129, 140, 248, 0.24);
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.22);
  backdrop-filter: blur(14px);
}

.resource-tooltip {
  @apply absolute bottom-full mb-2 p-3;
  right: 0;
  transform: translateX(-12px);
}

.production-tooltip {
  @apply absolute bottom-full left-1/2 mb-2 z-50 p-3;
  transform: translateX(-50%);
}

.upgrade-tooltip {
  @apply absolute bottom-full left-1/2 mb-2 p-3 z-50;
  transform: translateX(-50%);
}

.production-tooltip .tooltip-arrow,
.tooltip-arrow {
  @apply absolute top-full left-1/2;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(15, 23, 42, 0.92);
}

.resource-tooltip .tooltip-content,
.production-tooltip .tooltip-content,
.upgrade-tooltip .tooltip-content {
  @apply space-y-2;
}

.resource-tooltip .tooltip-item,
.upgrade-tooltip .tooltip-item {
  @apply flex flex-col space-y-1;
  font-size: 12px;
  line-height: 16px;
}

.production-tooltip .tooltip-item {
  @apply flex justify-between items-center;
  font-size: 11px;
  line-height: 16px;
}

.production-tooltip .tooltip-item.total {
  @apply border-t pt-2 mt-2;
  border-color: rgba(255, 255, 255, 0.14);
}

.tooltip-header,
.resource-tooltip .tooltip-label,
.production-tooltip .tooltip-value,
.resource-tooltip .tooltip-label {
  @apply font-semibold;
}

.production-tooltip .tooltip-label,
.resource-tooltip .tooltip-value {
  color: #cbd5e1;
}

.resource-tooltip .tooltip-label,
.tooltip-header {
  color: #fff;
}

.tooltip-item.active { color: #4ade80; }
.tooltip-item.insufficient { color: #f87171; }
.tooltip-item.upgrading { @apply text-center; color: #60a5fa; }
.tooltip-item.max-level { @apply text-center; color: #fbbf24; }

.resource-requirement {
  @apply flex justify-between items-center rounded-xl px-2 py-1.5;
  background: rgba(51, 65, 85, 0.72);
}

.resource-requirement.insufficient {
  background: rgba(127, 29, 29, 0.35);
  color: #fca5a5;
}

.resource-requirement:not(.insufficient) {
  color: #86efac;
}

.resource-amount {
  @apply font-mono text-right;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.22s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.boost-dialog-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  background: rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(10px);
}

.boost-dialog {
  @apply w-full max-w-md overflow-y-auto rounded-[28px] mx-4;
  max-height: 80vh;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(229, 231, 235, 0.96);
  box-shadow: 0 24px 60px -22px rgba(15, 23, 42, 0.25);
}

.boost-dialog-header {
  @apply flex items-center justify-between px-5 py-4;
  border-bottom: 1px solid rgba(229, 231, 235, 0.92);
}

.boost-dialog-header h3 {
  @apply text-lg font-semibold;
  color: #111827;
}

.close-btn {
  @apply flex h-10 w-10 items-center justify-center rounded-full text-2xl font-bold transition-colors;
  color: #6b7280;
}

.boost-dialog-content {
  @apply p-5 space-y-4;
}

.boost-description,
.coins-label,
.option-description {
  @apply text-sm;
  color: #6b7280;
}

.coins-value,
.option-cost {
  @apply font-bold;
  color: #4f46e5;
}

.boost-option,
.current-boost {
  @apply rounded-2xl p-3 transition-all duration-200 border;
  border-color: rgba(229, 231, 235, 0.92);
  background: rgba(248, 250, 252, 0.92);
}

.boost-option:hover {
  border-color: rgba(129, 140, 248, 0.5);
  box-shadow: 0 10px 24px rgba(79, 70, 229, 0.08);
}

.boost-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-duration,
.boost-status {
  @apply font-semibold;
  color: #111827;
}

.boost-remaining,
.boost-note {
  color: #16a34a;
}

@media (max-width: 1024px) {
  .game-sidebar {
    left: auto;
    right: 12px;
    top: 12px;
    width: min(320px, calc(100vw - 24px));
    height: calc(100vh - 24px);
    transform: translateX(110%);
  }

  .game-sidebar.mobile-open {
    transform: translateX(0);
  }
}
</style>
