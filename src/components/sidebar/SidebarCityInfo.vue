<template>
  <div class="city-info-card">
    <div class="city-header">
      <div class="city-title-row">
        <div class="city-title">新的城池p0sg (101|38)</div>
        <div class="coins-display" data-testid="sidebar-coins-display" @click="$emit('coins-click')">
          <span class="coins-icon">💰</span>
          <span class="coins-amount" data-testid="sidebar-coins-amount">{{ coins }}</span>
        </div>
      </div>
      <div class="city-details">
        <div class="detail-item civilization-row">
          <div class="civilization-left">
            <div class="status-dot red"></div>
            <span>城池文明度: {{ formatCivilization(citycivilization) }}</span>
          </div>
          <div class="civilization-right">
            <div class="status-dot" :class="civilizationLevel.statusColor || 'blue'"></div>
            <span :class="civilizationLevel.color">{{ civilizationLevel.level }}</span>
          </div>
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
</template>

<script>
export default {
  name: 'SidebarCityInfo',
  emits: ['coins-click'],
  props: {
    citycivilization: {
      type: Number,
      required: true
    },
    civilizationLevel: {
      type: Object,
      required: true
    },
    coins: {
      type: Number,
      required: true
    },
    formatCivilization: {
      type: Function,
      required: true
    }
  }
}
</script>
