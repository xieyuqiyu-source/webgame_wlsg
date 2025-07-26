<template>
  <div class="map-view">
    <!-- 游戏侧边栏 -->
    <GameSidebar @toggle="handleSidebarToggle" />
    
    <!-- 主要内容区域 -->
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
     
      
      <div class="content-area">
        <!-- Tab 切换组件 -->
        <MapTabs :active-tab="activeTab" @tab-change="handleTabChange">
          <!-- NPC城池列表 -->
          <NpcList v-show="activeTab === 'npc'" />
          
          <!-- 玩家城池列表 -->
          <PlayerList v-show="activeTab === 'player'" />
          
          <!-- 副本列表 -->
          <DungeonList v-show="activeTab === 'dungeon'" />
          
          <!-- 测试页面 -->
          <TestList v-show="activeTab === 'test'" />
        </MapTabs>
      </div>
    </div>
  </div>
</template>

<script>
import GameSidebar from '@/components/GameSidebar.vue'
import MapTabs from './components/MapTabs.vue'
import NpcList from './components/NpcList.vue'
import PlayerList from './components/PlayerList.vue'
import DungeonList from './components/DungeonList.vue'
import TestList from './components/TestList.vue'

export default {
  name: 'MapView',
  components: {
    GameSidebar,
    MapTabs,
    NpcList,
    PlayerList,
    DungeonList,
    TestList
  },
  data() {
    return {
      //=== sidebarCollapsed 侧边栏是否折叠
      sidebarCollapsed: false,
      //=== activeTab 当前激活的Tab页
      activeTab: 'npc'
    }
  },
  methods: {
    //=== handleSidebarToggle 处理侧边栏切换事件
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    
    //=== handleTabChange 处理Tab切换事件
    handleTabChange(tabKey) {
      this.activeTab = tabKey
      console.log('切换到Tab:', tabKey)
    }
  }
}
</script>

<style scoped>
.map-view {
  @apply flex h-screen;
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

.main-content {
  @apply flex-1 ml-80 transition-all duration-300 ease-in-out;
  position: relative;
  z-index: 1;
}

.main-content.sidebar-collapsed {
  @apply ml-16;
}

.content-area {
  @apply p-6;
}
</style>