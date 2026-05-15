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

.mobile-menu-trigger {
  @apply fixed left-3 top-3 z-40 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-lg;
  background: rgba(31, 41, 55, 0.9);
  border: 1px solid rgba(35, 124, 72, 0.4);
  backdrop-filter: blur(10px);
}

@media (max-width: 1024px) {
  .page-main,
  .page-main.sidebar-collapsed {
    margin-left: 0;
  }

  .page-content {
    @apply px-3 pb-4 pt-16;
  }
}
</style>
