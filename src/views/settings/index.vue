<template>
  <GamePageLayout page-class="settings-view">
    <div>
      <div class="page-header">
        <h1 class="page-title">游戏设置</h1>
        <p class="page-subtitle">管理你的游戏配置和数据</p>
      </div>
      
      <div class="content-area">
        <!-- 数据管理区域 -->
        <div class="settings-section">
          <h2 class="section-title">数据管理</h2>
          <div class="settings-grid">
            <div class="setting-card">
              <div class="setting-content">
                <h3 class="setting-title">当前将领</h3>
                <GeneralProfile
                  :general="gameStore.selectedGeneral"
                  :progress="gameStore.generalProgress"
                  :exp-for-next-level="gameStore.generalExpForNextLevel"
                  :bonuses="gameStore.generalBonuses"
                  @allocate="gameStore.allocateGeneralPoint"
                />
              </div>
            </div>
            <!-- 数据备份与恢复 -->
            <div class="setting-card">
              <div class="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-blue-500">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">数据备份与恢复</h3>
                <p class="setting-desc">导出或导入游戏存档文件</p>
                <div class="backup-actions">
                  <button @click="exportGameData" class="setting-btn primary">
                    导出存档
                  </button>
                  <input 
                    ref="fileInput" 
                    type="file" 
                    accept=".json" 
                    @change="importGameData" 
                    class="hidden"
                  >
                  <button @click="$refs.fileInput.click()" class="setting-btn secondary">
                    导入存档
                  </button>
                </div>
              </div>
            </div>

            <div class="setting-card">
              <div class="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-emerald-500">
                  <path d="M12,13A3,3 0 0,1 9,10A3,3 0 0,1 12,7A3,3 0 0,1 15,10A3,3 0 0,1 12,13M20,10V7H17V10H20M7,10V7H4V10H7M20,17V14H17V17H20M7,17V14H4V17H7M12,20A10,10 0 0,1 2,10A10,10 0 0,1 12,0A10,10 0 0,1 22,10A10,10 0 0,1 12,20M12,2A8,8 0 0,0 4,10A8,8 0 0,0 12,18A8,8 0 0,0 20,10A8,8 0 0,0 12,2Z"/>
                </svg>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">云存档同步</h3>
                <p class="setting-desc">使用同步码在电脑和手机之间上传或下载同一份存档</p>
                <div class="cloud-sync-panel">
                  <label class="cloud-sync-label" for="cloud-sync-id">同步码</label>
                  <div class="cloud-sync-row">
                    <input
                      id="cloud-sync-id"
                      v-model.trim="cloudSyncId"
                      type="text"
                      class="cloud-sync-input"
                      placeholder="请输入同步码或当前UUID"
                    >
                    <button @click="useCurrentUUIDAsSyncId" class="setting-btn secondary">
                      用当前UUID
                    </button>
                    <button @click="copyCloudSyncId" class="setting-btn secondary">
                      复制
                    </button>
                  </div>
                  <div class="cloud-sync-actions">
                    <button @click="uploadToCloud" :disabled="cloudSyncBusy" class="setting-btn primary">
                      {{ cloudSyncBusy ? '处理中...' : '上传云存档' }}
                    </button>
                    <button @click="downloadFromCloud" :disabled="cloudSyncBusy" class="setting-btn secondary">
                      {{ cloudSyncBusy ? '处理中...' : '下载云存档' }}
                    </button>
                    <button @click="checkCloudStatus" :disabled="cloudSyncBusy" class="setting-btn secondary">
                      检查云状态
                    </button>
                  </div>
                  <div class="cloud-sync-status" v-if="cloudSyncStatus">
                    {{ cloudSyncStatus }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 用户信息与标识 -->
            <div class="setting-card">
              <div class="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-purple-500">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">用户信息与标识</h3>
                <p class="setting-desc">您的游戏角色信息和唯一标识</p>
                <div class="user-info-display">
                  <div class="user-info-item">
                    <span class="info-label">昵称:</span>
                    <span class="info-value">{{ gameStore.userNickname || '未设置' }}</span>
                  </div>
                  <div class="user-info-item" v-if="gameStore.userFaction">
                    <span class="info-label">阵营:</span>
                    <span class="info-value faction-display" :style="{ color: getFactionConfig(gameStore.userFaction)?.color }">
                      {{ getFactionConfig(gameStore.userFaction)?.icon }}
                      {{ getFactionConfig(gameStore.userFaction)?.name }}
                    </span>
                  </div>
                  <div class="user-info-item">
                    <span class="info-label">用户ID:</span>
                    <div class="uuid-display">
                      <code class="uuid-text">{{ gameStore.userUUID }}</code>
                      <button @click="copyUUID" class="setting-btn small" title="复制UUID">
                        复制
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 重置游戏 -->
            <div class="setting-card">
              <div class="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-red-500">
                  <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
                </svg>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">重置游戏</h3>
                <p class="setting-desc">清除所有进度，重新开始游戏</p>
                <button @click="resetGame" class="setting-btn danger">
                  重置游戏
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- GM功能区域 -->
        <div class="settings-section">
          <h2 class="section-title">GM功能</h2>
          <div class="gm-section">
            <div class="gm-auth" v-if="!gmEnabled">
              <div class="auth-card">
                <div class="auth-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" class="text-yellow-500">
                    <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                  </svg>
                </div>
                <h3 class="auth-title">GM功能验证</h3>
                <p class="auth-desc">请输入GM密码以启用管理员功能</p>
                <div class="auth-form">
                  <input 
                    v-model="gmPassword" 
                    type="password" 
                    placeholder="请输入GM密码" 
                    class="auth-input"
                    @keyup.enter="enableGM"
                  >
                  <button @click="enableGM" class="auth-btn">
                    验证
                  </button>
                </div>
                <div v-if="gmError" class="auth-error">
                  {{ gmError }}
                </div>
              </div>
            </div>

            <div class="gm-controls" v-if="gmEnabled">
              <div class="gm-header">
                <div class="gm-status">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="text-green-500">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                  </svg>
                  <span>GM功能已启用</span>
                </div>
                <button @click="disableGM" class="gm-disable-btn">
                  退出GM
                </button>
              </div>

              <div class="gm-actions">
                <h4 class="gm-section-title">资源管理</h4>
                <div class="resource-controls">
                  <div class="resource-item" v-for="(amount, resourceType) in gameStore.resources" :key="resourceType">
                    <div class="resource-info">
                      <span class="resource-name">{{ getResourceName(resourceType) }}</span>
                      <span class="resource-current">当前: {{ Math.floor(amount) }}</span>
                    </div>
                    <div class="resource-actions">
                      <button @click="addResource(resourceType, 1000)" class="resource-btn small">
                        +1K
                      </button>
                      <button @click="addResource(resourceType, 10000)" class="resource-btn medium">
                        +10K
                      </button>
                      <button @click="addResource(resourceType, 100000)" class="resource-btn large">
                        +100K
                      </button>
                      <button @click="maxResource(resourceType)" class="resource-btn max">
                        最大
                      </button>
                    </div>
                  </div>
                </div>

                <h4 class="gm-section-title">金币管理</h4>
                <div class="coins-controls">
                  <div class="coins-item">
                    <div class="coins-info">
                      <span class="coins-name">💰 金币</span>
                      <span class="coins-current">当前: {{ gameStore.coins }}</span>
                    </div>
                    <div class="coins-actions">
                      <button @click="addCoins(100)" class="resource-btn small">
                        +100
                      </button>
                      <button @click="addCoins(1000)" class="resource-btn medium">
                        +1K
                      </button>
                      <button @click="addCoins(10000)" class="resource-btn large">
                        +10K
                      </button>
                      <button @click="addCoins(100000)" class="resource-btn max">
                        +100K
                      </button>
                    </div>
                  </div>
                </div>

                <h4 class="gm-section-title">快速操作</h4>
                <div class="quick-actions">
                  <button @click="addAllResources(10000)" class="quick-btn">
                    全部资源 +10K
                  </button>
                  <button @click="maxAllResources" class="quick-btn">
                    全部资源最大
                  </button>
                  <button @click="completeAllUpgrades" class="quick-btn">
                    完成所有升级
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏设置区域 -->
        <div class="settings-section">
          <h2 class="section-title">游戏设置</h2>
          <div class="settings-grid">
            <!-- 自动保存间隔 -->
            <div class="setting-card">
              <div class="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-purple-500">
                  <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                </svg>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">自动保存间隔</h3>
                <p class="setting-desc">设置游戏数据自动保存的时间间隔</p>
                <select v-model="autoSaveInterval" @change="updateAutoSaveInterval" class="setting-select">
                  <option value="60">1分钟</option>
                  <option value="300">5分钟</option>
                  <option value="600">10分钟</option>
                  <option value="1800">30分钟</option>
                </select>
              </div>
            </div>

            <!-- 音效设置 -->
            <div class="setting-card">
              <div class="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-indigo-500">
                  <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
                </svg>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">音效设置</h3>
                <p class="setting-desc">开启或关闭游戏音效</p>
                <label class="setting-toggle">
                  <input type="checkbox" v-model="soundEnabled" @change="updateSoundSetting">
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">{{ soundEnabled ? '开启' : '关闭' }}</span>
                </label>
              </div>
            </div>

            <!-- 通知设置 -->
            <div class="setting-card">
              <div class="setting-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-orange-500">
                  <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"/>
                </svg>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">升级完成通知</h3>
                <p class="setting-desc">建筑升级完成时显示通知</p>
                <label class="setting-toggle">
                  <input type="checkbox" v-model="notificationEnabled" @change="updateNotificationSetting">
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">{{ notificationEnabled ? '开启' : '关闭' }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GamePageLayout>
</template>

<script>
import GamePageLayout from '@/components/GamePageLayout.vue'
import GeneralProfile from '@/components/general/GeneralProfile.vue'
import { useGameStore } from '@/store/modules/gameStore.js'
import { getResourceName } from '@/config/resources.js'
import { getFactionConfig } from '@/config/factionConfig.js'
import { checkCloudSaveHealth, fetchCloudSave, getStoredCloudSyncId, setStoredCloudSyncId, uploadCloudSave } from '@/services/cloudSaveService.js'
import { ref } from 'vue'

export default {
  name: 'SettingsView',
  components: {
    GamePageLayout,
    GeneralProfile
  },
  setup() {
    const gameStore = useGameStore()
    
    // 响应式数据
    const gmEnabled = ref(false)
    const gmPassword = ref('')
    const gmError = ref('')
    const autoSaveInterval = ref(300) // 默认5分钟
    const soundEnabled = ref(true)
    const notificationEnabled = ref(true)
    const cloudSyncId = ref(getStoredCloudSyncId(gameStore.userUUID))
    const cloudSyncBusy = ref(false)
    const cloudSyncStatus = ref('')
    
    // GM密码常量
    const GM_PASSWORD = '12xyqXYQ'
    
    //=== exportGameData 导出游戏数据
    const exportGameData = () => {
      try {
        const gameData = gameStore.exportSaveData()
        
        const dataStr = JSON.stringify(gameData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        
        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        link.download = `wlsg_save_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
        link.click()
        
        URL.revokeObjectURL(link.href)
        alert('游戏数据导出成功！')
      } catch (error) {
        console.error('导出数据失败:', error)
        alert('导出数据失败，请重试！')
      }
    }
    
    //=== importGameData 导入游戏数据
    const importGameData = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const gameData = JSON.parse(e.target.result)

          // 确认导入
          if (confirm('确定要导入这个存档吗？当前进度将被覆盖！')) {
            gameStore.importSaveData(gameData)
            
            alert('游戏数据导入成功！')
            
            // 刷新页面以确保状态同步
            window.location.reload()
          }
        } catch (error) {
          console.error('导入数据失败:', error)
          alert('导入数据失败，请检查文件格式！')
        }
      }
      reader.readAsText(file)
      
      // 清空文件输入
      event.target.value = ''
    }

    const persistCloudSyncId = () => {
      const normalizedId = setStoredCloudSyncId(cloudSyncId.value || gameStore.userUUID)
      cloudSyncId.value = normalizedId
      return normalizedId
    }

    const useCurrentUUIDAsSyncId = () => {
      cloudSyncId.value = gameStore.userUUID
      persistCloudSyncId()
      cloudSyncStatus.value = '已将当前UUID设为同步码'
    }

    const copyCloudSyncId = async () => {
      const syncId = persistCloudSyncId()
      if (!syncId) {
        alert('当前没有可复制的同步码')
        return
      }

      try {
        await navigator.clipboard.writeText(syncId)
        cloudSyncStatus.value = '同步码已复制到剪贴板'
      } catch (error) {
        console.error('复制同步码失败:', error)
        alert('复制失败，请手动复制同步码')
      }
    }

    const checkCloudStatus = async () => {
      cloudSyncBusy.value = true
      try {
        const result = await checkCloudSaveHealth()
        cloudSyncStatus.value = `云存档服务正常：${result.service || 'save-api'}`
      } catch (error) {
        console.error('检查云存档服务失败:', error)
        cloudSyncStatus.value = `云存档服务不可用：${error.message}`
      } finally {
        cloudSyncBusy.value = false
      }
    }

    const uploadToCloud = async () => {
      const syncId = persistCloudSyncId()
      if (!syncId) {
        alert('请先填写同步码')
        return
      }

      cloudSyncBusy.value = true
      try {
        const saveData = gameStore.exportSaveData()
        const result = await uploadCloudSave(syncId, saveData)
        cloudSyncStatus.value = `云存档上传成功，服务器时间：${result.meta?.updatedAt || '未知'}`
      } catch (error) {
        console.error('上传云存档失败:', error)
        cloudSyncStatus.value = `上传失败：${error.message}`
      } finally {
        cloudSyncBusy.value = false
      }
    }

    const downloadFromCloud = async () => {
      const syncId = persistCloudSyncId()
      if (!syncId) {
        alert('请先填写同步码')
        return
      }

      cloudSyncBusy.value = true
      try {
        const result = await fetchCloudSave(syncId)
        if (!result.exists || !result.save) {
          cloudSyncStatus.value = '云端没有找到对应存档'
          return
        }

        if (!confirm('确定要下载并覆盖当前本地存档吗？')) {
          return
        }

        gameStore.importSaveData(result.save)
        cloudSyncStatus.value = `云存档下载成功，服务器时间：${result.meta?.updatedAt || '未知'}`
        alert('云存档下载成功，即将刷新页面')
        window.location.reload()
      } catch (error) {
        console.error('下载云存档失败:', error)
        cloudSyncStatus.value = `下载失败：${error.message}`
      } finally {
        cloudSyncBusy.value = false
      }
    }
    
    //=== resetGame 重置游戏
    const resetGame = () => {
      if (confirm('确定要重置游戏吗？所有进度将被清除且无法恢复！')) {
        if (confirm('请再次确认：这将删除所有游戏数据！')) {
          gameStore.resetGame()
          gameStore.saveGame()
          alert('游戏已重置！')
          window.location.reload()
        }
      }
    }
    
    //=== enableGM 启用GM功能
    const enableGM = () => {
      if (gmPassword.value === GM_PASSWORD) {
        gmEnabled.value = true
        gmError.value = ''
        gmPassword.value = ''
        console.log('GM功能已启用')
      } else {
        gmError.value = '密码错误，请重试'
        setTimeout(() => {
          gmError.value = ''
        }, 3000)
      }
    }
    
    //=== disableGM 禁用GM功能
    const disableGM = () => {
      gmEnabled.value = false
      console.log('GM功能已禁用')
    }
    
    //=== addResource 添加指定资源
    const addResource = (resourceType, amount) => {
      const currentAmount = gameStore.resources[resourceType] || 0
      const newAmount = currentAmount + amount
      
      gameStore.$patch((state) => {
        state.resources[resourceType] = newAmount
      })
      
      console.log(`添加 ${getResourceName(resourceType)} ${amount}，当前: ${newAmount}`)
    }
    
    //=== maxResource 将指定资源设为最大值
    const maxResource = (resourceType) => {
      const maxAmount = gameStore.warehouseCapacity
      
      gameStore.$patch((state) => {
        state.resources[resourceType] = maxAmount
      })
      
      console.log(`${getResourceName(resourceType)} 已设为最大值: ${maxAmount}`)
    }
    
    //=== addAllResources 为所有资源添加指定数量
    const addAllResources = (amount) => {
      Object.keys(gameStore.resources).forEach(resourceType => {
        addResource(resourceType, amount)
      })
    }
    
    //=== maxAllResources 将所有资源设为最大值
    const maxAllResources = () => {
      Object.keys(gameStore.resources).forEach(resourceType => {
        maxResource(resourceType)
      })
    }
    
    //=== completeAllUpgrades 完成所有升级
    const completeAllUpgrades = () => {
      // 完成建筑升级
      Object.keys(gameStore.buildingUpgrades).forEach(buildingType => {
        if (gameStore.buildingUpgrades[buildingType]) {
          gameStore.completeBuildingUpgrade(buildingType)
        }
      })
      
      // 完成仓库升级
      if (gameStore.warehouseUpgrade) {
        gameStore.completeWarehouseUpgrade()
      }
      
      console.log('所有升级已完成')
    }
    
    //=== updateAutoSaveInterval 更新自动保存间隔
    const updateAutoSaveInterval = () => {
      console.log('自动保存间隔已更新为:', autoSaveInterval.value, '秒')
      // 这里可以实现实际的定时器更新逻辑
    }
    
    //=== updateSoundSetting 更新音效设置
    const updateSoundSetting = () => {
      console.log('音效设置已更新为:', soundEnabled.value)
      // 这里可以实现实际的音效控制逻辑
    }
    
    //=== updateNotificationSetting 更新通知设置
    const updateNotificationSetting = () => {
      console.log('通知设置已更新为:', notificationEnabled.value)
      // 这里可以实现实际的通知控制逻辑
    }
    
    //=== addCoins 添加金币
    const addCoins = (amount) => {
      gameStore.addCoins(amount)
      console.log(`添加金币 ${amount}，当前: ${gameStore.coins}`)
    }

    //=== copyUUID 复制用户UUID到剪贴板
    const copyUUID = async () => {
      try {
        await navigator.clipboard.writeText(gameStore.userUUID)
        alert('UUID已复制到剪贴板！')
      } catch (error) {
        console.error('复制UUID失败:', error)
        // 降级方案：创建临时文本域进行复制
        const textArea = document.createElement('textarea')
        textArea.value = gameStore.userUUID
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          alert('UUID已复制到剪贴板！')
        } catch (fallbackError) {
          console.error('降级复制方案也失败:', fallbackError)
          alert('复制失败，请手动复制UUID')
        }
        document.body.removeChild(textArea)
      }
    }
    
    return {
      gameStore,
      gmEnabled,
      gmPassword,
      gmError,
      autoSaveInterval,
      soundEnabled,
      notificationEnabled,
      cloudSyncId,
      cloudSyncBusy,
      cloudSyncStatus,
      exportGameData,
      importGameData,
      uploadToCloud,
      downloadFromCloud,
      checkCloudStatus,
      useCurrentUUIDAsSyncId,
      copyCloudSyncId,
      resetGame,
      enableGM,
      disableGM,
      addResource,
      maxResource,
      addAllResources,
      maxAllResources,
      completeAllUpgrades,
      addCoins,
      updateAutoSaveInterval,
      updateSoundSetting,
      updateNotificationSetting,
      copyUUID,
      getResourceName,
      getFactionConfig
    }
  }
}
</script>

<style scoped>
.settings-view {
  @apply min-h-screen;
}

.page-header {
  @apply bg-gradient-to-r from-primary-50/90 to-gold-50/90 backdrop-blur-sm rounded-lg shadow-lg border border-primary-200/50 p-6 mb-6;
}

.page-title {
  @apply text-3xl font-bold bg-gradient-to-r from-primary-700 to-gold-600 bg-clip-text text-transparent mb-2;
}

.page-subtitle {
  @apply text-primary-600;
}

.content-area {
  @apply space-y-6;
}

.settings-section {
  @apply bg-gradient-to-br from-white/90 to-primary-50/80 backdrop-blur-sm rounded-lg shadow-lg border border-primary-200/50 p-6;
}

.section-title {
  @apply text-xl font-bold bg-gradient-to-r from-primary-700 to-secondary-600 bg-clip-text text-transparent mb-4 pb-2 border-b border-primary-200;
}

.settings-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.setting-card {
  @apply bg-gradient-to-br from-primary-50/80 to-gold-50/60 rounded-lg p-4 border border-primary-200/60 hover:shadow-lg hover:border-primary-300/80 transition-all duration-300;
}

.setting-icon {
  @apply mb-3;
}

.setting-title {
  @apply text-lg font-semibold text-primary-800 mb-1;
}

.setting-desc {
  @apply text-sm text-primary-600 mb-3;
}

.setting-btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.setting-btn.primary {
  @apply bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg;
}

.setting-btn.secondary {
  @apply bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 shadow-md hover:shadow-lg;
}

.setting-btn.danger {
  @apply bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg;
}

.setting-btn.small {
  @apply px-2 py-1 text-sm bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg;
}

.backup-actions {
  @apply flex flex-col space-y-3 mt-3;
}

.backup-actions .setting-btn {
  @apply w-full;
}

.cloud-sync-panel {
  @apply space-y-3;
}

.cloud-sync-label {
  @apply block text-sm font-medium text-primary-700;
}

.cloud-sync-row {
  @apply flex flex-col gap-2;
}

.cloud-sync-input {
  @apply w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/90;
}

.cloud-sync-actions {
  @apply flex flex-col gap-2;
}

.cloud-sync-status {
  @apply text-sm text-primary-700 bg-primary-50/70 border border-primary-200/60 rounded-md px-3 py-2 break-words;
}

.uuid-display {
  @apply flex items-center space-x-2 p-2 bg-primary-50/50 rounded-md border border-primary-200/60;
}

.uuid-text {
  @apply flex-1 text-xs font-mono text-primary-700 bg-white/80 px-2 py-1 rounded border border-primary-200/60 break-all;
}

.user-info-display {
  @apply space-y-2;
}

.user-info-item {
  @apply flex items-center justify-between p-2 bg-primary-50/50 rounded-md border border-primary-200/60;
}

.info-label {
  @apply text-sm font-medium text-primary-600;
}

.info-value {
  @apply text-sm font-semibold text-primary-800;
}

.faction-display {
  @apply flex items-center space-x-1 font-bold;
}

.setting-select {
  @apply w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/90;
}

.setting-toggle {
  @apply flex items-center space-x-3;
}

.toggle-slider {
  @apply relative inline-block w-12 h-6 bg-primary-200 rounded-full transition-colors;
}

.toggle-slider::before {
  @apply absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm;
  content: '';
}

input:checked + .toggle-slider {
  @apply bg-gradient-to-r from-primary-500 to-secondary-500;
}

input:checked + .toggle-slider::before {
  @apply transform translate-x-6;
}

.toggle-label {
  @apply text-sm font-medium text-primary-700;
}

/* GM功能样式 */
.gm-section {
  @apply space-y-4;
}

.auth-card {
  @apply bg-gradient-to-br from-gold-50/80 to-primary-50/60 rounded-lg p-6 text-center border border-gold-200/60;
}

.auth-icon {
  @apply mb-4;
}

.auth-title {
  @apply text-xl font-bold text-gold-700 mb-2;
}

.auth-desc {
  @apply text-gold-600 mb-4;
}

.auth-form {
  @apply flex space-x-2 max-w-sm mx-auto;
}

.auth-input {
  @apply flex-1 px-3 py-2 border border-gold-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white/90;
}

.auth-btn {
  @apply px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-md hover:from-gold-600 hover:to-gold-700 transition-all shadow-md hover:shadow-lg;
}

.auth-error {
  @apply mt-2 text-red-500 text-sm;
}

.gm-controls {
  @apply bg-gradient-to-br from-gold-50/80 to-primary-50/60 rounded-lg p-4 border border-gold-200/60;
}

.gm-header {
  @apply flex justify-between items-center mb-4 pb-2 border-b border-gold-200;
}

.gm-status {
  @apply flex items-center space-x-2 text-green-600 font-medium;
}

.gm-disable-btn {
  @apply px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all text-sm shadow-md;
}

.gm-actions {
  @apply space-y-4;
}

.gm-section-title {
  @apply text-lg font-semibold text-primary-800 mb-2;
}

.resource-controls {
  @apply space-y-3;
}

.resource-item {
  @apply flex justify-between items-center p-3 bg-gradient-to-r from-white/90 to-primary-50/50 rounded-md border border-primary-200/60;
}

.resource-info {
  @apply flex flex-col;
}

.resource-name {
  @apply font-medium text-primary-800;
}

.resource-current {
  @apply text-sm text-primary-600;
}

.resource-actions {
  @apply flex space-x-2;
}

.resource-btn {
  @apply px-2 py-1 rounded text-xs font-medium transition-colors;
}

.resource-btn.small {
  @apply bg-secondary-100 text-secondary-700 hover:bg-secondary-200 border border-secondary-200;
}

.resource-btn.medium {
  @apply bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-200;
}

.resource-btn.large {
  @apply bg-gold-100 text-gold-700 hover:bg-gold-200 border border-gold-200;
}

.resource-btn.max {
  @apply bg-gradient-to-r from-gold-200 to-primary-200 text-primary-800 hover:from-gold-300 hover:to-primary-300 border border-gold-300;
}

.coins-controls {
  @apply space-y-3;
}

.coins-item {
  @apply flex justify-between items-center p-3 bg-gradient-to-r from-gold-50/90 to-gold-100/50 rounded-md border border-gold-200/60;
}

.coins-info {
  @apply flex flex-col;
}

.coins-name {
  @apply font-medium text-gold-800;
}

.coins-current {
  @apply text-sm text-gold-600;
}

.coins-actions {
  @apply flex space-x-2;
}

.quick-actions {
  @apply flex flex-wrap gap-2;
}

.quick-btn {
  @apply px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-md hover:from-primary-600 hover:to-secondary-600 transition-all shadow-md hover:shadow-lg;
}

.hidden {
  @apply sr-only;
}

@media (max-width: 768px) {
  .page-header {
    @apply p-4 mb-4;
  }

  .page-title {
    @apply text-2xl;
  }

  .settings-section {
    @apply p-4;
  }

  .section-title {
    @apply text-lg mb-3;
  }

  .setting-card {
    @apply p-3;
  }

  .user-info-item {
    @apply flex-col items-start gap-2;
  }

  .uuid-display {
    @apply flex-col items-stretch gap-2;
  }

  .auth-form {
    @apply flex-col space-x-0 space-y-2 max-w-none;
  }

  .gm-header {
    @apply flex-col items-start gap-3;
  }

  .resource-item,
  .coins-item {
    @apply flex-col items-start gap-3;
  }

  .resource-actions,
  .coins-actions {
    @apply flex flex-wrap space-x-0 gap-2 w-full;
  }

  .resource-btn,
  .quick-btn,
  .gm-disable-btn,
  .auth-btn {
    min-height: 40px;
  }

  .resource-actions .resource-btn,
  .coins-actions .resource-btn {
    flex: 1 1 calc(50% - 0.5rem);
  }
}

@media (max-width: 480px) {
  .page-header {
    @apply p-3;
  }

  .page-title {
    @apply text-xl;
  }

  .settings-section {
    @apply p-3;
  }

  .setting-btn {
    @apply w-full justify-center;
  }

  .resource-actions .resource-btn,
  .coins-actions .resource-btn,
  .quick-btn {
    flex-basis: 100%;
    width: 100%;
  }
}
</style>
