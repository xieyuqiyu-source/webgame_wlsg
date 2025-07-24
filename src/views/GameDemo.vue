<template>
  <div class="game-demo">
    <!-- 游戏侧边栏 -->
    <GameSidebar @toggle="handleSidebarToggle" />
    
    <!-- 主要内容区域 -->
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="demo-header">
        <h1 class="demo-title">武林三国 - 游戏演示</h1>
        <p class="demo-subtitle">左侧菜单栏演示页面</p>
      </div>
      
      <div class="demo-content">
        <div class="demo-card">
          <h2 class="card-title">功能说明</h2>
          <ul class="feature-list">
            <li>✨ 左侧菜单栏支持展开/折叠</li>
            <li>🏰 显示城池基本信息</li>
            <li>📊 实时资源数据展示</li>
            <li>⚡ 生产力信息一览</li>
            <li>🛡️ 军队状态查看</li>
            <li>🎨 武林三国主题设计</li>
          </ul>
        </div>
        
        <div class="demo-card">
          <h2 class="card-title">操作指南</h2>
          <div class="guide-content">
            <p>点击左侧边栏右侧的箭头按钮可以展开或折叠菜单栏</p>
            <p>菜单栏包含了城池的核心信息，方便玩家快速查看游戏状态</p>
          </div>
        </div>
        
        <div class="demo-card">
          <h2 class="card-title">技术特性</h2>
          <div class="tech-features">
            <div class="tech-item">
              <span class="tech-label">响应式设计</span>
              <span class="tech-desc">适配不同屏幕尺寸</span>
            </div>
            <div class="tech-item">
              <span class="tech-label">流畅动画</span>
              <span class="tech-desc">CSS3 过渡效果</span>
            </div>
            <div class="tech-item">
              <span class="tech-label">模块化组件</span>
              <span class="tech-desc">可复用的Vue组件</span>
            </div>
            <div class="tech-item">
              <span class="tech-label">主题定制</span>
              <span class="tech-desc">Tailwind CSS样式</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GameSidebar from '@/components/GameSidebar.vue'

export default {
  name: 'GameDemo',
  components: {
    GameSidebar
  },
  data() {
    return {
      //=== sidebarCollapsed 侧边栏折叠状态
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
.game-demo {
  @apply min-h-screen;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  @apply transition-all duration-300 min-h-screen;
  margin-left: 300px;
  padding: 2rem;
}

.main-content.sidebar-collapsed {
  margin-left: 60px;
}

.demo-header {
  @apply text-center mb-8;
}

.demo-title {
  @apply text-4xl font-bold text-white mb-4;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.demo-subtitle {
  @apply text-xl text-white/80;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.demo-content {
  @apply max-w-4xl mx-auto space-y-6;
}

.demo-card {
  @apply game-card p-6;
}

.card-title {
  @apply text-2xl font-bold text-gray-800 mb-4;
}

.feature-list {
  @apply space-y-3;
}

.feature-list li {
  @apply text-gray-700 text-lg flex items-center;
}

.guide-content {
  @apply space-y-3;
}

.guide-content p {
  @apply text-gray-700 text-base leading-relaxed;
}

.tech-features {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.tech-item {
  @apply flex flex-col space-y-1 p-4 bg-gray-50 rounded-lg;
}

.tech-label {
  @apply font-semibold text-primary-600;
}

.tech-desc {
  @apply text-gray-600 text-sm;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
  
  .demo-title {
    @apply text-2xl;
  }
  
  .demo-subtitle {
    @apply text-lg;
  }
}
</style>