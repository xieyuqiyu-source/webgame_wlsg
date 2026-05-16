<template>
  <div class="dungeon-list">
    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索副本名称..."
          class="search-input"
        />
      </div>
      
      <div class="filter-buttons">
        <button 
          v-for="difficulty in difficultyFilters" 
          :key="difficulty.key"
          :class="['filter-btn', { 'active': selectedDifficulty === difficulty.key }]"
          @click="selectedDifficulty = selectedDifficulty === difficulty.key ? 'all' : difficulty.key"
        >
          {{ difficulty.label }}
        </button>
        
        <button 
          :class="['filter-btn', { 'active': availableOnly }]"
          @click="availableOnly = !availableOnly"
        >
          仅可挑战
        </button>
      </div>
    </div>
    
    <!-- 副本统计 -->
    <div class="dungeon-stats">
      <div class="stat-item">
        <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M17 12V14H15V16H13V14H11V12H13V10H15V12H17Z"/>
        </svg>
        <span class="stat-label">总副本:</span>
        <span class="stat-value">{{ dungeons.length }}</span>
      </div>
      
      <div class="stat-item">
        <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
        </svg>
        <span class="stat-label">可挑战:</span>
        <span class="stat-value">{{ availableDungeons.length }}</span>
      </div>
      
      <div class="stat-item">
        <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2ZM21,9V7L15,4L13.5,7H10.5L9,4L3,7V9H5V20H7V14H9V20H11V9H13V20H15V14H17V20H19V9H21Z"/>
        </svg>
        <span class="stat-label">已完成:</span>
        <span class="stat-value">{{ completedDungeons.length }}</span>
      </div>
    </div>
    
    <!-- 副本列表 -->
    <div class="dungeon-grid">
      <div 
        v-for="dungeon in filteredDungeons" 
        :key="dungeon.id"
        :class="['dungeon-card', dungeon.difficulty, { 'completed': dungeon.isCompleted, 'locked': !dungeon.isAvailable }]"
        @click="handleDungeonClick(dungeon)"
      >
        <!-- 副本头部 -->
        <div class="dungeon-header">
          <div class="dungeon-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" :class="getDifficultyIconMeta(dungeon.difficulty).iconClass">
              <path :d="getDifficultyIconMeta(dungeon.difficulty).iconPath" />
            </svg>
            <div v-if="dungeon.isCompleted" class="completed-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
              </svg>
            </div>
            <div v-if="!dungeon.isAvailable" class="locked-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
              </svg>
            </div>
          </div>
          <div class="dungeon-info">
            <h3 class="dungeon-name">{{ dungeon.name }}</h3>
            <p class="dungeon-type">{{ getDifficultyText(dungeon.difficulty) }}</p>
          </div>
          <div class="dungeon-level">
            <span class="level-text">Lv.{{ dungeon.recommendLevel }}</span>
          </div>
        </div>
        
        <!-- 副本描述 -->
        <div class="dungeon-description">
          <p class="description-text">{{ dungeon.description }}</p>
        </div>
        
        <!-- 副本要求 -->
        <div class="dungeon-requirements">
          <div class="requirement-item">
            <svg class="requirement-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
            </svg>
            <span>推荐战力: {{ formatNumber(dungeon.recommendPower) }}</span>
          </div>
          <div class="requirement-item">
            <svg class="requirement-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
            </svg>
            <span>消耗体力: {{ dungeon.energyCost }}</span>
          </div>
        </div>
        
        <!-- 奖励预览 -->
        <div class="dungeon-rewards">
          <h4 class="rewards-title">奖励预览</h4>
          <div class="rewards-grid">
            <div v-for="reward in dungeon.rewards" :key="reward.type" class="reward-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :class="getRewardIconMeta(reward.type).iconClass">
                <path :d="getRewardIconMeta(reward.type).iconPath" />
              </svg>
              <span class="reward-amount">{{ formatReward(reward) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="dungeon-actions">
          <button 
            v-if="dungeon.isAvailable && !dungeon.isCompleted"
            class="action-btn challenge"
            @click.stop="handleChallenge(dungeon)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.92,5H5L6.5,6.5L5,8H6.92L8.42,6.5L6.92,5M13,19H11V17.5L2.5,9H4.42L11,15.58V14H13V19M20.5,2.5L19,4L15.5,0.5L17,2L15.5,3.5L19,7L20.5,5.5L22,7L20.5,8.5L17,5L20.5,2.5Z"/>
            </svg>
            挑战副本
          </button>
          <button 
            v-else-if="dungeon.isCompleted"
            class="action-btn completed"
            disabled
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
            </svg>
            已完成
          </button>
          <button 
            v-else
            class="action-btn locked"
            disabled
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
            </svg>
            未解锁
          </button>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="filteredDungeons.length === 0" class="empty-state">
      <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M17 12V14H15V16H13V14H11V12H13V10H15V12H17Z"/>
      </svg>
      <h3 class="empty-title">未找到副本</h3>
      <p class="empty-text">尝试调整搜索条件或筛选器</p>
    </div>
  </div>
</template>

<script>
import { formatNumber } from '@/utils/formatters.js'

const DIFFICULTY_META = {
  easy: {
    iconPath: 'M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z',
    iconClass: 'text-green-500'
  },
  normal: {
    iconPath: 'M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M17 12V14H15V16H13V14H11V12H13V10H15V12H17Z',
    iconClass: 'text-blue-500'
  },
  hard: {
    iconPath: 'M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z',
    iconClass: 'text-orange-500'
  },
  hell: {
    iconPath: 'M17.66,11.2C17.43,10.9 17.15,10.64 16.89,10.38C16.22,9.78 15.46,9.35 14.82,8.72C13.33,7.26 13,4.85 13.95,3C13,3.23 12.17,3.75 11.46,4.32C8.87,6.4 7.85,10.07 9.07,13.22C9.11,13.32 9.15,13.42 9.15,13.55C9.15,13.77 9,13.97 8.8,14.05C8.57,14.15 8.33,14.09 8.14,13.93C8.08,13.88 8.04,13.83 8,13.76C6.87,12.33 6.69,10.28 7.45,8.64C5.78,10 4.87,12.3 5,14.47C5.06,14.97 5.12,15.47 5.29,15.97C5.43,16.57 5.7,17.17 6,17.7C7.08,19.43 8.95,20.67 10.96,20.92C13.1,21.19 15.39,20.8 17.03,19.32C18.86,17.66 19.5,15 18.56,12.72L18.43,12.46C18.22,12 17.66,11.2 17.66,11.2M14.5,17.5C14.22,17.74 13.76,18 13.4,18.1C12.28,18.5 11.16,17.94 10.5,17.28C11.69,17 12.4,16.12 12.61,15.23C12.78,14.43 12.46,13.77 12.33,13C12.21,12.26 12.23,11.63 12.5,10.94C12.69,11.32 12.89,11.7 13.13,12C13.9,13 15.11,13.44 15.37,14.8C15.41,14.94 15.43,15.08 15.43,15.23C15.46,16.05 15.1,16.95 14.5,17.5H14.5Z',
    iconClass: 'text-red-500'
  }
}

const REWARD_META = {
  coins: {
    iconPath: 'M5,6.09L7.91,4L9,5.09L6.09,8L9,10.91L7.91,12L5,9.09L2.09,12L1,10.91L3.91,8L1,5.09L2.09,4L5,6.09M16,6.09L18.91,4L20,5.09L17.09,8L20,10.91L18.91,12L16,9.09L13.09,12L12,10.91L14.91,8L12,5.09L13.09,4L16,6.09M11,14V16H13V20H15V16H17V14H15V12H13V14H11Z',
    iconClass: 'text-yellow-500'
  },
  exp: {
    iconPath: 'M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z',
    iconClass: 'text-purple-500'
  },
  equipment: {
    iconPath: 'M6.92,5H5L6.5,6.5L5,8H6.92L8.42,6.5L6.92,5M13,19H11V17.5L2.5,9H4.42L11,15.58V14H13V19M20.5,2.5L19,4L15.5,0.5L17,2L15.5,3.5L19,7L20.5,5.5L22,7L20.5,8.5L17,5L20.5,2.5Z',
    iconClass: 'text-gray-600'
  },
  gem: {
    iconPath: 'M6,2L2,8L12,22L22,8L18,2H6M6.5,4H17.5L20.5,8L12,18L3.5,8L6.5,4Z',
    iconClass: 'text-blue-500'
  },
  legendary: {
    iconPath: 'M5,16L3,5L8.5,12L12,4L15.5,12L21,5L19,16H5M12,18A2,2 0 0,1 14,20A2,2 0 0,1 12,22A2,2 0 0,1 10,20A2,2 0 0,1 12,18Z',
    iconClass: 'text-orange-500'
  }
}

export default {
  name: 'DungeonList',
  data() {
    return {
      //=== searchQuery 搜索关键词
      searchQuery: '',
      //=== selectedDifficulty 选中的难度筛选
      selectedDifficulty: 'all',
      //=== availableOnly 仅显示可挑战的副本
      availableOnly: false,
      //=== difficultyFilters 难度筛选选项
      difficultyFilters: [
        { key: 'all', label: '全部' },
        { key: 'easy', label: '简单' },
        { key: 'normal', label: '普通' },
        { key: 'hard', label: '困难' },
        { key: 'hell', label: '地狱' }
      ],
      //=== dungeons 副本数据
      dungeons: []
    }
  },
  computed: {
    //=== availableDungeons 可挑战的副本列表
    availableDungeons() {
      return this.dungeons.filter(dungeon => dungeon.isAvailable && !dungeon.isCompleted)
    },
    
    //=== completedDungeons 已完成的副本列表
    completedDungeons() {
      return this.dungeons.filter(dungeon => dungeon.isCompleted)
    },
    
    //=== filteredDungeons 过滤后的副本列表
    filteredDungeons() {
      let filtered = this.dungeons
      
      // 仅可挑战筛选
      if (this.availableOnly) {
        filtered = filtered.filter(dungeon => dungeon.isAvailable && !dungeon.isCompleted)
      }
      
      // 按名称搜索
      if (this.searchQuery.trim()) {
        filtered = filtered.filter(dungeon => 
          dungeon.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      // 按难度筛选
      if (this.selectedDifficulty !== 'all') {
        filtered = filtered.filter(dungeon => dungeon.difficulty === this.selectedDifficulty)
      }
      
      return filtered
    }
  },
  mounted() {
    //=== 生成副本数据
    this.generateDungeons()
  },
  methods: {
    //=== generateDungeons 生成副本数据
    generateDungeons() {
      const dungeonTemplates = [
        { name: '新手试炼', difficulty: 'easy', description: '适合新手玩家的入门副本，奖励丰厚。' },
        { name: '野外营寨', difficulty: 'easy', description: '清剿山贼营寨，获得基础资源。' },
        { name: '古墓探险', difficulty: 'normal', description: '探索神秘古墓，寻找珍贵宝物。' },
        { name: '敌军据点', difficulty: 'normal', description: '攻打敌军据点，获得军事装备。' },
        { name: '龙潭虎穴', difficulty: 'hard', description: '挑战强大的野兽，获得稀有材料。' },
        { name: '魔王城堡', difficulty: 'hard', description: '攻打魔王城堡，获得传说装备。' },
        { name: '地狱深渊', difficulty: 'hell', description: '最终挑战，只有最强者才能通过。' },
        { name: '天界试炼', difficulty: 'hell', description: '神级副本，奖励无与伦比。' }
      ]
      
      this.dungeons = dungeonTemplates.map((template, index) => {
        const baseLevel = this.getDifficultyBaseLevel(template.difficulty)
        const isCompleted = Math.random() < 0.3 // 30% 已完成
        const isAvailable = index < 5 || Math.random() < 0.7 // 前5个必定解锁，其他70%概率
        
        return {
          id: `dungeon_${index + 1}`,
          name: template.name,
          difficulty: template.difficulty,
          description: template.description,
          recommendLevel: baseLevel + Math.floor(Math.random() * 5),
          recommendPower: (baseLevel * 1000) + Math.floor(Math.random() * 5000),
          energyCost: this.getDifficultyEnergyCost(template.difficulty),
          isAvailable,
          isCompleted: isCompleted && isAvailable,
          rewards: this.generateRewards(template.difficulty)
        }
      })
    },
    
    //=== getDifficultyBaseLevel 获取难度基础等级
    getDifficultyBaseLevel(difficulty) {
      const levels = {
        easy: 1,
        normal: 10,
        hard: 20,
        hell: 30
      }
      return levels[difficulty] || 1
    },
    
    //=== getDifficultyEnergyCost 获取难度体力消耗
    getDifficultyEnergyCost(difficulty) {
      const costs = {
        easy: 10,
        normal: 20,
        hard: 30,
        hell: 50
      }
      return costs[difficulty] || 10
    },
    
    //=== generateRewards 生成奖励
    generateRewards(difficulty) {
      const baseRewards = [
        { type: 'coins', amount: this.getDifficultyBaseLevel(difficulty) * 100 },
        { type: 'exp', amount: this.getDifficultyBaseLevel(difficulty) * 50 }
      ]
      
      // 根据难度添加额外奖励
      if (difficulty === 'normal' || difficulty === 'hard' || difficulty === 'hell') {
        baseRewards.push({ type: 'equipment', amount: 1 })
      }
      
      if (difficulty === 'hard' || difficulty === 'hell') {
        baseRewards.push({ type: 'gem', amount: Math.floor(Math.random() * 3) + 1 })
      }
      
      if (difficulty === 'hell') {
        baseRewards.push({ type: 'legendary', amount: 1 })
      }
      
      return baseRewards
    },
    
    //=== getDifficultyText 获取难度文本
    getDifficultyText(difficulty) {
      const texts = {
        easy: '简单',
        normal: '普通',
        hard: '困难',
        hell: '地狱'
      }
      return texts[difficulty] || '未知'
    },
    
    getDifficultyIconMeta(difficulty) {
      return DIFFICULTY_META[difficulty] || DIFFICULTY_META.easy
    },
    
    getRewardIconMeta(rewardType) {
      return REWARD_META[rewardType] || REWARD_META.coins
    },
    
    //=== formatReward 格式化奖励显示
    formatReward(reward) {
      if (reward.type === 'coins') {
        return `${formatNumber(reward.amount)}金币`
      } else if (reward.type === 'exp') {
        return `${formatNumber(reward.amount)}经验`
      } else if (reward.type === 'equipment') {
        return '装备×1'
      } else if (reward.type === 'gem') {
        return `宝石×${reward.amount}`
      } else if (reward.type === 'legendary') {
        return '传说物品×1'
      }
      return `${reward.amount}`
    },
    
    //=== formatNumber 格式化数字
    formatNumber,
    
    //=== handleDungeonClick 处理副本点击事件
    handleDungeonClick(dungeon) {
      console.log('点击副本:', dungeon)
      // TODO: 显示副本详情
    },
    
    //=== handleChallenge 处理挑战事件
    handleChallenge(dungeon) {
      console.log('挑战副本:', dungeon)
      // TODO: 实现副本挑战功能
    }
  }
}
</script>

<style scoped>
.dungeon-list {
  @apply space-y-6;
}

.search-bar {
  @apply space-y-4;
}

.search-input-wrapper {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400;
}

.search-input {
  @apply w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200;
  background: rgba(16, 20, 24, 0.8);
  border: 1px solid rgba(34, 197, 94, 0.3);
  backdrop-filter: blur(10px);
  color: #e5e7eb;
  @apply placeholder-gray-400;
}

.search-input:focus {
  outline: none;
  border-color: rgba(34, 197, 94, 0.6);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.filter-buttons {
  @apply flex gap-2 flex-wrap;
}

.filter-btn {
  @apply px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200;
  background: rgba(16, 20, 24, 0.6);
  border: 1px solid rgba(34, 197, 94, 0.2);
  backdrop-filter: blur(8px);
  color: #9ca3af;
}

.filter-btn:hover {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.4);
  color: #22c55e;
}

.filter-btn.active {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.5);
  color: #22c55e;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.dungeon-stats {
  @apply flex gap-6 p-4 rounded-lg;
  background: rgba(16, 20, 24, 0.8);
  border: 1px solid rgba(34, 197, 94, 0.3);
  backdrop-filter: blur(10px);
}

.stat-item {
  @apply flex items-center gap-2;
}

.stat-icon {
  @apply text-green-400;
}

.stat-label {
  @apply text-sm text-gray-400;
}

.stat-value {
  @apply text-sm font-bold text-green-400;
}

.dungeon-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.dungeon-card {
  @apply rounded-lg p-4 cursor-pointer relative overflow-hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.2);
  backdrop-filter: blur(15px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, box-shadow, border-color;
}

.dungeon-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.6);
  background: rgba(255, 255, 255, 0.08);
}

.dungeon-card.easy {
  border-color: rgba(34, 197, 94, 0.3);
}

.dungeon-card.easy:hover {
  border-color: rgba(34, 197, 94, 0.6);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(34, 197, 94, 0.4);
}

.dungeon-card.normal {
  border-color: rgba(59, 130, 246, 0.3);
}

.dungeon-card.normal:hover {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(59, 130, 246, 0.4);
}

.dungeon-card.hard {
  border-color: rgba(249, 115, 22, 0.3);
}

.dungeon-card.hard:hover {
  border-color: rgba(249, 115, 22, 0.6);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(249, 115, 22, 0.4);
}

.dungeon-card.hell {
  border-color: rgba(239, 68, 68, 0.3);
}

.dungeon-card.hell:hover {
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(239, 68, 68, 0.4);
}

.dungeon-card.completed {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(107, 114, 128, 0.3);
  opacity: 0.7;
}

.dungeon-card.completed:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dungeon-card.locked {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(107, 114, 128, 0.2);
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.dungeon-card.locked:hover {
  transform: none;
  box-shadow: none;
}

.dungeon-header {
  @apply flex items-center gap-3 mb-3;
}

.dungeon-icon {
  @apply relative;
}

.completed-badge {
  @apply absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  animation: completedPulse 2s ease-in-out infinite;
}

.locked-badge {
  @apply absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center;
  background: rgba(107, 114, 128, 0.9);
  color: white;
}

.dungeon-info {
  @apply flex-1;
}

.dungeon-name {
  @apply font-semibold text-sm;
  color: #e5e7eb;
}

.dungeon-type {
  @apply text-xs;
  color: #9ca3af;
}

.dungeon-level {
  @apply flex items-center;
}

.level-text {
  @apply text-xs font-medium px-2 py-1 rounded;
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.dungeon-description {
  @apply mb-3;
}

.description-text {
  @apply text-sm leading-relaxed;
  color: #9ca3af;
}

.dungeon-requirements {
  @apply mb-3 space-y-1;
}

.requirement-item {
  @apply flex items-center gap-2 text-xs;
  color: #9ca3af;
}

.requirement-icon {
  @apply text-green-400;
}

.dungeon-rewards {
  @apply mb-3;
}

.rewards-title {
  @apply text-sm font-medium mb-2;
  color: #e5e7eb;
}

.rewards-grid {
  @apply flex flex-wrap gap-2;
}

.reward-item {
  @apply flex items-center gap-1 px-2 py-1 rounded text-xs;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.reward-amount {
  color: #9ca3af;
}

.dungeon-actions {
  @apply flex;
}

.action-btn {
  @apply flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded transition-all duration-200;
}

.action-btn.challenge {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: 1px solid rgba(34, 197, 94, 0.5);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
  transition: opacity 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  will-change: opacity, box-shadow, transform;
}

.action-btn.challenge:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.action-btn.completed {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border: 1px solid rgba(16, 185, 129, 0.5);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  cursor: not-allowed;
}

.action-btn.locked {
  background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
  color: white;
  border: 1px solid rgba(107, 114, 128, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.2);
  cursor: not-allowed;
  opacity: 0.6;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.empty-icon {
  @apply mb-4;
  color: #6b7280;
}

.empty-title {
  @apply text-lg font-semibold mb-2;
  color: #e5e7eb;
}

.empty-text {
  color: #9ca3af;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes completedPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
  }
}

@media (max-width: 768px) {
  .dungeon-list {
    @apply space-y-4;
  }

  .search-bar {
    @apply space-y-3;
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

  .dungeon-stats {
    flex-direction: column;
    gap: 10px;
    padding: 14px;
  }

  .dungeon-grid {
    @apply grid-cols-1 gap-3;
  }

  .dungeon-card {
    padding: 14px;
  }

  .dungeon-header {
    align-items: flex-start;
  }

  .dungeon-name {
    @apply text-sm;
  }

  .description-text {
    @apply text-xs leading-5;
  }

  .dungeon-actions {
    @apply flex-col;
  }

  .action-btn {
    width: 100%;
    padding: 10px 12px;
  }
}
</style>
