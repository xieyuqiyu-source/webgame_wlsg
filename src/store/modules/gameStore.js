//=== 游戏状态管理 Store

import { defineStore } from 'pinia'
import { 
  BUILDING_TYPES, 
  RESOURCE_TYPES, 
  WAREHOUSE_CONFIG,
  calculateProduction, 
  calculateUpgradeCost, 
  calculateWarehouseCapacity, 
  calculateWarehouseUpgradeCost,
  calculateUpgradeTime,
  calculateWarehouseUpgradeTime
} from '../../config/gameConfig.js'
import { calculateCivilization, getCivilizationLevel } from '../../config/civilizationConfig.js'
import { getUserUUID } from '../../utils/uuid.js'
import { FACTION_TYPES, getFactionConfig } from '../../config/factionConfig.js'

export const useGameStore = defineStore('game', {
  state: () => ({
    //=== 用户唯一标识
    userUUID: getUserUUID(),
    
    //=== 用户信息
    userNickname: '',           // 用户昵称
    userFaction: null,          // 用户阵营
    isFirstTime: true,          // 是否首次进入游戏
    
    //=== 资源数据
    resources: {
      [RESOURCE_TYPES.WOOD]: 100,
      [RESOURCE_TYPES.SOIL]: 100,
      [RESOURCE_TYPES.IRON]: 100,
      [RESOURCE_TYPES.FOOD]: 100
    },
    
    //=== 建筑等级数据 - 每种资源类型5个独立建筑
    buildings: {
      [BUILDING_TYPES.WOOD_MILL]: [1, 0, 0, 0, 0], // 5个木材厂，第一个1级，其余0级
      [BUILDING_TYPES.SOIL_MINE]: [1, 0, 0, 0, 0], // 5个泥土矿，第一个1级，其余0级
      [BUILDING_TYPES.IRON_MINE]: [1, 0, 0, 0, 0], // 5个铁矿场，第一个1级，其余0级
      [BUILDING_TYPES.FARM]: [1, 0, 0, 0, 0]       // 5个农场，第一个1级，其余0级
    },
    
    //=== 建筑升级进度 - 每种资源类型5个独立建筑的升级状态
    buildingUpgrades: {
      [BUILDING_TYPES.WOOD_MILL]: [null, null, null, null, null],
      [BUILDING_TYPES.SOIL_MINE]: [null, null, null, null, null],
      [BUILDING_TYPES.IRON_MINE]: [null, null, null, null, null],
      [BUILDING_TYPES.FARM]: [null, null, null, null, null]
    },
    
    //=== 仓库等级
    warehouseLevel: 1,
    
    //=== 仓库升级进度
    warehouseUpgrade: null,
    
    //=== 游戏状态
    lastUpdateTime: Date.now(),
    isPaused: false,
    
    //=== 累积产出缓存（用于处理小数产出）
    accumulatedProduction: {
      [RESOURCE_TYPES.WOOD]: 0,
      [RESOURCE_TYPES.SOIL]: 0,
      [RESOURCE_TYPES.IRON]: 0,
      [RESOURCE_TYPES.FOOD]: 0
    },
    
    //=== 文明度计算缓存（性能优化）
    _civilizationCache: {
      value: null,
      lastCalculatedAt: 0,
      cacheTimeout: 1000 // 缓存1秒
    }
  }),
  
  getters: {
    /**
     * 获取每小时总产出
     */
    hourlyProduction: (state) => {
      const production = {}
      
      Object.keys(RESOURCE_TYPES).forEach(key => {
        production[RESOURCE_TYPES[key]] = 0
      })
      
      Object.keys(state.buildings).forEach(buildingType => {
        const buildingLevels = state.buildings[buildingType]
        
        // 遍历该类型的所有5个建筑
        buildingLevels.forEach(level => {
          if (level > 0) { // 只计算已建造的建筑（等级大于0）
            const productionAmount = calculateProduction(buildingType, level)
            
            // 根据建筑类型确定产出的资源类型
            if (buildingType === BUILDING_TYPES.WOOD_MILL) {
              production[RESOURCE_TYPES.WOOD] += productionAmount
            } else if (buildingType === BUILDING_TYPES.SOIL_MINE) {
              production[RESOURCE_TYPES.SOIL] += productionAmount
            } else if (buildingType === BUILDING_TYPES.IRON_MINE) {
              production[RESOURCE_TYPES.IRON] += productionAmount
            } else if (buildingType === BUILDING_TYPES.FARM) {
              production[RESOURCE_TYPES.FOOD] += productionAmount
            }
          }
        })
      })
      
      return production
    },
    
    /**
     * 获取仓库容量
     */
    warehouseCapacity: (state) => {
      return calculateWarehouseCapacity(state.warehouseLevel)
    },
    
    /**
     * 检查资源是否达到仓库上限
     */
    isResourceFull: (state) => (resourceType) => {
      const capacity = calculateWarehouseCapacity(state.warehouseLevel)
      return state.resources[resourceType] >= capacity
    },
    
    /**
     * 检查建筑是否正在升级
     */
    isBuildingUpgrading: (state) => (buildingType, buildingIndex = 0) => {
      return state.buildingUpgrades[buildingType][buildingIndex] !== null
    },
    
    /**
     * 检查是否有足够资源进行升级
     */
    canUpgradeBuilding: (state) => (buildingType, buildingIndex = 0) => {
      // 如果正在升级，则不能再次升级
      if (state.buildingUpgrades[buildingType][buildingIndex] !== null) {
        return false
      }
      
      // 检查建筑是否已达到最大等级（10级）
      if (state.buildings[buildingType][buildingIndex] >= 10) {
        return false
      }
      
      const cost = calculateUpgradeCost(buildingType, state.buildings[buildingType][buildingIndex])
      return Object.keys(cost).every(resource => {
        return state.resources[resource] >= cost[resource]
      })
    },
    
    /**
     * 检查仓库是否正在升级
     */
    isWarehouseUpgrading: (state) => {
      return state.warehouseUpgrade !== null
    },
    
    /**
     * 检查是否可以升级仓库
     */
    canUpgradeWarehouse: (state) => {
      // 检查是否正在升级
      if (state.warehouseUpgrade !== null) {
        return false
      }
      
      // 检查是否已达到最大等级
      if (state.warehouseLevel >= WAREHOUSE_CONFIG.maxLevel) {
        return false
      }
      
      const cost = calculateWarehouseUpgradeCost(state.warehouseLevel)
      return Object.keys(cost).every(resource => {
        return state.resources[resource] >= cost[resource]
      })
    },

    /**
     * 计算城池文明度
     * 基于总产量和建筑等级的综合评分
     */
    citycivilization: (state) => {
      const now = Date.now()
      
      // 检查缓存是否有效
      if (state._civilizationCache.value !== null && 
          (now - state._civilizationCache.lastCalculatedAt) < state._civilizationCache.cacheTimeout) {
        return state._civilizationCache.value
      }
      
      // 使用配置文件计算文明度
      const civilization = calculateCivilization(state.buildings, state.warehouseLevel)
      
      // 更新缓存
      state._civilizationCache.value = civilization
      state._civilizationCache.lastCalculatedAt = now
      
      return civilization
    },

    /**
     * 获取文明度等级描述
     */
    civilizationLevel: (state) => {
      const civilization = calculateCivilization(state.buildings, state.warehouseLevel)
      return getCivilizationLevel(civilization)
    }
  },
  
  actions: {
    //=== 清除文明度缓存
    _clearCivilizationCache() {
      this._civilizationCache.value = null
      this._civilizationCache.lastCalculatedAt = 0
    },
    
    /**
     * 更新资源产出
     */
    updateResources() {
      if (this.isPaused) return
      
      const now = Date.now()
      const timeDiff = now - this.lastUpdateTime
      const seconds = timeDiff / 1000 // 转换为秒
      
      
      if (seconds >= 0.1) {
        const production = this.hourlyProduction
        const capacity = this.warehouseCapacity
        
        
        Object.keys(production).forEach(resourceType => {
          // 按秒计算产出：每小时产出 / 3600秒 * 经过的秒数
          const producedFloat = (production[resourceType] / 3600) * seconds
          
          // 累积小数产出
          this.accumulatedProduction[resourceType] += producedFloat
          
          // 当累积产出大于等于1时，转换为整数资源
          const integerProduced = Math.floor(this.accumulatedProduction[resourceType])
          
          if (integerProduced > 0) {
            const oldAmount = this.resources[resourceType]
            const newAmount = Math.min(this.resources[resourceType] + integerProduced, capacity)
            
            // 确保触发响应式更新
            this.$patch((state) => {
              state.resources[resourceType] = newAmount
              // 减去已转换的整数部分
              state.accumulatedProduction[resourceType] -= integerProduced
            })
            
          } else {
            // console.log(`${resourceType}: 累积中... (${this.accumulatedProduction[resourceType].toFixed(3)})`)
          }
        })
        
        this.lastUpdateTime = now
      } else {
        console.log('时间差不足0.1秒，跳过更新')
      }
    },
    
    /**
     * 升级建筑
     */
    upgradeBuilding(buildingType, buildingIndex = 0) {
      if (!this.canUpgradeBuilding(buildingType, buildingIndex)) {
        return false
      }
      
      const cost = calculateUpgradeCost(buildingType, this.buildings[buildingType][buildingIndex])
      const upgradeTime = calculateUpgradeTime(buildingType, this.buildings[buildingType][buildingIndex])
      
      // 扣除资源
      Object.keys(cost).forEach(resource => {
        this.resources[resource] -= cost[resource]
      })
      
      // 开始升级进度
      const startTime = Date.now()
      this.buildingUpgrades[buildingType][buildingIndex] = {
        startTime,
        duration: upgradeTime * 1000, // 转换为毫秒
        targetLevel: this.buildings[buildingType][buildingIndex] + 1
      }
      
      // 设置定时器完成升级
      setTimeout(() => {
        this.completeBuildingUpgrade(buildingType, buildingIndex)
      }, upgradeTime * 1000)
      
      return true
    },
    
    /**
     * 完成建筑升级
     */
    completeBuildingUpgrade(buildingType, buildingIndex = 0) {
      const upgrade = this.buildingUpgrades[buildingType][buildingIndex]
      if (!upgrade) return
      
      // 升级建筑等级
      this.buildings[buildingType][buildingIndex] = upgrade.targetLevel
      
      // 清除升级进度
      this.buildingUpgrades[buildingType][buildingIndex] = null
      
      // 清除文明度缓存
      this._clearCivilizationCache()
    },
    
    /**
     * 升级仓库
     */
    upgradeWarehouse() {
      if (!this.canUpgradeWarehouse) {
        return false
      }
      
      const cost = calculateWarehouseUpgradeCost(this.warehouseLevel)
      const upgradeTime = calculateWarehouseUpgradeTime(this.warehouseLevel)
      
      // 扣除资源
      Object.keys(cost).forEach(resource => {
        this.resources[resource] -= cost[resource]
      })
      
      // 开始升级进度
      const startTime = Date.now()
      this.warehouseUpgrade = {
        startTime,
        duration: upgradeTime * 1000, // 转换为毫秒
        targetLevel: this.warehouseLevel + 1
      }
      
      // 设置定时器完成升级
      setTimeout(() => {
        this.completeWarehouseUpgrade()
      }, upgradeTime * 1000)
      
      return true
    },
    
    /**
     * 完成仓库升级
     */
    completeWarehouseUpgrade() {
      const upgrade = this.warehouseUpgrade
      if (!upgrade) return
      
      // 升级仓库等级
      this.warehouseLevel = upgrade.targetLevel
      
      // 清除升级进度
      this.warehouseUpgrade = null
      
      // 清除文明度缓存
      this._clearCivilizationCache()
    },
    
    /**
     * 暂停/恢复游戏
     */
    togglePause() {
      this.isPaused = !this.isPaused
      if (!this.isPaused) {
        this.lastUpdateTime = Date.now()
      }
    },
    
    /**
     * 设置用户信息
     */
    setUserInfo(nickname, faction) {
      this.userNickname = nickname
      this.userFaction = faction
      this.isFirstTime = false
      this.saveGame() // 立即保存用户信息
    },
    
    /**
     * 手动保存游戏数据到本地存储
     */
    saveGame() {
      const gameData = {
        userUUID: this.userUUID,
        userNickname: this.userNickname,
        userFaction: this.userFaction,
        isFirstTime: this.isFirstTime,
        resources: this.resources,
        buildings: this.buildings,
        buildingUpgrades: this.buildingUpgrades,
        warehouseLevel: this.warehouseLevel,
        warehouseUpgrade: this.warehouseUpgrade,
        lastUpdateTime: this.lastUpdateTime,
        isPaused: this.isPaused,
        accumulatedProduction: this.accumulatedProduction
      }
      
      localStorage.setItem('wlsg_game_data', JSON.stringify(gameData))
    },
    
    /**
     * 从本地存储加载游戏数据
     */
    loadGame() {
      const savedData = localStorage.getItem('wlsg_game_data')
      if (savedData) {
        try {
          const gameData = JSON.parse(savedData)
          this.resources = { ...this.resources, ...gameData.resources }
          
          // 处理建筑数据兼容性（旧版本可能是单一值，新版本是数组）
          if (gameData.buildings) {
            Object.keys(gameData.buildings).forEach(buildingType => {
              const buildingData = gameData.buildings[buildingType]
              if (Array.isArray(buildingData)) {
                // 新版本数据结构（数组）
                this.buildings[buildingType] = buildingData
              } else {
                // 旧版本数据结构（单一值），转换为数组
                this.buildings[buildingType] = [buildingData || 0, 0, 0, 0, 0]
              }
            })
          }
          
          // 处理建筑升级数据兼容性
          if (gameData.buildingUpgrades) {
            Object.keys(gameData.buildingUpgrades).forEach(buildingType => {
              const upgradeData = gameData.buildingUpgrades[buildingType]
              if (Array.isArray(upgradeData)) {
                // 新版本数据结构（数组）
                this.buildingUpgrades[buildingType] = upgradeData
              } else {
                // 旧版本数据结构（单一值），转换为数组
                this.buildingUpgrades[buildingType] = [upgradeData, null, null, null, null]
              }
            })
          }
          
          // 处理用户信息
          if (gameData.userUUID) {
            this.userUUID = gameData.userUUID
          }
          if (gameData.userNickname) {
            this.userNickname = gameData.userNickname
          }
          if (gameData.userFaction) {
            this.userFaction = gameData.userFaction
          }
          if (gameData.hasOwnProperty('isFirstTime')) {
            this.isFirstTime = gameData.isFirstTime
          }
          
          this.warehouseLevel = gameData.warehouseLevel || 1
          this.warehouseUpgrade = gameData.warehouseUpgrade || null
          this.lastUpdateTime = gameData.lastUpdateTime || Date.now()
          this.isPaused = gameData.isPaused || false
          this.accumulatedProduction = { ...this.accumulatedProduction, ...gameData.accumulatedProduction }
          
          // 恢复升级定时器
          this.restoreUpgradeTimers()
        } catch (error) {
          console.error('加载游戏数据失败:', error)
        }
      }
    },
    
    /**
     * 恢复升级定时器
     */
    restoreUpgradeTimers() {
      const now = Date.now()
      
      // 恢复建筑升级定时器
      Object.keys(this.buildingUpgrades).forEach(buildingType => {
        const upgrades = this.buildingUpgrades[buildingType]
        upgrades.forEach((upgrade, buildingIndex) => {
          if (upgrade) {
            const elapsed = now - upgrade.startTime
            const remaining = upgrade.duration - elapsed
            
            if (remaining <= 0) {
              // 升级已完成
              this.completeBuildingUpgrade(buildingType, buildingIndex)
            } else {
              // 设置剩余时间的定时器
              setTimeout(() => {
                this.completeBuildingUpgrade(buildingType, buildingIndex)
              }, remaining)
            }
          }
        })
      })
      
      // 恢复仓库升级定时器
      if (this.warehouseUpgrade) {
        const elapsed = now - this.warehouseUpgrade.startTime
        const remaining = this.warehouseUpgrade.duration - elapsed
        
        if (remaining <= 0) {
          // 升级已完成
          this.completeWarehouseUpgrade()
        } else {
          // 设置剩余时间的定时器
          setTimeout(() => {
            this.completeWarehouseUpgrade()
          }, remaining)
        }
      }
    },
    
    /**
     * 重置游戏数据（包含用户信息）
     */
    resetGame() {
      // 重置用户信息
      this.userUUID = getUserUUID() // 生成新的UUID
      this.userNickname = ''
      this.userFaction = null
      this.isFirstTime = true
      
      // 重置资源为初始值
      this.resources = {
        [RESOURCE_TYPES.WOOD]: 100,
        [RESOURCE_TYPES.SOIL]: 100,
        [RESOURCE_TYPES.IRON]: 100,
        [RESOURCE_TYPES.FOOD]: 100
      }
      // 重置建筑 - 每种资源类型的第一个建筑为1级，其余为0级
      this.buildings = {
        [BUILDING_TYPES.WOOD_MILL]: [1, 0, 0, 0, 0],
        [BUILDING_TYPES.SOIL_MINE]: [1, 0, 0, 0, 0],
        [BUILDING_TYPES.IRON_MINE]: [1, 0, 0, 0, 0],
        [BUILDING_TYPES.FARM]: [1, 0, 0, 0, 0]
      }
      // 清空建筑升级状态
      this.buildingUpgrades = {
        [BUILDING_TYPES.WOOD_MILL]: [null, null, null, null, null],
        [BUILDING_TYPES.SOIL_MINE]: [null, null, null, null, null],
        [BUILDING_TYPES.IRON_MINE]: [null, null, null, null, null],
        [BUILDING_TYPES.FARM]: [null, null, null, null, null]
      }
      // 重置仓库等级为1（最低等级）
      this.warehouseLevel = 1
      this.warehouseUpgrade = null
      this.lastUpdateTime = Date.now()
      this.isPaused = false
      // 清空累积生产数据
      this.accumulatedProduction = {
        [RESOURCE_TYPES.WOOD]: 0,
        [RESOURCE_TYPES.SOIL]: 0,
        [RESOURCE_TYPES.IRON]: 0,
        [RESOURCE_TYPES.FOOD]: 0
      }
      
      // 清除本地存储的游戏数据
      localStorage.removeItem('wlsg_game_data')
    }
  }
})