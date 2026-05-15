<template>
  <div class="tutorial-hover-content">
    <div class="tutorial-kicker">{{ kicker }}</div>
    <div class="tutorial-title">{{ title }}</div>
    <p class="tutorial-body">{{ body }}</p>
    <div v-if="items.length" class="tutorial-items">
      <div v-for="item in items" :key="item" class="tutorial-item">{{ item }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TutorialHoverContent',
  props: {
    body: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      default: () => []
    },
    kicker: {
      type: String,
      default: '说明'
    },
    title: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.tutorial-hover-content {
  padding: 14px;
}

.tutorial-kicker {
  margin-bottom: 4px;
  color: #86efac;
  font-size: 11px;
}

.tutorial-title {
  margin-bottom: 8px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.tutorial-body {
  margin: 0;
  color: #d1d5db;
  font-size: 12px;
  line-height: 1.5;
}

.tutorial-items {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.tutorial-item {
  color: #9ca3af;
  font-size: 12px;
}
</style>
