<template>
  <div class="tab-container">
    <div class="tab-header">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'recruitment' }"
        @click="$emit('tab-change', 'recruitment')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 11.8 12.8 14 10 14S5 11.8 5 9V7L3 7V9C3 12.9 6.1 16 10 16V19H8V21H16V19H14V16C17.9 16 21 12.9 21 9Z"/>
        </svg>
        征兵
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'technology' }"
        @click="$emit('tab-change', 'technology')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.07,4.93C17.22,3 14.66,1.96 12,2C9.34,1.96 6.79,3 4.94,4.93C3,6.78 1.96,9.34 2,12C1.96,14.66 3,17.21 4.93,19.06C6.78,21 9.34,22.04 12,22C14.66,22.04 17.21,21 19.06,19.07C21,17.22 22.04,14.66 22,12C22.04,9.34 21,6.78 19.07,4.93M17,12V18H15V14H13V12H17M12,2.5L13.5,7H10.5L12,2.5M7,12H11V14H9V18H7V12Z"/>
        </svg>
        科技
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'unitDetails' }"
        @click="$emit('tab-change', 'unitDetails')"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        兵种详情
      </div>
    </div>
    
    <div class="tab-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MilitaryTabs',
  props: {
    //=== activeTab 当前激活的Tab页
    activeTab: {
      type: String,
      default: 'recruitment'
    }
  },
  emits: ['tab-change']
}
</script>

<style scoped>
/* Tab 样式 */
.tab-container {
  @apply flex flex-col;
}

.tab-header {
  @apply flex bg-green-700 bg-opacity-80 rounded-t-md overflow-x-auto;
}

.tab-item {
  @apply px-4 py-3 cursor-pointer text-white text-sm font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap flex-none;
  @apply hover:text-yellow-500; 
}

.tab-item.active {
  @apply bg-green-600;
}

.tab-icon {
  @apply w-5 h-5;
}

.tab-content {
  @apply flex flex-col gap-4;
  margin-top: 15px;
}

@media (min-width: 768px) {
  .tab-item {
    flex: 1 1 0%;
    justify-content: center;
  }
}
</style>
