<template>
  <div v-if="show" class="boost-dialog-overlay" @click="$emit('close')">
    <div class="boost-dialog" @click.stop>
      <div class="boost-dialog-header">
        <h3>生产力加速</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="boost-dialog-content">
        <div class="boost-info">
          <p class="boost-description">消耗金币获得生产力40%加成</p>
          <div class="current-coins">
            <span class="coins-label">当前金币:</span>
            <span class="coins-value">{{ coins }}</span>
          </div>
        </div>

        <div class="boost-options">
          <div
            v-for="option in boostOptions"
            :key="option.hours"
            class="boost-option"
            :class="{ disabled: coins < option.cost }"
            @click="$emit('start-boost', option.hours)"
          >
            <div class="option-header">
              <span class="option-duration">{{ option.hours }}小时</span>
              <span class="option-cost">{{ option.cost }}金币</span>
            </div>
            <div class="option-description">{{ option.description }}</div>
          </div>
        </div>

        <div v-if="isProductionBoostActive" class="current-boost">
          <div class="current-boost-info">
            <span class="boost-status">当前加速状态: 激活中</span>
            <span class="boost-remaining">剩余时间: {{ formatTime(productionBoostTimeLeft) }}</span>
          </div>
          <p class="boost-note">选择新的加速时间将延长当前加速效果</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarBoostDialog',
  emits: ['close', 'start-boost'],
  props: {
    boostOptions: {
      type: Array,
      required: true
    },
    coins: {
      type: Number,
      required: true
    },
    formatTime: {
      type: Function,
      required: true
    },
    isProductionBoostActive: {
      type: Boolean,
      required: true
    },
    productionBoostTimeLeft: {
      type: Number,
      required: true
    },
    show: {
      type: Boolean,
      required: true
    }
  }
}
</script>
