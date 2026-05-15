<template>
  <!-- 征兵弹窗 -->
  <Transition name="modal" appear>
    <div v-if="visible" class="recruitment-modal-overlay" data-testid="recruitment-modal-overlay" @click="handleOverlayClick">
      <div class="recruitment-modal" data-testid="recruitment-modal" @click.stop>
      <!-- 弹窗头部 -->
      <div class="modal-header">
        <div class="header-content">
          <HoverCard
            density="compact"
            :show="showUnitHover"
            @mouseenter="showUnitHover = true"
            @mouseleave="showUnitHover = false"
          >
            <template #trigger>
              <div class="unit-icon">{{ selectedUnit?.icon }}</div>
            </template>
            <UnitHoverContent v-if="selectedUnit" :unit="selectedUnit" />
          </HoverCard>
          <div class="unit-info">
            <h3 class="unit-name">征募 {{ selectedUnit?.name }}</h3>
            <p class="unit-description">{{ selectedUnit?.description }}</p>
          </div>
        </div>
        <button class="close-btn" @click="closeModal">
          <span>✕</span>
        </button>
      </div>



      <!-- 征兵信息 - 单行布局 -->
      <div class="recruitment-info">
        <!-- 单个消耗 -->
        <div class="info-item">
          <span class="item-label">单个消耗:</span>
          <div class="cost-inline">
            <span 
              v-for="(cost, resource) in selectedUnit?.cost" 
              :key="resource" 
              class="cost-tag"
            >
              {{ getResourceIcon(resource) }}{{ cost }}
            </span>
          </div>
        </div>

        <!-- 征兵数量 -->
        <div class="info-item">
          <span class="item-label">数量:</span>
          <div class="quantity-inline">
            <button class="quantity-btn" @click="decreaseQuantity" :disabled="recruitCount <= 1">-</button>
            <input v-model.number="recruitCount" type="number" min="1" :max="maxRecruitableCount" class="quantity-input" data-testid="recruitment-quantity-input" @input="validateQuantity">
            <button class="quantity-btn" @click="increaseQuantity" :disabled="recruitCount >= maxRecruitableCount">+</button>
            <button class="quick-btn" @click="setQuantityByRatio(0.5)" :disabled="maxRecruitableCount < 2">50%</button>
            <button class="quick-btn" @click="setQuantityByRatio(1)" :disabled="maxRecruitableCount < 1">最大</button>
          </div>
        </div>

        <!-- 总消耗 -->
        <div class="info-item">
          <span class="item-label">总消耗:</span>
          <div class="cost-inline">
            <span 
              v-for="(cost, resource) in totalCost" 
              :key="resource" 
              class="cost-tag"
              :class="{ 'insufficient': !hasEnoughResource(resource, cost) }"
            >
              {{ getResourceIcon(resource) }}{{ cost }}
            </span>
          </div>
        </div>

        <!-- 训练时间 -->
        <div class="info-item">
          <span class="item-label">时间:</span>
          <div class="time-inline">
            <span class="time-tag">单个: {{ formatTrainTime(gameStore.getActualTrainTime) }}</span>
            <span class="time-tag">总计: {{ formatTrainTime(gameStore.getActualTrainTime) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="modal-actions">
        <button class="cancel-btn" @click="closeModal">
          取消
        </button>
        <button 
          class="recruit-btn"
          data-testid="recruitment-start-button"
          @click="startRecruitment"
          :disabled="!canRecruit"
        >
          开始征兵
        </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useMilitaryHelpers } from '@/hooks/useMilitaryHelpers.js'
import HoverCard from '@/components/hover/HoverCard.vue'
import UnitHoverContent from '@/components/hover/UnitHoverContent.vue'

export default {
  name: 'RecruitmentModal',
  components: {
    HoverCard,
    UnitHoverContent
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedUnit: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { gameStore, getResourceIcon, formatTrainTime } = useMilitaryHelpers()
    
    // 征兵数量
    const recruitCount = ref(1)
    const showUnitHover = ref(false)
    
    //=== 计算最大可征募数量
    const maxRecruitableCount = computed(() => {
      if (!props.selectedUnit) return 0
      return gameStore.getMaxRecruitableCount(props.selectedUnit.id)
    })
    
    //=== 计算总消耗
    const totalCost = computed(() => {
      if (!props.selectedUnit) return {}
      
      const cost = {}
      Object.keys(props.selectedUnit.cost).forEach(resource => {
        cost[resource] = props.selectedUnit.cost[resource] * recruitCount.value
      })
      return cost
    })
    
    //=== 检查是否可以征兵
    const canRecruit = computed(() => {
      if (!props.selectedUnit || recruitCount.value <= 0) return false
      return gameStore.canRecruit(props.selectedUnit.id, recruitCount.value)
    })
    
    //=== 监听弹窗显示状态，重置征兵数量
    watch(() => props.visible, (newVisible) => {
      if (newVisible) {
        recruitCount.value = 1
      }
    })
    
    //=== 数量控制方法
    const increaseQuantity = () => {
      if (recruitCount.value < maxRecruitableCount.value) {
        recruitCount.value++
      }
    }
    
    const decreaseQuantity = () => {
      if (recruitCount.value > 1) {
        recruitCount.value--
      }
    }
    
    const validateQuantity = () => {
      if (recruitCount.value < 1) {
        recruitCount.value = 1
      } else if (recruitCount.value > maxRecruitableCount.value) {
        recruitCount.value = maxRecruitableCount.value
      }
    }
    
    const setQuantityByRatio = (ratio) => {
      recruitCount.value = Math.max(1, Math.floor(maxRecruitableCount.value * ratio))
    }
    
    const getResourceName = (resource) => {
      const names = {
        wood: '木材',
        soil: '泥土',
        iron: '铁矿',
        food: '粮食'
      }
      return names[resource] || resource
    }
    
    const hasEnoughResource = (resource, cost) => {
      return gameStore.resources[resource] >= cost
    }
    
    //=== 弹窗控制方法
    const closeModal = () => {
      emit('close')
    }
    
    const handleOverlayClick = () => {
      closeModal()
    }
    
    //=== 开始征兵
    const startRecruitment = () => {
      if (canRecruit.value) {
        const success = gameStore.recruitUnits(props.selectedUnit.id, recruitCount.value)
        if (success) {
          closeModal()
        }
      }
    }
    
    return {
      gameStore,
      showUnitHover,
      recruitCount,
      maxRecruitableCount,
      totalCost,
      canRecruit,
      increaseQuantity,
      decreaseQuantity,
      validateQuantity,
      setQuantityByRatio,
      getResourceIcon,
      getResourceName,
      hasEnoughResource,
      formatTrainTime,
      closeModal,
      handleOverlayClick,
      startRecruitment
    }
  }
}
</script>

<style scoped>
/* 弹窗遮罩 */
.recruitment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* 弹窗主体 */
.recruitment-modal {
  background: rgba(24, 24, 27, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid #237C48;
  border-radius: 12px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
  max-width: 480px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  color: white;
}

/* 弹窗头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid rgba(35, 124, 72, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-icon {
  font-size: 36px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.unit-info {
  flex: 1;
}

.unit-name {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: bold;
  color: #FFB900;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.unit-description {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
}

.close-btn {
  background: rgba(255, 99, 103, 0.2);
  border: 1px solid #FF6367;
  border-radius: 6px;
  color: #FF6367;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 99, 103, 0.3);
  transform: scale(1.1);
}

/* 征兵信息 - 单行布局 */
.recruitment-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(35, 124, 72, 0.05);
  border: 1px solid rgba(35, 124, 72, 0.2);
  border-radius: 6px;
}

.item-label {
  font-size: 12px;
  font-weight: bold;
  color: #FFB900;
  min-width: 60px;
  flex-shrink: 0;
}

.cost-inline,
.quantity-inline,
.time-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.cost-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: rgba(24, 24, 27, 0.3);
  border-radius: 3px;
  font-size: 11px;
  color: white;
  font-weight: bold;
}

.cost-tag.insufficient {
  color: #FF6367;
  background: rgba(255, 99, 103, 0.1);
}

.time-tag {
  padding: 2px 6px;
  background: rgba(24, 24, 27, 0.3);
  border-radius: 3px;
  font-size: 11px;
  color: #FFB900;
  font-weight: bold;
}



/* 数量控制 */
.quantity-btn {
  background: rgba(35, 124, 72, 0.2);
  border: 1px solid #237C48;
  border-radius: 3px;
  color: white;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  font-weight: bold;
}

.quantity-btn:hover:not(:disabled) {
  background: rgba(35, 124, 72, 0.4);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  background: rgba(24, 24, 27, 0.8);
  border: 1px solid #237C48;
  border-radius: 3px;
  color: white;
  padding: 2px 4px;
  font-size: 11px;
  text-align: center;
  width: 40px;
}

.quantity-input:focus {
  outline: none;
  border-color: #2A9D5F;
}

.quick-btn {
  background: rgba(35, 124, 72, 0.2);
  border: 1px solid #237C48;
  border-radius: 3px;
  color: white;
  padding: 2px 4px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-btn:hover:not(:disabled) {
  background: rgba(35, 124, 72, 0.4);
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}



/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .recruitment-modal,
.modal-leave-to .recruitment-modal {
  transform: scale(0.8) translateY(-20px);
  opacity: 0;
}

.modal-enter-to .recruitment-modal,
.modal-leave-from .recruitment-modal {
  transform: scale(1) translateY(0);
  opacity: 1;
  transition: all 0.3s ease;
}

/* 操作按钮 */
.modal-actions {
  padding: 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.cancel-btn,
.recruit-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.recruit-btn {
  background: linear-gradient(135deg, #237C48, #2d8f55);
  color: white;
  border: 1px solid #237C48;
}

.recruit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2d8f55, #237C48);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(35, 124, 72, 0.4);
}

.recruit-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border-color: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 滚动条样式 */
.recruitment-modal::-webkit-scrollbar {
  width: 8px;
}

.recruitment-modal::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.recruitment-modal::-webkit-scrollbar-thumb {
  background: rgba(35, 124, 72, 0.6);
  border-radius: 4px;
}

.recruitment-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(35, 124, 72, 0.8);
}

@media (max-width: 768px) {
  .recruitment-modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .recruitment-modal {
    max-width: none;
    max-height: 92vh;
    border-radius: 18px 18px 0 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
  }

  .modal-header {
    @apply items-start gap-3;
    padding: 14px 14px 12px;
  }

  .header-content {
    align-items: flex-start;
    gap: 10px;
    min-width: 0;
  }

  .unit-icon {
    font-size: 30px;
    line-height: 1;
  }

  .unit-name {
    font-size: 18px;
  }

  .unit-description {
    font-size: 11px;
  }

  .recruitment-info {
    padding: 12px;
    gap: 10px;
  }

  .info-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 10px;
  }

  .item-label {
    min-width: 0;
  }

  .cost-inline,
  .quantity-inline,
  .time-inline {
    flex-wrap: wrap;
    gap: 8px;
  }

  .quantity-btn {
    width: 28px;
    height: 28px;
  }

  .quantity-input {
    width: 56px;
    padding: 4px 6px;
    font-size: 12px;
  }

  .quick-btn,
  .cost-tag,
  .time-tag {
    font-size: 11px;
    padding: 4px 6px;
  }

  .modal-actions {
    padding: 12px;
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .recruit-btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>
