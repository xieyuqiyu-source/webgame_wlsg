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

              <UnitHoverContent :unit="unit" :base-unit="unit.baseUnit" />
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
                <div class="stat-value">{{ getUnitUpkeep(unit) }}</div>
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
import { UNIT_CATEGORIES, getFactionUnitsByType, getUnitUpkeep } from '@/config/factionConfig'
import { getFactionConfig } from '@/config/factionConfig'
import { useGameStore } from '@/store/modules/gameStore'
import { applyGeneralBonusesToUnit } from '@/domain/general/generalBonusResolver.js'
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
      return getFactionUnitsByType(this.gameStore.userFaction, this.activeTab).map((unit) => ({
        ...applyGeneralBonusesToUnit(unit, this.gameStore.generalBonuses),
        baseUnit: unit
      }))
    },
    //=== 获取兵种当前数量
    getUnitCount() {
      return (unitId) => {
        return this.gameStore.army[unitId] || 0
      }
    }
  },
  methods: {
    getUnitUpkeep,
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
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 28px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  margin: 0;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.current-faction-display {
  padding: 18px 18px 14px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.92);
  position: relative;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.faction-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #eef2ff 0%, #ffffff 100%);
  border: 1px solid rgba(199, 210, 254, 0.95);
  border-radius: 22px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.faction-icon {
  font-size: 20px;
  line-height: 1;
}

.faction-name {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin-right: 8px;
}

.faction-desc {
  font-size: 13px;
  color: #6b7280;
  max-width: 360px;
  line-height: 1.4;
}

.tab-header {
  display: flex;
  gap: 6px;
  padding: 8px 18px 0;
  overflow: auto hidden;
  scrollbar-width: none;
  background: transparent;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 16px;
  background: #f8fafc;
  color: #6b7280;
  flex: 1 1 0;
  min-width: 0;
}

.tab-item:hover {
  color: #111827;
  background: #eef2ff;
}

.tab-item.active {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 12px 22px rgba(79, 70, 229, 0.18);
}

.tab-icon {
  font-size: 15px;
  line-height: 1;
}

.tab-text {
  font-weight: 700;
  font-size: 13px;
}

.tab-content {
  padding: 14px 18px 18px;
  background: transparent;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.units-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.units-grid:has(.unit-card:nth-child(1):nth-last-child(1)) {
  grid-template-columns: minmax(0, 320px);
  justify-content: start;
}

.units-grid:has(.unit-card:nth-child(2):nth-last-child(1)) {
  grid-template-columns: repeat(2, minmax(0, 320px));
  justify-content: start;
}

.units-grid:has(.unit-card:nth-child(3):nth-last-child(1)) {
  grid-template-columns: repeat(3, minmax(0, 320px));
  justify-content: start;
}

.unit-card {
  background: #ffffff;
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 22px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  min-height: 0;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.unit-card:hover {
  transform: translateY(-2px);
  border-color: rgba(165, 180, 252, 0.9);
  box-shadow: 0 14px 28px rgba(99, 102, 241, 0.08);
}

.unit-title-bar {
  background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%);
  color: #111827;
  padding: 10px 12px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  border: 1px solid rgba(224, 231, 255, 0.95);
}

.unit-owned-mobile {
  display: none;
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  color: #6366f1;
}

.unit-help {
  position: absolute;
  top: 14px;
  right: 14px;
}

.unit-help-trigger {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 0;
  color: white;
  background: #6366f1;
  font-weight: 700;
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.16);
}

.unit-title-hover {
  width: 100%;
}

.unit-icon {
  font-size: 17px;
  line-height: 1;
}

.unit-name {
  font-size: 14px;
  font-weight: 800;
  margin: 0;
  color: #111827;
}

.unit-stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-item {
  background: #f8fafc;
  border-radius: 999px;
  padding: 7px 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid rgba(229, 231, 235, 0.92);
  min-width: 0;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.stat-value {
  font-size: 12px;
  font-weight: 800;
  color: #111827;
  display: inline;
}

.stat-icon {
  line-height: 1;
}

.unit-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.92);
}

.count-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.count-value {
  font-size: 14px;
  font-weight: 800;
  color: #4f46e5;
}

.recruit-button {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: none;
  padding: 10px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  box-shadow: 0 12px 20px rgba(79, 70, 229, 0.18);
}

.recruit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(79, 70, 229, 0.24);
}

.recruit-button:active {
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .units-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .unit-detail-tabs {
    border-radius: 22px;
  }

  .current-faction-display {
    padding: 12px 12px 10px;
  }

  .faction-info {
    flex-direction: row;
    gap: 8px;
    padding: 12px;
    justify-content: flex-start;
    align-items: center;
    border-radius: 18px;
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
    display: none;
  }

  .unit-help {
    top: 8px;
    right: 8px;
  }

  .tab-header {
    padding: 8px 12px 0;
    gap: 5px;
    overflow: visible;
  }

  .tab-item {
    flex: 1 1 0;
    min-width: 0;
    padding: 10px 6px;
    border-radius: 14px;
  }

  .tab-icon {
    font-size: 13px;
  }

  .tab-text {
    font-size: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab-content {
    padding: 10px 12px 12px;
  }

  .units-grid,
  .units-grid:has(.unit-card:nth-child(1):nth-last-child(1)),
  .units-grid:has(.unit-card:nth-child(2):nth-last-child(1)),
  .units-grid:has(.unit-card:nth-child(3):nth-last-child(1)) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin: 0;
    max-width: none;
  }

  .unit-card {
    padding: 8px;
    gap: 5px;
    border-radius: 16px;
  }

  .unit-card-main {
    display: grid;
    grid-template-columns: 82px minmax(0, 1fr);
    gap: 8px;
    align-items: stretch;
    min-width: 0;
  }

  .unit-title-bar {
    height: 100%;
    min-height: 76px;
    padding: 8px 6px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 4px;
    border-radius: 14px;
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
    color: #6366f1;
  }

  .unit-stats-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .stat-item {
    padding: 5px 6px;
  }

  .stat-label {
    font-size: 10px;
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
    padding: 9px 10px;
    font-size: 12px;
    border-radius: 12px;
  }
}
</style>
