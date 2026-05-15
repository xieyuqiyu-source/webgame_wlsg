<template>
  <div class="reminder-hover-content" :class="toneClass">
    <div class="reminder-title">{{ title }}</div>
    <p class="reminder-body">{{ body }}</p>
    <div v-if="action" class="reminder-action">{{ action }}</div>
  </div>
</template>

<script>
export default {
  name: 'ReminderHoverContent',
  props: {
    action: {
      type: String,
      default: ''
    },
    body: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    tone: {
      type: String,
      default: 'info'
    }
  },
  computed: {
    toneClass() {
      return `tone-${this.tone}`
    }
  }
}
</script>

<style scoped>
.reminder-hover-content {
  padding: 14px;
}

.reminder-title {
  margin-bottom: 6px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.reminder-body {
  margin: 0;
  color: #d1d5db;
  font-size: 12px;
  line-height: 1.5;
}

.reminder-action {
  margin-top: 10px;
  color: #93c5fd;
  font-size: 12px;
}

.tone-warning .reminder-title {
  color: #facc15;
}

.tone-danger .reminder-title {
  color: #fca5a5;
}

.tone-success .reminder-title {
  color: #86efac;
}
</style>
