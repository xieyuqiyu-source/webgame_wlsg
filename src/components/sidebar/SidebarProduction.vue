<template>
  <div class="section">
    <div class="section-header">
      <span>城池生产力</span>
      <button
        class="boost-btn"
        :class="{ 'boost-active': isProductionBoostActive }"
        :title="isProductionBoostActive ? `加速中，剩余${formatTime(productionBoostTimeLeft)}` : '生产力加速'"
        @click="$emit('open-boost-dialog')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13,2.05V5.08C16.39,5.57 19,8.47 19,12C19,12.9 18.82,13.75 18.5,14.54L21.12,16.07C21.68,14.83 22,13.45 22,12C22,6.82 18.05,2.55 13,2.05M12,19C8.13,19 5,15.87 5,12C5,8.47 7.61,5.57 11,5.08V2.05C5.94,2.55 2,6.81 2,12C2,17.52 6.48,22 12,22C13.45,22 14.83,21.68 16.07,21.12L14.54,18.5C13.75,18.82 12.9,19 12,19M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12Z"/>
        </svg>
        <span v-if="isProductionBoostActive" class="boost-text">{{ formatTime(productionBoostTimeLeft) }}</span>
        <span v-else class="boost-text">加速</span>
      </button>
    </div>

    <div class="production-list">
      <div
        v-for="production in productions"
        :key="production.name"
        class="production-item"
        @mouseenter="$emit('update:showProductionTooltip', production.type)"
        @mouseleave="$emit('update:showProductionTooltip', null)"
      >
        <div class="production-info">
          <img v-if="production.icon" :src="production.icon" :alt="production.name" class="production-icon" />
          <div v-else class="production-icon production-icon-fallback"></div>
          <span class="production-name">{{ production.name }}</span>
        </div>
        <div class="production-details">
          <span class="production-rate">{{ production.rate }} 每小时</span>
        </div>

        <Transition name="tooltip-fade">
          <div v-if="showProductionTooltip === production.type" class="production-tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-content">
              <div class="tooltip-item">
                <span class="tooltip-label">基础产量: <span class="tooltip-value">{{ production.baseProduction }} 每小时</span></span>
              </div>
              <div v-if="userFaction" class="tooltip-item">
                <span class="tooltip-label">阵营加成: <span class="tooltip-value" :class="production.bonusClass">{{ production.bonusText }}</span></span>
              </div>
              <div class="tooltip-item total">
                <span class="tooltip-label">总产量: <span class="tooltip-value text-yellow-400">{{ production.rate }} 每小时</span></span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarProduction',
  emits: ['open-boost-dialog', 'update:showProductionTooltip'],
  props: {
    formatTime: {
      type: Function,
      required: true
    },
    isProductionBoostActive: {
      type: Boolean,
      required: true
    },
    productionBoostTimeLeft: {
      type: Number,
      required: true
    },
    productions: {
      type: Array,
      required: true
    },
    showProductionTooltip: {
      type: String,
      default: null
    },
    userFaction: {
      type: String,
      default: ''
    }
  }
}
</script>
