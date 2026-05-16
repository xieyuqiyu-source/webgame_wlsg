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
  @apply flex overflow-x-auto rounded-[24px] p-1.5;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(229, 231, 235, 0.92);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.tab-item {
  @apply px-5 py-3 cursor-pointer text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-none rounded-[18px];
  color: #6b7280;
}

.tab-item.active {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  box-shadow: 0 10px 24px rgba(79, 70, 229, 0.18);
}

.tab-item:hover:not(.active) {
  color: #111827;
  background: rgba(99, 102, 241, 0.06);
}

.tab-content {
  @apply flex flex-col gap-4;
  margin-top: 18px;
}

@media (min-width: 768px) {
  .tab-item {
    flex: 1 1 0%;
    text-align: center;
  }
}
</style>
