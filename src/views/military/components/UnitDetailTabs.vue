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
          <div class="unit-header">
            <span class="unit-icon">{{ unit.icon }}</span>
            <h4 class="unit-name">{{ unit.name }}</h4>
          </div>
          
          <p class="unit-description">{{ unit.description }}</p>
          
          <div class="unit-stats">
            <div class="stat-row">
              <span class="stat-label">攻击:</span>
              <span class="stat-value">{{ unit.attack }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">步防:</span>
              <span class="stat-value">{{ unit.infantryDefense }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">骑防:</span>
              <span class="stat-value">{{ unit.cavalryDefense }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">速度:</span>
              <span class="stat-value">{{ unit.speed }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">运载量:</span>
              <span class="stat-value">{{ unit.carryCapacity }}</span>
            </div>
          </div>
          
          <div class="unit-cost">
            <div class="cost-title">训练成本:</div>
            <div class="cost-items">
              <span v-if="unit.cost.wood" class="cost-item">
                🪵 {{ unit.cost.wood }}
              </span>
              <span v-if="unit.cost.iron" class="cost-item">
                ⛏️ {{ unit.cost.iron }}
              </span>
              <span v-if="unit.cost.food" class="cost-item">
                🌾 {{ unit.cost.food }}
              </span>
            </div>
          </div>
          
          <div class="unit-actions">
            <button 
              class="train-button"
              @click="handleUnitTrain(unit)"
            >
              训练 ({{ unit.trainTime }}s)
            </button>
          </div>
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

/* 兵种网格 */
.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* 兵种卡片 */
.unit-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.unit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #dc3545;
}

.unit-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.unit-icon {
  font-size: 24px;
  margin-right: 12px;
}

.unit-name {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.unit-description {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 13px;
  line-height: 1.4;
}

/* 属性统计 */
.unit-stats {
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #e9ecef;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 12px;
  color: #333;
  font-weight: 600;
}

/* 成本信息 */
.unit-cost {
  margin-bottom: 16px;
}

.cost-title {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 8px;
}

.cost-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cost-item {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #495057;
  font-weight: 500;
}

/* 操作按钮 */
.unit-actions {
  text-align: center;
}

.train-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.train-button:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.train-button:active {
  transform: translateY(0);
}
</style>