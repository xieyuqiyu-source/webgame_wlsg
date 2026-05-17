<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleOverlayClick">
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">欢迎来到三国争霸</h2>
        <p class="dialog-subtitle">设置玩家信息，选择阵营与出仕将领</p>
      </div>

      <div class="dialog-content">
        <div class="form-group">
          <label class="form-label">玩家昵称</label>
          <input
            v-model="nickname"
            type="text"
            class="form-input"
            placeholder="请输入您的昵称"
            maxlength="20"
            @keyup.enter="handleSubmit"
          >
          <div v-if="nicknameError" class="error-message">{{ nicknameError }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">选择阵营</label>
          <div class="faction-grid">
            <button
              v-for="faction in factions"
              :key="faction.id"
              type="button"
              class="faction-card"
              :class="{ selected: selectedFaction === faction.id }"
              @click="selectFaction(faction.id)"
            >
              <div class="faction-icon">{{ faction.icon }}</div>
              <div class="faction-name">{{ faction.name }}</div>
              <div class="faction-description">{{ faction.description }}</div>
              <div class="faction-slogan">{{ faction.slogan }}</div>
            </button>
          </div>
          <div v-if="factionError" class="error-message">{{ factionError }}</div>
        </div>

        <div v-if="selectedFaction" class="form-group">
          <label class="form-label">选择将领</label>
          <div class="general-grid">
            <button
              v-for="general in availableGenerals"
              :key="general.id"
              type="button"
              class="general-card"
              :class="{ selected: selectedGeneralId === general.id }"
              @click="selectGeneral(general.id)"
            >
              <div class="general-name">{{ general.name }}</div>
              <div class="general-title">{{ general.title }}</div>
              <div class="general-description">{{ general.description }}</div>
              <div class="general-trait">
                <strong>{{ general.trait.name }}</strong>
                <span>{{ general.trait.description }}</span>
              </div>
            </button>
          </div>
          <div v-if="generalError" class="error-message">{{ generalError }}</div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-primary" type="button" :disabled="!canSubmit" @click="handleSubmit">
          开始游戏
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { getAllFactions } from '../config/factionConfig.js'
import { getGeneralsByFaction } from '../config/generalConfig.js'

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
    const selectedGeneralId = ref(null)
    const nicknameError = ref('')
    const factionError = ref('')
    const generalError = ref('')
    const factions = getAllFactions()

    const availableGenerals = computed(() => (
      selectedFaction.value ? getGeneralsByFaction(selectedFaction.value) : []
    ))

    const canSubmit = computed(() => (
      nickname.value.trim().length >= 2 &&
      selectedFaction.value &&
      selectedGeneralId.value
    ))

    const selectFaction = (factionId) => {
      selectedFaction.value = factionId
      selectedGeneralId.value = null
      factionError.value = ''
      generalError.value = ''
    }

    const selectGeneral = (generalId) => {
      selectedGeneralId.value = generalId
      generalError.value = ''
    }

    const validateForm = () => {
      let isValid = true
      const trimmedNickname = nickname.value.trim()

      if (!trimmedNickname) {
        nicknameError.value = '请输入昵称'
        isValid = false
      } else if (trimmedNickname.length < 2) {
        nicknameError.value = '昵称至少需要 2 个字符'
        isValid = false
      } else {
        nicknameError.value = ''
      }

      if (!selectedFaction.value) {
        factionError.value = '请选择一个阵营'
        isValid = false
      } else {
        factionError.value = ''
      }

      if (!selectedGeneralId.value) {
        generalError.value = '请选择一位将领'
        isValid = false
      } else {
        generalError.value = ''
      }

      return isValid
    }

    const handleSubmit = () => {
      if (!validateForm()) return
      emit('submit', {
        nickname: nickname.value.trim(),
        faction: selectedFaction.value,
        generalId: selectedGeneralId.value
      })
    }

    const handleOverlayClick = () => {
      if (props.allowClose) emit('close')
    }

    return {
      availableGenerals,
      canSubmit,
      factionError,
      factions,
      generalError,
      handleOverlayClick,
      handleSubmit,
      nickname,
      nicknameError,
      selectFaction,
      selectGeneral,
      selectedFaction,
      selectedGeneralId
    }
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.dialog-container {
  width: min(960px, 90vw);
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.dialog-header,
.dialog-footer {
  padding: 20px 24px;
  text-align: center;
}

.dialog-header {
  border-bottom: 1px solid #e5e7eb;
}

.dialog-title {
  margin: 0 0 8px;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
}

.dialog-subtitle {
  margin: 0;
  color: #6b7280;
}

.dialog-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
}

.faction-grid,
.general-grid {
  display: grid;
  gap: 16px;
}

.faction-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.general-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.faction-card,
.general-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px;
  background: #f9fafb;
  text-align: left;
  cursor: pointer;
}

.faction-card.selected,
.general-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.faction-icon {
  margin-bottom: 10px;
  font-size: 28px;
  text-align: center;
}

.faction-name,
.general-name {
  color: #1f2937;
  font-size: 18px;
  font-weight: 700;
}

.faction-description,
.general-description {
  margin-top: 8px;
  color: #6b7280;
  font-size: 14px;
}

.faction-slogan,
.general-title {
  margin-top: 8px;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 600;
}

.general-trait {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 12px;
  color: #374151;
  font-size: 13px;
}

.error-message {
  margin-top: 6px;
  color: #dc2626;
  font-size: 14px;
}

.dialog-footer {
  border-top: 1px solid #e5e7eb;
}

.btn {
  min-width: 120px;
  border: 0;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
}

.btn-primary {
  color: #ffffff;
  background: #3b82f6;
}

.btn:disabled {
  cursor: not-allowed;
  background: #9ca3af;
}

@media (max-width: 768px) {
  .dialog-container {
    width: 95vw;
  }

  .dialog-content {
    padding: 16px;
  }
}
</style>
