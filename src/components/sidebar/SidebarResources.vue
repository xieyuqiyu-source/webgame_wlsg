<template>
  <div class="section">
    <div class="section-header">
      <span>本城资源</span>
      <div class="resource-dots-container">
        <div
          class="resource-dot fill-dot"
          :class="{ disabled: coins < 10 }"
          data-testid="sidebar-fill-warehouse"
          @click="$emit('fill-warehouse')"
          @mouseenter="$emit('update:showFillTooltip', true)"
          @mouseleave="$emit('update:showFillTooltip', false)"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>

          <Transition name="tooltip-fade">
            <div v-if="showFillTooltip" class="resource-tooltip">
              <div class="tooltip-content">
                <div v-if="coins < 10" class="tooltip-item insufficient">
                  <span class="tooltip-label">金币不足</span>
                  <span class="tooltip-value">需要10金币 (当前: {{ coins }})</span>
                </div>
                <div v-else class="tooltip-item">
                  <span class="tooltip-label">一键爆仓</span>
                  <span class="tooltip-value">消耗10金币填满所有资源</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div
          class="resource-dot boost-dot"
          :class="{ disabled: coins < warehouseBoostCost, active: isWarehouseBoostActive }"
          data-testid="sidebar-warehouse-boost"
          @click="$emit('activate-warehouse-boost')"
          @mouseenter="$emit('update:showBoostTooltip', true)"
          @mouseleave="$emit('update:showBoostTooltip', false)"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>

          <Transition name="tooltip-fade">
            <div v-if="showBoostTooltip" class="resource-tooltip">
              <div class="tooltip-content">
                <div v-if="isWarehouseBoostActive" class="tooltip-item active">
                  <span class="tooltip-label">容量加成激活中</span>
                  <span class="tooltip-value">剩余时间: {{ formatTime(warehouseBoostTimeLeft) }}</span>
                  <span class="tooltip-value">当前容量: {{ formatNumber(warehouseCapacity) }} (2倍加成)</span>
                </div>
                <div v-else-if="coins < warehouseBoostCost" class="tooltip-item insufficient">
                  <span class="tooltip-label">金币不足</span>
                  <span class="tooltip-value">需要{{ warehouseBoostCost }}金币 (当前: {{ coins }})</span>
                </div>
                <div v-else class="tooltip-item">
                  <span class="tooltip-label">容量加成</span>
                  <span class="tooltip-value">消耗{{ warehouseBoostCost }}金币获得2倍仓库容量</span>
                  <span class="tooltip-value">持续1小时</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <div class="resource-list">
      <div
        v-for="resource in resources"
        :key="resource.name"
        class="resource-item"
        :data-testid="`sidebar-resource-${resource.type}`"
      >
        <div class="resource-info">
          <img v-if="resource.icon" :src="resource.icon" :alt="resource.name" class="resource-icon" />
          <div v-else class="resource-icon resource-icon-fallback"></div>
          <span class="resource-name">{{ resource.name }}</span>
        </div>
        <div class="resource-value" :data-testid="`sidebar-resource-value-${resource.type}`">{{ resource.current }}/{{ resource.max }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarResources',
  emits: [
    'activate-warehouse-boost',
    'fill-warehouse',
    'update:showBoostTooltip',
    'update:showFillTooltip'
  ],
  props: {
    coins: {
      type: Number,
      required: true
    },
    formatNumber: {
      type: Function,
      required: true
    },
    formatTime: {
      type: Function,
      required: true
    },
    isWarehouseBoostActive: {
      type: Boolean,
      required: true
    },
    resources: {
      type: Array,
      required: true
    },
    showBoostTooltip: {
      type: Boolean,
      required: true
    },
    showFillTooltip: {
      type: Boolean,
      required: true
    },
    warehouseBoostCost: {
      type: Number,
      required: true
    },
    warehouseBoostTimeLeft: {
      type: Number,
      required: true
    },
    warehouseCapacity: {
      type: Number,
      required: true
    }
  }
}
</script>
