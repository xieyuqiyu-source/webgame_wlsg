<template>
  <div class="game-page-layout" :class="pageClass">
    <GameSidebar @toggle="handleSidebarToggle" />

    <main class="page-main" :class="[mainClass, { 'sidebar-collapsed': sidebarCollapsed }]">
      <div class="page-content" :class="contentClass">
        <slot />
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue'
import GameSidebar from '@/components/GameSidebar.vue'

export default {
  name: 'GamePageLayout',
  components: {
    GameSidebar
  },
  props: {
    pageClass: {
      type: [String, Array, Object],
      default: ''
    },
    mainClass: {
      type: [String, Array, Object],
      default: ''
    },
    contentClass: {
      type: [String, Array, Object],
      default: ''
    }
  },
  setup() {
    const sidebarCollapsed = ref(false)

    const handleSidebarToggle = (collapsed) => {
      sidebarCollapsed.value = collapsed
    }

    return {
      handleSidebarToggle,
      sidebarCollapsed
    }
  }
}
</script>

<style scoped>
.game-page-layout {
  @apply flex min-h-screen;
}

.page-main {
  @apply flex-1 ml-80 transition-all duration-300 ease-in-out;
}

.page-main.sidebar-collapsed {
  @apply ml-16;
}

.page-content {
  @apply p-6;
}
</style>
