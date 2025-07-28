<template>
  <div class="game-sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- 折叠/展开按钮 -->
    <div class="sidebar-toggle" @click="toggleSidebar">
      <div class="toggle-icon">
        <svg v-if="!isCollapsed" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
        </svg>
      </div>
    </div>

    <!-- 侧边栏内容 -->
    <div class="sidebar-content" v-show="!isCollapsed">
      <!-- 可滚动的主要内容区域 -->
      <div class="scrollable-content">
        <!-- 城池信息卡片 -->
        <div class="city-info-card">
          <div class="city-header">
            <div class="city-title-row">
              <div class="city-title">新的城池p0sg (101|38)</div>
              <div class="coins-display" @click="handleCoinsClick">
                <span class="coins-icon">💰</span>
                <span class="coins-amount">{{ gameStore.coins }}</span>
              </div>
            </div>
            <div class="city-details">
              <div class="detail-item civilization-row">
                <div class="civilization-left">
                  <div class="status-dot red"></div>
                  <span>城池文明度: {{ formatCivilization(gameStore.citycivilization) }}</span>
                </div>
                <div class="civilization-right">
                  <div class="status-dot" :class="gameStore.civilizationLevel.statusColor || 'blue'"></div>
                  <span :class="gameStore.civilizationLevel.color">{{ gameStore.civilizationLevel.level }}</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="status-dot yellow"></div>
                <span>首次充值赠送100礼金券</span>
              </div>
              <div class="detail-item">
                <div class="status-dot green"></div>
                <span>社区群组上线，邀您共加入</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 资源信息 -->
        <div class="section">
          <div class="section-header">
            <span>本城资源</span>
            <!-- 资源管理小圆点 -->
            <div class="resource-dots-container">
              <!-- 一键爆仓小圆点 -->
              <div 
                @click="fillWarehouse" 
                @mouseenter="showFillTooltip = true"
                @mouseleave="showFillTooltip = false"
                :class="{ 'disabled': gameStore.coins < 10 }"
                class="resource-dot fill-dot"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                
                <!-- 一键爆仓悬浮提示 -->
                <Transition name="tooltip-fade">
                  <div v-if="showFillTooltip" class="resource-tooltip">
                    <div class="tooltip-content">
                      <div v-if="gameStore.coins < 10" class="tooltip-item insufficient">
                        <span class="tooltip-label">金币不足</span>
                        <span class="tooltip-value">需要10金币 (当前: {{ gameStore.coins }})</span>
                      </div>
                      <div v-else class="tooltip-item">
                        <span class="tooltip-label">一键爆仓</span>
                        <span class="tooltip-value">消耗10金币填满所有资源</span>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
              
              <!-- 容量加成小圆点 -->
              <div 
                @click="activateWarehouseBoost" 
                @mouseenter="showBoostTooltip = true"
                @mouseleave="showBoostTooltip = false"
                :class="{ 
                  'disabled': gameStore.coins < warehouseBoostCost,
                  'active': isWarehouseBoostActive 
                }"
                class="resource-dot boost-dot"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                
                <!-- 容量加成悬浮提示 -->
                <Transition name="tooltip-fade">
                  <div v-if="showBoostTooltip" class="resource-tooltip">
                    <div class="tooltip-content">
                      <div v-if="isWarehouseBoostActive" class="tooltip-item active">
                        <span class="tooltip-label">容量加成激活中</span>
                        <span class="tooltip-value">剩余时间: {{ formatTime(warehouseBoostTimeLeft) }}</span>
                        <span class="tooltip-value">当前容量: {{ formatNumber(gameStore.warehouseCapacity) }} (2倍加成)</span>
                      </div>
                      <div v-else-if="gameStore.coins < warehouseBoostCost" class="tooltip-item insufficient">
                        <span class="tooltip-label">金币不足</span>
                        <span class="tooltip-value">需要{{ warehouseBoostCost }}金币 (当前: {{ gameStore.coins }})</span>
                      </div>
                      <div v-else class="tooltip-item">
                        <span class="tooltip-label">容量加成</span>
                        <span class="tooltip-value">消耗{{ warehouseBoostCost }}金币获得2倍仓库容量</span>
                        <span class="tooltip-value">持续1小时</span>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
          <div class="resource-list">
            <div class="resource-item" v-for="resource in resources" :key="resource.name">
              <div class="resource-info">
                <img v-if="resource.icon" :src="resource.icon" :alt="resource.name" class="resource-icon" />
                <div v-else class="resource-icon resource-icon-fallback"></div>
                <span class="resource-name">{{ resource.name }}</span>
              </div>
              <div class="resource-value">{{ resource.current }}/{{ resource.max }}</div>
            </div>
          </div>
        </div>

        <!-- 生产力信息 -->
        <div class="section">
          <div class="section-header">
            <span>城池生产力</span>
            <button 
              @click="showBoostDialog = true"
              class="boost-btn"
              :class="{ 'boost-active': gameStore.isProductionBoostActive }"
              :title="gameStore.isProductionBoostActive ? `加速中，剩余${formatTime(gameStore.productionBoostTimeLeft)}` : '生产力加速'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,2.05V5.08C16.39,5.57 19,8.47 19,12C19,12.9 18.82,13.75 18.5,14.54L21.12,16.07C21.68,14.83 22,13.45 22,12C22,6.82 18.05,2.55 13,2.05M12,19C8.13,19 5,15.87 5,12C5,8.47 7.61,5.57 11,5.08V2.05C5.94,2.55 2,6.81 2,12C2,17.52 6.48,22 12,22C13.45,22 14.83,21.68 16.07,21.12L14.54,18.5C13.75,18.82 12.9,19 12,19M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12Z"/>
              </svg>
              <span v-if="gameStore.isProductionBoostActive" class="boost-text">{{ formatTime(gameStore.productionBoostTimeLeft) }}</span>
              <span v-else class="boost-text">加速</span>
            </button>
          </div>
          <div class="production-list">
            <div 
              class="production-item" 
              v-for="production in productions" 
              :key="production.name"
              @mouseenter="showProductionTooltip = production.type"
              @mouseleave="showProductionTooltip = null"
            >
              <div class="production-info">
                <img v-if="production.icon" :src="production.icon" :alt="production.name" class="production-icon" />
                <div v-else class="production-icon production-icon-fallback"></div>
                <span class="production-name">{{ production.name }}</span>
              </div>
              <div class="production-details">
                <span class="production-rate">{{ production.rate }} 每小时</span>
              </div>
              
              <!-- 生产力详情提示框 -->
              <Transition name="tooltip-fade">
                <div v-if="showProductionTooltip === production.type" class="production-tooltip">
                  <div class="tooltip-arrow"></div>
                  <!-- <div class="tooltip-header">{{ production.name }}产量详情</div> -->
                  <div class="tooltip-content">
                    <div class="tooltip-item">
                      <span class="tooltip-label">基础产量: <span class="tooltip-value">{{ production.baseProduction }} 每小时</span></span>
                     
                    </div>
                    <div class="tooltip-item" v-if="gameStore.userFaction">
                      <span class="tooltip-label">阵营加成: <span class="tooltip-value" :class="production.bonusClass">{{ production.bonusText }}</span></span>
                      
                    </div>
                    <div class="tooltip-item total">
                      <span class="tooltip-label">总产量: <span class="tooltip-value text-yellow-400">{{ production.rate }} 每小时</span></span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- 仓库管理 -->
        <div class="section">
          <div class="section-header">仓库管理</div>
          <div class="warehouse-info">
            <div class="warehouse-level">
              <span class="warehouse-label">仓库等级:</span>
              <span class="warehouse-value">{{ gameStore.warehouseLevel }}/{{ WAREHOUSE_CONFIG.maxLevel }}</span>
            </div>
            <div class="warehouse-upgrade-container" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
              <button
                @mouseenter="showTooltip = true"
                @mouseleave="showTooltip = false"
                @click="upgradeWarehouse"
                :disabled="!gameStore.canUpgradeWarehouse || isWarehouseUpgrading"
                class="warehouse-upgrade-btn relative overflow-hidden"
                :class="gameStore.canUpgradeWarehouse && !isWarehouseUpgrading ? 'enabled' : 'disabled'"
              >
                <!-- 进度条背景 -->
                <div 
                  v-if="isWarehouseUpgrading" 
                  class="absolute inset-0 bg-green-500 transition-all duration-100 ease-linear"
                  :style="{ width: warehouseUpgradeProgress + '%' }"
                ></div>
                
                <!-- 按钮文字 -->
                <span class="relative z-10 color-white">
                  <template v-if="isWarehouseUpgrading">
                    升级中... {{ Math.round(warehouseUpgradeProgress) }}%
                  </template>
                  <template v-else>
                    {{ gameStore.warehouseLevel >= WAREHOUSE_CONFIG.maxLevel ? '已满级' : `升级 (${gameStore.warehouseLevel} → ${gameStore.warehouseLevel + 1})` }}
                  </template>
                </span>
              </button>
              <!-- 浮动提醒 -->
              <div v-if="showTooltip && (!gameStore.canUpgradeWarehouse || isWarehouseUpgrading)" class="upgrade-tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-header">升级条件</div>
                <div v-if="isWarehouseUpgrading" class="tooltip-content">
                  <div class="tooltip-item upgrading">仓库正在升级中...</div>
                  <div class="tooltip-item">
                    <div class="text-green-400 text-center mt-1">剩余时间: {{ formatTime(warehouseUpgradeTimeLeft) }}</div>
                  </div>
                </div>
                <div v-else-if="gameStore.warehouseLevel >= WAREHOUSE_CONFIG.maxLevel" class="tooltip-content">
                  <div class="tooltip-item max-level">仓库已达到最大等级</div>
                </div>
                <div v-else class="tooltip-content">
                  <div class="tooltip-item" v-for="(cost, resourceType) in warehouseUpgradeCost" :key="resourceType">
                    <div class="resource-requirement" :class="{ 'insufficient': gameStore.resources[resourceType] < cost }">
                      <span class="resource-name">{{ getResourceName(resourceType) }}:</span>
                      <span class="resource-amount">{{ gameStore.resources[resourceType] }}/{{ cost }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 军队信息 -->
        <div class="section">
          <div class="section-header">
            <span>本城直属军队</span>
            <span class="army-count">总数: {{ gameStore.totalArmyCount }}</span>
          </div>
          <div class="army-grid">
            <div v-if="Object.keys(gameStore.army).length === 0" class="empty-army">
              <span class="empty-text">暂无军队</span>
            </div>
            <div v-else class="army-item" v-for="(count, unitId) in gameStore.army" :key="unitId">
              <div class="army-icon">{{ getUnitIcon(unitId) }}</div>
              <div class="army-info">
                <span class="army-name">{{ getUnitName(unitId) }}</span>
                <span class="army-count-text">×{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 生产力加速弹窗 -->
      <div v-if="showBoostDialog" class="boost-dialog-overlay" @click="showBoostDialog = false">
        <div class="boost-dialog" @click.stop>
          <div class="boost-dialog-header">
            <h3>生产力加速</h3>
            <button @click="showBoostDialog = false" class="close-btn">×</button>
          </div>
          <div class="boost-dialog-content">
            <div class="boost-info">
              <p class="boost-description">消耗金币获得生产力40%加成</p>
              <div class="current-coins">
                <span class="coins-label">当前金币:</span>
                <span class="coins-value">{{ gameStore.coins }}</span>
              </div>
            </div>
            
            <div class="boost-options">
              <div 
                v-for="option in boostOptions" 
                :key="option.hours"
                class="boost-option"
                :class="{ 'disabled': gameStore.coins < option.cost }"
                @click="startBoost(option.hours)"
              >
                <div class="option-header">
                  <span class="option-duration">{{ option.hours }}小时</span>
                  <span class="option-cost">{{ option.cost }}金币</span>
                </div>
                <div class="option-description">{{ option.description }}</div>
              </div>
            </div>
            
            <div v-if="gameStore.isProductionBoostActive" class="current-boost">
              <div class="current-boost-info">
                <span class="boost-status">当前加速状态: 激活中</span>
                <span class="boost-remaining">剩余时间: {{ formatTime(gameStore.productionBoostTimeLeft) }}</span>
              </div>
              <p class="boost-note">选择新的加速时间将延长当前加速效果</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 固定在底部的导航区域 -->
      <div class="bottom-nav">
        <div class="nav-buttons">
          <div class="nav-button" @click="handleNavClick('city')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
              </svg>
            </div>
            <span class="nav-label">城池</span>
          </div>
          <div class="nav-button" @click="handleNavClick('military')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L22 9L17 14L18.18 22.74L12 19.27L5.82 22.74L7 14L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <span class="nav-label">军事</span>
          </div>
          <div class="nav-button" @click="handleNavClick('map')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3Z"/>
              </svg>
            </div>
            <span class="nav-label">地图</span>
          </div>
          <div class="nav-button" @click="handleNavClick('settings')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
              </svg>
            </div>
            <span class="nav-label">设置</span>
          </div>
          <div class="nav-button" @click="handleNavClick('message')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"/>
              </svg>
            </div>
            <span class="nav-label">信函</span>
          </div>
          <div class="nav-button" @click="handleNavClick('notification-test')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 6.5C21 8.43 19.43 10 17.5 10S14 8.43 14 6.5 15.57 3 17.5 3 21 4.57 21 6.5ZM10 6.5C10 8.43 8.43 10 6.5 10S3 8.43 3 6.5 4.57 3 6.5 3 10 4.57 10 6.5ZM12 8C15.31 8 18 10.69 18 14V16L20 18V19H4V18L6 16V14C6 10.69 8.69 8 12 8ZM10 20H14C14 21.1 13.1 22 12 22S10 21.1 10 20Z"/>
              </svg>
            </div>
            <span class="nav-label">通知</span>
          </div>
          <div class="nav-button" @click="handleNavClick('battle-simulator')">
            <div class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
              </svg>
            </div>
            <span class="nav-label">战斗</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { RESOURCE_ICONS, getResourceIcon, getResourceName } from '@/config/resources.js'
import { useGameStore } from '@/store/modules/gameStore.js'
import { computed, ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { calculateWarehouseUpgradeTime, calculateWarehouseUpgradeCost, calculateProduction, BUILDING_TYPES, WAREHOUSE_CONFIG } from '@/config/gameConfig.js'
import { formatCivilization, formatTime, formatNumber } from '@/utils/formatters.js'
import { getFactionConfig, getUnitById } from '@/config/factionConfig.js'

export default {
  name: 'GameSidebar',
  emits: ['toggle', 'nav-click'],
  setup() {
    const gameStore = useGameStore()
    
    // 仓库升级相关状态
    const showTooltip = ref(false)
    // 生产力提示框状态
    const showProductionTooltip = ref(null)
    // 生产力加速弹窗状态
    const showBoostDialog = ref(false)
    // 资源管理小圆点悬浮提示状态
    const showFillTooltip = ref(false)
    const showBoostTooltip = ref(false)
    let progressTimer = null
    
    //=== 仓库升级状态（从gameStore获取）
    const isWarehouseUpgrading = computed(() => {
      return gameStore.isWarehouseUpgrading
    })
    
    // 响应式时间戳，用于强制更新计算属性
    const currentTime = ref(Date.now())
    
    //=== 仓库升级进度
    const warehouseUpgradeProgress = computed(() => {
      if (!gameStore.warehouseUpgrade) return 0
      // 使用响应式时间戳确保计算属性能够更新
      const now = currentTime.value
      const elapsed = now - gameStore.warehouseUpgrade.startTime
      const progress = Math.min((elapsed / gameStore.warehouseUpgrade.duration) * 100, 100)
      return progress
    })
    
    //=== 仓库升级剩余时间
    const warehouseUpgradeTimeLeft = computed(() => {
      if (!gameStore.warehouseUpgrade) return 0
      // 使用响应式时间戳确保计算属性能够更新
      const now = currentTime.value
      const elapsed = now - gameStore.warehouseUpgrade.startTime
      const remaining = Math.max(0, gameStore.warehouseUpgrade.duration - elapsed)
      return Math.ceil(remaining / 1000)
    })
    
    //=== 计算资源数据
    const resources = computed(() => {
      const resourceTypes = ['wood', 'soil', 'iron', 'food']
      return resourceTypes.map(type => ({
        name: getResourceName(type),
        type,
        icon: getResourceIcon(type),
        current: Math.floor(gameStore.resources[type] || 0),
        max: Math.floor(gameStore.warehouseCapacity || 0)
      }))
    })
    
    //=== 计算生产力数据
    const productions = computed(() => {
      const resourceTypes = ['wood', 'soil', 'iron', 'food']
      return resourceTypes.map(type => {
        // 计算基础产量（不含阵营加成）
        let baseProduction = 0
        const buildingTypeMap = {
          'wood': BUILDING_TYPES.WOOD_MILL,
          'soil': BUILDING_TYPES.SOIL_MINE,
          'iron': BUILDING_TYPES.IRON_MINE,
          'food': BUILDING_TYPES.FARM
        }
        
        const buildingType = buildingTypeMap[type]
        if (buildingType && gameStore.buildings[buildingType]) {
          gameStore.buildings[buildingType].forEach(level => {
            if (level > 0) {
              // 计算不含阵营加成的基础产量
              baseProduction += calculateProduction(buildingType, level, null)
            }
          })
        }
        
        // 获取总产量（含阵营加成）
        const totalProduction = Math.floor(gameStore.hourlyProduction[type] || 0)
        
        // 计算阵营加成信息
        let bonusText = '无加成'
        let bonusClass = 'text-gray-400'
        
        if (gameStore.userFaction) {
          const factionConfig = getFactionConfig(gameStore.userFaction)
          if (factionConfig && factionConfig.traits) {
            const economyBonus = factionConfig.traits.economyBonus || 1.0
            const bonusPercent = Math.round((economyBonus - 1) * 100)
            
            if (bonusPercent > 0) {
              bonusText = `+${bonusPercent}% (${factionConfig.name})`
              bonusClass = 'text-green-400'
            } else if (bonusPercent < 0) {
              bonusText = `${bonusPercent}% (${factionConfig.name})`
              bonusClass = 'text-red-400'
            } else {
              bonusText = '无加成'
              bonusClass = 'text-gray-400'
            }
          }
        }
        
        return {
          name: getResourceName(type),
          type,
          icon: getResourceIcon(type),
          rate: totalProduction,
          baseProduction: Math.floor(baseProduction),
          bonusText,
          bonusClass
        }
      })
    })
    
    //=== 计算仓库升级成本
    const warehouseUpgradeCost = computed(() => {
      return calculateWarehouseUpgradeCost(gameStore.warehouseLevel)
    })
    
    // 格式化时间显示
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`
      }
    }
    
    //=== 启动进度定时器
    const startProgressTimer = () => {
      if (progressTimer) {
        clearInterval(progressTimer)
      }
      progressTimer = setInterval(() => {
        // 更新响应式时间戳，触发计算属性重新计算
        currentTime.value = Date.now()
      }, 100)
    }
    
    //=== 停止进度定时器
    const stopProgressTimer = () => {
      if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
      }
    }
    
    //=== 监听升级状态变化
    const watchUpgradeStatus = () => {
      if (isWarehouseUpgrading.value) {
        startProgressTimer()
      } else {
        stopProgressTimer()
      }
    }
    
    onMounted(() => {
      watchUpgradeStatus()
      // 监听升级状态变化
      watchEffect(() => {
        watchUpgradeStatus()
      })
    })
    
    //=== getUnitIcon 获取兵种图标
    const getUnitIcon = (unitId) => {
      const unit = getUnitById(unitId)
      return unit?.icon || '⚔️'
    }
    
    //=== getUnitName 获取兵种名称
    const getUnitName = (unitId) => {
      const unit = getUnitById(unitId)
      return unit?.name || '未知兵种'
    }
    
    //=== 生产力加速选项配置
    const boostOptions = computed(() => [
      {
        hours: 1,
        cost: gameStore.calculateBoostCost(1),
        description: '短期加速，适合快速收集资源'
      },
      {
        hours: 4,
        cost: gameStore.calculateBoostCost(4),
        description: '中期加速，性价比较高'
      },
      {
        hours: 8,
        cost: gameStore.calculateBoostCost(8),
        description: '长期加速，适合离线挂机'
      },
      {
        hours: 24,
        cost: gameStore.calculateBoostCost(24),
        description: '全天加速，效果最佳'
      }
    ])
    
    //=== 启动生产力加速
    const startBoost = (hours) => {
      if (gameStore.coins < gameStore.calculateBoostCost(hours)) {
        return // 金币不足，不执行
      }
      
      const success = gameStore.startProductionBoost(hours)
      if (success) {
        showBoostDialog.value = false
      }
    }
    
    //=== 仓库容量加成相关
    const warehouseBoostCost = computed(() => {
      return 50 // 仓库容量加成花费50金币
    })
    
    const isWarehouseBoostActive = computed(() => {
      return gameStore.isWarehouseBoostActive
    })
    
    const warehouseBoostTimeLeft = computed(() => {
      if (!gameStore.warehouseBoost) return 0
      const now = currentTime.value
      const elapsed = now - gameStore.warehouseBoost.startTime
      const remaining = Math.max(0, gameStore.warehouseBoost.duration - elapsed)
      return Math.ceil(remaining / 1000)
    })
    
    //=== 一键爆仓功能
    const fillWarehouse = () => {
      if (gameStore.coins < 10) {
        return // 金币不足
      }
      
      const success = gameStore.fillWarehouse()
      if (success) {
        console.log('一键爆仓成功')
      }
    }
    
    //=== 激活仓库容量加成
    const activateWarehouseBoost = () => {
      if (gameStore.coins < warehouseBoostCost.value || isWarehouseBoostActive.value) {
        return // 金币不足或已激活
      }
      
      const success = gameStore.activateWarehouseBoost()
      if (success) {
        console.log('仓库容量加成激活成功')
      }
    }
    
    // 清理定时器
    onUnmounted(() => {
      stopProgressTimer()
    })
    
    return {
      gameStore,
      resources,
      productions,
      isWarehouseUpgrading,
      warehouseUpgradeTimeLeft,
      warehouseUpgradeProgress,
      showTooltip,
      showProductionTooltip,
      showBoostDialog,
      showFillTooltip,
      showBoostTooltip,
      boostOptions,
      startBoost,
      warehouseUpgradeCost,
      warehouseBoostCost,
      isWarehouseBoostActive,
      warehouseBoostTimeLeft,
      fillWarehouse,
      activateWarehouseBoost,
      getResourceName,
      formatTime,
      formatCivilization,
      getUnitIcon,
      getUnitName,
      WAREHOUSE_CONFIG
    }
  },
  data() {
    return {
      //=== isCollapsed 侧边栏折叠状态
      isCollapsed: false
    }
  },
  methods: {
    //=== toggleSidebar 切换侧边栏展开/折叠状态
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed
      this.$emit('toggle', this.isCollapsed)
    },
    //=== upgradeWarehouse 升级仓库
    upgradeWarehouse() {
      this.gameStore.upgradeWarehouse()
    },
    //=== handleNavClick 处理底部导航按钮点击事件
    handleNavClick(navType) {
      console.log('导航点击:', navType)
      this.$emit('nav-click', navType)
      
      // 根据navType进行路由跳转
      const routeMap = {
        'city': '/city',
        'military': '/military', 
        'map': '/map',
        'message': '/message', // 信函页面
        'settings': '/settings', // 设置按钮跳转到设置页面
        'notification-test': '/notification-test', // 通知测试页面
        'battle-simulator': '/battle-simulator' // 战斗模拟器页面
      }
      
      const targetRoute = routeMap[navType]
      if (targetRoute && this.$router.currentRoute.value.path !== targetRoute) {
        this.$router.push(targetRoute)
      }
    },
    //=== handleCoinsClick 处理金币点击事件（GM功能）
    handleCoinsClick() {
      const amount = prompt('GM操作：请输入要添加的金币数量', '100')
      if (amount && !isNaN(amount) && parseInt(amount) > 0) {
        this.gameStore.addCoins(parseInt(amount))
      }
    },
    //=== formatNumber 格式化数字显示
    formatNumber(num) {
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B'
      }
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    }
  }
}
</script>

<style scoped>
.game-sidebar {
  @apply fixed left-0 top-0 h-full z-50 transition-all duration-300;
  width: 300px;
  background: rgba(31, 41, 55, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(35, 124, 72, 0.3);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.game-sidebar.collapsed {
  width: 60px;
}

.sidebar-toggle {
  @apply absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full;
  @apply bg-gray-700 hover:bg-gray-600 rounded-r-md p-2 cursor-pointer transition-colors;
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-left: none;
}

.toggle-icon {
  @apply text-white w-4 h-4 flex items-center justify-center;
}

.sidebar-content {
  @apply h-full flex flex-col;
}

.scrollable-content {
  @apply flex-1 p-4 overflow-y-auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(35, 124, 72, 0.5) transparent;
}

.scrollable-content::-webkit-scrollbar {
  width: 4px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(35, 124, 72, 0.5);
  border-radius: 2px;
}

.city-info-card {
  @apply mb-6 p-4 rounded-md;
  background: rgba(55, 65, 81, 0.5);
  border: 1px solid rgba(35, 124, 72, 0.3);
}

.city-header {
  @apply space-y-3;
}

.city-title-row {
  @apply flex justify-between items-center mb-3;
}

.city-title {
  @apply text-white text-sm font-medium;
  line-height: 20px;
}

.coins-display {
  @apply flex items-center gap-1 cursor-pointer hover:bg-yellow-600 hover:bg-opacity-20 px-2 py-1 rounded transition-colors;
}

.coins-icon {
  @apply text-sm;
}

.coins-amount {
  @apply text-yellow-400 text-sm font-bold;
  color: #FFB900;
}

.city-details {
  @apply space-y-2;
}

.detail-item {
  @apply flex items-center gap-2 text-white text-sm;
  line-height: 20px;
}

.civilization-row {
  @apply justify-between;
}

.civilization-left,
.civilization-right {
  @apply flex items-center gap-2;
}

.status-dot {
  @apply w-2 h-2 rounded-full flex-shrink-0;
}

.status-dot.red {
  background-color: #FF6367;
}

.status-dot.yellow {
  background-color: #FFB900;
}

.status-dot.green {
  background-color: #237C48;
}

.status-dot.blue {
  background-color: #3B82F6;
}

.section {
  @apply mb-6;
}

.section-header {
  @apply text-white font-medium text-sm mb-3 pb-2 flex justify-between items-center;
  border-bottom: 1px solid #374151;
  line-height: 24px;
}

.army-count {
  @apply text-green-600 text-sm cursor-pointer hover:text-green-500;
}

.resource-list,
.production-list {
  @apply space-y-2;
}

.resource-item {
  @apply flex justify-between items-center px-3;
}

.resource-info {
  @apply flex items-center gap-2;
}

.resource-icon {
  @apply w-4 h-4 rounded-sm flex-shrink-0;
}

.resource-icon-fallback {
  @apply bg-gray-500;
}

.resource-name {
  @apply text-white text-sm;
  line-height: 24px;
  width: 32px;
}

.resource-value {
  @apply text-yellow-400 text-sm;
  line-height: 24px;
}

.production-item {
  @apply flex justify-between items-center px-3 relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.production-item:hover {
  background-color: rgba(55, 65, 81, 0.3);
}

.production-info {
  @apply flex items-center gap-2;
}

.production-icon {
  @apply w-4 h-4 rounded-sm flex-shrink-0;
}

.production-icon-fallback {
  @apply bg-gray-500;
}

.production-name {
  @apply text-white text-sm;
  line-height: 24px;
  width: 32px;
}

.production-details {
  @apply flex items-center gap-2;
}

.production-rate {
  @apply text-red-400 text-sm;
  line-height: 24px;
  width: 80px;
  text-align: right;
  white-space: nowrap;
}

.upgrade-btn {
  @apply bg-green-700 hover:bg-green-600 rounded p-1 cursor-pointer transition-colors;
  @apply flex items-center justify-center;
  width: 20px;
  height: 20px;
}

/* 生产力提示框样式 */
.production-tooltip {
  @apply absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50;
  @apply border border-green-500/50 rounded-md shadow-2xl;
  @apply text-white text-sm;
  min-width: 200px;
  max-width: 280px;
  /* 毛玻璃效果 */
  background: rgba(31, 41, 55, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.production-tooltip .tooltip-arrow {
  @apply absolute top-full left-1/2 transform -translate-x-1/2;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(16, 185, 129, 0.5);
}

.production-tooltip .tooltip-header {
  @apply px-3 py-2 text-white font-medium rounded-t-md;
  background: rgba(34, 197, 94, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-size: 12px;
}

.production-tooltip .tooltip-content {
  @apply p-3 space-y-2;
}

.production-tooltip .tooltip-item {
  @apply flex justify-between items-center;
  font-size: 11px;
  line-height: 16px;
  /* 不换行 */
}

.production-tooltip .tooltip-item.total {
  @apply border-t border-white/20 pt-2 mt-2;
  font-weight: 500;
}

.production-tooltip .tooltip-label {
  @apply text-gray-300;
}

.production-tooltip .tooltip-value {
  @apply text-white font-medium;
}

/* 淡入淡出动画 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.95);
}

.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.95);
}

.tooltip-fade-enter-to,
.tooltip-fade-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

/* 资源标题区域样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* 资源管理小圆点样式 */
.resource-dots-container {
  display: flex;
  gap: 8px;
}

.resource-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.resource-dot:hover {
  transform: scale(1.1);
}

.resource-dot.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resource-dot.disabled:hover {
  transform: none;
}

/* 一键爆仓小圆点 */
.fill-dot {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.fill-dot:hover:not(.disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* 容量加成小圆点 */
.boost-dot {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.boost-dot:hover:not(.disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.boost-dot.active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  animation: pulse-boost 2s infinite;
}

@keyframes pulse-boost {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
  }
}

.resource-dot svg {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
}

/* 资源小圆点悬浮提示样式 */
.resource-tooltip {
  @apply absolute bottom-full mb-2;
  @apply border border-green-500/50 rounded-md shadow-2xl;
  @apply text-white text-sm;
  min-width: 200px;
  max-width: 280px;
  z-index: 9999;
  /* 向左偏移，避免被右侧遮挡 */
  right: 0;
  transform: translateX(-20px);
  /* 毛玻璃效果 */
  background: rgba(31, 41, 55, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 移除三角形箭头样式 */

.resource-tooltip .tooltip-content {
  @apply p-3 space-y-2;
}

.resource-tooltip .tooltip-item {
  @apply flex flex-col space-y-1;
  font-size: 12px;
  line-height: 16px;
}

.resource-tooltip .tooltip-item.active {
  @apply text-green-400;
}

.resource-tooltip .tooltip-item.insufficient {
  @apply text-red-400;
}

.resource-tooltip .tooltip-label {
  @apply font-medium text-white;
}

.resource-tooltip .tooltip-value {
  @apply text-gray-300;
}

/* 悬浮提示过渡动画 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

/* 仓库管理样式 */
.warehouse-info {
  @apply space-y-3;
}

.warehouse-level {
  @apply flex justify-between items-center;
}

.warehouse-label {
  @apply text-sm text-gray-300;
}

.warehouse-value {
  @apply text-sm text-white font-medium;
}

.warehouse-upgrade-btn {
  @apply w-full px-3 py-2 text-xs rounded-md transition-all duration-200;
}

.warehouse-upgrade-btn.enabled {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.warehouse-upgrade-btn.disabled {
  @apply bg-gray-600 text-gray-400 cursor-not-allowed;
}

/* 仓库升级容器样式 */
.warehouse-upgrade-container {
  @apply relative;
}



/* 浮动提醒样式 */
.upgrade-tooltip {
  @apply absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2;
  @apply bg-gray-800 bg-opacity-95 backdrop-blur-sm;
  @apply border border-green-500 border-opacity-50 rounded-lg;
  @apply p-3 min-w-[200px] max-w-[280px];
  @apply text-xs text-white;
  @apply shadow-lg shadow-black/50;
  @apply z-50;
  animation: tooltipFadeIn 0.2s ease-out;
}

.tooltip-arrow {
  @apply absolute top-full left-1/2 transform -translate-x-1/2;
  @apply w-0 h-0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(34, 197, 94, 0.5);
}

.tooltip-header {
  @apply text-green-400 font-semibold mb-2 text-center;
}

.tooltip-content {
  @apply space-y-1;
}

.tooltip-item {
  @apply flex flex-col;
}

.tooltip-item.upgrading {
  @apply text-blue-400 text-center;
}

.tooltip-item.max-level {
  @apply text-yellow-400 text-center;
}

.resource-requirement {
  @apply flex justify-between items-center;
  @apply py-1 px-2 rounded;
  @apply bg-gray-700 bg-opacity-50;
}

.resource-requirement.insufficient {
  @apply bg-red-900 bg-opacity-30 text-red-300;
}

.resource-requirement:not(.insufficient) {
  @apply text-green-300;
}

.resource-name {
  @apply font-medium;
}

.resource-amount {
  @apply font-mono text-right;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 底部导航样式 */
.bottom-nav {
  @apply flex-shrink-0 p-4;
  border-top: 1px solid rgba(35, 124, 72, 0.3);
  background: rgba(31, 41, 55, 0.95);
}

.nav-buttons {
  @apply grid grid-cols-3 gap-2;
}

.nav-button {
  @apply flex flex-col items-center justify-center p-3 rounded-md cursor-pointer transition-all duration-200;
  background: rgba(55, 65, 81, 0.3);
  border: 1px solid rgba(35, 124, 72, 0.2);
  min-height: 60px;
}

.nav-button:hover {
  background: rgba(35, 124, 72, 0.4);
  border-color: rgba(35, 124, 72, 0.5);
  transform: translateY(-1px);
}

.nav-button:active {
  transform: translateY(0);
}

.nav-icon {
  @apply text-green-400 mb-1;
}

.nav-button:hover .nav-icon {
  @apply text-green-300;
}

.nav-label {
  @apply text-white text-xs font-medium;
  line-height: 16px;
}

/* 军队网格样式 */
.army-grid {
  @apply space-y-2 mt-3;
}

.empty-army {
  @apply text-center py-4;
}

.empty-text {
  @apply text-gray-400 text-sm;
}

.army-item {
  @apply flex items-center gap-2 p-2 rounded-md transition-all duration-200;
  background: rgba(55, 65, 81, 0.3);
  border: 1px solid rgba(35, 124, 72, 0.2);
}

.army-item:hover {
  background: rgba(35, 124, 72, 0.4);
  border-color: rgba(35, 124, 72, 0.5);
}

.army-icon {
  @apply text-green-400 text-lg;
}

.army-info {
  @apply flex-1 flex justify-between items-center;
}

.army-name {
  @apply text-white text-sm;
}

.army-count-text {
  @apply text-green-300 text-sm font-medium;
}

/* 生产力加速按钮样式 */
.boost-btn {
  @apply flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200;
  @apply bg-yellow-600 bg-opacity-20 text-yellow-400 border border-yellow-600 border-opacity-30;
  @apply hover:bg-yellow-600 hover:bg-opacity-30 hover:border-opacity-50;
}

.boost-btn.boost-active {
  @apply bg-green-600 bg-opacity-30 text-green-400 border-green-600;
  @apply animate-pulse;
}

.boost-text {
  @apply font-medium;
}

/* 生产力加速弹窗样式 */
.boost-dialog-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
  backdrop-filter: blur(4px);
}

.boost-dialog {
  @apply bg-gray-800 rounded-lg shadow-xl border border-gray-600 max-w-md w-full mx-4;
  max-height: 80vh;
  overflow-y: auto;
}

.boost-dialog-header {
  @apply flex justify-between items-center p-4 border-b border-gray-600;
}

.boost-dialog-header h3 {
  @apply text-white text-lg font-semibold;
}

.close-btn {
  @apply text-gray-400 hover:text-white text-2xl font-bold cursor-pointer transition-colors;
  @apply w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700;
}

.boost-dialog-content {
  @apply p-4 space-y-4;
}

.boost-info {
  @apply space-y-2;
}

.boost-description {
  @apply text-gray-300 text-sm;
}

.current-coins {
  @apply flex justify-between items-center p-2 bg-gray-700 rounded-md;
}

.coins-label {
  @apply text-gray-400 text-sm;
}

.coins-value {
  @apply text-yellow-400 font-bold;
}

.boost-options {
  @apply space-y-2;
}

.boost-option {
  @apply p-3 bg-gray-700 rounded-md cursor-pointer transition-all duration-200;
  @apply border border-gray-600 hover:border-yellow-500 hover:bg-gray-600;
}

.boost-option.disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply hover:border-gray-600 hover:bg-gray-700;
}

.option-header {
  @apply flex justify-between items-center mb-1;
}

.option-duration {
  @apply text-white font-semibold;
}

.option-cost {
  @apply text-yellow-400 font-bold;
}

.option-description {
  @apply text-gray-400 text-sm;
}

.current-boost {
  @apply p-3 bg-green-900 bg-opacity-30 border border-green-600 border-opacity-50 rounded-md;
}

.current-boost-info {
  @apply flex justify-between items-center mb-2;
}

.boost-status {
  @apply text-green-400 font-semibold text-sm;
}

.boost-remaining {
  @apply text-green-300 text-sm;
}

.boost-note {
  @apply text-green-200 text-xs opacity-80;
}
</style>