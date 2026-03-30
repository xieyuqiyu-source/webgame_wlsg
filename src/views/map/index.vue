<template>
  <GamePageLayout page-class="map-view">
    <div class="content-area">
      <MapTabs :active-tab="activeTab" @tab-change="handleTabChange">
        <NpcList v-show="activeTab === 'npc'" />
        <PlayerList v-show="activeTab === 'player'" />
        <DungeonList v-show="activeTab === 'dungeon'" />
        <TestList v-show="activeTab === 'test'" />
        <BattleSimulator v-show="activeTab === 'battle'" />
      </MapTabs>
    </div>
  </GamePageLayout>
</template>

<script>
import GamePageLayout from '@/components/GamePageLayout.vue'
import MapTabs from './components/MapTabs.vue'
import NpcList from './components/NpcList.vue'
import PlayerList from './components/PlayerList.vue'
import BattleSimulator from './components/BattleSimulator.vue'
import DungeonList from './components/DungeonList.vue'
import TestList from './components/TestList.vue'

export default {
  name: 'MapView',
  components: {
    GamePageLayout,
    MapTabs,
    NpcList,
    PlayerList,
    DungeonList,
    TestList,
    BattleSimulator
  },
  data() {
    return {
      activeTab: 'npc'
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
</style>
