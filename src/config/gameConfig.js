//=== 游戏配置文件 - 定义建筑升级和资源产出公式

import { calculateFactionBonus } from './factionConfig.js'

/**
 * 建筑类型枚举
 */
export const BUILDING_TYPES = {
  WOOD_MILL: 'woodMill',     // 木材厂
  SOIL_MINE: 'soilMine',     // 泥土矿
  IRON_MINE: 'ironMine',     // 铁矿场
  FARM: 'farm'               // 农场
}

/**
 * 资源类型枚举
 */
export const RESOURCE_TYPES = {
  WOOD: 'wood',   // 木材
  SOIL: 'soil',   // 泥土
  IRON: 'iron',   // 铁矿
  FOOD: 'food'    // 粮食
}

/**
 * 建筑基础配置
 * 每种建筑的产出配置和升级消耗
 * 
 * 🔧 产量配置说明：
 * - productionByLevel: 手动配置每级建筑的每小时产出量
 * - 数组索引对应建筑等级，例如：[0级, 1级, 2级, 3级, ...]
 * - 可根据游戏平衡性需求自由调整每级的产量数值
 */
export const BUILDING_CONFIG = {
  [BUILDING_TYPES.WOOD_MILL]: {
    name: '木材厂',
    resourceType: RESOURCE_TYPES.WOOD,
    // 🎯 手动配置每级产量 - 可在此处直接修改各等级产出
    productionByLevel: [0, 100, 120, 144, 173, 207, 249, 299, 358, 430, 516],
    upgradeTime: {
      base: 30,                // 基础升级时间(秒)
      growth: 1.3              // 每级升级时间增长倍数
    },
    upgradeCost: {
      base: { wood: 50, soil: 30, iron: 10, food: 20 },
      growth: 1.5              // 每级升级成本增长倍数
    }
  },
  [BUILDING_TYPES.SOIL_MINE]: {
    name: '泥土矿',
    resourceType: RESOURCE_TYPES.SOIL,
    // 🎯 手动配置每级产量 - 可在此处直接修改各等级产出
    productionByLevel: [0, 80, 96, 115, 138, 166, 199, 239, 287, 344, 413],
    upgradeTime: {
      base: 45,                // 基础升级时间(秒)
      growth: 1.3              // 每级升级时间增长倍数
    },
    upgradeCost: {
      base: { wood: 30, soil: 40, iron: 20, food: 10 },
      growth: 1.5
    }
  },
  [BUILDING_TYPES.IRON_MINE]: {
    name: '铁矿场',
    resourceType: RESOURCE_TYPES.IRON,
    // 🎯 手动配置每级产量 - 可在此处直接修改各等级产出
    productionByLevel: [0, 60, 72, 86, 103, 124, 149, 179, 215, 258, 310],
    upgradeTime: {
      base: 60,                // 基础升级时间(秒)
      growth: 1.3              // 每级升级时间增长倍数
    },
    upgradeCost: {
      base: { wood: 40, soil: 50, iron: 30, food: 15 },
      growth: 1.5
    }
  },
  [BUILDING_TYPES.FARM]: {
    name: '农场',
    resourceType: RESOURCE_TYPES.FOOD,
    // 🎯 手动配置每级产量 - 可在此处直接修改各等级产出
    productionByLevel: [0, 120, 144, 173, 207, 249, 299, 358, 430, 516, 619],
    upgradeTime: {
      base: 25,                // 基础升级时间(秒)
      growth: 1.3              // 每级升级时间增长倍数
    },
    upgradeCost: {
      base: { wood: 25, soil: 20, iron: 5, food: 30 },
      growth: 1.5
    }
  }
}

/**
 * 仓库配置
 */
export const WAREHOUSE_CONFIG = {
  maxLevel: 12,              // 仓库最大等级
  baseCapacity: 1000,       // 基础仓库容量
  capacityGrowth: 1.3,       // 每级容量增长倍数
  upgradeTime: {
    base: 120,               // 基础升级时间(秒)
    growth: 1.4              // 每级升级时间增长倍数
  },
  upgradeCost: {
    base: { wood: 100, soil: 100, iron: 50, food: 50 },
    growth: 1.8
  }
}

/**
 * 计算建筑每小时产出
 * 🔧 使用手动配置的产量表，支持阵营经济加成
 * @param {string} buildingType - 建筑类型
 * @param {number} level - 建筑等级
 * @param {string} factionType - 阵营类型（可选）
 * @returns {number} 每小时产出量
 */
export const calculateProduction = (buildingType, level, factionType = null) => {
  const config = BUILDING_CONFIG[buildingType]
  if (!config || !config.productionByLevel) return 0
  
  // 确保等级在有效范围内
  if (level < 0 || level >= config.productionByLevel.length) return 0
  
  // 获取基础产量
  let baseProduction = config.productionByLevel[level]
  
  // 应用阵营经济加成
  if (factionType) {
    baseProduction = calculateFactionBonus(factionType, 'economy', baseProduction)
  }
  
  return baseProduction
}

/**
 * 计算建筑升级成本
 * @param {string} buildingType - 建筑类型
 * @param {number} currentLevel - 当前等级
 * @returns {Object} 升级所需资源
 */
export const calculateUpgradeCost = (buildingType, currentLevel) => {
  const config = BUILDING_CONFIG[buildingType]
  if (!config) return {}
  
  const cost = {}
  const baseCost = config.upgradeCost.base
  const growth = config.upgradeCost.growth
  
  Object.keys(baseCost).forEach(resource => {
    cost[resource] = Math.floor(baseCost[resource] * Math.pow(growth, currentLevel - 1))
  })
  
  return cost
}

/**
 * 计算仓库容量
 * @param {number} level - 仓库等级
 * @returns {number} 仓库容量
 */
export const calculateWarehouseCapacity = (level) => {
  return Math.floor(WAREHOUSE_CONFIG.baseCapacity * Math.pow(WAREHOUSE_CONFIG.capacityGrowth, level - 1))
}

/**
 * 计算建筑升级时间
 * @param {string} buildingType - 建筑类型
 * @param {number} currentLevel - 当前等级
 * @returns {number} 升级所需时间(秒)
 */
export const calculateUpgradeTime = (buildingType, currentLevel) => {
  const config = BUILDING_CONFIG[buildingType]
  if (!config) return 0
  
  return Math.floor(config.upgradeTime.base * Math.pow(config.upgradeTime.growth, currentLevel - 1))
}

/**
 * 计算仓库升级时间
 * @param {number} currentLevel - 当前等级
 * @returns {number} 升级所需时间(秒)
 */
export const calculateWarehouseUpgradeTime = (currentLevel) => {
  return Math.floor(WAREHOUSE_CONFIG.upgradeTime.base * Math.pow(WAREHOUSE_CONFIG.upgradeTime.growth, currentLevel - 1))
}

/**
 * 计算仓库升级成本
 * @param {number} currentLevel - 当前等级
 * @returns {Object} 升级所需资源
 */
export const calculateWarehouseUpgradeCost = (currentLevel) => {
  const cost = {}
  const baseCost = WAREHOUSE_CONFIG.upgradeCost.base
  const growth = WAREHOUSE_CONFIG.upgradeCost.growth
  
  Object.keys(baseCost).forEach(resource => {
    cost[resource] = Math.floor(baseCost[resource] * Math.pow(growth, currentLevel - 1))
  })
  
  return cost
}