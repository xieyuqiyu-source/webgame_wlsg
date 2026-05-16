<template>
  <div class="bottom-nav">
    <div class="nav-buttons">
      <div
        v-for="item in navItems"
        :key="item.key"
        class="nav-button"
        :data-testid="`sidebar-nav-${item.key}`"
        @click="$emit('nav-click', item.key)"
      >
        <div class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path :d="item.iconPath" />
          </svg>
        </div>
        <span class="nav-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarBottomNav',
  emits: ['nav-click'],
  props: {
    navItems: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.bottom-nav {
  padding: 10px 12px 12px;
  border-top: 1px solid rgba(226, 232, 240, 0.92);
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(12px);
}

.nav-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.nav-button {
  min-height: 58px;
  padding: 8px 6px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  background: rgba(255, 255, 255, 0.96);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button:hover {
  transform: translateY(-1px);
  border-color: rgba(148, 163, 184, 0.55);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  color: #334155;
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-size: 11px;
  font-weight: 700;
}
</style>
