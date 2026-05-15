<template>
  <div class="map-tabs">
    <!-- Tab 导航 -->
    <div class="tab-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-button', { 'active': activeTab === tab.key }]"
        @click="$emit('tab-change', tab.key)"
      >
        <div class="tab-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path :d="tab.iconPath" />
          </svg>
        </div>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>
    
    <!-- Tab 内容 -->
    <div class="tab-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapTabs',
  props: {
    //=== activeTab 当前激活的tab
    activeTab: {
      type: String,
      required: true
    },
    tabs: {
      type: Array,
      default: () => ([
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
      ])
    }
  },
  emits: ['tab-change'],
  data() {
    return {}
  }
}
</script>

<style scoped>
/* Tab 样式 - 参考军事页面设计 */
.map-tabs {
  @apply flex flex-col;
}

.tab-nav {
  @apply flex bg-green-700 bg-opacity-80 rounded-t-md overflow-x-auto;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.tab-button {
  @apply px-4 py-3 cursor-pointer text-white text-sm font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap flex-none;
  @apply hover:text-yellow-500;
  background: transparent;
  border: none;
  justify-content: center;
}

.tab-button.active {
  @apply bg-green-600;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.tab-button.active:hover {
  background: #237C48;
}

.tab-icon {
  @apply w-5 h-5;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.tab-label {
  @apply font-bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.tab-count {
  @apply bg-yellow-500 text-black text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tab-button.active .tab-count {
  @apply bg-yellow-400;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.tab-content {
  @apply flex flex-col gap-4;
  margin-top: 15px;
}

@media (min-width: 768px) {
  .tab-button {
    flex: 1 1 0%;
  }
}
</style>
