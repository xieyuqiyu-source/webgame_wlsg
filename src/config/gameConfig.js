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
  maxLevel: 20,              // 仓库最大等级
  // 🎯 手动配置每级容量 - 根据图片数据表配置
  capacityByLevel: [
    3200,   // 0级
    4800,   // 1级
    6800,   // 2级
    9200,   // 3级
    12400,  // 4级
    16000,  // 5级
    20000,  // 6级
    25200,  // 7级
    31200,  // 8级
    38400,  // 9级
    47200,  // 10级
    57600,  // 11级
    70400,  // 12级
    85600,  // 13级
    103600, // 14级
    125200, // 15级
    151600, // 16级
    182800, // 17级
    220400, // 18级
    265600, // 19级
    320000  // 20级
  ],
  // 🎯 手动配置每级升级成本 - 根据图片数据表配置
  upgradeCostByLevel: [
    { wood: 260, soil: 320, iron: 180, food: 80 },    // 升级到1级
    { wood: 330, soil: 410, iron: 230, food: 100 },   // 升级到2级
    { wood: 430, soil: 520, iron: 290, food: 130 },   // 升级到3级
    { wood: 550, soil: 670, iron: 380, food: 170 },   // 升级到4级
    { wood: 700, soil: 860, iron: 480, food: 210 },   // 升级到5级
    { wood: 890, soil: 1100, iron: 620, food: 270 },  // 升级到6级
    { wood: 1140, soil: 1410, iron: 790, food: 350 }, // 升级到7级
    { wood: 1460, soil: 1800, iron: 1010, food: 450 },// 升级到8级
    { wood: 1870, soil: 2310, iron: 1300, food: 580 },// 升级到9级
    { wood: 2400, soil: 2950, iron: 1660, food: 740 },// 升级到10级
    { wood: 3070, soil: 3780, iron: 2130, food: 940 },// 升级到11级
    { wood: 3930, soil: 4840, iron: 2720, food: 1210 },// 升级到12级
    { wood: 5030, soil: 6190, iron: 3480, food: 1550 },// 升级到13级
    { wood: 6440, soil: 7920, iron: 4460, food: 1980 },// 升级到14级
    { wood: 8240, soil: 10140, iron: 5700, food: 2540 },// 升级到15级
    { wood: 10550, soil: 12980, iron: 7300, food: 3250 },// 升级到16级
    { wood: 13500, soil: 16620, iron: 9350, food: 4150 },// 升级到17级
    { wood: 17280, soil: 21270, iron: 11960, food: 5320 },// 升级到18级
    { wood: 22120, soil: 27220, iron: 15310, food: 6810 },// 升级到19级
    { wood: 28310, soil: 34840, iron: 19600, food: 8710 } // 升级到20级
  ],
  upgradeTime: {
    base: 120,               // 基础升级时间(秒)
    growth: 1.4              // 每级升级时间增长倍数
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
  // 使用手动配置的容量表
  if (level < 0 || level >= WAREHOUSE_CONFIG.capacityByLevel.length) {
    return 0
  }
  return WAREHOUSE_CONFIG.capacityByLevel[level]
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
  // 使用手动配置的升级成本表
  if (currentLevel < 0 || currentLevel >= WAREHOUSE_CONFIG.upgradeCostByLevel.length) {
    return {}
  }
  return { ...WAREHOUSE_CONFIG.upgradeCostByLevel[currentLevel] }
}