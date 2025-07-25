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
    name: '伐木场',
    resourceType: RESOURCE_TYPES.WOOD,
    maxLevel: 20,            // 最高等级20
    // 🎯 手动配置每级产量 - 根据用户提供的表格数据配置
    productionByLevel: [
      4,     // 0级
      10,    // 1级
      18,    // 2级
      30,    // 3级
      44,    // 4级
      66,    // 5级
      100,   // 6级
      140,   // 7级
      200,   // 8级
      290,   // 9级
      400,   // 10级
      560,   // 11级
      750,   // 12级
      990,   // 13级
      1270,  // 14级
      1600,  // 15级
      2000,  // 16级
      2600,  // 17级
      3200,  // 18级
      4000,  // 19级
      4900   // 20级
    ],
    upgradeTime: {
      base: 60,                // 基础升级时间(秒)
      growth: 1.25             // 每级升级时间增长倍数
    },
    // 🎯 手动配置每级升级成本 - 根据用户提供的表格数据配置
    upgradeCostByLevel: [
      { wood: 80, soil: 200, iron: 100, food: 120 },     // 升级到1级
      { wood: 130, soil: 330, iron: 170, food: 200 },    // 升级到2级
      { wood: 220, soil: 560, iron: 280, food: 330 },    // 升级到3级
      { wood: 370, soil: 930, iron: 470, food: 560 },    // 升级到4级
      { wood: 620, soil: 1560, iron: 780, food: 930 },   // 升级到5级
      { wood: 1040, soil: 2600, iron: 1300, food: 1560 }, // 升级到6级
      { wood: 1740, soil: 4340, iron: 2170, food: 2600 }, // 升级到7级
      { wood: 2900, soil: 7250, iron: 3620, food: 4350 }, // 升级到8级
      { wood: 4840, soil: 12100, iron: 6050, food: 7260 }, // 升级到9级
      { wood: 8080, soil: 20210, iron: 10100, food: 12120 }, // 升级到10级
      { wood: 13500, soil: 33740, iron: 16870, food: 20250 }, // 升级到11级
      { wood: 22540, soil: 56350, iron: 28180, food: 33810 }, // 升级到12级
      { wood: 37640, soil: 94110, iron: 47050, food: 56460 }, // 升级到13级
      { wood: 62860, soil: 157160, iron: 78580, food: 94300 }, // 升级到14级
      { wood: 104980, soil: 262460, iron: 131230, food: 157480 }, // 升级到15级
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到16级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到17级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到18级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到19级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 }              // 升级到20级 (表格显示为-)
    ]
  },
  [BUILDING_TYPES.SOIL_MINE]: {
    name: '泥土场',
    maxLevel: 20,
    resourceType: RESOURCE_TYPES.SOIL,
    productionByLevel: [
      0, 10, 18, 30, 44, 66, 100, 140, 200, 290, 400, 560, 750, 990, 1270, 1600, 2000, 2600, 3200, 4000, 4900
    ],
    upgradeTime: {
      base: 30,
      growth: 1.5
    },
    upgradeCostByLevel: [
      { wood: 160, soil: 80, iron: 160, food: 100 }, // 1级
      { wood: 270, soil: 130, iron: 270, food: 170 }, // 2级
      { wood: 450, soil: 220, iron: 450, food: 280 }, // 3级
      { wood: 750, soil: 370, iron: 750, food: 470 }, // 4级
      { wood: 1240, soil: 620, iron: 1240, food: 780 }, // 5级
      { wood: 2080, soil: 1040, iron: 2080, food: 1300 }, // 6级
      { wood: 3470, soil: 1740, iron: 3470, food: 2170 }, // 7级
      { wood: 5800, soil: 2900, iron: 5800, food: 3620 }, // 8级
      { wood: 9680, soil: 4840, iron: 9680, food: 6050 }, // 9级
      { wood: 16160, soil: 8080, iron: 16160, food: 10100 }, // 10级
      { wood: 27000, soil: 13500, iron: 27000, food: 16870 }, // 11级
      { wood: 45080, soil: 22540, iron: 45080, food: 28180 }, // 12级
      { wood: 75290, soil: 37640, iron: 75290, food: 47050 }, // 13级
      { wood: 125730, soil: 62860, iron: 125730, food: 78580 }, // 14级
      { wood: 209970, soil: 104980, iron: 209970, food: 131230 }, // 15级
      { wood: 0, soil: 0, iron: 0, food: 0 }, // 16级
      { wood: 0, soil: 0, iron: 0, food: 0 }, // 17级
      { wood: 0, soil: 0, iron: 0, food: 0 }, // 18级
      { wood: 0, soil: 0, iron: 0, food: 0 }, // 19级
      { wood: 0, soil: 0, iron: 0, food: 0 }  // 20级
    ]
  },
  [BUILDING_TYPES.IRON_MINE]: {
    name: '铁矿场',
    resourceType: RESOURCE_TYPES.IRON,
    maxLevel: 20,            // 最高等级20
    // 🎯 手动配置每级产量 - 根据用户提供的表格数据配置
    productionByLevel: [
      4,     // 0级
      10,    // 1级
      18,    // 2级
      30,    // 3级
      44,    // 4级
      66,    // 5级
      100,   // 6级
      140,   // 7级
      200,   // 8级
      290,   // 9级
      400,   // 10级
      560,   // 11级
      750,   // 12级
      990,   // 13级
      1270,  // 14级
      1600,  // 15级
      2000,  // 16级
      2600,  // 17级
      3200,  // 18级
      4000,  // 19级
      4900   // 20级
    ],
    upgradeTime: {
      base: 60,                // 基础升级时间(秒)
      growth: 1.25             // 每级升级时间增长倍数
    },
    // 🎯 手动配置每级升级成本 - 根据用户提供的表格数据配置
    upgradeCostByLevel: [
      { wood: 200, soil: 160, iron: 60, food: 120 },     // 升级到1级
      { wood: 330, soil: 270, iron: 100, food: 200 },    // 升级到2级
      { wood: 560, soil: 450, iron: 170, food: 330 },    // 升级到3级
      { wood: 930, soil: 750, iron: 280, food: 560 },    // 升级到4级
      { wood: 1560, soil: 1240, iron: 470, food: 930 },  // 升级到5级
      { wood: 2600, soil: 2080, iron: 780, food: 1560 }, // 升级到6级
      { wood: 4340, soil: 3470, iron: 1300, food: 2600 }, // 升级到7级
      { wood: 7250, soil: 5800, iron: 2170, food: 4350 }, // 升级到8级
      { wood: 12100, soil: 9680, iron: 3630, food: 7260 }, // 升级到9级
      { wood: 20210, soil: 16160, iron: 6060, food: 12120 }, // 升级到10级
      { wood: 33740, soil: 27000, iron: 10120, food: 20250 }, // 升级到11级
      { wood: 56350, soil: 45080, iron: 16910, food: 33810 }, // 升级到12级
      { wood: 94110, soil: 75290, iron: 28230, food: 56460 }, // 升级到13级
      { wood: 157160, soil: 125730, iron: 47150, food: 94300 }, // 升级到14级
      { wood: 262460, soil: 209970, iron: 78740, food: 157480 }, // 升级到15级
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到16级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到17级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到18级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到19级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 }              // 升级到20级 (表格显示为-)
    ]
  },
  [BUILDING_TYPES.FARM]: {
    name: '农场',
    resourceType: RESOURCE_TYPES.FOOD,
    maxLevel: 20,
    // 🎯 手动配置每级产量 - 可在此处直接修改各等级产出
    productionByLevel: [
      0,     // 0级
      10,    // 1级
      18,    // 2级
      30,    // 3级
      44,    // 4级
      66,    // 5级
      100,   // 6级
      140,   // 7级
      200,   // 8级
      290,   // 9级
      400,   // 10级
      560,   // 11级
      750,   // 12级
      990,   // 13级
      1270,  // 14级
      1600,  // 15级
      2000,  // 16级
      2600,  // 17级
      3200,  // 18级
      4000,  // 19级
      4900   // 20级
    ],
    upgradeTime: {
      base: 30,                // 基础升级时间(秒)
      growth: 1.5              // 每级升级时间增长倍数
    },
    upgradeCostByLevel: [
      { wood: 120, soil: 100, iron: 120, food: 60 },     // 升级到1级
      { wood: 200, soil: 170, iron: 200, food: 100 },    // 升级到2级
      { wood: 330, soil: 280, iron: 330, food: 170 },    // 升级到3级
      { wood: 560, soil: 470, iron: 560, food: 280 },    // 升级到4级
      { wood: 930, soil: 780, iron: 930, food: 470 },    // 升级到5级
      { wood: 1560, soil: 1300, iron: 1560, food: 780 }, // 升级到6级
      { wood: 2600, soil: 2170, iron: 2600, food: 1300 }, // 升级到7级
      { wood: 4350, soil: 3620, iron: 4350, food: 2170 }, // 升级到8级
      { wood: 7260, soil: 6050, iron: 7260, food: 3630 }, // 升级到9级
      { wood: 12120, soil: 10100, iron: 12120, food: 6060 }, // 升级到10级
      { wood: 20250, soil: 16870, iron: 20250, food: 10120 }, // 升级到11级
      { wood: 33810, soil: 28180, iron: 33810, food: 16910 }, // 升级到12级
      { wood: 56460, soil: 47050, iron: 56460, food: 28230 }, // 升级到13级
      { wood: 94300, soil: 78580, iron: 94300, food: 47150 }, // 升级到14级
      { wood: 157480, soil: 131230, iron: 157480, food: 78740 }, // 升级到15级
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到16级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到17级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到18级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 },             // 升级到19级 (表格显示为-)
      { wood: 0, soil: 0, iron: 0, food: 0 }              // 升级到20级 (表格显示为-)
    ]
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
  
  // 如果有手动配置的升级成本表，优先使用
  if (config.upgradeCostByLevel) {
    if (currentLevel < 0 || currentLevel >= config.upgradeCostByLevel.length) {
      return {}
    }
    return { ...config.upgradeCostByLevel[currentLevel] }
  }
  
  // 否则使用基础成本和增长倍数计算
  if (config.upgradeCost) {
    const cost = {}
    const baseCost = config.upgradeCost.base
    const growth = config.upgradeCost.growth
    
    Object.keys(baseCost).forEach(resource => {
      cost[resource] = Math.floor(baseCost[resource] * Math.pow(growth, currentLevel - 1))
    })
    
    return cost
  }
  
  return {}
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