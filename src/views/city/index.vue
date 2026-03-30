<template>
  <GamePageLayout page-class="city-view">
    <div class="content-area">
      <CityTabs :active-tab="activeTab" @tab-change="handleTabChange">
        <ResourceBuildingGrid
          v-if="activeTab === 'resource'"
          :resource-buildings="resourceBuildings"
          @building-click="handleBuildingClick"
        />

        <MilitaryBuildings v-if="activeTab === 'military'" />
      </CityTabs>
    </div>
  </GamePageLayout>
</template>

<script>
import GamePageLayout from '@/components/GamePageLayout.vue'
import { RESOURCE_BUILDINGS } from '@/config/cityViewConfig.js'
import CityTabs from './components/CityTabs.vue'
import ResourceBuildingGrid from './components/ResourceBuildingGrid.vue'
import MilitaryBuildings from './components/MilitaryBuildings.vue'

export default {
  name: 'CityView',
  components: {
    GamePageLayout,
    CityTabs,
    ResourceBuildingGrid,
    MilitaryBuildings
  },
  data() {
    return {
      activeTab: 'resource',
      resourceBuildings: RESOURCE_BUILDINGS
    }
  },
  methods: {
    handleTabChange(tab) {
      this.activeTab = tab
    },
    handleBuildingClick(building, resourceType) {
      console.log('建筑点击:', building, '资源类型:', resourceType)
    }
  }
}
</script>

<style scoped>
.city-view {
  @apply min-h-screen;
}

.content-area {
  @apply min-h-full;
}
</style>
