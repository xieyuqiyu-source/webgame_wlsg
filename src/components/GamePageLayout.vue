<template>
  <div class="game-page-layout" :class="pageClass">
    <GameSidebar
      :is-mobile="isMobile"
      :mobile-open="mobileSidebarOpen"
      @toggle="handleSidebarToggle"
      @close-mobile="closeMobileSidebar"
    />

    <main class="page-main" :class="[mainClass, { 'sidebar-collapsed': sidebarCollapsed }]">
      <button
        v-if="isMobile"
        class="mobile-menu-trigger"
        type="button"
        @click="openMobileSidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 6H21V8H3V6M3 11H21V13H3V11M3 16H21V18H3V16Z" />
        </svg>
        <span>菜单</span>
      </button>

      <div class="page-content" :class="contentClass">
        <slot />
      </div>
    </main>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import GameSidebar from '@/components/GameSidebar.vue'

const MOBILE_BREAKPOINT = 1024

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
    const isMobile = ref(false)
    const mobileSidebarOpen = ref(false)

    const syncViewportState = () => {
      isMobile.value = window.innerWidth <= MOBILE_BREAKPOINT
      if (!isMobile.value) {
        mobileSidebarOpen.value = false
      }
    }

    const handleSidebarToggle = (collapsed) => {
      sidebarCollapsed.value = collapsed
    }

    const openMobileSidebar = () => {
      mobileSidebarOpen.value = true
    }

    const closeMobileSidebar = () => {
      mobileSidebarOpen.value = false
    }

    onMounted(() => {
      syncViewportState()
      window.addEventListener('resize', syncViewportState)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', syncViewportState)
    })

    return {
      handleSidebarToggle,
      sidebarCollapsed,
      isMobile,
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar
    }
  }
}
</script>

<style scoped>
.game-page-layout {
  @apply flex min-h-screen;
  position: relative;
  z-index: 1;
}

.page-main {
  @apply flex-1 transition-all duration-300 ease-in-out;
  margin-left: 320px;
}

.page-main.sidebar-collapsed {
  margin-left: 92px;
}

.page-content {
  @apply px-6 py-8;
  max-width: 1320px;
  margin: 0 auto;
}

.mobile-menu-trigger {
  @apply fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold;
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--border-soft);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
}

@media (max-width: 1024px) {
  .page-main,
  .page-main.sidebar-collapsed {
    margin-left: 0;
  }

  .page-content {
    @apply px-4 pb-6 pt-20;
  }
}
</style>
