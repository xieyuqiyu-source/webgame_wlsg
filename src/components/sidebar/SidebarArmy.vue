<template>
  <div class="section">
    <div class="section-header">
      <span>本城直属军队</span>
      <span class="army-count">总数: {{ totalArmyCount }}</span>
    </div>

    <button v-if="general && generalProgress" type="button" class="general-entry" @click="$emit('general-click')">
      <span class="general-entry-label">将领</span>
      <span class="general-entry-value">{{ general.name }} Lv.{{ generalProgress.level }}</span>
    </button>

    <div class="army-grid">
      <div v-if="Object.keys(army).length === 0" class="empty-army">
        <span class="empty-text">暂无军队</span>
      </div>
      <div v-else v-for="(count, unitId) in army" :key="unitId" class="army-item">
        <HoverCard
          density="compact"
          placement="right"
          :show="hoveredUnitId === unitId"
          @mouseenter="hoveredUnitId = unitId"
          @mouseleave="hoveredUnitId = null"
        >
          <template #trigger>
            <div class="army-icon">{{ getUnitIcon(unitId) }}</div>
          </template>
          <UnitHoverContent v-if="getUnit(unitId)" :unit="getUnit(unitId)" />
        </HoverCard>
        <div class="army-info">
          <span class="army-name">{{ getUnitName(unitId) }}</span>
          <span class="army-count-text">x{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HoverCard from '@/components/hover/HoverCard.vue'
import UnitHoverContent from '@/components/hover/UnitHoverContent.vue'
import { getUnitById } from '@/config/factionConfig.js'

export default {
  name: 'SidebarArmy',
  components: {
    HoverCard,
    UnitHoverContent
  },
  props: {
    army: { type: Object, required: true },
    general: { type: Object, default: null },
    generalProgress: { type: Object, default: null },
    getUnitIcon: { type: Function, required: true },
    getUnitName: { type: Function, required: true },
    totalArmyCount: { type: Number, required: true }
  },
  emits: ['general-click'],
  data() {
    return { hoveredUnitId: null }
  },
  methods: {
    getUnit(unitId) {
      return getUnitById(unitId)
    }
  }
}
</script>

<style scoped>
.general-entry {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  border: 1px solid rgba(199, 210, 254, 0.9);
  border-radius: 12px;
  padding: 8px 10px;
  color: #312e81;
  background: rgba(238, 242, 255, 0.9);
  font-size: 13px;
}

.general-entry-label {
  color: #6366f1;
}

.general-entry-value {
  font-weight: 700;
}
</style>
