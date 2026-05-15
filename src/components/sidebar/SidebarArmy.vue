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
          <span class="army-count-text">×{{ count }}</span>
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
  },
  data() {
    return {
      hoveredUnitId: null
    }
  },
  methods: {
    getUnit(unitId) {
      return getUnitById(unitId)
    }
  }
}
</script>
