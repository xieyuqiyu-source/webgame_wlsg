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
