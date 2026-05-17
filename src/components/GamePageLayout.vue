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
        v-if="isMobile && !mobileSidebarOpen"
        class="mobile-menu-trigger"
        type="button"
        @click="openMobileSidebar"
        aria-label="打开功能菜单"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 7H20" stroke-linecap="round" />
          <path d="M7 12H20" stroke-linecap="round" />
          <path d="M10 17H20" stroke-linecap="round" />
        </svg>
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
  margin-left: 72px;
}

.page-content {
  @apply px-6 py-8;
  max-width: 1320px;
  margin: 0 auto;
}

.mobile-menu-trigger {
  @apply fixed z-40 inline-flex items-center justify-center rounded-full;
  right: 16px;
  bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  width: 58px;
  height: 58px;
  color: #ffffff;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.96), rgba(99, 102, 241, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: 0 18px 36px rgba(79, 70, 229, 0.28);
  backdrop-filter: blur(20px);
}

.mobile-menu-trigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(79, 70, 229, 0.32);
}

@media (max-width: 1024px) {
  .page-main,
  .page-main.sidebar-collapsed {
    margin-left: 0;
  }

  .page-content {
    @apply px-4 pb-24 pt-6;
  }
}
</style>
