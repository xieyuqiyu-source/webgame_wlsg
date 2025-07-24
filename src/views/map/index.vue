<template>
  <div class="map-view">
    <!-- 游戏侧边栏 -->
    <GameSidebar @toggle="handleSidebarToggle" />
    
    <!-- 主要内容区域 -->
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="page-header">
        <h1 class="page-title">世界地图</h1>
        <p class="page-subtitle">探索武林三国的广阔世界</p>
      </div>
      
      <div class="content-area">
        <!-- 地图内容将在这里实现 -->
        <div class="placeholder-content">
          <div class="placeholder-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="text-blue-400">
              <path d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3Z"/>
            </svg>
          </div>
          <h3 class="placeholder-title">世界地图系统</h3>
          <p class="placeholder-text">地图功能正在开发中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GameSidebar from '@/components/GameSidebar.vue'

export default {
  name: 'MapView',
  components: {
    GameSidebar
  },
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  methods: {
    //=== handleSidebarToggle 处理侧边栏切换事件
    handleSidebarToggle(collapsed) {
      this.sidebarCollapsed = collapsed
    }
  }
}
</script>

<style scoped>
.map-view {
  @apply flex h-screen bg-gray-100;
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

.placeholder-content {
  @apply flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-sm border border-gray-200;
}

.placeholder-icon {
  @apply mb-4;
}

.placeholder-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.placeholder-text {
  @apply text-gray-500;
}
</style>