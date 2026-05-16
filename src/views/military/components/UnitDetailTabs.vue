<template>
  <div class="unit-detail-tabs">
    <!-- 当前阵营显示 -->
    <div class="current-faction-display">
      <div class="faction-info">
        <span class="faction-icon">{{ currentFactionConfig?.icon }}</span>
        <span class="faction-name">{{ currentFactionConfig?.name }}</span>
        <span class="faction-desc">{{ currentFactionConfig?.description }}</span>
      </div>
      <HoverCard
        class="unit-help"
        density="compact"
        :show="showUnitHelp"
        @mouseenter="showUnitHelp = true"
        @mouseleave="showUnitHelp = false"
      >
        <template #trigger>
          <button class="unit-help-trigger" type="button">?</button>
        </template>
        <TutorialHoverContent
          v-if="unitDetailsTutorial"
          :title="unitDetailsTutorial.title"
          :body="unitDetailsTutorial.body"
          :items="unitDetailsTutorial.items"
        />
      </HoverCard>
    </div>

    <!-- Tab 头部 -->
    <div class="tab-header">
      <div 
        v-for="(category, type) in unitCategories" 
        :key="type"
        class="tab-item"
        :class="{ active: activeTab === type }"
        @click="handleTabChange(type)"
      >
        <span class="tab-icon">{{ category.icon }}</span>
        <span class="tab-text">{{ category.name }}</span>
      </div>
    </div>

    <!-- Tab 内容 -->
    <div class="tab-content">
      <div class="units-grid">
        <div 
          v-for="unit in currentUnits" 
          :key="unit.id"
          class="unit-card"
        >
          <div class="unit-card-main">
            <!-- 兵种名称栏 -->
            <HoverCard
              class="unit-title-hover"
              density="compact"
              :show="hoveredUnitId === unit.id"
              @mouseenter="hoveredUnitId = unit.id"
              @mouseleave="hoveredUnitId = null"
            >
              <template #trigger>
                <div class="unit-title-bar">
                  <div class="unit-icon">{{ unit.icon }}</div>
                  <h4 class="unit-name">{{ unit.name }}</h4>
                  <div class="unit-owned-mobile">现有 {{ getUnitCount(unit.id) }}</div>
                </div>
              </template>

              <UnitHoverContent :unit="unit" />
            </HoverCard>
            
            <!-- 属性信息网格 -->
            <div class="unit-stats-grid">
              <div class="stat-item">
                <div class="stat-label"><span class="stat-icon">⚔️</span><span class="stat-text">攻击</span></div>
                <div class="stat-value">{{ unit.attack }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label"><span class="stat-icon">🛡️</span><span class="stat-text">步防</span></div>
                <div class="stat-value">{{ unit.infantryDefense }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label"><span class="stat-icon">🐎</span><span class="stat-text">骑防</span></div>
                <div class="stat-value">{{ unit.cavalryDefense }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label"><span class="stat-icon">💨</span><span class="stat-text">速度</span></div>
                <div class="stat-value">{{ unit.speed }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label"><span class="stat-icon">🎒</span><span class="stat-text">运载</span></div>
                <div class="stat-value">{{ unit.carryCapacity }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label"><span class="stat-icon">🍚</span><span class="stat-text">口粮</span></div>
                <div class="stat-value">{{ unit.unitType === 'special' ? 0 : 2 }}</div>
              </div>
            </div>
          </div>
          
          <!-- 当前数量显示 -->
          <div class="unit-count">
            <span class="count-label">当前有</span>
            <span class="count-value">{{ getUnitCount(unit.id) }}</span>
          </div>
          
          <!-- 征募按钮 -->
          <button 
            class="recruit-button"
            :data-testid="`recruit-unit-${unit.id}`"
            @click="handleUnitTrain(unit)"
          >
            征募
          </button>
        </div>
      </div>
    </div>
    
    <!-- 征兵弹窗 -->
    <RecruitmentModal
      :visible="showRecruitmentModal"
      :selectedUnit="selectedUnit"
      @close="closeRecruitmentModal"
    />
  </div>
</template>

<script>
import { UNIT_CATEGORIES, getFactionUnitsByType } from '@/config/factionConfig'
import { getFactionConfig } from '@/config/factionConfig'
import { useGameStore } from '@/store/modules/gameStore'
import HoverCard from '@/components/hover/HoverCard.vue'
import UnitHoverContent from '@/components/hover/UnitHoverContent.vue'
import TutorialHoverContent from '@/components/hover/TutorialHoverContent.vue'
import RecruitmentModal from './RecruitmentModal.vue'
import { getTutorial, TUTORIAL_KEYS } from '@/config/tutorialConfig.js'

export default {
  name: 'UnitDetailTabs',
  components: {
    HoverCard,
    UnitHoverContent,
    TutorialHoverContent,
    RecruitmentModal
  },
  setup() {
    const gameStore = useGameStore()
    return {
      gameStore
    }
  },
  data() {
    return {
      activeTab: 'infantry',
      unitCategories: UNIT_CATEGORIES,
      showRecruitmentModal: false,
      selectedUnit: null,
      hoveredUnitId: null,
      showUnitHelp: false,
      unitDetailsTutorial: getTutorial(TUTORIAL_KEYS.UNIT_DETAILS)
    }
  },
  computed: {
    //=== currentFactionConfig 当前用户阵营配置
    currentFactionConfig() {
      return this.gameStore.userFaction ? getFactionConfig(this.gameStore.userFaction) : null
    },
    //=== currentUnits 当前阵营当前兵种类型的兵种列表
    currentUnits() {
      if (!this.gameStore.userFaction) return []
      return getFactionUnitsByType(this.gameStore.userFaction, this.activeTab)
    },
    //=== 获取兵种当前数量
    getUnitCount() {
      return (unitId) => {
        return this.gameStore.army[unitId] || 0
      }
    }
  },
  methods: {
    //=== handleTabChange 处理兵种类型切换
    handleTabChange(tabType) {
      this.activeTab = tabType
      this.$emit('tab-change', { faction: this.gameStore.userFaction, unitType: tabType })
    },
    //=== handleUnitTrain 处理兵种训练
    handleUnitTrain(unit) {
      this.selectedUnit = unit
      this.showRecruitmentModal = true
    },
    //=== 关闭征兵弹窗
    closeRecruitmentModal() {
      this.showRecruitmentModal = false
      this.selectedUnit = null
    }
  }
}
</script>

<style scoped>
.unit-detail-tabs {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  margin: 20px 0;
}

/* 当前阵营显示样式 */
.current-faction-display {
  background: rgba(35, 124, 72, 0.1);
  padding: 24px;
  border-bottom: 2px solid rgba(35, 124, 72, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
}

.faction-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #237C48;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(35, 124, 72, 0.25);
  transition: all 0.3s ease;
}

.faction-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(35, 124, 72, 0.35);
  border-color: #FFB900;
}

.faction-icon {
  font-size: 28px;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.faction-info:hover .faction-icon {
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 4px 8px rgba(255, 185, 0, 0.5));
}

.faction-name {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  margin-right: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

.faction-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  max-width: 350px;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1.4;
}

/* Tab 头部样式 */
.tab-header {
  display: flex;
  background: rgba(24, 24, 27, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #237C48;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 3px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;
}

.tab-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(35, 124, 72, 0.2), transparent);
  transition: left 0.5s ease;
}

.tab-item:hover {
  background: rgba(35, 124, 72, 0.1);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.tab-item:hover::before {
  left: 100%;
}

.tab-item.active {
  background: linear-gradient(135deg, #237C48 0%, #2d8f56 100%);
  border-bottom-color: #FFB900;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(35, 124, 72, 0.3);
  transform: translateY(-2px);
}

.tab-icon {
  font-size: 20px;
  margin-right: 10px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.tab-item.active .tab-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 8px rgba(255, 185, 0, 0.5));
}

.tab-text {
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tab-item.active .tab-text {
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Tab 内容样式 */
.tab-content {
  padding: 20px;
  background: transparent;
}

/* 兵种网格布局 */
.units-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 当只有1-3个卡片时不拉长，靠左展示 */
.units-grid:has(.unit-card:nth-child(1):nth-last-child(1)) {
  grid-template-columns: 260px;
  justify-content: start;
}

.units-grid:has(.unit-card:nth-child(2):nth-last-child(1)) {
  grid-template-columns: repeat(2, 260px);
  justify-content: start;
}

.units-grid:has(.unit-card:nth-child(3):nth-last-child(1)) {
  grid-template-columns: repeat(3, 260px);
  justify-content: start;
}

/* 兵种卡片 - 毛玻璃效果 */
.unit-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: 190px;
  will-change: transform, box-shadow;
}

.unit-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 32px rgba(255, 185, 0, 0.25);
  border-color: rgba(255, 185, 0, 0.4);
}

/* 兵种名称栏 */
.unit-title-bar {
  background: linear-gradient(135deg, #FFB900 0%, #FFA000 100%);
  color: #18181B;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(255, 185, 0, 0.2);
}

.unit-owned-mobile {
  display: none;
}

.unit-help {
  position: absolute;
  top: 18px;
  right: 18px;
}

.unit-help-trigger {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 0;
  color: white;
  background: #237c48;
  font-weight: 700;
}

.unit-title-hover {
  width: 100%;
}

.unit-icon {
  font-size: 16px;
}

.unit-name {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 属性网格 */
.unit-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  flex: 1;
}

.stat-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  padding: 8px 6px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 185, 0, 0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 185, 0, 0.15);
}

.stat-label {
  font-size: 10px;
  color: #666;
  font-weight: 600;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.stat-value {
  font-size: 15px;
  font-weight: 800;
  color: #18181B;
  display: block;
}

.stat-icon {
  line-height: 1;
}

/* 当前数量 */
.unit-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.count-label {
  font-size: 11px;
  color: #666;
  font-weight: 600;
}

.count-value {
  font-size: 14px;
  font-weight: 800;
  color: #FFB900;
}

/* 征募按钮 */
.recruit-button {
  background: linear-gradient(135deg, #FFB900 0%, #FFA000 100%);
  color: #18181B;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(255, 185, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  will-change: transform, box-shadow;
}

.recruit-button:hover {
  background: linear-gradient(135deg, #FFA000 0%, #FF8F00 100%);
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 185, 0, 0.3);
}

.recruit-button:active {
  transform: translateY(0) scale(1.02);
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 1024px) {
  .units-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .unit-detail-tabs {
    margin: 8px 0;
    border-radius: 12px;
  }

  .current-faction-display {
    padding: 10px;
  }

  .faction-info {
    flex-direction: row;
    gap: 8px;
    padding: 10px 12px;
    justify-content: flex-start;
    align-items: center;
  }

  .faction-name {
    margin-right: 0;
    font-size: 14px;
  }

  .faction-desc {
    font-size: 11px;
    max-width: none;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .unit-help {
    top: 8px;
    right: 8px;
  }

  .tab-header {
    overflow-x: auto;
  }

  .tab-item {
    flex: none;
    min-width: 98px;
    padding: 9px 10px;
  }

  .tab-icon {
    margin-right: 4px;
    font-size: 16px;
  }

  .tab-text {
    font-size: 12px;
  }

  .tab-content {
    padding: 6px;
  }

  .units-grid,
  .units-grid:has(.unit-card:nth-child(1):nth-last-child(1)),
  .units-grid:has(.unit-card:nth-child(2):nth-last-child(1)),
  .units-grid:has(.unit-card:nth-child(3):nth-last-child(1)) {
    grid-template-columns: 1fr;
    padding: 4px;
    gap: 8px;
  }

  .unit-card {
    min-height: 0;
    padding: 8px;
    gap: 5px;
  }

  .unit-card-main {
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 8px;
    align-items: stretch;
  }

  .unit-title-bar {
    height: 100%;
    min-height: 84px;
    padding: 8px 6px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 4px;
    border-radius: 10px;
  }

  .unit-name {
    font-size: 11px;
    line-height: 1.2;
  }

  .unit-icon {
    font-size: 18px;
  }

  .unit-owned-mobile {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: rgba(24, 24, 27, 0.72);
  }

  .unit-stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
  }

  .stat-item {
    padding: 5px 4px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .stat-label {
    font-size: 11px;
    margin-bottom: 0;
    color: #475569;
    letter-spacing: 0;
    text-transform: none;
  }

  .stat-value {
    font-size: 12px;
    display: inline;
    line-height: 1;
  }

  .stat-text {
    display: none;
  }

  .unit-count {
    display: none;
  }

  .recruit-button {
    width: 100%;
    padding: 7px 10px;
    font-size: 12px;
    border-radius: 8px;
  }
}
</style>
