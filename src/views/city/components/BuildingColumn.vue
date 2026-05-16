<template>
  <div class="building-column">
    <BuildingCard 
      v-for="building in buildings" 
      :key="building.id"
      :building="building"
      :resource-type="resourceType"
      :building-type="building.buildingType"
      :building-index="building.buildingIndex"
      :icon="icon"
      @click="handleBuildingClick(building)"
    />
  </div>
</template>

<script>
import BuildingCard from './BuildingCard.vue'

export default {
  name: 'BuildingColumn',
  components: {
    BuildingCard
  },
  props: {
    //=== buildings 建筑列表数据
    buildings: {
      type: Array,
      required: true
    },
    //=== resourceType 资源类型
    resourceType: {
      type: String,
      required: true
    },
    //=== buildingType 建筑类型
    buildingType: {
      type: String,
      required: true
    },
    //=== icon SVG图标字符串
    icon: {
      type: String,
      default: ''
    }
  },
  emits: ['building-click'],
  methods: {
    //=== handleBuildingClick 处理建筑点击事件
    handleBuildingClick(building) {
      this.$emit('building-click', building, this.resourceType)
    }
  }
}
</script>

<style scoped>
.building-column {
  @apply flex flex-col gap-4 flex-1;
}

@media (max-width: 768px) {
  .building-column {
    @apply gap-3;
  }
}
</style>
