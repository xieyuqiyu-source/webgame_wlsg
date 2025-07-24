<template>
  <div class="unit-detail-tabs">
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
      <div class="category-info">
        <h3>{{ unitCategories[activeTab]?.name }}</h3>
        <p class="category-description">{{ unitCategories[activeTab]?.description }}</p>
      </div>
      
      <div class="units-grid">
        <div 
          v-for="unit in currentUnits" 
          :key="unit.id"
          class="unit-card"
        >
          <!-- 兵种名称栏 -->
          <div class="unit-title-bar">
            <div class="unit-icon">{{ unit.icon }}</div>
            <h4 class="unit-name">{{ unit.name }}</h4>
          </div>
          
          <!-- 属性信息网格 -->
          <div class="unit-stats-grid">
            <div class="stat-item">
              <div class="stat-label">攻击</div>
              <div class="stat-value">{{ unit.attack }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">步防</div>
              <div class="stat-value">{{ unit.infantryDefense }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">骑防</div>
              <div class="stat-value">{{ unit.cavalryDefense }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">速度</div>
              <div class="stat-value">{{ unit.speed }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">运载</div>
              <div class="stat-value">{{ unit.carryCapacity }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">口粮</div>
              <div class="stat-value">{{ unit.unitType === 'special' ? 0 : 2 }}</div>
            </div>
          </div>
          
          <!-- 当前数量显示 -->
          <div class="unit-count">
            <span class="count-label">当前有</span>
            <span class="count-value">0</span>
          </div>
          
          <!-- 征募按钮 -->
          <button 
            class="recruit-button"
            @click="handleUnitTrain(unit)"
          >
            征募
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { UNIT_CATEGORIES, getUnitsByType } from '@/config/unitsConfig'

export default {
  name: 'UnitDetailTabs',
  data() {
    return {
      activeTab: 'infantry',
      unitCategories: UNIT_CATEGORIES
    }
  },
  computed: {
    currentUnits() {
      return getUnitsByType(this.activeTab)
    }
  },
  methods: {
    handleTabChange(tabType) {
      this.activeTab = tabType
      this.$emit('tab-change', tabType)
    },
    handleUnitTrain(unit) {
      this.$emit('unit-train', unit)
    }
  }
}
</script>

<style scoped>
.unit-detail-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Tab 头部样式 */
.tab-header {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-item:hover {
  background: #e9ecef;
}

.tab-item.active {
  background: #fff;
  border-bottom-color: #dc3545;
  color: #dc3545;
}

.tab-icon {
  font-size: 18px;
  margin-right: 8px;
}

.tab-text {
  font-weight: 500;
  font-size: 14px;
}

/* Tab 内容样式 */
.tab-content {
  padding: 20px;
}

.category-info {
  margin-bottom: 24px;
  text-align: center;
}

.category-info h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.category-description {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

/* 兵种网格布局 */
.units-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 当只有1-3个卡片时不拉长 */
.units-grid:has(.unit-card:nth-child(1):nth-last-child(1)) {
  grid-template-columns: 280px;
  justify-content: center;
}

.units-grid:has(.unit-card:nth-child(2):nth-last-child(1)) {
  grid-template-columns: repeat(2, 280px);
  justify-content: center;
}

.units-grid:has(.unit-card:nth-child(3):nth-last-child(1)) {
  grid-template-columns: repeat(3, 280px);
  justify-content: center;
}

/* 兵种卡片 - 毛玻璃效果 */
.unit-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 280px;
}

.unit-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(255, 185, 0, 0.3);
  border-color: rgba(255, 185, 0, 0.4);
}

/* 兵种名称栏 */
.unit-title-bar {
  background: linear-gradient(135deg, #FFB900 0%, #FFA000 100%);
  color: #18181B;
  padding: 12px 16px;
  border-radius: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(255, 185, 0, 0.3);
}

.unit-icon {
  font-size: 20px;
}

.unit-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 属性网格 */
.unit-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  flex: 1;
}

.stat-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 185, 0, 0.2);
}

.stat-label {
  font-size: 11px;
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: #18181B;
  display: block;
}

/* 当前数量 */
.unit-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.count-label {
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.count-value {
  font-size: 16px;
  font-weight: 800;
  color: #FFB900;
}

/* 征募按钮 */
.recruit-button {
  background: linear-gradient(135deg, #FFB900 0%, #FFA000 100%);
  color: #18181B;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 185, 0, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recruit-button:hover {
  background: linear-gradient(135deg, #FFA000 0%, #FF8F00 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 185, 0, 0.4);
}

.recruit-button:active {
  transform: translateY(0);
}
</style>