<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleOverlayClick">
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">欢迎来到三国争霸</h2>
        <p class="dialog-subtitle">请设置您的游戏信息</p>
      </div>
      
      <div class="dialog-content">
        <!-- 昵称输入 -->
        <div class="form-group">
          <label class="form-label">玩家昵称</label>
          <input 
            v-model="nickname" 
            type="text" 
            class="form-input"
            placeholder="请输入您的昵称"
            maxlength="20"
            @keyup.enter="handleSubmit"
          />
          <div v-if="nicknameError" class="error-message">{{ nicknameError }}</div>
        </div>
        
        <!-- 阵营选择 -->
        <div class="form-group">
          <label class="form-label">选择阵营</label>
          <div class="faction-grid">
            <div 
              v-for="faction in factions" 
              :key="faction.id"
              class="faction-card"
              :class="{ 'selected': selectedFaction === faction.id }"
              @click="selectFaction(faction.id)"
            >
              <div class="faction-icon">{{ faction.icon }}</div>
              <div class="faction-name">{{ faction.name }}</div>
              <div class="faction-description">{{ faction.description }}</div>
              <div class="faction-slogan">{{ faction.slogan }}</div>
              
              <!-- 阵营特性展示 -->
              <div class="faction-traits">
                <div class="trait-item" v-if="faction.traits.economyBonus !== 1">
                  <span class="trait-icon">💰</span>
                  <span class="trait-text">经济 {{ faction.traits.economyBonus > 1 ? '+' : '' }}{{ Math.round((faction.traits.economyBonus - 1) * 100) }}%</span>
                </div>
                <div class="trait-item" v-if="faction.traits.militaryBonus !== 1">
                  <span class="trait-icon">⚔️</span>
                  <span class="trait-text">军事 {{ faction.traits.militaryBonus > 1 ? '+' : '' }}{{ Math.round((faction.traits.militaryBonus - 1) * 100) }}%</span>
                </div>
                <div class="trait-item" v-if="faction.traits.buildingBonus !== 1">
                  <span class="trait-icon">🏗️</span>
                  <span class="trait-text">建筑速度 {{ faction.traits.buildingBonus > 1 ? '+' : '' }}{{ Math.round((faction.traits.buildingBonus - 1) * 100) }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="factionError" class="error-message">{{ factionError }}</div>
        </div>
      </div>
      
      <div class="dialog-footer">
        <button 
          class="btn btn-primary"
          @click="handleSubmit"
          :disabled="!canSubmit"
        >
          开始游戏
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getAllFactions } from '../config/factionConfig.js'

export default {
  name: 'UserInitDialog',
  emits: ['submit', 'close'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    allowClose: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const nickname = ref('')
    const selectedFaction = ref(null)
    const factions = ref([])
    const nicknameError = ref('')
    const factionError = ref('')
    
    // 计算属性
    const canSubmit = computed(() => {
      return nickname.value.trim().length >= 2 && selectedFaction.value
    })
    
    // 方法
    const selectFaction = (factionId) => {
      selectedFaction.value = factionId
      factionError.value = ''
    }
    
    const validateForm = () => {
      let isValid = true
      
      // 验证昵称
      if (!nickname.value.trim()) {
        nicknameError.value = '请输入昵称'
        isValid = false
      } else if (nickname.value.trim().length < 2) {
        nicknameError.value = '昵称至少需要2个字符'
        isValid = false
      } else if (nickname.value.trim().length > 20) {
        nicknameError.value = '昵称不能超过20个字符'
        isValid = false
      } else {
        nicknameError.value = ''
      }
      
      // 验证阵营
      if (!selectedFaction.value) {
        factionError.value = '请选择一个阵营'
        isValid = false
      } else {
        factionError.value = ''
      }
      
      return isValid
    }
    
    const handleSubmit = () => {
      if (validateForm()) {
        emit('submit', {
          nickname: nickname.value.trim(),
          faction: selectedFaction.value
        })
      }
    }
    
    const handleOverlayClick = () => {
      if (props.allowClose) {
        emit('close')
      }
    }
    
    // 生命周期
    onMounted(() => {
      factions.value = getAllFactions()
    })
    
    return {
      nickname,
      selectedFaction,
      factions,
      nicknameError,
      factionError,
      canSubmit,
      selectFaction,
      handleSubmit,
      handleOverlayClick
    }
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  animation: dialogSlideIn 0.3s ease-out;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  padding: 24px 24px 16px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.dialog-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.dialog-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin-top: 4px;
}

.faction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.faction-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.faction-card:hover {
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.faction-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.faction-icon {
  font-size: 32px;
  text-align: center;
  margin-bottom: 12px;
}

.faction-name {
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
  color: #1f2937;
}

.faction-description {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 12px;
  line-height: 1.4;
}

.faction-slogan {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  font-style: italic;
  margin-bottom: 16px;
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.faction-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.trait-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
}

.trait-icon {
  font-size: 14px;
}

.trait-text {
  color: #059669;
  font-weight: 600;
}

.dialog-footer {
  padding: 16px 24px 24px;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-container {
    width: 95vw;
    margin: 20px;
  }
  
  .faction-grid {
    grid-template-columns: 1fr;
  }
  
  .dialog-title {
    font-size: 20px;
  }
  
  .dialog-content {
    padding: 16px;
  }
}
</style>