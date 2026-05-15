<template>
  <GamePageLayout page-class="map-view">
    <div class="content-area">
      <div class="map-header">
        <div>
          <h1 class="map-title">地图</h1>
          <p class="map-subtitle">正式地图功能只保留城池和副本，调试工具已独立。</p>
        </div>
        <router-link class="debug-entry" to="/map-debug">
          打开战斗调试页
        </router-link>
      </div>

      <MapTabs :active-tab="activeTab" :tabs="formalTabs" @tab-change="handleTabChange">
        <NpcList v-show="activeTab === 'npc'" />
        <PlayerList v-show="activeTab === 'player'" />
        <DungeonList v-show="activeTab === 'dungeon'" />
      </MapTabs>
    </div>
  </GamePageLayout>
</template>

<script>
import GamePageLayout from '@/components/GamePageLayout.vue'
import MapTabs from './components/MapTabs.vue'
import NpcList from './components/NpcList.vue'
import PlayerList from './components/PlayerList.vue'
import DungeonList from './components/DungeonList.vue'

export default {
  name: 'MapView',
  components: {
    GamePageLayout,
    MapTabs,
    NpcList,
    PlayerList,
    DungeonList
  },
  data() {
    return {
      activeTab: 'npc',
      formalTabs: [
        {
          key: 'npc',
          label: 'NPC城池',
          count: 0,
          iconPath: 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L13.5 7H10.5L9 4L3 7V9H5V20H7V14H9V20H11V9H13V20H15V14H17V20H19V9H21Z'
        },
        {
          key: 'player',
          label: '玩家城池',
          count: 0,
          iconPath: 'M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12S12 10.2 12 8S13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8 4C10.2 4 12 5.8 12 8C12 10.2 10.2 12 8 12C5.8 12 4 10.2 4 8C4 5.8 5.8 4 8 4M8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z'
        },
        {
          key: 'dungeon',
          label: '副本',
          count: 0,
          iconPath: 'M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M17 12V14H15V16H13V14H11V12H13V10H15V12H17Z'
        }
      ]
    }
  },
  methods: {
    handleTabChange(tabKey) {
      this.activeTab = tabKey
      console.log('切换到Tab:', tabKey)
    }
  }
}
</script>

<style scoped>
.map-view {
  @apply min-h-screen;
  /* background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%); */
  position: relative;
}

.map-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(35, 124, 72, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(255, 185, 0, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.map-view :deep(.page-main) {
  position: relative;
  z-index: 1;
}

.content-area {
  @apply min-h-full;
}

.map-header {
  @apply mb-4 flex items-start justify-between gap-4;
}

.map-title {
  @apply text-2xl font-bold text-white mb-1;
}

.map-subtitle {
  @apply text-sm text-gray-300;
}

.debug-entry {
  @apply inline-flex items-center justify-center rounded-md border border-green-600 px-4 py-2 text-sm font-medium text-green-200 transition-colors;
  background: rgba(17, 24, 39, 0.55);
}

.debug-entry:hover {
  @apply text-white border-green-500;
  background: rgba(35, 124, 72, 0.25);
}

@media (max-width: 768px) {
  .map-header {
    @apply flex-col items-stretch;
  }

  .map-title {
    @apply text-xl;
  }

  .debug-entry {
    @apply w-full;
  }
}
</style>
