<template>
  <div class="section">
    <div class="section-header">
      <span>本城直属军队</span>
      <span class="army-count">总数: {{ totalArmyCount }}</span>
    </div>
    <div class="army-grid">
      <div v-if="Object.keys(army).length === 0" class="empty-army">
        <span class="empty-text">暂无军队</span>
      </div>
      <div v-else v-for="(count, unitId) in army" :key="unitId" class="army-item">
        <div class="army-icon">{{ getUnitIcon(unitId) }}</div>
        <div class="army-info">
          <span class="army-name">{{ getUnitName(unitId) }}</span>
          <span class="army-count-text">×{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarArmy',
  props: {
    army: {
      type: Object,
      required: true
    },
    getUnitIcon: {
      type: Function,
      required: true
    },
    getUnitName: {
      type: Function,
      required: true
    },
    totalArmyCount: {
      type: Number,
      required: true
    }
  }
}
</script>
