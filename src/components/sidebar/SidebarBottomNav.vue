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
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(229, 231, 235, 0.92);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
}

.nav-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.nav-button {
  min-height: 64px;
  padding: 10px 8px;
  border-radius: 20px;
  border: 1px solid rgba(229, 231, 235, 0.92);
  background: rgba(248, 250, 252, 0.92);
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
  border-color: rgba(129, 140, 248, 0.55);
  box-shadow: 0 10px 24px rgba(79, 70, 229, 0.12);
  color: #4f46e5;
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  font-size: 12px;
  font-weight: 700;
}
</style>
