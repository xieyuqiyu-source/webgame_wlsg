<template>
  <div class="player-list">
    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索玩家城池名称..."
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
        
        <button 
          :class="['filter-btn', { 'active': onlineOnly }]"
          @click="onlineOnly = !onlineOnly"
        >
          仅在线
        </button>
      </div>
    </div>
    
    <!-- 在线玩家统计 -->
    <div class="online-stats">
      <div class="stat-item">
        <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L13.5 7H10.5L9 4L3 7V9H5V20H7V14H9V20H11V9H13V20H15V14H17V20H19V9H21Z"/>
        </svg>
        <span class="stat-label">在线玩家:</span>
        <span class="stat-value">{{ onlinePlayers.length }}</span>
      </div>
      
      <div class="stat-item">
        <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
        </svg>
        <span class="stat-label">可攻击:</span>
        <span class="stat-value">{{ attackablePlayers.length }}</span>
      </div>
    </div>
    
    <!-- 玩家列表 -->
    <div class="player-grid">
      <div 
        v-for="player in filteredPlayers" 
        :key="player.id"
        class="player-card"
        @click="handlePlayerClick(player)"
      >
        <!-- 玩家头像和基本信息 -->
        <div class="player-header">
          <div class="player-avatar">
            <div :class="['faction-badge', player.faction]">
              {{ getFactionName(player.faction) }}
            </div>
            <div v-if="player.isOnline" class="online-indicator"></div>
          </div>
          <div class="player-info">
            <h3 class="player-name">{{ player.name }}</h3>
            <p class="player-level">{{ player.civilizationLevel || '起步发展' }}</p>
            <p class="last-active">{{ getLastActiveText(player.lastActive) }}</p>
          </div>
          <div class="player-status">
            <span :class="['status-badge', player.isOnline ? 'online' : 'offline']">
              {{ player.isOnline ? '在线' : '离线' }}
            </span>
          </div>
        </div>
        
        <!-- 城池信息 -->
        <div class="player-city">
          <div class="city-name">
            <svg class="city-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19Z"/>
            </svg>
            <span>{{ player.cityName }}</span>
          </div>
          <div class="civilization-level">
            <span class="civilization-text">文明度: {{ player.civilization }}</span>
          </div>
        </div>
        
        <!-- 军队信息 -->
        <div class="player-army">
          <div class="army-power">
            <svg class="army-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
            </svg>
            <span>战力: {{ formatNumber(player.armyPower) }}</span>
          </div>
          <div class="protection-status" v-if="player.hasProtection">
            <svg class="protection-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
            </svg>
            <span class="protection-text">新手保护</span>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="player-actions">
          <button class="action-btn scout" :disabled="player.scouting" @click.stop="handleScout(player)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
            </svg>
            {{ player.scouting ? '侦查中' : '侦查' }}
          </button>
          <button 
            class="action-btn attack" 
            :disabled="!player.isOnline || player.hasProtection || Boolean(activeSortieTask) || isSortieCoolingDown"
            @click.stop="handleAttack(player)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.92,5H5L6.5,6.5L5,8H6.92L8.42,6.5L6.92,5M13,19H11V17.5L2.5,9H4.42L11,15.58V14H13V19M20.5,2.5L19,4L15.5,0.5L17,2L15.5,3.5L19,7L20.5,5.5L22,7L20.5,8.5L17,5L20.5,2.5Z"/>
            </svg>
            {{ activeSortieTask ? '行军中' : (isSortieCoolingDown ? '冷却中' : (player.hasProtection ? '保护中' : '攻击')) }}
          </button>
          <button
            class="action-btn plunder"
            :disabled="!player.isOnline || player.hasProtection || Boolean(activeSortieTask) || isSortieCoolingDown"
            @click.stop="handlePlunder(player)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,6H3V4H21M19,8C20.11,8 21,8.9 21,10V20C21,21.11 20.11,22 19,22H5C3.89,22 3,21.11 3,20V10C3,8.9 3.89,8 5,8H19M12,11A3,3 0 0,0 9,14A3,3 0 0,0 12,17A3,3 0 0,0 15,14A3,3 0 0,0 12,11Z"/>
            </svg>
            {{ activeSortieTask ? '行军中' : (isSortieCoolingDown ? '冷却中' : (player.hasProtection ? '保护中' : '掠夺')) }}
          </button>
        </div>

        <div v-if="player.scoutedAt && player.scoutData" class="scout-result" @click.stop>
          <div class="scout-result-header">
            <div>
              <span>侦查情报</span>
              <span class="scout-time">{{ getScoutTimeText(player.scoutedAt) }}</span>
            </div>
            <div class="army-summary">
              <span>总兵力: {{ player.scoutData.totalUnits }}</span>
              <span>{{ player.scoutData.unitTypes }}种兵种</span>
            </div>
          </div>
          <div v-if="player.scoutData.units.length" class="army-details">
            <div v-for="unit in player.scoutData.units" :key="unit.id" class="unit-item">
              <HoverCard
                density="compact"
                :show="hoveredScoutUnitKey === `${player.id}:${unit.id}`"
                @mouseenter="hoveredScoutUnitKey = `${player.id}:${unit.id}`"
                @mouseleave="hoveredScoutUnitKey = null"
              >
                <template #trigger>
                  <span class="unit-name">{{ unit.name }}</span>
                </template>
                <UnitHoverContent :unit="unit" />
              </HoverCard>
              <span class="unit-count">{{ formatNumber(unit.count) }}</span>
            </div>
          </div>
          <div v-else class="empty-army">城内暂无驻军</div>
          <div class="scout-resources">
            <span>木材 {{ formatNumber(player.scoutData.resources.wood) }}</span>
            <span>泥土 {{ formatNumber(player.scoutData.resources.soil) }}</span>
            <span>铁矿 {{ formatNumber(player.scoutData.resources.iron) }}</span>
            <span>粮食 {{ formatNumber(player.scoutData.resources.food) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loadError" class="load-error">
      {{ loadError }}
    </div>
    
    <!-- 空状态 -->
    <div v-if="filteredPlayers.length === 0" class="empty-state">
      <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12S12 10.2 12 8S13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8 4C10.2 4 12 5.8 12 8C12 10.2 10.2 12 8 12C5.8 12 4 10.2 4 8C4 5.8 5.8 4 8 4M8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z"/>
      </svg>
      <h3 class="empty-title">{{ onlineOnly ? '暂无在线玩家' : '未找到玩家城池' }}</h3>
      <p class="empty-text">{{ onlineOnly ? '当前没有其他玩家在线' : '尝试调整搜索条件或筛选器' }}</p>
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
              <h2 class="dispatch-title">{{ dispatchActionLabel }}玩家</h2>
              <p class="dispatch-subtitle">{{ dispatchTargetPlayer?.name || '目标玩家' }} · {{ getFactionName(dispatchTargetPlayer?.faction) }}</p>
            </div>
            <button class="dispatch-close" @click="closeDispatchDialog">关闭</button>
          </div>

          <div class="dispatch-summary">
            <span>可选兵种 {{ availableDispatchUnits.length }} 种</span>
            <span>已选总兵力 {{ selectedDispatchTotal }}</span>
            <span v-if="selectedDispatchTotal > 0">运载 {{ selectedDispatchCarryCapacity }}</span>
            <span class="snapshot-note">按最近侦查快照结算</span>
          </div>

          <div class="dispatch-list">
            <div v-for="unit in availableDispatchUnits" :key="unit.id" class="dispatch-row">
              <div class="dispatch-unit-meta">
                <div class="dispatch-unit-name">{{ unit.name }}</div>
                <div class="dispatch-unit-stock">现有 {{ formatNumber(unit.available) }}</div>
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
import { useGameStore } from '@/store/modules/gameStore.js'
import { useMilitaryStore } from '@/store/modules/militaryStore.js'
import { useNotificationStore } from '@/store/modules/notificationStore.js'
import { fetchPlayers, scoutPlayer } from '@/services/playerDirectoryService.js'
import { getUnitById } from '@/config/factionConfig.js'
import { applyGeneralBonusesToUnit } from '@/domain/general/generalBonusResolver.js'
import { COMBAT_RULE_IDS } from '@/domain/combat/combatConstants.js'
import HoverCard from '@/components/hover/HoverCard.vue'
import UnitHoverContent from '@/components/hover/UnitHoverContent.vue'
import BattleReport from './Test/BattleReport.vue'

export default {
  name: 'PlayerList',
  components: {
    HoverCard,
    UnitHoverContent,
    BattleReport
  },
  setup() {
    return {
      gameStore: useGameStore(),
      militaryStore: useMilitaryStore(),
      notificationStore: useNotificationStore()
    }
  },
  data() {
    return {
      //=== searchQuery 搜索关键词
      searchQuery: '',
      //=== selectedFaction 选中的阵营筛选
      selectedFaction: 'all',
      //=== onlineOnly 仅显示在线玩家
      onlineOnly: true,
      //=== factionFilters 阵营筛选选项
      factionFilters: [
        { key: 'all', label: '全部' },
        { key: 'wei', label: '魏' },
        { key: 'shu', label: '蜀' },
        { key: 'wu', label: '吴' }
      ],
      //=== players 玩家数据
      players: [],
      loadError: '',
      onlineTimer: null,
      hoveredScoutUnitKey: null,
      dispatchDialogVisible: false,
      dispatchRuleId: null,
      dispatchTargetPlayer: null,
      dispatchSelections: {},
      battleReportData: null,
      battleReportVisible: false
    }
  },
  computed: {
    //=== onlinePlayers 在线玩家列表
    onlinePlayers() {
      return this.players.filter(player => player.isOnline)
    },
    
    //=== attackablePlayers 可攻击的玩家列表
    attackablePlayers() {
      return this.onlinePlayers.filter(player => !player.hasProtection)
    },
    
    //=== filteredPlayers 过滤后的玩家列表
    filteredPlayers() {
      let filtered = this.players
      
      // 仅在线玩家筛选
      if (this.onlineOnly) {
        filtered = filtered.filter(player => player.isOnline)
      }
      
      // 按名称搜索
      if (this.searchQuery.trim()) {
        filtered = filtered.filter(player => 
          player.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          player.cityName.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      // 按阵营筛选
      if (this.selectedFaction !== 'all') {
        filtered = filtered.filter(player => player.faction === this.selectedFaction)
      }
      
      return filtered
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

    activeSortieTask() {
      return this.militaryStore.sortieTask
    },

    isSortieCoolingDown() {
      return this.militaryStore.isSortieCoolingDown
    },

    pendingBattleReport() {
      return this.militaryStore.pendingBattleReport
    }
  },
  mounted() {
    this.loadPlayers()
    this.startOnlineStatusUpdate()
  },
  beforeUnmount() {
    //=== 清理定时器
    if (this.onlineTimer) {
      clearInterval(this.onlineTimer)
    }
  },
  watch: {
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
    async loadPlayers() {
      try {
        const result = await fetchPlayers(this.gameStore.userUUID)
        const existingPlayers = new Map(this.players.map((player) => [player.id, player]))
        this.players = (result.players || []).map((player) => ({
          ...player,
          scoutedAt: existingPlayers.get(player.id)?.scoutedAt || null,
          scoutData: existingPlayers.get(player.id)?.scoutData || null,
          scouting: false
        }))
        this.loadError = ''
      } catch (error) {
        this.loadError = `玩家列表加载失败：${error.message}`
      }
    },
    
    //=== startOnlineStatusUpdate 开始在线状态更新
    startOnlineStatusUpdate() {
      this.onlineTimer = setInterval(() => {
        this.loadPlayers()
      }, 30000) // 每30秒更新一次
    },
    
    //=== getFactionName 获取阵营名称
    getFactionName(faction) {
      const names = {
        wei: '魏',
        shu: '蜀', 
        wu: '吴'
      }
      return names[faction] || '未知'
    },
    
    //=== getLastActiveText 获取最后活跃时间文本
    getLastActiveText(lastActive) {
      if (!lastActive) return '暂无在线记录'
      const now = Date.now()
      const diff = now - lastActive
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      if (minutes < 1) {
        return '刚刚在线'
      } else if (minutes < 60) {
        return `${minutes}分钟前`
      } else if (hours < 24) {
        return `${hours}小时前`
      } else {
        return '1天前'
      }
    },

    getScoutTimeText(scoutedAt) {
      return new Date(scoutedAt).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    //=== formatNumber 格式化数字
    formatNumber,
    
    //=== handlePlayerClick 处理玩家点击事件
    handlePlayerClick(player) {
      console.log('点击玩家:', player)
      // TODO: 显示玩家详情
    },
    
    //=== handleScout 处理侦查事件
    async handleScout(player) {
      if (player.scouting) return
      player.scouting = true
      try {
        const result = await scoutPlayer(player.id)
        player.scoutedAt = result.scoutedAt
        player.scoutData = {
          ...result.scoutData,
          units: (result.scoutData?.units || []).map((unit) => ({
            ...(getUnitById(unit.id) || {
              name: unit.id,
              attack: 0,
              infantryDefense: 0,
              cavalryDefense: 0,
              speed: 0,
              carryCapacity: 0
            }),
            ...unit
          }))
        }
        this.notificationStore.addSuccessNotification(
          '侦查成功',
          `已取得 ${player.name} 的城池情报`
        )
      } catch (error) {
        this.notificationStore.addErrorNotification('侦查失败', error.message)
      } finally {
        player.scouting = false
      }
    },
    
    handleAttack(player) {
      if (!player.isOnline) {
        this.notificationStore.addWarningNotification('无法攻击', '只能攻击在线玩家')
        return
      }
      if (player.hasProtection) {
        this.notificationStore.addWarningNotification('无法攻击', '该玩家处于新手保护状态')
        return
      }
      this.openDispatchDialog(player, COMBAT_RULE_IDS.CLASSIC_CRUSH)
    },

    handlePlunder(player) {
      if (!player.isOnline) {
        this.notificationStore.addWarningNotification('无法掠夺', '只能掠夺在线玩家')
        return
      }
      if (player.hasProtection) {
        this.notificationStore.addWarningNotification('无法掠夺', '该玩家处于新手保护状态')
        return
      }
      this.openDispatchDialog(player, COMBAT_RULE_IDS.PLUNDER_STRIKE)
    },

    openDispatchDialog(player, ruleId) {
      if (this.activeSortieTask || this.isSortieCoolingDown) {
        this.notificationStore.addInfoNotification('无法出征', this.activeSortieTask ? '当前已有部队在外行军' : '部队冷却中，请稍后再试')
        return
      }
      if (!player.scoutData) {
        this.notificationStore.addWarningNotification('无法出征', '请先侦查目标玩家')
        return
      }
      if (this.availableDispatchUnits.length === 0) {
        this.notificationStore.addWarningNotification('出兵失败', '当前没有可出征的军队')
        return
      }

      this.dispatchTargetPlayer = player
      this.dispatchRuleId = ruleId
      this.dispatchSelections = {}
      this.dispatchDialogVisible = true
    },

    closeDispatchDialog() {
      this.dispatchDialogVisible = false
      this.dispatchRuleId = null
      this.dispatchTargetPlayer = null
      this.dispatchSelections = {}
    },

    normalizeDispatchCount(unitId, rawValue) {
      const max = this.militaryStore.army[unitId] || 0
      const nextValue = Number.parseInt(rawValue, 10)
      if (Number.isNaN(nextValue) || nextValue <= 0) return 0
      return Math.min(max, nextValue)
    },

    updateDispatchSelection(unitId, rawValue) {
      this.dispatchSelections = {
        ...this.dispatchSelections,
        [unitId]: this.normalizeDispatchCount(unitId, rawValue)
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
      this.dispatchSelections = this.availableDispatchUnits.reduce((result, unit) => {
        result[unit.id] = unit.available
        return result
      }, {})
    },

    confirmDispatch() {
      if (!this.dispatchTargetPlayer || !this.dispatchRuleId) return
      if (this.selectedDispatchTotal <= 0) {
        this.notificationStore.addWarningNotification('出兵失败', '请至少选择一支部队')
        return
      }

      const defenseArmy = {
        faction: this.dispatchTargetPlayer.faction,
        units: (this.dispatchTargetPlayer.scoutData.units || []).map((unit) => ({ ...unit }))
      }
      const dispatchResult = this.militaryStore.createSortieTask({
        player: {
          id: this.dispatchTargetPlayer.id,
          name: this.dispatchTargetPlayer.name,
          faction: this.dispatchTargetPlayer.faction,
          level: Math.max(1, Math.floor((this.dispatchTargetPlayer.civilization || 0) / 100) || 1),
          defenseArmy,
          resources: { ...(this.dispatchTargetPlayer.scoutData.resources || {}) }
        },
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
    }
  }
}
</script>

<style scoped>
.player-list {
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

/* 玩家网格样式 */
.player-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.player-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: #111827;
  position: relative;
  will-change: border-color, box-shadow;
}

.player-card:hover {
  border-color: rgba(165, 180, 252, 0.9);
  box-shadow: 0 14px 28px rgba(99, 102, 241, 0.08);
}

/* 玩家头部样式 */
.player-header {
  @apply flex items-center justify-between mb-4;
}

.player-avatar {
  @apply relative;
}

.faction-badge {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
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

.online-indicator {
  @apply absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.online-indicator.pulse {
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.player-info {
  @apply flex-1 ml-3;
}

.player-name {
  @apply text-lg font-bold mb-1;
  color: #111827;
}

.player-level {
  @apply text-sm;
  color: #64748b;
}

.last-active {
  @apply text-xs;
  color: #94a3b8;
}

.player-status {
  @apply flex flex-col items-end;
}

.status-badge {
  @apply px-3 py-1 text-xs font-bold rounded-full;
}

.status-badge.online {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.status-badge.offline {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid rgba(203, 213, 225, 0.9);
}

/* 城池信息样式 */
.player-city {
  @apply mb-4 space-y-2;
}

.city-name {
  @apply flex items-center gap-2 text-sm p-3 rounded-lg;
  background: #eef2ff;
  border: 1px solid rgba(199, 210, 254, 0.95);
  color: #111827;
  font-weight: bold;
}

.city-icon {
  color: #3B82F6;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.civilization-level {
  @apply text-sm p-2 rounded;
  background: #f8fafc;
  color: #64748b;
  text-align: center;
  border: 1px solid rgba(229, 231, 235, 0.92);
}

.civilization-text {
  font-weight: bold;
}

/* 军队信息样式 */
.player-army {
  @apply mb-4 space-y-2;
}

.army-power {
  @apply flex items-center gap-2 text-sm p-3 rounded-lg;
  background: #fef2f2;
  border: 1px solid rgba(254, 202, 202, 0.95);
  color: #111827;
  font-weight: bold;
}

.army-icon {
  color: #FF6367;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.protection-status {
  @apply flex items-center gap-2 text-sm p-2 rounded;
  background: #fffbeb;
  border: 1px solid rgba(253, 230, 138, 0.95);
}

.protection-icon {
  color: #FFB900;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.protection-text {
  color: #FFB900;
  font-weight: bold;
}

/* 操作按钮样式 */
.player-actions {
  @apply flex gap-3;
}

.action-btn {
  @apply flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-lg;
  backdrop-filter: blur(8px);
  border: 1px solid;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: opacity 0.2s ease, box-shadow 0.2s ease;
  will-change: opacity, box-shadow;
}

.action-btn.scout {
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
  border-color: #3B82F6;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.action-btn.scout:hover {
  opacity: 0.9;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.attack {
  background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
  border-color: #EF4444;
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.action-btn.attack:hover:not(:disabled) {
  opacity: 0.9;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.action-btn.plunder {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border-color: #F59E0B;
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.action-btn.plunder:hover:not(:disabled) {
  opacity: 0.9;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.action-btn:disabled {
  background: #e5e7eb !important;
  border-color: #e5e7eb !important;
  color: #94a3b8 !important;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 空状态样式 */
.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 16px;
  margin: 20px 0;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.empty-title {
  @apply text-xl font-bold mb-2;
  color: #111827;
}

.empty-text {
  color: #64748b;
}

.scout-result {
  margin-top: 16px;
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid rgba(229, 231, 235, 0.92);
}

.scout-result-header,
.scout-result-header > div,
.army-summary,
.army-details,
.scout-resources {
  display: flex;
  align-items: center;
}

.scout-result-header {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
}

.scout-result-header > div,
.army-summary {
  gap: 8px;
}

.scout-time {
  color: #4f46e5;
  font-size: 11px;
}

.army-summary {
  color: #64748b;
  font-size: 12px;
}

.army-details {
  flex-wrap: wrap;
  gap: 8px;
}

.unit-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 8px;
  color: #334155;
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.95);
  font-size: 12px;
}

.unit-name {
  font-weight: 700;
}

.unit-count {
  color: #4f46e5;
  font-weight: 700;
}

.empty-army {
  color: #64748b;
  font-size: 12px;
}

.scout-resources {
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.load-error {
  padding: 12px 14px;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
}

.dispatch-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.44);
  backdrop-filter: blur(12px);
}

.dispatch-dialog {
  width: min(720px, 100%);
  max-height: min(760px, calc(100vh - 40px));
  overflow: auto;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(229, 231, 235, 0.94);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28);
  padding: 22px;
  color: #111827;
}

.dispatch-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.dispatch-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.dispatch-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.dispatch-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.dispatch-summary span {
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 800;
}

.dispatch-summary .snapshot-note {
  background: #fff7ed;
  color: #c2410c;
}

.dispatch-list {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.dispatch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.96);
}

.dispatch-unit-name {
  font-weight: 800;
}

.dispatch-unit-stock {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
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
  border: 0;
  border-radius: 12px;
  font-weight: 800;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dispatch-close,
.dispatch-secondary,
.dispatch-primary {
  padding: 10px 14px;
}

.dispatch-close,
.dispatch-secondary,
.dispatch-step,
.dispatch-max {
  background: #f1f5f9;
  color: #334155;
}

.dispatch-step {
  width: 34px;
  height: 34px;
}

.dispatch-input {
  width: 84px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(203, 213, 225, 0.9);
  text-align: center;
  font-weight: 800;
  color: #111827;
  background: #fff;
}

.dispatch-max {
  height: 34px;
  padding: 0 10px;
  font-size: 12px;
}

.dispatch-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dispatch-primary {
  color: #fff;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.dispatch-primary:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

@media (max-width: 768px) {
  .player-list {
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

  .online-stats {
    padding: 14px;
    gap: 10px;
  }

  .stat-item {
    width: 100%;
    justify-content: flex-start;
    padding: 10px 12px;
  }

  .player-grid {
    @apply grid-cols-1 gap-4;
  }

  .player-card {
    padding: 14px;
  }

  .player-header {
    align-items: flex-start;
    gap: 10px;
  }

  .player-info {
    margin-left: 0;
  }

  .player-name {
    @apply text-base;
  }

  .player-status {
    align-items: flex-start;
  }

  .player-actions {
    @apply flex-col gap-2;
  }

  .action-btn {
    width: 100%;
  }

  .dispatch-overlay {
    align-items: flex-end;
    padding: 12px;
  }

  .dispatch-dialog {
    max-height: 82vh;
    border-radius: 20px;
    padding: 16px;
  }

  .dispatch-row {
    align-items: stretch;
    flex-direction: column;
  }

  .dispatch-input-group {
    width: 100%;
  }

  .dispatch-input {
    flex: 1;
    width: auto;
  }

  .dispatch-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .dispatch-primary {
    grid-column: 1 / -1;
  }
}
</style>
