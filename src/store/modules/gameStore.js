//=== 游戏状态管理 Store

import { defineStore } from 'pinia'
import { 
  BUILDING_TYPES, 
  RESOURCE_TYPES, 
  BUILDING_CONFIG,
  WAREHOUSE_CONFIG,
  calculateProduction, 
  calculateUpgradeCost, 
  calculateWarehouseCapacity, 
  calculateWarehouseUpgradeCost,
  calculateUpgradeTime,
  calculateWarehouseUpgradeTime
} from '../../config/gameConfig.js'
import { calculateCivilization, getCivilizationLevel } from '../../config/civilizationConfig.js'
import { getUserUUID, setStoredUserUUID } from '../../utils/uuid.js'
import { createGeneralProgress, getGeneralById, getGeneralExpForNextLevel } from '../../config/generalConfig.js'
import { resolveGeneralBonuses } from '../../domain/general/generalBonusResolver.js'
import { useNotificationStore } from './notificationStore.js'
import { useMilitaryStore } from './militaryStore.js'
import { useNpcStore } from './npcStore.js'
import { clearUnifiedGameData, createUnifiedSavePayload, loadUnifiedGameData, normalizeSavePayload, saveUnifiedGameData } from '../../utils/saveSystem.js'

export const useGameStore = defineStore('game', {
  state: () => ({
    //=== 用户唯一标识
    userUUID: getUserUUID(),
    
    //=== 用户信息
    userNickname: '',           // 用户昵称
    userFaction: null,          // 用户阵营
    generalProgress: null,      // 当前将领成长数据
    isFirstTime: true,          // 是否首次进入游戏
    
    //=== 资源数据 - 初始化为满仓状态（1级仓库容量4800）
    resources: {
      [RESOURCE_TYPES.WOOD]: 4800,
      [RESOURCE_TYPES.SOIL]: 4800,
      [RESOURCE_TYPES.IRON]: 4800,
      [RESOURCE_TYPES.FOOD]: 4800
    },
    
    //=== 金币数据
    coins: 1000, // 玩家金币
    
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
    },
    
    //=== 生产力加速状态
    productionBoost: {
      isActive: false,        // 是否正在加速
      multiplier: 1.4,        // 加速倍数（40%加成）
      startTime: null,        // 加速开始时间
      duration: 0,            // 加速持续时间（毫秒）
      endTime: null           // 加速结束时间
    },
    
    //=== 仓库容量加成状态
    warehouseBoost: {
      isActive: false,        // 是否正在加成
      multiplier: 2.0,        // 容量加成倍数（100%加成）
      startTime: null,        // 加成开始时间
      duration: 24 * 60 * 60 * 1000, // 加成持续时间（24小时，毫秒）
      endTime: null           // 加成结束时间
    }
  }),
  
  getters: {
    /**
     * 获取每小时总产出（包含加速效果）
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
            // 传入玩家阵营信息以应用经济加成
            let productionAmount = calculateProduction(buildingType, level, state.userFaction)
            productionAmount *= resolveGeneralBonuses(state.generalProgress).economyMultiplier
            
            // 应用生产力加速效果
            if (state.productionBoost.isActive && state.productionBoost.endTime > Date.now()) {
              productionAmount *= state.productionBoost.multiplier
            }
            
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
     * 获取仓库容量（包含加成效果）
     */
    warehouseCapacity: (state) => {
      let baseCapacity = calculateWarehouseCapacity(state.warehouseLevel)
      
      // 应用仓库容量加成效果
      if (state.warehouseBoost.isActive && state.warehouseBoost.endTime > Date.now()) {
        baseCapacity = Math.floor(baseCapacity * state.warehouseBoost.multiplier)
      }
      
      return baseCapacity
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
      
      // 检查建筑是否已达到最大等级
      const config = BUILDING_CONFIG[buildingType]
      const maxLevel = config?.maxLevel || config?.productionByLevel?.length - 1 || 10
      if (state.buildings[buildingType][buildingIndex] >= maxLevel) {
        return false
      }
      
      const cost = calculateUpgradeCost(buildingType, state.buildings[buildingType][buildingIndex])
      return Object.keys(cost).every(resource => {
        return state.resources[resource] >= cost[resource]
      })
    },

    hasUpgradeableResourceBuilding() {
      return [
        BUILDING_TYPES.WOOD_MILL,
        BUILDING_TYPES.SOIL_MINE,
        BUILDING_TYPES.IRON_MINE,
        BUILDING_TYPES.FARM
      ].some(buildingType => (
        this.buildings[buildingType].some((_, buildingIndex) => (
          this.canUpgradeBuilding(buildingType, buildingIndex)
        ))
      ))
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
    },
    
    army: () => useMilitaryStore().army,

    recruitmentQueue: () => useMilitaryStore().recruitmentQueue,

    recruitmentConfig: () => useMilitaryStore().recruitmentConfig,

    totalArmyCount: () => useMilitaryStore().totalArmyCount,

    isRecruiting: () => useMilitaryStore().isRecruiting,

    getActualTrainTime: () => useMilitaryStore().getActualTrainTime,

    selectedGeneral: (state) => getGeneralById(state.generalProgress?.id),

    generalBonuses: (state) => resolveGeneralBonuses(state.generalProgress),

    generalExpForNextLevel: (state) => getGeneralExpForNextLevel(state.generalProgress?.level || 1),
    
    /**
     * 检查生产力加速是否激活
     */
    isProductionBoostActive: (state) => {
      return state.productionBoost.isActive && state.productionBoost.endTime > Date.now()
    },
    
    /**
     * 获取生产力加速剩余时间（秒）
     */
    productionBoostTimeLeft: (state) => {
      if (!state.productionBoost.isActive || !state.productionBoost.endTime) {
        return 0
      }
      const remaining = Math.max(0, state.productionBoost.endTime - Date.now())
      return Math.ceil(remaining / 1000)
    },
    
    /**
     * 检查仓库容量加成是否激活
     */
    isWarehouseBoostActive: (state) => {
      return state.warehouseBoost.isActive && state.warehouseBoost.endTime > Date.now()
    },
    
    /**
     * 获取仓库容量加成剩余时间（秒）
     */
    warehouseBoostTimeLeft: (state) => {
      if (!state.warehouseBoost.isActive || !state.warehouseBoost.endTime) {
        return 0
      }
      const remaining = Math.max(0, state.warehouseBoost.endTime - Date.now())
      return Math.ceil(remaining / 1000)
    },
    
    /**
     * 计算生产力加速费用（基于持续时间）
     */
    calculateBoostCost: (state) => (hours) => {
      // 基础费用：每小时100金币
      const baseCostPerHour = 100
      return baseCostPerHour * hours
    }
  },
  
  actions: {
    //=== 清除文明度缓存
    _clearCivilizationCache() {
      this._civilizationCache.value = null
      this._civilizationCache.lastCalculatedAt = 0
    },

    setArmy(army) {
      useMilitaryStore().setArmy(army)
      this.saveGame()
    },

    consumeArmyUnits(unitId, count) {
      const success = useMilitaryStore().consumeUnits(unitId, count)
      if (success) {
        this.saveGame()
      }
      return success
    },

    storeLootedResources(resources = {}) {
      const capacity = this.warehouseCapacity
      const stored = {}
      const overflow = {}

      Object.entries(resources).forEach(([resource, amount]) => {
        const incoming = Math.max(0, amount || 0)
        const current = this.resources[resource] || 0
        const accepted = Math.max(0, Math.min(incoming, capacity - current))

        this.resources[resource] = current + accepted
        stored[resource] = accepted
        overflow[resource] = incoming - accepted
      })

      this.saveGame()

      return { stored, overflow }
    },
    
    /**
     * 更新资源产出
     */
    updateResources() {
      if (this.isPaused) return
      
      const now = Date.now()
      const timeDiff = now - this.lastUpdateTime
      const seconds = timeDiff / 1000 // 转换为秒
      
      // 离线收益计算
      if (seconds > 5) { // 如果离线时间超过5秒，显示离线收益信息
        console.log(`离线收益: 离线了${(seconds/60).toFixed(1)}分钟，获得资源收益`)
      }
      
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
            
            // 检查是否达到仓库上限并发送通知
            if (oldAmount < capacity && newAmount >= capacity) {
              const notificationStore = useNotificationStore()
              const resourceNames = {
                [RESOURCE_TYPES.WOOD]: '木材',
                [RESOURCE_TYPES.SOIL]: '泥土',
                [RESOURCE_TYPES.IRON]: '铁矿',
                [RESOURCE_TYPES.FOOD]: '粮食'
              }
              const resourceName = resourceNames[resourceType] || resourceType
              notificationStore.addResourceFullNotification(resourceName)
            }
            
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
        // 检查具体失败原因并发送通知
        if (this.buildingUpgrades[buildingType][buildingIndex] !== null) {
          const notificationStore = useNotificationStore()
          notificationStore.addInfoNotification('升级进行中', '该建筑正在升级中，请等待完成', 3000)
        } else {
          const config = BUILDING_CONFIG[buildingType]
          const maxLevel = config?.maxLevel || config?.productionByLevel?.length - 1 || 10
          if (this.buildings[buildingType][buildingIndex] >= maxLevel) {
            const notificationStore = useNotificationStore()
            notificationStore.addInfoNotification('已达最高等级', '该建筑已达到最高等级', 3000)
          } else {
            const notificationStore = useNotificationStore()
            const buildingNames = {
              [BUILDING_TYPES.WOOD_MILL]: '伐木场',
              [BUILDING_TYPES.SOIL_MINE]: '泥土矿',
              [BUILDING_TYPES.IRON_MINE]: '铁矿场',
              [BUILDING_TYPES.FARM]: '农场'
            }
            const buildingName = buildingNames[buildingType] || '建筑'
            notificationStore.addResourceInsufficientNotification(`升级${buildingName}`)
          }
        }
        return false
      }
      
      const cost = calculateUpgradeCost(buildingType, this.buildings[buildingType][buildingIndex])
      const upgradeTime = Math.floor(
        calculateUpgradeTime(buildingType, this.buildings[buildingType][buildingIndex]) *
        this.generalBonuses.buildingTimeMultiplier
      )
      
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
     * 按短板优先策略批量升级资源建筑
     */
    upgradeResourceBuildingsBalanced() {
      const notificationStore = useNotificationStore()
      const resourceOrder = [
        RESOURCE_TYPES.WOOD,
        RESOURCE_TYPES.SOIL,
        RESOURCE_TYPES.IRON,
        RESOURCE_TYPES.FOOD
      ]
      const resourceBuildingTypes = [
        BUILDING_TYPES.WOOD_MILL,
        BUILDING_TYPES.SOIL_MINE,
        BUILDING_TYPES.IRON_MINE,
        BUILDING_TYPES.FARM
      ]
      const buildingTypeToResource = {
        [BUILDING_TYPES.WOOD_MILL]: RESOURCE_TYPES.WOOD,
        [BUILDING_TYPES.SOIL_MINE]: RESOURCE_TYPES.SOIL,
        [BUILDING_TYPES.IRON_MINE]: RESOURCE_TYPES.IRON,
        [BUILDING_TYPES.FARM]: RESOURCE_TYPES.FOOD
      }
      const startedUpgrades = []

      while (true) {
        const capacity = Math.max(this.warehouseCapacity, 1)
        const candidates = resourceBuildingTypes.flatMap(buildingType => (
          this.buildings[buildingType]
            .map((level, buildingIndex) => ({
              buildingType,
              buildingIndex,
              level,
              resourceType: buildingTypeToResource[buildingType]
            }))
            .filter(candidate => this.canUpgradeBuilding(candidate.buildingType, candidate.buildingIndex))
        ))

        if (candidates.length === 0) {
          break
        }

        candidates.sort((left, right) => {
          const leftStockRatio = this.resources[left.resourceType] / capacity
          const rightStockRatio = this.resources[right.resourceType] / capacity
          if (leftStockRatio !== rightStockRatio) return leftStockRatio - rightStockRatio

          const leftProduction = this.hourlyProduction[left.resourceType]
          const rightProduction = this.hourlyProduction[right.resourceType]
          if (leftProduction !== rightProduction) return leftProduction - rightProduction

          if (left.level !== right.level) return left.level - right.level

          const leftResourceOrder = resourceOrder.indexOf(left.resourceType)
          const rightResourceOrder = resourceOrder.indexOf(right.resourceType)
          if (leftResourceOrder !== rightResourceOrder) return leftResourceOrder - rightResourceOrder

          return left.buildingIndex - right.buildingIndex
        })

        const nextUpgrade = candidates[0]
        if (!this.upgradeBuilding(nextUpgrade.buildingType, nextUpgrade.buildingIndex)) {
          break
        }

        startedUpgrades.push(nextUpgrade)
      }

      if (startedUpgrades.length === 0) {
        notificationStore.addInfoNotification('暂无可升级建筑', '当前资源不足，或所有资源建筑都在升级中', 3000)
      } else {
        notificationStore.addSuccessNotification(
          '一键升级已启动',
          `已开始升级 ${startedUpgrades.length} 座资源建筑`,
          3500
        )
      }

      return startedUpgrades.length
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
      
      // 发送升级完成通知
      const notificationStore = useNotificationStore()
      const buildingNames = {
        [BUILDING_TYPES.WOOD_MILL]: '伐木场',
        [BUILDING_TYPES.SOIL_MINE]: '泥土矿',
        [BUILDING_TYPES.IRON_MINE]: '铁矿场',
        [BUILDING_TYPES.FARM]: '农场'
      }
      const buildingName = buildingNames[buildingType] || '建筑'
      notificationStore.addBuildingUpgradeCompleteNotification(
         `${buildingName}(${buildingIndex + 1})`,
         upgrade.targetLevel
       )
     },
    
    /**
     * 升级仓库
     */
    upgradeWarehouse() {
      if (!this.canUpgradeWarehouse) {
        // 检查具体失败原因并发送通知
        const notificationStore = useNotificationStore()
        if (this.warehouseUpgrade !== null) {
          notificationStore.addInfoNotification('升级进行中', '仓库正在升级中，请等待完成', 3000)
        } else if (this.warehouseLevel >= WAREHOUSE_CONFIG.maxLevel) {
          notificationStore.addInfoNotification('已达最高等级', '仓库已达到最高等级', 3000)
        } else {
          notificationStore.addResourceInsufficientNotification('升级仓库')
        }
        return false
      }
      
      const cost = calculateWarehouseUpgradeCost(this.warehouseLevel)
      const upgradeTime = Math.floor(
        calculateWarehouseUpgradeTime(this.warehouseLevel) *
        this.generalBonuses.buildingTimeMultiplier
      )
      
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
      
      // 发送仓库升级完成通知
      const notificationStore = useNotificationStore()
      notificationStore.addWarehouseUpgradeCompleteNotification(upgrade.targetLevel)
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
    setUserInfo(nickname, faction, generalId) {
      this.userNickname = nickname
      this.userFaction = faction
      this.generalProgress = createGeneralProgress(generalId)
      this.isFirstTime = false
      this.saveGame() // 立即保存用户信息
    },

    getGameSaveData() {
      return {
        userUUID: this.userUUID,
        userNickname: this.userNickname,
        userFaction: this.userFaction,
        citycivilization: this.citycivilization,
        civilizationLevel: this.civilizationLevel?.level || '',
        generalProgress: this.generalProgress,
        isFirstTime: this.isFirstTime,
        resources: this.resources,
        coins: this.coins,
        buildings: this.buildings,
        buildingUpgrades: this.buildingUpgrades,
        warehouseLevel: this.warehouseLevel,
        warehouseUpgrade: this.warehouseUpgrade,
        lastUpdateTime: this.lastUpdateTime,
        isPaused: this.isPaused,
        accumulatedProduction: this.accumulatedProduction,
        productionBoost: this.productionBoost,
        warehouseBoost: this.warehouseBoost
      }
    },

    applyGameSaveData(gameData = {}) {
      this.resources = { ...this.resources, ...(gameData.resources || {}) }
      
      if (gameData.buildings) {
        Object.keys(gameData.buildings).forEach(buildingType => {
          const buildingData = gameData.buildings[buildingType]
          if (Array.isArray(buildingData)) {
            this.buildings[buildingType] = buildingData
          } else {
            this.buildings[buildingType] = [buildingData || 0, 0, 0, 0, 0]
          }
        })
      }

      if (gameData.buildingUpgrades) {
        Object.keys(gameData.buildingUpgrades).forEach(buildingType => {
          const upgradeData = gameData.buildingUpgrades[buildingType]
          if (Array.isArray(upgradeData)) {
            this.buildingUpgrades[buildingType] = upgradeData
          } else {
            this.buildingUpgrades[buildingType] = [upgradeData, null, null, null, null]
          }
        })
      }

      if (gameData.userUUID) {
        this.userUUID = gameData.userUUID
        setStoredUserUUID(gameData.userUUID)
      }
      if (gameData.userNickname) {
        this.userNickname = gameData.userNickname
      }
      if (gameData.userFaction) {
        this.userFaction = gameData.userFaction
      }
      if (gameData.generalProgress) {
        this.generalProgress = gameData.generalProgress
      }
      if (gameData.hasOwnProperty('isFirstTime')) {
        this.isFirstTime = gameData.isFirstTime
      }
      if (gameData.hasOwnProperty('coins')) {
        this.coins = gameData.coins
      }

      this.warehouseLevel = gameData.warehouseLevel || 1
      this.warehouseUpgrade = gameData.warehouseUpgrade || null
      this.lastUpdateTime = gameData.lastUpdateTime || Date.now()
      this.isPaused = gameData.isPaused || false
      this.accumulatedProduction = { ...this.accumulatedProduction, ...(gameData.accumulatedProduction || {}) }

      if (gameData.productionBoost) {
        this.productionBoost = { ...this.productionBoost, ...gameData.productionBoost }
      }

      if (gameData.warehouseBoost) {
        this.warehouseBoost = { ...this.warehouseBoost, ...gameData.warehouseBoost }
      }
    },

    buildSavePayload() {
      return createUnifiedSavePayload({
        game: this.getGameSaveData(),
        military: useMilitaryStore().getMilitarySaveData(),
        npc: useNpcStore().getNpcSaveData()
      })
    },

    applySavePayload(savePayload) {
      const militaryStore = useMilitaryStore()
      const npcStore = useNpcStore()

      this.applyGameSaveData(savePayload.game)
      militaryStore.setMilitaryState(savePayload.military)
      npcStore.applyNpcSaveData(savePayload.npc)
    },

    exportSaveData() {
      return this.buildSavePayload()
    },

    importSaveData(rawSaveData) {
      const normalizedSave = normalizeSavePayload(rawSaveData)
      this.applySavePayload(normalizedSave)
      this.restoreUpgradeTimers()
      useMilitaryStore().restoreRecruitmentTimers()
      this.restoreProductionBoostTimer()
      this.restoreWarehouseBoostTimer()
      this.saveGame()
      return normalizedSave
    },
    
    /**
     * 手动保存游戏数据到本地存储
     */
    saveGame() {
      saveUnifiedGameData(this.buildSavePayload())
    },
    
    /**
     * 从本地存储加载游戏数据
     */
    loadGame() {
      const savePayload = loadUnifiedGameData()
      if (savePayload) {
        try {
          this.applySavePayload(savePayload)
          this.saveGame()
          
          // 恢复升级定时器
          this.restoreUpgradeTimers()
          
          // 恢复征兵定时器
          useMilitaryStore().restoreRecruitmentTimers()
          
          // 恢复生产力加速定时器
          this.restoreProductionBoostTimer()
          
          // 恢复仓库容量加成定时器
          this.restoreWarehouseBoostTimer()
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
     * 恢复生产力加速定时器
     */
    restoreProductionBoostTimer() {
      if (this.productionBoost.isActive && this.productionBoost.endTime) {
        const now = Date.now()
        const remaining = this.productionBoost.endTime - now
        
        if (remaining <= 0) {
          // 加速已过期，停止加速
          this.stopProductionBoost()
        } else {
          // 设置剩余时间的定时器
          setTimeout(() => {
            this.stopProductionBoost()
          }, remaining)
        }
      }
    },
    
    /**
     * 恢复仓库容量加成定时器
     */
    restoreWarehouseBoostTimer() {
      if (this.warehouseBoost.isActive && this.warehouseBoost.endTime) {
        const now = Date.now()
        const remaining = this.warehouseBoost.endTime - now
        
        if (remaining <= 0) {
          // 加成已过期，停止加成
          this.stopWarehouseBoost()
        } else {
          // 设置剩余时间的定时器
          setTimeout(() => {
            this.stopWarehouseBoost()
          }, remaining)
        }
      }
    },
    
    recruitUnits(unitId, count) {
      return useMilitaryStore().recruitUnits(unitId, count)
    },

    completeRecruitment(taskId) {
      return useMilitaryStore().completeRecruitment(taskId)
    },

    accelerateRecruitment(taskId) {
      return useMilitaryStore().accelerateRecruitment(taskId)
    },

    addGeneralExperience(amount) {
      if (!this.generalProgress || amount <= 0) return false

      this.generalProgress.exp += Math.floor(amount)
      let leveledUp = false

      while (this.generalProgress.exp >= this.generalExpForNextLevel) {
        this.generalProgress.exp -= this.generalExpForNextLevel
        this.generalProgress.level += 1
        this.generalProgress.unspentPoints += 2
        leveledUp = true
      }

      if (leveledUp) {
        useNotificationStore().addSuccessNotification(
          '将领升级',
          `${this.selectedGeneral?.name || '将领'} 已升至 ${this.generalProgress.level} 级，可分配属性点`
        )
      }

      this.saveGame()
      return true
    },

    allocateGeneralPoint(attributeKey) {
      if (!this.generalProgress || this.generalProgress.unspentPoints <= 0) return false
      if (!Object.hasOwn(this.generalProgress.attributes, attributeKey)) return false

      this.generalProgress.attributes[attributeKey] += 1
      this.generalProgress.unspentPoints -= 1
      this.saveGame()
      return true
    },
    
    /**
     * GM添加金币
     */
    addCoins(amount) {
      if (amount <= 0) {
        const notificationStore = useNotificationStore()
        notificationStore.addErrorNotification('添加失败', '金币数量必须大于0')
        return false
      }
      
      this.coins += amount
      
      // 保存游戏数据（金币变化）
      this.saveGame()
      
      const notificationStore = useNotificationStore()
      notificationStore.addSuccessNotification(
        'GM操作',
        `成功添加 ${amount} 金币，当前金币: ${this.coins}`
      )
      
      return true
    },
    
    canRecruit(unitId, count) {
      return useMilitaryStore().canRecruit(unitId, count)
    },

    getMaxRecruitableCount(unitId) {
      return useMilitaryStore().getMaxRecruitableCount(unitId)
    },
    
    /**
     * 启动生产力加速
     */
    startProductionBoost(hours) {
      if (hours < 1 || hours > 24) {
        const notificationStore = useNotificationStore()
        notificationStore.addErrorNotification('参数错误', '加速时间必须在1-24小时之间')
        return false
      }
      
      const cost = this.calculateBoostCost(hours)
      
      if (this.coins < cost) {
        const notificationStore = useNotificationStore()
        notificationStore.addErrorNotification('金币不足', `生产力加速需要 ${cost} 金币，当前仅有 ${this.coins} 金币`)
        return false
      }
      
      // 如果已经在加速中，延长时间
      const now = Date.now()
      let newEndTime
      
      if (this.productionBoost.isActive && this.productionBoost.endTime > now) {
        // 延长现有加速时间
        newEndTime = this.productionBoost.endTime + (hours * 60 * 60 * 1000)
      } else {
        // 开始新的加速
        newEndTime = now + (hours * 60 * 60 * 1000)
      }
      
      // 扣除金币
      this.coins -= cost
      
      // 更新加速状态
      this.productionBoost = {
        isActive: true,
        multiplier: 1.4, // 40%加成
        startTime: this.productionBoost.isActive ? this.productionBoost.startTime : now,
        duration: newEndTime - (this.productionBoost.isActive ? this.productionBoost.startTime : now),
        endTime: newEndTime
      }
      
      // 设置定时器自动停止加速
      const remainingTime = newEndTime - now
      setTimeout(() => {
        this.stopProductionBoost()
      }, remainingTime)
      
      // 保存游戏数据
      this.saveGame()
      
      const notificationStore = useNotificationStore()
      notificationStore.addSuccessNotification(
        '生产力加速启动',
        `消耗 ${cost} 金币，生产力提升40%，持续 ${hours} 小时`
      )
      
      return true
    },
    
    /**
     * 停止生产力加速
     */
    stopProductionBoost() {
      if (this.productionBoost.isActive) {
        this.productionBoost = {
          isActive: false,
          multiplier: 1.4,
          startTime: null,
          duration: 0,
          endTime: null
        }
        
        // 保存游戏数据
        this.saveGame()
        
        const notificationStore = useNotificationStore()
        notificationStore.addInfoNotification('生产力加速结束', '生产力已恢复正常水平')
      }
    },
    
    /**
     * 一键爆仓（填满仓库）
     */
    fillWarehouse() {
      const cost = 10 // 固定花费10金币
      
      if (this.coins < cost) {
        const notificationStore = useNotificationStore()
        notificationStore.addErrorNotification('金币不足', `一键爆仓需要 ${cost} 金币，当前仅有 ${this.coins} 金币`)
        return false
      }
      
      // 扣除金币
      this.coins -= cost
      
      // 获取当前仓库容量
      const capacity = this.warehouseCapacity
      
      // 填满所有资源
      Object.keys(RESOURCE_TYPES).forEach(key => {
        this.resources[RESOURCE_TYPES[key]] = capacity
      })
      
      // 保存游戏数据
      this.saveGame()
      
      const notificationStore = useNotificationStore()
      notificationStore.addSuccessNotification(
        '一键爆仓成功',
        `消耗 ${cost} 金币，所有资源已填满至仓库容量 ${capacity}`
      )
      
      return true
    },
    
    /**
     * 激活仓库容量加成
     */
    activateWarehouseBoost() {
      // 计算花费：基础50金币 + 仓库等级 * 10金币
      const cost = 50 + this.warehouseLevel * 10
      
      if (this.coins < cost) {
        const notificationStore = useNotificationStore()
        notificationStore.addErrorNotification('金币不足', `仓库容量加成需要 ${cost} 金币，当前仅有 ${this.coins} 金币`)
        return false
      }
      
      // 如果已经激活，延长时间
      const now = Date.now()
      let newEndTime
      
      if (this.warehouseBoost.isActive && this.warehouseBoost.endTime > now) {
        // 延长现有加成时间
        newEndTime = this.warehouseBoost.endTime + this.warehouseBoost.duration
      } else {
        // 开始新的加成
        newEndTime = now + this.warehouseBoost.duration
      }
      
      // 扣除金币
      this.coins -= cost
      
      // 更新加成状态
      this.warehouseBoost = {
        isActive: true,
        multiplier: 2.0, // 100%加成
        startTime: this.warehouseBoost.isActive ? this.warehouseBoost.startTime : now,
        duration: 24 * 60 * 60 * 1000, // 24小时
        endTime: newEndTime
      }
      
      // 设置定时器自动停止加成
      const remainingTime = newEndTime - now
      setTimeout(() => {
        this.stopWarehouseBoost()
      }, remainingTime)
      
      // 保存游戏数据
      this.saveGame()
      
      const notificationStore = useNotificationStore()
      notificationStore.addSuccessNotification(
        '仓库容量加成启动',
        `消耗 ${cost} 金币，仓库容量提升100%，持续24小时`
      )
      
      return true
    },
    
    /**
     * 停止仓库容量加成
     */
    stopWarehouseBoost() {
      if (this.warehouseBoost.isActive) {
        this.warehouseBoost = {
          isActive: false,
          multiplier: 2.0,
          startTime: null,
          duration: 24 * 60 * 60 * 1000,
          endTime: null
        }
        
        // 保存游戏数据
        this.saveGame()
        
        const notificationStore = useNotificationStore()
        notificationStore.addInfoNotification('仓库容量加成结束', '仓库容量已恢复正常水平')
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
      this.generalProgress = null
      this.isFirstTime = true
      
      // 重置资源为满仓状态（1级仓库容量4800）
      this.resources = {
        [RESOURCE_TYPES.WOOD]: 4800,
        [RESOURCE_TYPES.SOIL]: 4800,
        [RESOURCE_TYPES.IRON]: 4800,
        [RESOURCE_TYPES.FOOD]: 4800
      }
      
      // 重置金币
      this.coins = 1000
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
      
      useMilitaryStore().resetMilitaryState()
      
      // 重置生产力加速状态
      this.productionBoost = {
        isActive: false,
        multiplier: 1.4,
        startTime: null,
        duration: 0,
        endTime: null
      }
      
      // 重置仓库容量加成状态
      this.warehouseBoost = {
        isActive: false,
        multiplier: 2.0,
        startTime: null,
        duration: 24 * 60 * 60 * 1000,
        endTime: null
      }
      
      useNpcStore().clearStorage()
      clearUnifiedGameData()
    }
  }
})
