<template>
  <div class="hover-content">
    <div class="hover-title">{{ title }}</div>

    <template v-if="isUpgrading">
      <div class="hover-note active">建筑正在升级中</div>
      <div class="hover-row">
        <span>剩余时间</span>
        <strong>{{ remainingTimeText }}</strong>
      </div>
    </template>

    <template v-else-if="isMaxLevel">
      <div class="hover-note max">建筑已达到最高等级</div>
    </template>

    <template v-else>
      <div class="hover-row highlight">
        <span>产量提升</span>
        <strong>+{{ productionGain }}/h</strong>
      </div>
      <div class="hover-row">
        <span>升级耗时</span>
        <strong>{{ upgradeDurationText }}</strong>
      </div>
      <div class="hover-divider"></div>
      <div
        v-for="(cost, resourceType) in upgradeCost"
        :key="resourceType"
        class="hover-row"
        :class="{ insufficient: resources[resourceType] < cost }"
      >
        <span>{{ getResourceName(resourceType) }}</span>
        <strong>{{ resources[resourceType] }}/{{ cost }}</strong>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'BuildingUpgradeHoverContent',
  props: {
    getResourceName: {
      type: Function,
      required: true
    },
    isMaxLevel: {
      type: Boolean,
      required: true
    },
    isUpgrading: {
      type: Boolean,
      required: true
    },
    productionGain: {
      type: Number,
      required: true
    },
    remainingTimeText: {
      type: String,
      default: ''
    },
    resources: {
      type: Object,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    upgradeCost: {
      type: Object,
      required: true
    },
    upgradeDurationText: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.hover-content {
  padding: 12px;
}

.hover-title {
  margin-bottom: 10px;
  color: #4ade80;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.hover-note {
  color: #93c5fd;
  font-size: 12px;
  text-align: center;
}

.hover-note.max {
  color: #facc15;
}

.hover-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0;
  color: #d1d5db;
  font-size: 12px;
}

.hover-row strong {
  color: #ffffff;
}

.hover-row.highlight strong {
  color: #4ade80;
}

.hover-row.insufficient,
.hover-row.insufficient strong {
  color: #fca5a5;
}

.hover-divider {
  height: 1px;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.14);
}
</style>
