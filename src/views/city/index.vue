<template>
  <div class="city-view">
    <!-- 游戏侧边栏 -->
    <GameSidebar @toggle="handleSidebarToggle" />
    
    <!-- 主要内容区域 -->
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      
      <div class="content-area">
        <!-- Tab 切换组件 -->
        <CityTabs :active-tab="activeTab" @tab-change="handleTabChange">
          <!-- 资源建筑内容 -->
          <ResourceBuildingGrid 
            v-if="activeTab === 'resource'"
            :resource-buildings="resourceBuildings"
            @building-click="handleBuildingClick"
          />
          
          <!-- 军事建筑内容 -->
          <MilitaryBuildings v-if="activeTab === 'military'" />
        </CityTabs>
      </div>
    </div>
  </div>
</template>

<script>
import GameSidebar from '@/components/GameSidebar.vue'
import CityTabs from './components/CityTabs.vue'
import ResourceBuildingGrid from './components/ResourceBuildingGrid.vue'
import MilitaryBuildings from './components/MilitaryBuildings.vue'

export default {
  name: 'CityView',
  components: {
    GameSidebar,
    CityTabs,
    ResourceBuildingGrid,
    MilitaryBuildings
  },
  data() {
    return {
      sidebarCollapsed: false,
      //=== activeTab 当前激活的Tab页
      activeTab: 'resource',
      //=== resourceBuildings 资源建筑数据 - 4种资源，每种5个相同建筑
      resourceBuildings: {
        wood: [
          { id: 1, name: '伐木场 1', buildingType: 'woodMill', buildingIndex: 0, icon: '🪓' },
          { id: 2, name: '伐木场 2', buildingType: 'woodMill', buildingIndex: 1, icon: '🪓' },
          { id: 3, name: '伐木场 3', buildingType: 'woodMill', buildingIndex: 2, icon: '🪓' },
          { id: 4, name: '伐木场 4', buildingType: 'woodMill', buildingIndex: 3, icon: '🪓' },
          { id: 5, name: '伐木场 5', buildingType: 'woodMill', buildingIndex: 4, icon: '🪓' }
        ],
        soil: [
          { id: 6, name: '泥土矿 1', buildingType: 'soilMine', buildingIndex: 0, icon: '⛏️' },
          { id: 7, name: '泥土矿 2', buildingType: 'soilMine', buildingIndex: 1, icon: '⛏️' },
          { id: 8, name: '泥土矿 3', buildingType: 'soilMine', buildingIndex: 2, icon: '⛏️' },
          { id: 9, name: '泥土矿 4', buildingType: 'soilMine', buildingIndex: 3, icon: '⛏️' },
          { id: 10, name: '泥土矿 5', buildingType: 'soilMine', buildingIndex: 4, icon: '⛏️' }
        ],
        iron: [
          { id: 11, name: '铁矿 1', buildingType: 'ironMine', buildingIndex: 0, icon: '⚒️' },
          { id: 12, name: '铁矿 2', buildingType: 'ironMine', buildingIndex: 1, icon: '⚒️' },
          { id: 13, name: '铁矿 3', buildingType: 'ironMine', buildingIndex: 2, icon: '⚒️' },
          { id: 14, name: '铁矿 4', buildingType: 'ironMine', buildingIndex: 3, icon: '⚒️' },
          { id: 15, name: '铁矿 5', buildingType: 'ironMine', buildingIndex: 4, icon: '⚒️' }
        ],
        food: [
          { id: 16, name: '农场 1', buildingType: 'farm', buildingIndex: 0, icon: '🌾' },
          { id: 17, name: '农场 2', buildingType: 'farm', buildingIndex: 1, icon: '🌾' },
          { id: 18, name: '农场 3', buildingType: 'farm', buildingIndex: 2, icon: '🌾' },
          { id: 19, name: '农场 4', buildingType: 'farm', buildingIndex: 3, icon: '🌾' },
          { id: 20, name: '农场 5', buildingType: 'farm', buildingIndex: 4, icon: '🌾' }
        ]
      }
    }
  },
  methods: {
    //=== handleSidebarToggle 处理侧边栏切换事件
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    },
    //=== handleTabChange 处理Tab切换事件
    handleTabChange(tab) {
      this.activeTab = tab
    },
    //=== handleBuildingClick 处理建筑点击事件
    handleBuildingClick(building, resourceType) {
      console.log('建筑点击:', building, '资源类型:', resourceType)
      // TODO: 实现建筑升级或详情查看逻辑
    }
  }
}
</script>

<style scoped>
.city-view {
  @apply flex h-screen ;
}

.main-content {
  @apply flex-1 ml-80 transition-all duration-300 ease-in-out;
}

.main-content.sidebar-collapsed {
  @apply ml-16;
}

.page-header {
  @apply bg-white shadow-sm border-b border-gray-200 px-6 py-4;
}

.page-title {
  @apply text-2xl font-bold text-gray-900 mb-1;
}

.page-subtitle {
  @apply text-gray-600 text-sm;
}

.content-area {
  @apply p-6;
}
</style>