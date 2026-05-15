<template>
  <div class="hover-card-shell" :class="placementClass">
    <slot name="trigger" />

    <Transition name="hover-card-fade">
      <div v-if="show" class="hover-card-panel" :class="densityClass">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script>
export default {
  name: 'HoverCard',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    density: {
      type: String,
      default: 'standard'
    },
    placement: {
      type: String,
      default: 'top'
    }
  },
  computed: {
    densityClass() {
      return `density-${this.density}`
    },
    placementClass() {
      return `placement-${this.placement}`
    }
  }
}
</script>

<style scoped>
.hover-card-shell {
  position: relative;
}

.hover-card-panel {
  position: absolute;
  z-index: 60;
  min-width: 220px;
  max-width: 300px;
  color: #ffffff;
  background: rgba(31, 41, 55, 0.96);
  border: 1px solid rgba(34, 197, 94, 0.45);
  border-radius: 8px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(12px);
}

.placement-top .hover-card-panel {
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translateX(-50%);
}

.placement-right .hover-card-panel {
  top: 50%;
  left: calc(100% + 10px);
  transform: translateY(-50%);
}

.density-compact {
  min-width: 180px;
}

.density-rich {
  min-width: 260px;
}

.hover-card-fade-enter-active,
.hover-card-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.placement-top .hover-card-fade-enter-from,
.placement-top .hover-card-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(6px);
}

.placement-right .hover-card-fade-enter-from,
.placement-right .hover-card-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-6px);
}
</style>
