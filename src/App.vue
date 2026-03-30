<script>
import { onMounted, ref, shallowRef } from 'vue'
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
    const showUserInitDialog = ref(false)
    const stagewiseToolbar = shallowRef(null)
    const stagewiseConfig = ref(null)
    const isStagewiseEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_STAGEWISE === 'true'

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
      showUserInitDialog,
      stagewiseConfig,
      stagewiseToolbar
    }
  }
}
</script>

<template>
  <div id="app">
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
/* 全局样式已在 style.css 中定义 */
</style>
