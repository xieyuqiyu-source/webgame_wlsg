<template>
  <GamePageLayout page-class="military-view">
    <div class="content-area">
      <MilitaryTabs :active-tab="activeTab" @tab-change="handleTabChange">
        <div v-if="activeTab === 'recruitment'" class="recruitment-content">
          <RecruitmentQueue class="mb-6" />
          <UnitDetailTabs @tab-change="handleUnitDetailTabChange" />
        </div>

        <div v-if="activeTab === 'technology'" class="tab-panel">
          <div class="panel-header">
            <h2 class="panel-title">军事科技</h2>
            <p class="panel-subtitle">研发军事技术提升战斗力</p>
          </div>
          <div class="panel-content">
            <div class="placeholder-box">
              <div class="placeholder-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="text-green-400">
                  <path d="M19.07,4.93C17.22,3 14.66,1.96 12,2C9.34,1.96 6.79,3 4.94,4.93C3,6.78 1.96,9.34 2,12C1.96,14.66 3,17.21 4.93,19.06C6.78,21 9.34,22.04 12,22C14.66,22.04 17.21,21 19.06,19.07C21,17.22 22.04,14.66 22,12C22.04,9.34 21,6.78 19.07,4.93M17,12V18H15V14H13V12H17M12,2.5L13.5,7H10.5L12,2.5M7,12H11V14H9V18H7V12Z"/>
                </svg>
              </div>
              <h3 class="placeholder-title">科技研发</h3>
              <p class="placeholder-text">科技系统开发中，敬请期待...</p>
            </div>
          </div>
        </div>
      </MilitaryTabs>
    </div>
  </GamePageLayout>
</template>

<script>
import GamePageLayout from '@/components/GamePageLayout.vue'
import MilitaryTabs from './components/MilitaryTabs.vue'
import UnitDetailTabs from './components/UnitDetailTabs.vue'
import RecruitmentQueue from './components/RecruitmentQueue.vue'

export default {
  name: 'MilitaryView',
  components: {
    GamePageLayout,
    MilitaryTabs,
    UnitDetailTabs,
    RecruitmentQueue
  },
  data() {
    return {
      activeTab: 'recruitment',
      activeUnitDetailTab: 'infantry'
    }
  },
  methods: {
    handleTabChange(tab) {
      this.activeTab = tab
    },
    handleUnitDetailTabChange(tab) {
      this.activeUnitDetailTab = tab
      console.log('Unit detail tab changed:', tab)
    }
  }
}
</script>

<style scoped>
.military-view {
  @apply min-h-screen;
}

.content-area {
  @apply min-h-full;
}

/* Tab内容样式 */
.recruitment-content {
  @apply space-y-6;
}

.tab-panel {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.panel-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.panel-title {
  @apply text-xl font-bold text-gray-900 mb-1;
}

.panel-subtitle {
  @apply text-gray-600 text-sm;
}

.panel-content {
  @apply p-6;
}

/* 占位内容样式 */
.placeholder-box {
  @apply flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300;
}

.placeholder-icon {
  @apply mb-4;
}

.placeholder-title {
  @apply text-lg font-semibold text-gray-700 mb-2;
}

.placeholder-text {
  @apply text-gray-500 text-center;
}
</style>
