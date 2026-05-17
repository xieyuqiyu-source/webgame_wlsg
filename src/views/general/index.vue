<template>
  <GamePageLayout page-class="general-view">
    <section class="general-shell">
      <header class="general-header">
        <h1>将领</h1>
        <p>查看将领成长、特性与属性分配</p>
      </header>
      <GeneralProfile
        :general="gameStore.selectedGeneral"
        :progress="gameStore.generalProgress"
        :exp-for-next-level="gameStore.generalExpForNextLevel"
        @allocate="gameStore.allocateGeneralPoint"
      />
    </section>
  </GamePageLayout>
</template>

<script>
import GamePageLayout from '@/components/GamePageLayout.vue'
import GeneralProfile from '@/components/general/GeneralProfile.vue'
import { useGameStore } from '@/store/modules/gameStore.js'

export default {
  name: 'GeneralView',
  components: {
    GamePageLayout,
    GeneralProfile
  },
  setup() {
    return { gameStore: useGameStore() }
  }
}
</script>

<style scoped>
.general-shell {
  max-width: 680px;
  padding: 24px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(226, 232, 240, 0.92);
}
.general-header { margin-bottom: 20px; }
.general-header h1 { margin: 0 0 6px; color: #111827; font-size: 26px; font-weight: 700; }
.general-header p { margin: 0; color: #6b7280; }
</style>
