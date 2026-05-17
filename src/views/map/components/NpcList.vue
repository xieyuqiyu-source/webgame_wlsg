<template>
  <div class="npc-list">
    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索NPC城池名称..."
          class="search-input"
        />
      </div>
      
      <div class="filter-buttons">
        <button 
          v-for="faction in factionFilters" 
          :key="faction.key"
          :class="['filter-btn', { 'active': selectedFaction === faction.key }]"
          @click="selectedFaction = selectedFaction === faction.key ? 'all' : faction.key"
        >
          {{ faction.label }}
        </button>
      </div>
    </div>
    
    <!-- 刷新控制区域 -->
    <div class="refresh-control">
      <div class="refresh-info">
        <div class="countdown-display">
          <svg class="countdown-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
          </svg>
          <span class="countdown-label">自动刷新:</span>
          <span class="countdown-time">{{ formattedCountdown }}</span>
        </div>
        
        <div class="refresh-cost">
          <svg class="coin-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
          </svg>
          <span class="cost-text">手动刷新: {{ npcStore.manualRefreshCost }}金币</span>
        </div>
      </div>
      
      <button 
        class="manual-refresh-btn"
        :class="{ 'disabled': !canManualRefresh }"
        :disabled="!canManualRefresh"
        @click="manualRefresh"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
        </svg>
        立即刷新
      </button>
    </div>

    <div v-if="activeSortieTask || isSortieCoolingDown" class="sortie-status-panel">
      <div class="sortie-status-main">
        <div class="sortie-status-title">
          {{ activeSortieTask ? sortieStatusTitle : '部队整备中' }}
        </div>
        <div class="sortie-status-subtitle">
          <template v-if="activeSortieTask">
            {{ activeSortieTask.actionLabel }} {{ activeSortieTask.target.name }} · {{ sortiePhaseText }}
          </template>
          <template v-else>
            部队正在冷却，暂时无法再次出征
          </template>
        </div>
      </div>
      <div class="sortie-status-time">
        {{ activeSortieTask ? sortieTimeText : cooldownTimeText }}
      </div>
    </div>

    <div v-if="activeSortieTask || isSortieCoolingDown" class="sortie-status-sticky">
      <span class="sticky-label">{{ activeSortieTask ? sortieStatusTitle : '冷却中' }}</span>
      <span class="sticky-target">{{ activeSortieTask ? activeSortieTask.target.name : '部队整备' }}</span>
      <span class="sticky-time">{{ activeSortieTask ? sortieTimeText : cooldownTimeText }}</span>
    </div>
    
   
    
    <!-- NPC列表 -->
    <div class="npc-list-container">
      <div 
        v-for="npc in paginatedNpcs" 
        :key="npc.id"
        class="npc-list-item"
        @click="handleNpcClick(npc)"
      >
       <div class="npc-list-items" style="display: flex;">
        <!-- 阵营标识 -->
        <div class="npc-faction">
          <div :class="['faction-badge', npc.faction]">
            {{ getFactionName(npc.faction) }}
          </div>
        </div>
        
        <!-- NPC基本信息 -->
        <div class="npc-basic-info">
          <h3 class="npc-name">{{ npc.name }}</h3>
          <span class="npc-level">Lv.{{ npc.level }}</span>
          <span v-if="npc.recoveryState" class="npc-recovery-badge">恢复中 · {{ formatRecoveryTime(npc) }}</span>
        </div>
        
        <!-- 资源信息 -->
        <div class="npc-resources">
          <div class="resource-item">
            <img :src="getResourceIcon('wood')" :alt="getResourceName('wood')" class="resource-icon" width="14" height="14" />
            <span class="resource-value">{{ formatNumber(npc.resources.wood) }}</span>
          </div>
          <div class="resource-item">
            <img :src="getResourceIcon('soil')" :alt="getResourceName('soil')" class="resource-icon" width="14" height="14" />
            <span class="resource-value">{{ formatNumber(npc.resources.soil) }}</span>
          </div>
          <div class="resource-item">
            <img :src="getResourceIcon('iron')" :alt="getResourceName('iron')" class="resource-icon" width="14" height="14" />
            <span class="resource-value">{{ formatNumber(npc.resources.iron) }}</span>
          </div>
          <div class="resource-item">
            <img :src="getResourceIcon('food')" :alt="getResourceName('food')" class="resource-icon" width="14" height="14" />
            <span class="resource-value">{{ formatNumber(npc.resources.food) }}</span>
          </div>
        </div>
        
        <!-- 侦查状态信息 -->
        <div class="npc-scout-info">
          <div v-if="npc.scoutedAt" class="scout-status">
            <svg class="scout-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
            </svg>
            <span class="scout-label">已侦查</span>
            <span class="scout-time">{{ formatScoutTime(npc.scoutedAt) }}</span>
          </div>
          <div v-else class="scout-status">
            <svg class="scout-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z"/>
            </svg>
            <span class="scout-label">未侦查</span>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="npc-actions">
          <button class="action-btn scout" @click.stop="handleScout(npc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
            </svg>
            侦查
          </button>
          <button class="action-btn attack" :disabled="Boolean(activeSortieTask) || isSortieCoolingDown" @click.stop="handleAttack(npc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.92,5H5L6.5,6.5L5,8H6.92L8.42,6.5L6.92,5M13,19H11V17.5L2.5,9H4.42L11,15.58V14H13V19M20.5,2.5L19,4L15.5,0.5L17,2L15.5,3.5L19,7L20.5,5.5L22,7L20.5,8.5L17,5L20.5,2.5Z"/>
            </svg>
            {{ activeSortieTask ? '行军中' : (isSortieCoolingDown ? '冷却中' : '攻击') }}
          </button>
          <button class="action-btn plunder" :disabled="Boolean(activeSortieTask) || isSortieCoolingDown" @click.stop="handlePlunder(npc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,6H3V4H21M19,8C20.11,8 21,8.9 21,10V20C21,21.11 20.11,22 19,22H5C3.89,22 3,21.11 3,20V10C3,8.9 3.89,8 5,8H19M12,11A3,3 0 0,0 9,14A3,3 0 0,0 12,17A3,3 0 0,0 15,14A3,3 0 0,0 12,11Z"/>
            </svg>
            {{ activeSortieTask ? '行军中' : (isSortieCoolingDown ? '冷却中' : '掠夺') }}
          </button>
        </div>
        </div>
        <div>

<!-- 侦查结果显示 - 横向展示在下方 -->
        <div v-if="npc.scoutedAt && npc.scoutData" class="scout-result">
          <div class="scout-result-header">
            <div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
              </svg>
              <span>侦查情报</span>
            </div>
            <div class="army-summary">
              <span class="army-total">总兵力: {{ npc.scoutData.totalUnits }}</span>
              <span class="army-types">{{ npc.scoutData.unitTypes }}种兵种</span>
            </div>
          </div>
          <div class="army-details">
            <div v-for="unit in npc.scoutData.units" :key="unit.id" class="unit-item">
              <HoverCard
                density="compact"
                :show="hoveredScoutUnitId === unit.id"
                @mouseenter="hoveredScoutUnitId = unit.id"
                @mouseleave="hoveredScoutUnitId = null"
              >
                <template #trigger>
                  <span class="unit-name">{{ unit.name }}</span>
                </template>
                <UnitHoverContent :unit="unit" />
              </HoverCard>
              <span class="unit-count">{{ formatNumber(unit.count) }}</span>
            </div>
          </div>
          <div v-if="npc.scoutData.resources" class="scout-resources">
            <span v-if="scoutInsightActive" class="scout-bonus">{{ gameStore.selectedGeneral?.name }} 洞察生效</span>
            <span>木材 {{ npc.scoutData.resources.wood }}</span>
            <span>泥土 {{ npc.scoutData.resources.soil }}</span>
            <span>铁矿 {{ npc.scoutData.resources.iron }}</span>
            <span>粮食 {{ npc.scoutData.resources.food }}</span>
          </div>
        </div>
        </div>
        
        
      </div>
    </div>
    
    <!-- 分页组件 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="pagination-btn" 
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        上一页
      </button>
      
      <div class="pagination-numbers">
        <button 
          v-for="page in totalPages" 
          :key="page"
          :class="['pagination-number', { 'active': currentPage === page }]"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        class="pagination-btn" 
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
    
    <!-- 空状态 -->
    <div v-if="filteredNpcs.length === 0" class="empty-state">
      <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
      </svg>
      <h3 class="empty-title">未找到NPC城池</h3>
      <p class="empty-text">尝试调整搜索条件或筛选器</p>
    </div>

    <BattleReport
      :visible="battleReportVisible"
      :battle-report-data="battleReportData"
      @close="closeBattleReport"
    />

    <Teleport to="body">
      <div v-if="dispatchDialogVisible" class="dispatch-overlay" @click.self="closeDispatchDialog">
        <div class="dispatch-dialog">
          <div class="dispatch-header">
            <div>
              <h2 class="dispatch-title">{{ dispatchActionLabel }}出征</h2>
              <p class="dispatch-subtitle">{{ dispatchTargetNpc?.name || '目标城池' }} · {{ getFactionName(dispatchTargetNpc?.faction) }}</p>
            </div>
            <button class="dispatch-close" @click="closeDispatchDialog">关闭</button>
          </div>

          <div class="dispatch-summary">
            <span>可选兵种 {{ availableDispatchUnits.length }} 种</span>
            <span>已选总兵力 {{ selectedDispatchTotal }}</span>
            <span v-if="selectedDispatchTotal > 0">运载 {{ selectedDispatchCarryCapacity }}</span>
            <span v-if="carryBonusPercent > 0">{{ gameStore.selectedGeneral?.name }} 运载 +{{ carryBonusPercent }}%</span>
            <span v-if="marchSpeedBonusPercent > 0">{{ gameStore.selectedGeneral?.name }} 行军 +{{ marchSpeedBonusPercent }}%</span>
          </div>

          <div class="dispatch-list">
            <div v-for="unit in availableDispatchUnits" :key="unit.id" class="dispatch-row">
              <div class="dispatch-unit-meta">
                <div class="dispatch-unit-name">{{ unit.name }}</div>
                <div class="dispatch-unit-stock">现有 {{ formatNumber(unit.available) }}</div>
                <div v-if="unit.baseUnit.carryCapacity !== unit.carryCapacity" class="dispatch-unit-bonus">
                  运载 {{ unit.baseUnit.carryCapacity }} -> {{ unit.carryCapacity }}
                </div>
                <div v-if="unit.baseUnit.speed !== unit.speed" class="dispatch-unit-bonus">
                  速度 {{ unit.baseUnit.speed }} -> {{ unit.speed }}
                </div>
              </div>
              <div class="dispatch-input-group">
                <button class="dispatch-step" @click="adjustDispatchUnit(unit.id, -1)">-</button>
                <input
                  :value="dispatchSelections[unit.id] || 0"
                  type="number"
                  min="0"
                  :max="unit.available"
                  class="dispatch-input"
                  @input="updateDispatchSelection(unit.id, $event.target.value)"
                />
                <button class="dispatch-step" @click="adjustDispatchUnit(unit.id, 1)">+</button>
                <button class="dispatch-max" @click="setDispatchUnitMax(unit.id, unit.available)">全选</button>
              </div>
            </div>
          </div>

          <div class="dispatch-actions">
            <button class="dispatch-secondary" @click="fillAllDispatchUnits">全军出征</button>
            <button class="dispatch-secondary" @click="clearDispatchSelections">清空</button>
            <button class="dispatch-primary" :disabled="selectedDispatchTotal <= 0" @click="confirmDispatch">
              确认{{ dispatchActionLabel }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { formatNumber } from '@/utils/formatters.js'
import { getUnitById } from '@/config/factionConfig.js'
import { applyGeneralBonusesToUnit } from '@/domain/general/generalBonusResolver.js'
import { COMBAT_RULE_IDS } from '@/domain/combat/combatConstants.js'
import { useGameStore } from '@/store/modules/gameStore.js'
import { useMilitaryStore } from '@/store/modules/militaryStore.js'
import { useNotificationStore } from '@/store/modules/notificationStore.js'
import { useNpcStore } from '@/store/modules/npcStore.js'
import { getResourceIcon, getResourceName } from '@/config/resources.js'
import HoverCard from '@/components/hover/HoverCard.vue'
import UnitHoverContent from '@/components/hover/UnitHoverContent.vue'
import BattleReport from './Test/BattleReport.vue'

export default {
  name: 'NpcList',
  components: {
    HoverCard,
    UnitHoverContent,
    BattleReport
  },
  setup() {
    const gameStore = useGameStore()
    const militaryStore = useMilitaryStore()
    const notificationStore = useNotificationStore()
    const npcStore = useNpcStore()
    return {
      gameStore,
      militaryStore,
      notificationStore,
      npcStore
    }
  },
  data() {
    return {
      //=== searchQuery 搜索关键词
      searchQuery: '',
      //=== selectedFaction 选中的阵营筛选
      selectedFaction: 'all',
      //=== factionFilters 阵营筛选选项
      factionFilters: [
        { key: 'all', label: '全部' },
        { key: 'wei', label: '魏' },
        { key: 'shu', label: '蜀' },
        { key: 'wu', label: '吴' }
      ],
      //=== currentPage 当前页码
      currentPage: 1,
      hoveredScoutUnitId: null,
      //=== pageSize 每页显示数量
      pageSize: 12,
      //=== refreshTimer 刷新倒计时定时器
      refreshTimer: null,
      //=== currentTime 用于触发响应式更新
      currentTime: Date.now(),
      //=== battleReportData 地图战斗战报
      battleReportData: null,
      //=== battleReportVisible 战报弹层状态
      battleReportVisible: false,
      //=== dispatchDialogVisible 选兵出征弹层
      dispatchDialogVisible: false,
      //=== dispatchRuleId 当前出征规则
      dispatchRuleId: null,
      //=== dispatchTargetNpc 当前出征目标
      dispatchTargetNpc: null,
      //=== dispatchSelections 出征兵力选择
      dispatchSelections: {}
    }
  },
  computed: {
    //=== npcs 从store获取NPC列表
    npcs() {
      return this.npcStore.npcs
    },

    //=== filteredNpcs 过滤后的NPC列表
    filteredNpcs() {
      let filtered = this.npcs
      
      // 按名称搜索
      if (this.searchQuery.trim()) {
        filtered = filtered.filter(npc => 
          npc.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      // 按阵营筛选
      if (this.selectedFaction !== 'all') {
        filtered = filtered.filter(npc => npc.faction === this.selectedFaction)
      }
      
      return filtered
    },
    
    //=== paginatedNpcs 分页后的NPC列表
    paginatedNpcs() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredNpcs.slice(start, end)
    },
    
    //=== totalPages 总页数
    totalPages() {
      return Math.ceil(this.filteredNpcs.length / this.pageSize)
    },
    
    //=== refreshCountdown 刷新倒计时（秒）
    refreshCountdown() {
      // 传入currentTime以触发响应式更新
      return Math.floor(this.npcStore.timeUntilNextRefresh(this.currentTime) / 1000)
    },
    
    //=== 格式化倒计时显示
    formattedCountdown() {
      const totalSeconds = this.refreshCountdown
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
    },
    
    //=== 检查是否可以手动刷新
    canManualRefresh() {
      return this.gameStore.coins >= this.npcStore.manualRefreshCost
    },

    dispatchActionLabel() {
      return this.dispatchRuleId === COMBAT_RULE_IDS.PLUNDER_STRIKE ? '掠夺' : '攻击'
    },

    availableDispatchUnits() {
      return Object.entries(this.militaryStore.army || {}).reduce((result, [unitId, count]) => {
        if (!count || count <= 0) return result
        const unit = getUnitById(unitId)
        if (!unit) return result
        result.push({
          ...applyGeneralBonusesToUnit(unit, this.gameStore.generalBonuses),
          baseUnit: unit,
          available: count
        })
        return result
      }, [])
    },

    selectedDispatchTotal() {
      return Object.values(this.dispatchSelections).reduce((sum, count) => sum + (Number(count) || 0), 0)
    },

    selectedDispatchCarryCapacity() {
      return this.availableDispatchUnits.reduce((total, unit) => (
        total + ((Number(this.dispatchSelections[unit.id]) || 0) * unit.carryCapacity)
      ), 0)
    },

    carryBonusPercent() {
      return Math.round((this.gameStore.generalBonuses.carryMultiplier - 1) * 100)
    },

    marchSpeedBonusPercent() {
      return Math.round((this.gameStore.generalBonuses.marchSpeedMultiplier - 1) * 100)
    },

    scoutInsightActive() {
      return this.gameStore.generalBonuses.scoutInsight > 0
    },

    activeSortieTask() {
      return this.militaryStore.sortieTask
    },

    pendingBattleReport() {
      return this.militaryStore.pendingBattleReport
    },

    isSortieCoolingDown() {
      return (this.militaryStore.sortieCooldownUntil || 0) > this.currentTime
    },

    sortieStatusTitle() {
      if (!this.activeSortieTask) return ''
      return this.activeSortieTask.status === 'outbound' ? '部队出征中' : '部队返程中'
    },

    sortiePhaseText() {
      if (!this.activeSortieTask) return ''
      return this.activeSortieTask.status === 'outbound' ? '前往目标' : '返回城池'
    },

    sortieTimeText() {
      if (!this.activeSortieTask) return ''
      return this.formatDurationFromNow(this.activeSortieTask.phaseEndsAt)
    },

    cooldownTimeText() {
      return this.formatDurationFromNow(this.militaryStore.sortieCooldownUntil)
    }
  },
  async mounted() {
    //=== 初始化NPC数据
    await this.npcStore.initializeNpcs()
    
    //=== 触发npcs-updated事件，将NPC数据传递给父组件
    this.$emit('npcs-updated', this.npcs)
    
    //=== 启动倒计时定时器
    this.startCountdownTimer()
  },
  
  beforeUnmount() {
    //=== 清理定时器
    this.clearCountdownTimer()
  },
  watch: {
    //=== 监听搜索条件变化，重置分页
    searchQuery() {
      this.resetPagination()
    },
    //=== 监听筛选条件变化，重置分页
    selectedFaction() {
      this.resetPagination()
    },
    pendingBattleReport: {
      immediate: true,
      handler(report) {
        if (!report || this.$el?.offsetParent === null) return
        this.battleReportData = report
        this.battleReportVisible = true
        this.militaryStore.clearPendingBattleReport()
      }
    }
  },
  methods: {
    //=== handleNpcClick 处理NPC点击事件
    handleNpcClick(npc) {
      console.log('点击NPC:', JSON.stringify(npc))
      // TODO: 显示NPC详情
    },
    
    //=== handleScout 处理侦查事件
    handleScout(npc) {
      // 检查是否已经侦查过
      if (npc.scoutedAt) {
        this.notificationStore.addNotification({
          type: 'warning',
          title: '侦查失败',
          message: '该城池已经侦查过了'
        })
        return
      }
      
      // 获取玩家阵营
      const playerFaction = this.gameStore.userFaction
      if (!playerFaction) {
        this.notificationStore.addNotification({
          type: 'error',
          title: '侦查失败',
          message: '请先选择阵营'
        })
        return
      }
      
      // 获取对应阵营的侦查兵种ID
      const scoutUnitId = this.getScoutUnitId(playerFaction)
      if (!scoutUnitId) {
        this.notificationStore.addNotification({
          type: 'error',
          title: '侦查失败',
          message: '未找到对应的侦查兵种'
        })
        return
      }
      
      // 计算需要消耗的侦查兵数量
      const requiredScouts = this.calculateRequiredScouts(playerFaction, npc.level)
      
      // 检查是否有足够的侦查兵
      const currentScouts = this.militaryStore.army[scoutUnitId] || 0
      if (currentScouts < requiredScouts) {
        this.notificationStore.addNotification({
          type: 'error',
          title: '侦查失败',
          message: `需要${requiredScouts}个侦查兵，当前只有${currentScouts}个`
        })
        return
      }
      
      // 消耗侦查兵
      this.militaryStore.consumeUnits(scoutUnitId, requiredScouts)
      
      // 执行侦查
      this.npcStore.scoutNpc(npc.id, {
        scoutsUsed: requiredScouts,
        playerFaction: playerFaction
      })
      
      // 保存游戏数据
      this.gameStore.saveGame()
      
      this.notificationStore.addNotification({
        type: 'success',
        title: '侦查成功',
        message: `消耗了${requiredScouts}个侦查兵`
      })
    },
    
    //=== handleAttack 处理攻击事件
    handleAttack(npc) {
      if (this.activeSortieTask || this.isSortieCoolingDown) {
        this.notificationStore.addInfoNotification('无法出征', this.activeSortieTask ? '当前已有部队在外行军' : '部队冷却中，请稍后再试')
        return
      }
      this.openDispatchDialog(npc, COMBAT_RULE_IDS.CLASSIC_CRUSH)
    },

    handlePlunder(npc) {
      if (this.activeSortieTask || this.isSortieCoolingDown) {
        this.notificationStore.addInfoNotification('无法出征', this.activeSortieTask ? '当前已有部队在外行军' : '部队冷却中，请稍后再试')
        return
      }
      this.openDispatchDialog(npc, COMBAT_RULE_IDS.PLUNDER_STRIKE)
    },

    openDispatchDialog(npc, ruleId) {
      if (this.activeSortieTask || this.isSortieCoolingDown) {
        this.notificationStore.addInfoNotification('无法出征', this.activeSortieTask ? '当前已有部队在外行军' : '部队冷却中，请稍后再试')
        return
      }

      if (this.availableDispatchUnits.length === 0) {
        this.notificationStore.addWarningNotification('出兵失败', '当前没有可出征的军队')
        return
      }

      this.dispatchTargetNpc = npc
      this.dispatchRuleId = ruleId
      this.dispatchSelections = {}
      this.dispatchDialogVisible = true
    },

    closeDispatchDialog() {
      this.dispatchDialogVisible = false
      this.dispatchRuleId = null
      this.dispatchTargetNpc = null
      this.dispatchSelections = {}
    },

    normalizeDispatchCount(unitId, rawValue) {
      const max = this.militaryStore.army[unitId] || 0
      const nextValue = Number.parseInt(rawValue, 10)
      if (Number.isNaN(nextValue) || nextValue <= 0) return 0
      return Math.min(max, nextValue)
    },

    updateDispatchSelection(unitId, rawValue) {
      const nextValue = this.normalizeDispatchCount(unitId, rawValue)
      this.dispatchSelections = {
        ...this.dispatchSelections,
        [unitId]: nextValue
      }
    },

    adjustDispatchUnit(unitId, delta) {
      const current = this.dispatchSelections[unitId] || 0
      this.updateDispatchSelection(unitId, current + delta)
    },

    setDispatchUnitMax(unitId, max) {
      this.dispatchSelections = {
        ...this.dispatchSelections,
        [unitId]: max
      }
    },

    clearDispatchSelections() {
      this.dispatchSelections = {}
    },

    fillAllDispatchUnits() {
      const nextSelections = {}
      this.availableDispatchUnits.forEach((unit) => {
        nextSelections[unit.id] = unit.available
      })
      this.dispatchSelections = nextSelections
    },

    confirmDispatch() {
      if (!this.dispatchTargetNpc || !this.dispatchRuleId) {
        return
      }

      if (this.selectedDispatchTotal <= 0) {
        this.notificationStore.addWarningNotification('出兵失败', '请至少选择一支部队')
        return
      }

      const dispatchResult = this.militaryStore.createSortieTask({
        npc: this.dispatchTargetNpc,
        ruleId: this.dispatchRuleId,
        selections: this.dispatchSelections
      })

      if (dispatchResult?.ok) {
        this.closeDispatchDialog()
      }
    },

    closeBattleReport() {
      this.battleReportVisible = false
      this.battleReportData = null
    },

    formatDurationFromNow(targetTime) {
      const remainingMs = Math.max(0, (targetTime || 0) - this.currentTime)
      const totalSeconds = Math.ceil(remainingMs / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      if (minutes > 0) {
        return `${minutes}分${seconds.toString().padStart(2, '0')}秒`
      }
      return `${seconds}秒`
    },
    
    //=== changePage 切换页码
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    //=== resetPagination 重置分页
    resetPagination() {
      this.currentPage = 1
    },
    
    //=== getScoutUnitId 获取对应阵营的侦查兵种ID
    getScoutUnitId(faction) {
      const scoutUnits = {
        'wei': 'zhanYingTanMa',  // 魏国：战鹰探马
        'shu': 'flyingKite',     // 蜀国：飞鸢
        'wu': 'secretAgent'      // 吴国：密探
      }
      return scoutUnits[faction]
    },
    
    //=== calculateRequiredScouts 计算需要消耗的侦查兵数量
    calculateRequiredScouts(faction, targetLevel) {
      const consumptionRates = {
        'wei': 0.8,   // 魏国：战鹰探马消耗较少
        'shu': 2.5,   // 蜀国：飞鸢消耗最多
        'wu': 1.5     // 吴国：密探消耗中等
      }
      
      // 基础消耗改为指数增长
      const baseConsumption = Math.pow(targetLevel, 1.8) * 2 + targetLevel * 3
      const rate = consumptionRates[faction] || 1.5
      
      return Math.max(2, Math.ceil(baseConsumption * rate))
    },
    
    //=== formatScoutTime 格式化侦查时间
    formatScoutTime(timestamp) {
      const now = Date.now()
      const diff = now - timestamp
      const minutes = Math.floor(diff / (1000 * 60))
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      
      const hours = Math.floor(minutes / 60)
      return `${hours}小时前`
    },

    formatRecoveryTime(npc) {
      const recoveryState = npc?.recoveryState
      if (!recoveryState) return ''
      const endAt = (recoveryState.startedAt || 0) + (recoveryState.duration || 0)
      return this.formatDurationFromNow(endAt)
    },
    
    //=== startCountdownTimer 启动倒计时定时器
    startCountdownTimer() {
      this.clearCountdownTimer()
      
      // 启动定时器，每秒更新一次
      this.refreshTimer = setInterval(() => {
        // 更新currentTime以触发响应式更新
        this.currentTime = Date.now()
        this.npcStore.progressNpcRecovery(this.currentTime)
        
        // 检查是否需要自动刷新，传入currentTime参数
        if (this.npcStore.needsRegeneration(this.currentTime)) {
          this.autoRefresh()
        }
      }, 1000)
    },
    
    //=== clearCountdownTimer 清理倒计时定时器
    clearCountdownTimer() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    
    //=== autoRefresh 自动刷新NPC列表
    autoRefresh() {
      this.npcStore.generateNpcs()
      this.$emit('npcs-updated', this.npcs)
      
      this.notificationStore.addNotification({
        type: 'info',
        title: 'NPC列表刷新',
        message: 'NPC列表已自动刷新，发现新的目标！'
      })
    },
    
    //=== manualRefresh 手动刷新NPC列表
    manualRefresh() {
      // 检查金币是否足够
      if (!this.canManualRefresh) {
        this.notificationStore.addNotification({
          type: 'error',
          title: '刷新失败',
          message: `金币不足！需要${this.npcStore.manualRefreshCost}金币，当前只有${this.gameStore.coins}金币`
        })
        return
      }
      
      // 扣除金币
      this.gameStore.coins -= this.npcStore.manualRefreshCost
      
      // 手动刷新NPC列表
      this.npcStore.manualRefresh()
      this.$emit('npcs-updated', this.npcs)
      
      // 保存游戏数据
      this.gameStore.saveGame()
      
      this.notificationStore.addNotification({
        type: 'success',
        title: '手动刷新成功',
        message: `消耗${this.npcStore.manualRefreshCost}金币，NPC列表已刷新！`
      })
    },

    //=== getFactionName 获取阵营名称
    getFactionName(faction) {
      const names = { wei: '魏', shu: '蜀', wu: '吴' }
      return names[faction] || '未知'
    },
    
    //=== getResourceIcon 获取资源图标URL
    getResourceIcon(resourceType) {
      return getResourceIcon(resourceType)
    },
    
    //=== getResourceName 获取资源名称
    getResourceName(resourceType) {
      return getResourceName(resourceType)
    },
    
    //=== formatNumber 格式化数字
    formatNumber
  }
}
</script>

<style scoped>
.npc-list {
  @apply space-y-6;
}

/* 搜索栏样式 - 参考军事页面设计 */
.search-bar {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 刷新控制区域样式 */
.refresh-control {
  background: linear-gradient(135deg, rgba(255, 185, 0, 0.1), rgba(255, 185, 0, 0.05));
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 185, 0, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sortie-status-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #eef2ff 0%, #ffffff 100%);
  border: 1px solid rgba(199, 210, 254, 0.95);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.sortie-status-sticky {
  position: sticky;
  top: 8px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(79, 70, 229, 0.96);
  color: #ffffff;
  box-shadow: 0 12px 26px rgba(79, 70, 229, 0.22);
}

.sticky-label {
  font-size: 12px;
  font-weight: 800;
}

.sticky-target {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sticky-time {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 800;
  opacity: 0.95;
}

.sortie-status-main {
  min-width: 0;
}

.sortie-status-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
}

.sortie-status-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.sortie-status-time {
  flex-shrink: 0;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(165, 180, 252, 0.7);
  color: #4f46e5;
  font-size: 12px;
  font-weight: 800;
}

.refresh-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.countdown-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown-icon {
  color: #FFB900;
  animation: pulse 2s infinite;
}

.countdown-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.countdown-time {
  color: #4f46e5;
  font-size: 16px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  background: rgba(99, 102, 241, 0.08);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(165, 180, 252, 0.7);
}

.refresh-cost {
  display: flex;
  align-items: center;
  gap: 6px;
}

.coin-icon {
  color: #f59e0b;
}

.cost-text {
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.manual-refresh-btn {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 18px rgba(79, 70, 229, 0.18);
}

.manual-refresh-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, #5b5df0, #4338ca);
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(79, 70, 229, 0.24);
}

.manual-refresh-btn.disabled {
  background: #e5e7eb;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@media (min-width: 640px) {
  .search-bar {
    flex-direction: row;
  }
}

.search-input-wrapper {
  @apply relative flex-1;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2;
  color: #94a3b8;
}

.search-input {
  @apply w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.92);
  color: #111827;
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  outline: none;
  border-color: #a5b4fc;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
  background: #ffffff;
}

.filter-buttons {
  @apply flex gap-2 flex-wrap;
}

.filter-btn {
  @apply px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200;
  background: rgba(255, 255, 255, 0.96);
  color: #64748b;
  border: 1px solid rgba(229, 231, 235, 0.92);
}

.filter-btn:hover {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #111827;
  transform: translateY(-1px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 12px 22px rgba(79, 70, 229, 0.18);
}

.online-stats {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.stat-item {
  @apply flex items-center gap-3;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(229, 231, 235, 0.92);
}

.stat-icon {
  color: #6366f1;
}

.stat-label {
  @apply text-sm font-medium;
  color: #64748b;
}

.stat-value {
  @apply text-sm font-bold;
  color: #111827;
}

/* NPC列表容器样式 */
.npc-list-container {
  @apply space-y-3;
}

.npc-list-item {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  padding: 16px;
  /* cursor: pointer; */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: #111827;
  /* display: flex; */
  align-items: center;
  gap: 16px;
  min-height: 60px;
}
.npc-list-items {
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  padding: 16px;
  /* cursor: pointer; */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: #111827;
  /* display: flex; */
  align-items: center;
  gap: 16px;
  min-height: 60px;
}
.npc-list-item:hover {
  border-color: rgba(165, 180, 252, 0.9);
  box-shadow: 0 14px 28px rgba(99, 102, 241, 0.08);
}

/* 阵营标识样式 */
.npc-faction {
  @apply flex-shrink-0;
}

.faction-badge {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 0px solid rgba(255, 255, 255, 0.2);
}

.faction-badge.wei {
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
}

.faction-badge.shu {
  background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
}

.faction-badge.wu {
  background: linear-gradient(135deg, #237C48 0%, #166534 100%);
}

/* NPC基本信息样式 */
.npc-basic-info {
  @apply flex-shrink-0 min-w-0;
  width: 140px;
}

.npc-recovery-badge {
  display: inline-flex;
  align-items: center;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.npc-name {
  @apply text-base font-bold mb-1 truncate;
  color: #111827;
}

.npc-level {
  @apply text-xs;
  color: #64748b;
}

/* 资源信息样式 */
.npc-resources {
  @apply flex-1 flex items-center gap-4;
}

.resource-item {
  @apply flex items-center gap-1 text-xs;
  color: #111827;
  font-weight: 700;
}

.resource-icon {
  color: #FFB900;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.resource-value {
  color: #111827;
}

/* 侦查状态信息样式 */
 .npc-scout-info {
   @apply flex-shrink-0 flex flex-col gap-1;
   width: 120px;
 }
 
 .scout-status {
   @apply flex items-center gap-1 text-xs;
   color: #111827;
   font-weight: 600;
 }
 
 .scout-icon {
   color: #FFB900;
   filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
 }
 
 .scout-label {
   color: #64748b;
 }
 
 .scout-time {
   color: #4f46e5;
   font-weight: bold;
   font-size: 10px;
 }
 
 /* 侦查结果样式 - 横向布局 */
 .scout-result {
   @apply mt-3 p-3 rounded-lg w-full;
   background: #f8fafc;
   border: 1px solid rgba(229, 231, 235, 0.92);
 }
 
 .scout-result-header {
   @apply flex items-center justify-between mb-2 text-sm font-bold;
   color: #111827;
 }
 
 .scout-result-header > div:first-child {
   @apply flex items-center gap-2;
 }
 
 .army-summary {
   @apply flex items-center gap-4 text-xs;
   color: #64748b;
 }
 
 .army-total {
   color: #4f46e5;
   font-weight: bold;
 }
 
 .army-types {
   color: #94a3b8;
 }
 
.army-details {
  @apply flex flex-wrap gap-2;
}

.scout-resources {
  @apply flex flex-wrap gap-3 mt-3 text-xs font-semibold;
  color: #475569;
}

.scout-bonus {
  color: #166534;
}
 
 .unit-item {
   @apply flex items-center gap-2 text-xs px-2 py-1 rounded;
   background: #ffffff;
   border: 1px solid rgba(229, 231, 235, 0.92);
   min-width: 80px;
 }
 
 .unit-name {
   color: #475569;
   font-size: 10px;
 }
 
 .unit-count {
   color: #111827;
   font-weight: bold;
   font-size: 10px;
 }

/* 操作按钮样式 */
.npc-actions {
  @apply flex gap-2 flex-shrink-0;
}

.action-btn {
  @apply flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-md;
  backdrop-filter: blur(8px);
  border: 1px solid;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
  min-width: 60px;
}

.action-btn:disabled {
  opacity: 0.48;
  cursor: not-allowed;
  box-shadow: none !important;
}

.action-btn.scout {
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
  border-color: #3B82F6;
  color: white;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.2);
}

.action-btn.scout:hover {
  opacity: 0.9;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.action-btn.attack {
  background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
  border-color: #EF4444;
  color: white;
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.2);
}

.action-btn.attack:hover {
  opacity: 0.9;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

.action-btn.plunder {
  background: linear-gradient(135deg, #F59E0B 0%, #B45309 100%);
  border-color: #F59E0B;
  color: white;
  box-shadow: 0 1px 4px rgba(245, 158, 11, 0.2);
}

.action-btn.plunder:hover {
  opacity: 0.9;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
}

.dispatch-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(7, 12, 10, 0.68);
  backdrop-filter: blur(6px);
}

.dispatch-dialog {
  width: min(760px, 100%);
  max-height: 80vh;
  overflow: auto;
  background: #f5f6f8;
  border: 1px solid #d8dde6;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
  padding: 20px;
  color: #1f2937;
}

.dispatch-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.dispatch-title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.dispatch-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.dispatch-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 14px;
  font-size: 14px;
  color: #4b5563;
}

.dispatch-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dispatch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.dispatch-unit-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.dispatch-unit-stock {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.dispatch-unit-bonus {
  margin-top: 4px;
  font-size: 12px;
  color: #15803d;
}

.dispatch-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dispatch-close,
.dispatch-secondary,
.dispatch-primary,
.dispatch-step,
.dispatch-max {
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.dispatch-close,
.dispatch-secondary,
.dispatch-primary {
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
}

.dispatch-close:hover,
.dispatch-secondary:hover,
.dispatch-step:hover,
.dispatch-max:hover {
  background: #f3f4f6;
}

.dispatch-step {
  width: 32px;
  height: 32px;
  font-size: 16px;
  font-weight: 700;
}

.dispatch-input {
  width: 100px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  color: #111827;
  text-align: center;
  padding: 0 10px;
  font-size: 14px;
}

.dispatch-max {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
}

.dispatch-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.dispatch-primary {
  background: #237c48;
  border-color: #237c48;
  color: #fff;
}

.dispatch-primary:hover:not(:disabled) {
  background: #1d663b;
  border-color: #1d663b;
}

.dispatch-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* 分页组件样式 */
.pagination {
  @apply flex items-center justify-center gap-2 mt-6;
}

.pagination-btn {
  @apply px-3 py-2 rounded-md text-sm font-medium cursor-pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(35, 124, 72, 0.2);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.pagination-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 185, 0, 0.3);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:disabled:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(35, 124, 72, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.pagination-numbers {
  @apply flex gap-1;
}

.pagination-number {
  @apply px-3 py-2 rounded-md text-sm font-medium cursor-pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(35, 124, 72, 0.2);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.pagination-number:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 185, 0, 0.3);
  color: white;
}

.pagination-number.active {
  background: linear-gradient(135deg, #FFB900 0%, #FFA000 100%);
  border-color: #FFB900;
  color: #18181B;
  box-shadow: 0 4px 12px rgba(255, 185, 0, 0.3);
}

/* 空状态样式 */
.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 20px;
  margin: 20px 0;
}

.empty-icon {
  color: #94a3b8;
  margin-bottom: 16px;
}

.empty-title {
  @apply text-xl font-bold mb-2;
  color: #111827;
}

.empty-text {
  color: #64748b;
}

@media (max-width: 768px) {
  .npc-list {
    @apply space-y-4;
  }

  .search-bar {
    padding: 14px;
    border-radius: 12px;
    gap: 12px;
  }

  .filter-buttons {
    gap: 8px;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 2px;
  }

  .filter-btn {
    @apply px-3 py-2 text-xs whitespace-nowrap flex-none;
  }

  .refresh-control {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 14px;
  }

  .sortie-status-panel {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 14px;
  }

  .sortie-status-sticky {
    top: 6px;
    padding: 10px 12px;
    gap: 6px;
  }

  .sticky-target {
    font-size: 11px;
  }

  .sticky-time,
  .sticky-label {
    font-size: 11px;
  }

  .sortie-status-time {
    align-self: stretch;
    text-align: center;
  }

  .refresh-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .countdown-display,
  .refresh-cost {
    width: 100%;
  }

  .manual-refresh-btn {
    width: 100%;
    justify-content: center;
  }

  .npc-list-item,
  .npc-list-items {
    padding: 12px;
    gap: 12px;
    min-height: 0;
  }

  .npc-list-items {
    display: flex !important;
    flex-direction: column;
    align-items: stretch;
  }

  .npc-basic-info,
  .npc-scout-info {
    width: auto;
  }

  .npc-basic-info {
    @apply flex items-center justify-between gap-3;
  }

  .npc-name {
    @apply text-sm mb-0;
  }

  .npc-level {
    @apply text-[11px] whitespace-nowrap;
  }

  .npc-resources {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 12px;
    width: 100%;
  }

  .resource-item {
    @apply text-[11px];
  }

  .npc-scout-info {
    gap: 6px;
  }

  .npc-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
  }

  .action-btn {
    min-width: 0;
    width: 100%;
    padding: 10px 8px;
    font-size: 11px;
  }

  .scout-result {
    @apply mt-2 p-3;
  }

  .scout-result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .army-summary {
    gap: 10px;
    flex-wrap: wrap;
  }

  .army-details {
    gap: 8px;
  }

  .unit-item {
    min-width: calc(50% - 4px);
  }

  .dispatch-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .dispatch-dialog {
    width: 100%;
    max-height: 88vh;
    border-radius: 18px 18px 0 0;
    padding: 14px;
  }

  .dispatch-header {
    gap: 10px;
    margin-bottom: 12px;
  }

  .dispatch-title {
    font-size: 20px;
  }

  .dispatch-subtitle {
    font-size: 12px;
  }

  .dispatch-row {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    gap: 12px;
  }

  .dispatch-input-group {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .dispatch-input {
    flex: 1;
    width: auto;
  }

  .dispatch-step {
    width: 36px;
    height: 36px;
  }

  .dispatch-max {
    flex: 1;
    min-height: 36px;
  }

  .dispatch-actions {
    margin-top: 14px;
    flex-direction: column-reverse;
  }

  .dispatch-secondary,
  .dispatch-primary {
    width: 100%;
  }

  .pagination {
    gap: 8px;
    flex-wrap: wrap;
  }

  .pagination-numbers {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 2px;
  }
}
</style>
