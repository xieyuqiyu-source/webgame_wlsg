<template>
  <div class="section">
    <div class="section-header">仓库管理</div>
    <div class="warehouse-info">
      <div class="warehouse-level">
        <span class="warehouse-label">仓库等级:</span>
        <span class="warehouse-value">{{ warehouseLevel }}/{{ warehouseMaxLevel }}</span>
      </div>
      <div
        class="warehouse-upgrade-container"
        @mouseenter="$emit('update:showTooltip', true)"
        @mouseleave="$emit('update:showTooltip', false)"
      >
        <button
          class="warehouse-upgrade-btn relative overflow-hidden"
          :class="canUpgradeWarehouse && !isWarehouseUpgrading ? 'enabled' : 'disabled'"
          :disabled="!canUpgradeWarehouse || isWarehouseUpgrading"
          data-testid="sidebar-warehouse-upgrade"
          @click="$emit('upgrade-warehouse')"
        >
          <div
            v-if="isWarehouseUpgrading"
            class="absolute inset-0 bg-green-500 transition-all duration-100 ease-linear"
            :style="{ width: warehouseUpgradeProgress + '%' }"
          ></div>

          <span class="relative z-10 color-white">
            <template v-if="isWarehouseUpgrading">
              升级中... {{ Math.round(warehouseUpgradeProgress) }}%
            </template>
            <template v-else>
              {{ warehouseLevel >= warehouseMaxLevel ? '已满级' : `升级 (${warehouseLevel} → ${warehouseLevel + 1})` }}
            </template>
          </span>
        </button>

        <div v-if="showTooltip && (!canUpgradeWarehouse || isWarehouseUpgrading)" class="upgrade-tooltip">
          <div class="tooltip-arrow"></div>
          <div class="tooltip-header">升级条件</div>
          <div v-if="isWarehouseUpgrading" class="tooltip-content">
            <div class="tooltip-item upgrading">仓库正在升级中...</div>
            <div class="tooltip-item">
              <div class="text-green-400 text-center mt-1">剩余时间: {{ formatTime(warehouseUpgradeTimeLeft) }}</div>
            </div>
          </div>
          <div v-else-if="warehouseLevel >= warehouseMaxLevel" class="tooltip-content">
            <div class="tooltip-item max-level">仓库已达到最大等级</div>
          </div>
          <div v-else class="tooltip-content">
            <div v-for="(cost, resourceType) in warehouseUpgradeCost" :key="resourceType" class="tooltip-item">
              <div class="resource-requirement" :class="{ insufficient: resourceAmounts[resourceType] < cost }">
                <span class="resource-name">{{ getResourceName(resourceType) }}:</span>
                <span class="resource-amount">{{ resourceAmounts[resourceType] }}/{{ cost }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarWarehouse',
  emits: ['upgrade-warehouse', 'update:showTooltip'],
  props: {
    canUpgradeWarehouse: {
      type: Boolean,
      required: true
    },
    formatTime: {
      type: Function,
      required: true
    },
    getResourceName: {
      type: Function,
      required: true
    },
    isWarehouseUpgrading: {
      type: Boolean,
      required: true
    },
    resourceAmounts: {
      type: Object,
      required: true
    },
    showTooltip: {
      type: Boolean,
      required: true
    },
    warehouseLevel: {
      type: Number,
      required: true
    },
    warehouseMaxLevel: {
      type: Number,
      required: true
    },
    warehouseUpgradeCost: {
      type: Object,
      required: true
    },
    warehouseUpgradeProgress: {
      type: Number,
      required: true
    },
    warehouseUpgradeTimeLeft: {
      type: Number,
      required: true
    }
  }
}
</script>
