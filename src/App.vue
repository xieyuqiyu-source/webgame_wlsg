<script>
import { StagewiseToolbar } from '@stagewise/toolbar-vue'
import VuePlugin from '@stagewise-plugins/vue'
import { useGameTimer } from './hooks/useGameTimer'
import { onMounted, ref } from 'vue'
import { useGameStore } from './store/modules/gameStore'
import UserInitDialog from './components/UserInitDialog.vue'

export default {
  name: 'App',
  components: {
    StagewiseToolbar,
    UserInitDialog
  },
  setup() {
    const gameStore = useGameStore()
    const showUserInitDialog = ref(false)
    
    // 启动游戏定时器
    const gameTimer = useGameTimer()
    
    // 处理用户信息提交
    const handleUserInfoSubmit = (userInfo) => {
      gameStore.setUserInfo(userInfo.nickname, userInfo.faction)
      showUserInitDialog.value = false
    }
    
    // 确保在组件挂载后启动定时器并检查是否需要显示初始化对话框
    onMounted(() => {
      console.log('App组件已挂载，游戏定时器应该已启动')
      
      // 检查是否为首次进入游戏
      if (gameStore.isFirstTime) {
        showUserInitDialog.value = true
      }
    })
    
    return {
      showUserInitDialog,
      handleUserInfoSubmit
    }
  },
  data() {
    return {
      //=== stagewise配置 - AI辅助开发工具栏配置
      stagewiseConfig: {
        plugins: [VuePlugin]
      },
      //=== 开发模式检测 - 仅在开发环境显示工具栏
      isDev: import.meta.env.DEV
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
    
    <!-- stagewise AI开发工具栏 - 仅开发模式显示 -->
    <StagewiseToolbar 
      v-if="isDev" 
      :config="stagewiseConfig" 
    />
  </div>
</template>

<style>
/* 全局样式已在 style.css 中定义 */
</style>
