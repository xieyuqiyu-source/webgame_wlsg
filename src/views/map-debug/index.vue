<template>
  <GamePageLayout page-class="map-debug-view">
    <div class="content-area">
      <div class="debug-header">
        <div>
          <h1 class="debug-title">地图调试</h1>
          <p class="debug-subtitle">战斗模拟器和测试工具从正式地图页拆出，避免干扰主玩法入口。</p>
        </div>
        <router-link class="back-link" to="/map">
          返回正式地图
        </router-link>
      </div>

      <MapTabs :active-tab="activeTab" :tabs="debugTabs" @tab-change="handleTabChange">
        <BattleSimulator v-show="activeTab === 'battle'" />
        <TestList v-show="activeTab === 'test'" />
      </MapTabs>
    </div>
  </GamePageLayout>
</template>

<script>
import GamePageLayout from '@/components/GamePageLayout.vue'
import MapTabs from '@/views/map/components/MapTabs.vue'
import BattleSimulator from '@/views/map/components/BattleSimulator.vue'
import TestList from '@/views/map/components/TestList.vue'

export default {
  name: 'MapDebugView',
  components: {
    GamePageLayout,
    MapTabs,
    BattleSimulator,
    TestList
  },
  data() {
    return {
      activeTab: 'battle',
      debugTabs: [
        {
          key: 'battle',
          label: '战斗模拟器',
          count: 0,
          iconPath: 'M6.92 5H5L6.5 6.5L5 8H6.92L8.42 6.5L6.92 5M13 2.05V5.08C16.39 5.57 19 8.47 19 12C19 12.9 18.82 13.75 18.5 14.54L21.12 16.07C21.68 14.83 22 13.45 22 12C22 6.82 18.05 2.55 13 2.05M12 19C8.13 19 5 15.87 5 12C5 8.47 7.61 5.57 11 5.08V2.05C5.94 2.55 2 6.81 2 12C2 17.52 6.48 22 12 22C14.8 22 17.32 20.75 19 18.72L16.37 17.19C15.17 18.43 13.67 19 12 19Z'
        },
        {
          key: 'test',
          label: '规则测试',
          count: 0,
          iconPath: 'M7 2V4H8V18C8 19.1 8.9 20 10 20H14C15.1 20 16 19.1 16 18V4H17V2H7M10 4H14V18H10V4M11 6V16H13V6H11Z'
        }
      ]
    }
  },
  methods: {
    handleTabChange(tabKey) {
      this.activeTab = tabKey
    }
  }
}
</script>

<style scoped>
.map-debug-view {
  @apply min-h-screen;
  position: relative;
}

.map-debug-view::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(35, 124, 72, 0.08), transparent 45%);
  pointer-events: none;
  z-index: 0;
}

.map-debug-view :deep(.page-main) {
  position: relative;
  z-index: 1;
}

.content-area {
  @apply min-h-full;
}

.debug-header {
  @apply mb-4 flex items-start justify-between gap-4;
}

.debug-title {
  @apply text-2xl font-bold text-white mb-1;
}

.debug-subtitle {
  @apply text-sm text-gray-300;
}

.back-link {
  @apply inline-flex items-center justify-center rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-200 transition-colors;
  background: rgba(17, 24, 39, 0.55);
}

.back-link:hover {
  @apply text-white border-gray-500;
  background: rgba(55, 65, 81, 0.4);
}
</style>
