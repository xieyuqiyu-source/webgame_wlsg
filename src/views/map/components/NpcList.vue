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
    
    <!-- 统计信息 -->
    <!-- <div class="online-stats">
      <div class="stat-item">
        <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
        </svg>
        <span class="stat-label">NPC城池:</span>
        <span class="stat-value">{{ filteredNpcs.length }}</span>
      </div>
      
      <div class="stat-item" v-if="totalPages > 1">
        <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z"/>
        </svg>
        <span class="stat-label">页码:</span>
        <span class="stat-value">{{ currentPage }} / {{ totalPages }}</span>
      </div>
    </div> -->
    
    <!-- NPC列表 -->
    <div class="npc-list-container">
      <div 
        v-for="npc in paginatedNpcs" 
        :key="npc.id"
        class="npc-list-item"
        @click="handleNpcClick(npc)"
      >
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
        </div>
        
        <!-- 资源信息 -->
        <div class="npc-resources">
          <div class="resource-item">
            <svg class="resource-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" class="text-amber-600"/>
            </svg>
            <span class="resource-value">{{ formatNumber(npc.resources.wood) }}</span>
          </div>
          <div class="resource-item">
            <svg class="resource-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,17H22V19H2V17M3.15,12.95L4,11.47L4.85,12.95L5.81,11L4,9.19L2.19,11L3.15,12.95M9.85,12.95L10.7,11.47L11.55,12.95L12.51,11L10.7,9.19L8.89,11L9.85,12.95M16.55,12.95L17.4,11.47L18.25,12.95L19.21,11L17.4,9.19L15.59,11L16.55,12.95M12,8A2,2 0 0,0 10,6A2,2 0 0,0 8,8A2,2 0 0,0 10,10A2,2 0 0,0 12,8Z" class="text-yellow-600"/>
            </svg>
            <span class="resource-value">{{ formatNumber(npc.resources.soil) }}</span>
          </div>
          <div class="resource-item">
            <svg class="resource-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" class="text-gray-600"/>
            </svg>
            <span class="resource-value">{{ formatNumber(npc.resources.iron) }}</span>
          </div>
          <div class="resource-item">
            <svg class="resource-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" class="text-green-600"/>
            </svg>
            <span class="resource-value">{{ formatNumber(npc.resources.food) }}</span>
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
          <button class="action-btn attack" @click.stop="handleAttack(npc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.92,5H5L6.5,6.5L5,8H6.92L8.42,6.5L6.92,5M13,19H11V17.5L2.5,9H4.42L11,15.58V14H13V19M20.5,2.5L19,4L15.5,0.5L17,2L15.5,3.5L19,7L20.5,5.5L22,7L20.5,8.5L17,5L20.5,2.5Z"/>
            </svg>
            攻击
          </button>
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
  </div>
</template>

<script>
import { formatNumber } from '@/utils/formatters.js'

export default {
  name: 'NpcList',
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
      //=== npcs NPC数据
      npcs: [],
      //=== currentPage 当前页码
      currentPage: 1,
      //=== pageSize 每页显示数量
      pageSize: 12
    }
  },
  computed: {
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
    }
  },
  mounted() {
    //=== 生成随机NPC数据
    this.generateNpcs()
  },
  watch: {
    //=== 监听搜索条件变化，重置分页
    searchQuery() {
      this.resetPagination()
    },
    //=== 监听筛选条件变化，重置分页
    selectedFaction() {
      this.resetPagination()
    }
  },
  methods: {
    //=== generateNpcs 生成随机NPC数据
    generateNpcs() {
      const factions = ['wei', 'shu', 'wu']
      const cityNames = [
        '洛阳', '长安', '成都', '建业', '襄阳', '江陵', '合肥', '濮阳', '徐州', '荆州',
        '益州', '扬州', '兖州', '青州', '冀州', '并州', '凉州', '交州', '幽州', '豫州'
      ]
      
      this.npcs = []
      
      for (let i = 0; i < 12; i++) {
        const faction = factions[Math.floor(Math.random() * factions.length)]
        const name = cityNames[Math.floor(Math.random() * cityNames.length)] + (Math.floor(Math.random() * 999) + 1)
        const level = Math.floor(Math.random() * 20) + 1
        
        this.npcs.push({
          id: `npc_${i + 1}`,
          name,
          faction,
          level,
          resources: {
            wood: Math.floor(Math.random() * 50000) + 10000,
            soil: Math.floor(Math.random() * 50000) + 10000,
            iron: Math.floor(Math.random() * 50000) + 10000,
            food: Math.floor(Math.random() * 50000) + 10000
          },
          armyPower: Math.floor(Math.random() * 100000) + 20000
        })
      }
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
    
    //=== getResourceIcon 获取资源图标组件
    getResourceIcon(resourceType) {
      const icons = {
        wood: 'WoodIcon',
        soil: 'SoilIcon', 
        iron: 'IronIcon',
        food: 'FoodIcon'
      }
      return icons[resourceType] || 'WoodIcon'
    },
    
    //=== formatNumber 格式化数字
    formatNumber,
    
    //=== handleNpcClick 处理NPC点击事件
    handleNpcClick(npc) {
      console.log('点击NPC:', npc)
      // TODO: 显示NPC详情
    },
    
    //=== handleScout 处理侦查事件
    handleScout(npc) {
      console.log('侦查NPC:', npc)
      // TODO: 实现侦查功能
    },
    
    //=== handleAttack 处理攻击事件
    handleAttack(npc) {
      console.log('攻击NPC:', npc)
      // TODO: 实现攻击功能
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
    }
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
  color: rgba(255, 255, 255, 0.6);
}

.search-input {
  @apply w-full pl-10 pr-4 py-3 rounded-lg transition-all duration-200;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(35, 124, 72, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  outline: none;
  border-color: #FFB900;
  box-shadow: 0 0 0 2px rgba(255, 185, 0, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.filter-buttons {
  @apply flex gap-2 flex-wrap;
}

.filter-btn {
  @apply px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(35, 124, 72, 0.3);
  backdrop-filter: blur(10px);
}

.filter-btn:hover {
  background: rgba(255, 185, 0, 0.2);
  border-color: #FFB900;
  transform: translateY(-1px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #FFB900 0%, #FFA000 100%);
  color: #18181B;
  border-color: #FFB900;
  box-shadow: 0 4px 12px rgba(255, 185, 0, 0.3);
}

/* 在线统计样式 */
.online-stats {
  background: rgba(35, 124, 72, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-item {
  @apply flex items-center gap-3;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(35, 124, 72, 0.2);
}

.stat-icon {
  color: #FFB900;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.stat-label {
  @apply text-sm font-medium;
  color: rgba(255, 255, 255, 0.8);
}

.stat-value {
  @apply text-sm font-bold;
  color: #FFB900;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* NPC列表容器样式 */
.npc-list-container {
  @apply space-y-3;
}

.npc-list-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(35, 124, 72, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: white;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 60px;
}

.npc-list-item:hover {
  border-color: rgba(255, 185, 0, 0.4);
  box-shadow: 0 4px 12px rgba(255, 185, 0, 0.1);
}

/* 阵营标识样式 */
.npc-faction {
  @apply flex-shrink-0;
}

.faction-badge {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.npc-name {
  @apply text-base font-bold mb-1 truncate;
  color: #FFB900;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.npc-level {
  @apply text-xs;
  color: rgba(255, 255, 255, 0.7);
}

/* 资源信息样式 */
.npc-resources {
  @apply flex-1 flex items-center gap-4;
}

.resource-item {
  @apply flex items-center gap-1 text-xs;
  color: white;
  font-weight: 500;
}

.resource-icon {
  color: #FFB900;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.resource-value {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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
  color: #FFB900;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.empty-text {
  color: rgba(255, 255, 255, 0.7);
}
</style>