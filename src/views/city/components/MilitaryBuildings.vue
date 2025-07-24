<template>
  <div class="military-buildings">
    <div class="placeholder-content">
      <div class="placeholder-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" class="text-red-400">
          <path d="M12 2L13.09 8.26L22 9L17 14L18.18 22.74L12 19.27L5.82 22.74L7 14L2 9L10.91 8.26L12 2Z"/>
        </svg>
      </div>
      <h3 class="placeholder-title">军事建筑系统</h3>
      <p class="placeholder-text">军事建筑功能正在开发中...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MilitaryBuildings'
}
</script>

<style scoped>
/* 占位内容样式 */
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