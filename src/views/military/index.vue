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
            <div class="panel-help">
              <HoverCard
                density="compact"
                :show="showTechnologyHelp"
                @mouseenter="showTechnologyHelp = true"
                @mouseleave="showTechnologyHelp = false"
              >
                <template #trigger>
                  <button class="help-trigger" type="button">?</button>
                </template>
                <TutorialHoverContent
                  v-if="technologyTutorial"
                  :title="technologyTutorial.title"
                  :body="technologyTutorial.body"
                  :items="technologyTutorial.items"
                />
              </HoverCard>
            </div>
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
import HoverCard from '@/components/hover/HoverCard.vue'
import TutorialHoverContent from '@/components/hover/TutorialHoverContent.vue'
import { getTutorial, TUTORIAL_KEYS } from '@/config/tutorialConfig.js'

export default {
  name: 'MilitaryView',
  components: {
    GamePageLayout,
    MilitaryTabs,
    UnitDetailTabs,
    RecruitmentQueue,
    HoverCard,
    TutorialHoverContent
  },
  data() {
    return {
      activeTab: 'recruitment',
      activeUnitDetailTab: 'infantry',
      showTechnologyHelp: false,
      technologyTutorial: getTutorial(TUTORIAL_KEYS.MILITARY_TECHNOLOGY)
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
  @apply min-h-full space-y-5;
}

/* Tab内容样式 */
.recruitment-content {
  @apply space-y-6;
}

.tab-panel {
  @apply rounded-3xl border;
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(229, 231, 235, 0.9);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.panel-header {
  @apply px-6 py-5;
  @apply relative;
  border-bottom: 1px solid rgba(229, 231, 235, 0.92);
}

.panel-help {
  @apply absolute right-6 top-4;
}

.help-trigger {
  @apply w-8 h-8 rounded-full text-xs font-bold text-white;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.2);
}

.panel-title {
  @apply text-xl font-bold mb-1;
  color: var(--text-main);
}

.panel-subtitle {
  @apply text-sm;
  color: var(--text-subtle);
}

.panel-content {
  @apply p-6;
}

/* 占位内容样式 */
.placeholder-box {
  @apply flex flex-col items-center justify-center h-64 rounded-[24px];
  background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%);
  border: 1px dashed rgba(129, 140, 248, 0.48);
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

@media (max-width: 768px) {
  .content-area {
    @apply space-y-3;
  }

  .recruitment-content {
    @apply space-y-3;
  }

  .panel-header {
    @apply px-4 py-4;
    padding-right: 3.5rem;
  }

  .panel-help {
    right: 1rem;
    top: 1rem;
  }

  .panel-title {
    @apply text-lg;
  }

  .panel-content {
    @apply p-4;
  }

  .placeholder-box {
    @apply h-48 px-4;
  }
}
</style>
