<template>
  <div class="tab-container">
    <div class="tab-header">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'resource' }"
        @click="$emit('tab-change', 'resource')"
      >
        资源建筑
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'military' }"
        @click="$emit('tab-change', 'military')"
      >
        军事建筑
      </div>
    </div>
    
    <div class="tab-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CityTabs',
  props: {
    //=== activeTab 当前激活的Tab页
    activeTab: {
      type: String,
      default: 'resource'
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
  @apply flex bg-green-700 bg-opacity-80 rounded-t-md;
  /* 自定义修改 */
 /* border-radius: 10px */
}

.tab-item {
  @apply px-6 py-3 cursor-pointer text-white text-sm font-bold transition-all duration-200;
  @apply hover:text-yellow-500; 
  
}

.tab-item.active {
  @apply bg-green-600;
}


.tab-content {
  @apply flex flex-col gap-4;
}
</style>