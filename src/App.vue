<script>
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useGameTimer } from './hooks/useGameTimer'
import { useGameStore } from './store/modules/gameStore'
import UserInitDialog from './components/UserInitDialog.vue'
import GlobalNotification from './components/GlobalNotification.vue'

export default {
  name: 'App',
  components: {
    UserInitDialog,
    GlobalNotification
  },
  setup() {
    const gameStore = useGameStore()
    const route = useRoute()
    const showUserInitDialog = ref(false)
    const stagewiseToolbar = shallowRef(null)
    const stagewiseConfig = ref(null)
    const isStagewiseEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_STAGEWISE === 'true'
    const shouldShowVeil = computed(() => !route.meta?.plainSurface)

    useGameTimer()

    const handleUserInfoSubmit = (userInfo) => {
      gameStore.setUserInfo(userInfo.nickname, userInfo.faction)
      showUserInitDialog.value = false
    }

    const loadStagewise = async () => {
      if (!isStagewiseEnabled) return

      const [{ StagewiseToolbar }, vuePluginModule] = await Promise.all([
        import('@stagewise/toolbar-vue'),
        import('@stagewise-plugins/vue')
      ])

      stagewiseToolbar.value = StagewiseToolbar
      stagewiseConfig.value = {
        plugins: [vuePluginModule.default]
      }
    }

    onMounted(() => {
      if (gameStore.isFirstTime) {
        showUserInitDialog.value = true
      }

      loadStagewise()
    })

    return {
      handleUserInfoSubmit,
      isStagewiseEnabled,
      shouldShowVeil,
      showUserInitDialog,
      stagewiseConfig,
      stagewiseToolbar
    }
  }
}
</script>

<template>
  <div id="app" class="app-shell">
    <div v-if="shouldShowVeil" class="app-shell__veil"></div>
    <router-view />
    
    <!-- 用户初始化对话框 -->
    <UserInitDialog 
      :visible="showUserInitDialog"
      :allow-close="false"
      @submit="handleUserInfoSubmit"
    />
    
    <!-- 全局通知组件 -->
    <GlobalNotification />
    
    <!-- stagewise AI开发工具栏 - 仅开发模式显示 -->
    <component
      :is="stagewiseToolbar"
      v-if="isStagewiseEnabled && stagewiseToolbar && stagewiseConfig"
      :config="stagewiseConfig"
    />
  </div>
</template>

<style>
.app-shell {
  min-height: 100vh;
  position: relative;
}

.app-shell__veil {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.16) 0%, rgba(99, 102, 241, 0) 34%),
    radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0) 30%),
    rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(8px);
}
</style>
