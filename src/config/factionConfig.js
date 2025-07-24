//=== 阵营配置文件 - 定义魏蜀吴三个阵营的基础信息和特性

/**
 * 阵营类型枚举
 */
export const FACTION_TYPES = {
  WEI: 'wei',     // 魏国
  SHU: 'shu',     // 蜀国
  WU: 'wu'        // 吴国
}

/**
 * 兵种类型枚举
 */
export const UNIT_TYPES = {
  INFANTRY: 'infantry',     // 步兵
  CAVALRY: 'cavalry',       // 骑兵
  SIEGE: 'siege',          // 攻城武器
  SPECIAL: 'special'       // 特殊兵种
}

/**
 * 兵种分类信息
 */
export const UNIT_CATEGORIES = {
  [UNIT_TYPES.INFANTRY]: {
    name: '步兵营',
    icon: '🛡️',
    description: '近战步兵单位，擅长防守和阵地战'
  },
  [UNIT_TYPES.CAVALRY]: {
    name: '骑兵营', 
    icon: '🐎',
    description: '快速机动部队，具有高速度和冲击力'
  },
  [UNIT_TYPES.SIEGE]: {
    name: '攻城武器',
    icon: '🏗️', 
    description: '专门用于攻城的重型武器装备'
  },
  [UNIT_TYPES.SPECIAL]: {
    name: '特殊兵种',
    icon: '⭐',
    description: '具有特殊能力的精英作战单位'
  }
}

/**
 * 阵营基础配置
 */
export const FACTION_CONFIG = {
  [FACTION_TYPES.WEI]: {
    id: FACTION_TYPES.WEI,
    name: '魏国',
    description: '以曹操为首的北方霸主，擅长政治和经济发展',
    color: '#1E40AF', // 蓝色
    bgColor: '#EFF6FF',
    borderColor: '#3B82F6',
    // 阵营特性
    traits: {
      economyBonus: 1.8,      // 经济加成 80% (非常强)
      militaryBonus: 0.8,     // 军事加成 -20% (弱)
      buildingBonus: 1.2      // 建筑速度加成 20% (比较快)
    },
    // 阵营图标
    icon: '⚔️',
    // 阵营标语
    slogan: '挟天子以令诸侯',
    // 阵营兵种配置
    units: {
      // 步兵营
      qingZhouArmy: {
        name: '青州军',
        description: '魏国精锐步兵，攻守兼备的基础作战单位',
        attack: 8,
        infantryDefense: 7,
        cavalryDefense: 10,
        speed: 6,
        carryCapacity: 80,
        unitType: UNIT_TYPES.INFANTRY,
        cost: { wood: 240, soil: 200, iron: 360, food: 80 },
        totalCost: 880,
        trainTime: 60,
        icon: '🛡️'
      },
      jinWeiSoldier: {
        name: '禁卫甲士',
        description: '魏国重装步兵，具有强大的防御能力',
        attack: 6,
        infantryDefense: 13,
        cavalryDefense: 7,
        speed: 5,
        carryCapacity: 40,
        unitType: UNIT_TYPES.INFANTRY,
        cost: { wood: 200, soil: 260, iron: 320, food: 140 },
        totalCost: 920,
        trainTime: 90,
        icon: '⚔️'
      },
      huWei: {
        name: '虎卫',
        description: '魏国精英步兵，攻击力强劲',
        attack: 14,
        infantryDefense: 8,
        cavalryDefense: 5,
        speed: 7,
        carryCapacity: 100,
        unitType: UNIT_TYPES.INFANTRY,
        cost: { wood: 300, soil: 320, iron: 420, food: 160 },
        totalCost: 1200,
        trainTime: 120,
        icon: '🐅'
      },
      zhanYingTanMa: {
        name: '战鹰探马',
        description: '魏国侦察骑兵，速度极快的轻装单位',
        attack: 0,
        infantryDefense: 4,
        cavalryDefense: 2,
        speed: 16,
        carryCapacity: 0,
        unitType: UNIT_TYPES.CAVALRY,
        cost: { wood: 280, soil: 320, iron: 40, food: 80 },
        totalCost: 720,
        trainTime: 75,
        icon: '🦅'
      },
      // 骑兵营
      qiQiYing: {
        name: '骑骑营',
        description: '魏国重装骑兵，攻击力强劲',
        attack: 24,
        infantryDefense: 13,
        cavalryDefense: 10,
        speed: 14,
        carryCapacity: 200,
        unitType: UNIT_TYPES.CAVALRY,
        cost: { wood: 1100, soil: 880, iron: 640, food: 200 },
        totalCost: 2820,
        trainTime: 180,
        icon: '🐎'
      },
      huBaoQi: {
        name: '虎豹骑',
        description: '魏国精英骑兵，攻防俱佳的重型单位',
        attack: 36,
        infantryDefense: 16,
        cavalryDefense: 21,
        speed: 10,
        carryCapacity: 140,
        unitType: UNIT_TYPES.CAVALRY,
        cost: { wood: 1100, soil: 1280, iron: 1600, food: 360 },
        totalCost: 4340,
        trainTime: 240,
        icon: '🐆'
      },
      // 攻城武器
      chongZhuangChe: {
        name: '冲撞车',
        description: '魏国攻城器械，专门用于攻城作战',
        attack: 12,
        infantryDefense: 6,
        cavalryDefense: 15,
        speed: 4,
        carryCapacity: 0,
        unitType: UNIT_TYPES.SIEGE,
        cost: { wood: 1800, soil: 720, iron: 1000, food: 140 },
        totalCost: 3660,
        trainTime: 300,
        icon: '🏗️'
      },
      luLeiChe: {
        name: '露雷车',
        description: '魏国火药武器，具有强大的爆炸威力',
        attack: 15,
        infantryDefense: 12,
        cavalryDefense: 2,
        speed: 3,
        carryCapacity: 0,
        unitType: UNIT_TYPES.SIEGE,
        cost: { wood: 1900, soil: 2700, iron: 1200, food: 180 },
        totalCost: 5980,
        trainTime: 360,
        icon: '💥'
      },
      // 特殊兵种
      jianzhuShi: {
        name: '建筑师',
        description: '魏国建筑工程师，具有超强的运载能力',
        attack: 10,
        infantryDefense: 160,
        cavalryDefense: 160,
        speed: 5,
        carryCapacity: 9999,
        unitType: UNIT_TYPES.SPECIAL,
        cost: { wood: 11600, soil: 10600, iron: 14400, food: 11000 },
        totalCost: 47600,
        trainTime: 600,
        icon: '🏗️'
      },
      tuZu: {
        name: '土族',
        description: '魏国贵族部队，拥有极高的战斗素养',
        attack: 100,
        infantryDefense: 80,
        cavalryDefense: 60,
        speed: 4,
        carryCapacity: 0,
        unitType: UNIT_TYPES.SPECIAL,
        cost: { wood: 61500, soil: 54400, iron: 90000, food: 75000 },
        totalCost: 280900,
        trainTime: 1200,
        icon: '🏔️'
      },
      weiMerchant: {
        name: '魏国商人',
        description: '魏国商贸人员，专门负责贸易运输',
        attack: 0,
        infantryDefense: 0,
        cavalryDefense: 0,
        speed: 16,
        carryCapacity: 1000,
        unitType: UNIT_TYPES.SPECIAL,
        cost: { wood: 0, soil: 0, iron: 0, food: 0 },
        totalCost: 0,
        trainTime: 0,
        icon: '💰'
      }
    }
  },
  
  [FACTION_TYPES.SHU]: {
    id: FACTION_TYPES.SHU,
    name: '蜀国',
    description: '以刘备为首的仁义之师，擅长军事和民心',
    color: '#DC2626', // 红色
    bgColor: '#FEF2F2',
    borderColor: '#EF4444',
    // 阵营特性
    traits: {
      economyBonus: 1.2,      // 经济加成 20% (强)
      militaryBonus: 1.8,     // 军事加成 80% (非常强)
      buildingBonus: 0.8      // 建筑速度加成 -20% (弱，建筑时间增加)
    },
    // 阵营图标
    icon: '🛡️',
    // 阵营标语
    slogan: '匡扶汉室，兴复中原',
    // 阵营兵种配置
    units: {
      // 步兵营
      greedyWolf: {
        name: '贪狼营',
        description: '蜀国精锐步兵，攻守兼备的基础作战单位',
        attack: 8,
        infantryDefense: 4,
        cavalryDefense: 1,
        speed: 7,
        carryCapacity: 120,
        unitType: UNIT_TYPES.INFANTRY,
        cost: { wood: 190, soil: 150, iron: 80, food: 80 },
        totalCost: 500,
        trainTime: 60,
        icon: '🛡️'
      },
      qilinGuard: {
        name: '麒麟卫',
        description: '蜀国重装步兵，具有强大的防御能力',
        attack: 2,
        infantryDefense: 7,
        cavalryDefense: 12,
        speed: 7,
        carryCapacity: 80,
        unitType: UNIT_TYPES.INFANTRY,
        cost: { wood: 290, soil: 140, iron: 170, food: 80 },
        totalCost: 680,
        trainTime: 90,
        icon: '⚔️'
      },
      azureDragon: {
        name: '青龙军',
        description: '蜀国精英步兵，攻击力强劲',
        attack: 12,
        infantryDefense: 6,
        cavalryDefense: 6,
        speed: 6,
        carryCapacity: 100,
        unitType: UNIT_TYPES.INFANTRY,
        cost: { wood: 260, soil: 240, iron: 340, food: 140 },
        totalCost: 980,
        trainTime: 120,
        icon: '🐉'
      },
      flyingKite: {
        name: '飞鸢',
        description: '蜀国轻装侦察兵，速度极快',
        attack: 0,
        infantryDefense: 2,
        cavalryDefense: 1,
        speed: 9,
        carryCapacity: 0,
        unitType: UNIT_TYPES.INFANTRY,
        cost: { wood: 320, soil: 200, iron: 100, food: 100 },
        totalCost: 720,
        trainTime: 75,
        icon: '🪁'
      },
      // 骑兵营
      xiLiangCavalry: {
        name: '西凉铁骑',
        description: '蜀国重装骑兵，冲击力惊人',
        attack: 11,
        infantryDefense: 20,
        cavalryDefense: 8,
        speed: 10,
        carryCapacity: 220,
        unitType: UNIT_TYPES.CAVALRY,
        cost: { wood: 740, soil: 540, iron: 580, food: 150 },
        totalCost: 2010,
        trainTime: 180,
        icon: '🐎'
      },
      southernElephant: {
        name: '南蛮象',
        description: '蜀国战象部队，攻防俱佳的重型单位',
        attack: 30,
        infantryDefense: 10,
        cavalryDefense: 15,
        speed: 9,
        carryCapacity: 160,
        unitType: UNIT_TYPES.CAVALRY,
        cost: { wood: 900, soil: 1030, iron: 960, food: 160 },
        totalCost: 3050,
        trainTime: 240,
        icon: '🐘'
      },
      // 攻城武器
      siegeTower: {
        name: '临冲车',
        description: '蜀国攻城器械，专门用于攻城作战',
        attack: 13,
        infantryDefense: 6,
        cavalryDefense: 16,
        speed: 4,
        carryCapacity: 0,
        unitType: UNIT_TYPES.SIEGE,
        cost: { wood: 2000, soil: 600, iron: 700, food: 140 },
        totalCost: 1640,
        trainTime: 300,
        icon: '🏗️'
      },
      thunderBolt: {
        name: '霹天雷',
        description: '蜀国火药武器，具有强大的爆炸威力',
        attack: 10,
        infantryDefense: 12,
        cavalryDefense: 2,
        speed: 3,
        carryCapacity: 0,
        unitType: UNIT_TYPES.SIEGE,
        cost: { wood: 1800, soil: 2400, iron: 1200, food: 120 },
        totalCost: 5520,
        trainTime: 360,
        icon: '💥'
      },
      // 特殊兵种
      woodenOx: {
        name: '木牛流马',
        description: '蜀国运输工具，具有超强的运载能力',
        attack: 20,
        infantryDefense: 160,
        cavalryDefense: 160,
        speed: 5,
        carryCapacity: 9999,
        unitType: UNIT_TYPES.SPECIAL,
        cost: { wood: 14400, soil: 11000, iron: 11600, food: 13000 },
        totalCost: 50000,
        trainTime: 600,
        icon: '🐂'
      },
      hanRoyalty: {
        name: '汉室宗亲',
        description: '蜀国贵族部队，拥有极高的战斗素养',
        attack: 80,
        infantryDefense: 120,
        cavalryDefense: 80,
        speed: 4,
        carryCapacity: 0,
        unitType: UNIT_TYPES.SPECIAL,
        cost: { wood: 71000, soil: 53200, iron: 50000, food: 54400 },
        totalCost: 228600,
        trainTime: 1200,
        icon: '👑'
      },
      shuMerchant: {
        name: '蜀国商人',
        description: '蜀国商贸人员，专门负责贸易运输',
        attack: 0,
        infantryDefense: 0,
        cavalryDefense: 0,
        speed: 12,
        carryCapacity: 2000,
        unitType: UNIT_TYPES.SPECIAL,
        cost: { wood: 0, soil: 0, iron: 0, food: 0 },
        totalCost: 0,
        trainTime: 0,
        icon: '💰'
      }
    }
  },
  
  [FACTION_TYPES.WU]: {
    id: FACTION_TYPES.WU,
    name: '吴国',
    description: '以孙权为首的江东豪族，擅长水战和贸易',
    color: '#059669', // 绿色
    bgColor: '#F0FDF4',
    borderColor: '#10B981',
    // 阵营特性
    traits: {
      economyBonus: 0.8,      // 经济加成 -20% (非常弱)
      militaryBonus: 1.2,     // 军事加成 20% (中等)
      buildingBonus: 1.8      // 建筑速度加成 80% (非常快)
    },
    // 阵营图标
    icon: '⚓',
    // 阵营标语
    slogan: '据江东之险，成霸业之基',
    // 阵营兵种配置
    units: {
      // 步兵营
      shadowGuard: {
        name: '影卫',
        description: '吴国精锐步兵，攻守兼备的基础作战单位',
        attack: 3,
        infantryDefense: 8,
        cavalryDefense: 10,
        speed: 7,
        carryCapacity: 60,
        unitType: UNIT_TYPES.INFANTRY,
        cost: { wood: 200, soil: 260, iron: 110, food: 60 },
        totalCost: 630,
        trainTime: 60,
        icon: '🗡️'
      },
      xiuLuo: {
        name: '修罗',
        description: '吴国重装步兵，具有强大的攻击能力',
        attack: 13,
        infantryDefense: 7,
        cavalryDefense: 4,
        speed: 6,
        carryCapacity: 90,
        unitType: UNIT_TYPES.INFANTRY,
        cost: { wood: 280, soil: 300, iron: 370, food: 120 },
        totalCost: 1070,
        trainTime: 90,
        icon: '⚔️'
      },
      secretAgent: {
        name: '密探',
        description: '吴国侦察骑兵，速度极快的轻装单位',
        attack: 0,
        infantryDefense: 4,
        cavalryDefense: 2,
        speed: 17,
        carryCapacity: 0,
        unitType: UNIT_TYPES.CAVALRY,
        cost: { wood: 340, soil: 300, iron: 40, food: 80 },
        totalCost: 760,
        trainTime: 75,
        icon: '🕵️'
      },
      divineWind: {
        name: '神风',
        description: '吴国精英骑兵，速度与攻击力并重',
        attack: 18,
        infantryDefense: 5,
        cavalryDefense: 8,
        speed: 19,
        carryCapacity: 150,
        unitType: UNIT_TYPES.CAVALRY,
        cost: { wood: 700, soil: 900, iron: 460, food: 120 },
        totalCost: 2180,
        trainTime: 120,
        icon: '🌪️'
      },
      // 骑兵营
      zhuQueRider: {
        name: '朱雀骑',
        description: '吴国重装骑兵，防御力强劲',
        attack: 9,
        infantryDefense: 23,
        cavalryDefense: 11,
        speed: 16,
        carryCapacity: 70,
        unitType: UNIT_TYPES.CAVALRY,
        cost: { wood: 720, soil: 660, iron: 540, food: 240 },
        totalCost: 2160,
        trainTime: 180,
        icon: '🐎'
      },
      overlordRider: {
        name: '霸王骑',
        description: '吴国精英骑兵，攻击力惊人',
        attack: 28,
        infantryDefense: 10,
        cavalryDefense: 33,
        speed: 13,
        carryCapacity: 130,
        unitType: UNIT_TYPES.CAVALRY,
        cost: { wood: 1000, soil: 1240, iron: 1350, food: 340 },
        totalCost: 3930,
        trainTime: 240,
        icon: '👑'
      },
      // 攻城武器
      chongChe: {
        name: '冲撞车',
        description: '吴国攻城器械，专门用于攻城作战',
        attack: 10,
        infantryDefense: 6,
        cavalryDefense: 21,
        speed: 4,
        carryCapacity: 0,
        unitType: UNIT_TYPES.SIEGE,
        cost: { wood: 1900, soil: 1110, iron: 660, food: 150 },
        totalCost: 3820,
        trainTime: 300,
        icon: '🏗️'
      },
      juShiChe: {
        name: '巨石车',
        description: '吴国投石器械，具有强大的攻击威力',
        attack: 14,
        infantryDefense: 9,
        cavalryDefense: 2,
        speed: 3,
        carryCapacity: 0,
        unitType: UNIT_TYPES.SIEGE,
        cost: { wood: 1920, soil: 2900, iron: 1260, food: 180 },
        totalCost: 6260,
        trainTime: 360,
        icon: '💥'
      },
      // 特殊兵种
      fengShuiMaster: {
        name: '风水师',
        description: '吴国特殊兵种，具有超强的运载能力',
        attack: 10,
        infantryDefense: 160,
        cavalryDefense: 160,
        speed: 5,
        carryCapacity: 9999,
        unitType: UNIT_TYPES.SPECIAL,
        cost: { wood: 11000, soil: 14000, iron: 10600, food: 9800 },
        totalCost: 45400,
        trainTime: 600,
        icon: '🔮'
      },
      taiPingShi: {
        name: '太平士',
        description: '吴国贵族部队，拥有极高的战斗素养',
        attack: 80,
        infantryDefense: 100,
        cavalryDefense: 100,
        speed: 5,
        carryCapacity: 0,
        unitType: UNIT_TYPES.SPECIAL,
        cost: { wood: 61500, soil: 90800, iron: 62000, food: 75000 },
        totalCost: 289300,
        trainTime: 1200,
        icon: '⚡'
      },
      wuMerchant: {
        name: '吴国商人',
        description: '吴国商贸人员，专门负责贸易运输',
        attack: 0,
        infantryDefense: 0,
        cavalryDefense: 0,
        speed: 24,
        carryCapacity: 1500,
        unitType: UNIT_TYPES.SPECIAL,
        cost: { wood: 0, soil: 0, iron: 0, food: 0 },
        totalCost: 0,
        trainTime: 0,
        icon: '💰'
      }
    }
  }
}

/**
 * 获取阵营信息
 * @param {string} factionType - 阵营类型
 * @returns {object} 阵营配置信息
 */
export const getFactionConfig = (factionType) => {
  return FACTION_CONFIG[factionType] || null
}

/**
 * 获取所有阵营列表
 * @returns {array} 阵营配置数组
 */
export const getAllFactions = () => {
  return Object.values(FACTION_CONFIG)
}

/**
 * 计算阵营加成
 * @param {string} factionType - 阵营类型
 * @param {string} bonusType - 加成类型 (economy, military, building)
 * @param {number} baseValue - 基础值
 * @returns {number} 应用加成后的值
 */
export const calculateFactionBonus = (factionType, bonusType, baseValue) => {
  const faction = getFactionConfig(factionType)
  if (!faction || !faction.traits) return baseValue
  
  const bonusKey = `${bonusType}Bonus`
  const bonus = faction.traits[bonusKey] || 1.0
  
  return Math.floor(baseValue * bonus)
}

/**
 * 验证阵营类型是否有效
 * @param {string} factionType - 阵营类型
 * @returns {boolean} 是否为有效阵营
 */
export const isValidFaction = (factionType) => {
  return Object.values(FACTION_TYPES).includes(factionType)
}

// ===== 兵种相关API函数 =====

/**
 * 获取指定阵营的所有兵种
 * @param {string} factionType - 阵营类型
 * @returns {array} 兵种配置数组
 */
export const getFactionUnits = (factionType) => {
  const faction = getFactionConfig(factionType)
  if (!faction || !faction.units) return []
  
  return Object.entries(faction.units)
    .map(([key, unit]) => ({ id: key, ...unit, faction: factionType }))
}

/**
 * 根据阵营和兵种类型获取兵种列表
 * @param {string} factionType - 阵营类型
 * @param {string} unitType - 兵种类型
 * @returns {array} 兵种配置数组
 */
export const getFactionUnitsByType = (factionType, unitType) => {
  return getFactionUnits(factionType)
    .filter(unit => unit.unitType === unitType)
}

/**
 * 获取指定阵营的指定兵种
 * @param {string} factionType - 阵营类型
 * @param {string} unitId - 兵种ID
 * @returns {object|null} 兵种配置信息
 */
export const getFactionUnit = (factionType, unitId) => {
  const faction = getFactionConfig(factionType)
  if (!faction || !faction.units || !faction.units[unitId]) return null
  
  return { id: unitId, ...faction.units[unitId], faction: factionType }
}

/**
 * 获取所有阵营的所有兵种（统一格式）
 * @returns {array} 所有兵种配置数组
 */
export const getAllUnits = () => {
  const allUnits = []
  Object.values(FACTION_TYPES).forEach(factionType => {
    const factionUnits = getFactionUnits(factionType)
    allUnits.push(...factionUnits)
  })
  return allUnits
}

/**
 * 根据兵种类型获取所有阵营的兵种
 * @param {string} unitType - 兵种类型
 * @returns {array} 兵种配置数组
 */
export const getUnitsByType = (unitType) => {
  return getAllUnits().filter(unit => unit.unitType === unitType)
}

/**
 * 根据兵种ID查找兵种（跨阵营搜索）
 * @param {string} unitId - 兵种ID
 * @returns {object|null} 兵种配置信息
 */
export const getUnitById = (unitId) => {
  for (const factionType of Object.values(FACTION_TYPES)) {
    const unit = getFactionUnit(factionType, unitId)
    if (unit) return unit
  }
  return null
}

/**
 * 计算兵种在指定阵营下的实际属性（应用阵营加成）
 * @param {string} factionType - 阵营类型
 * @param {string} unitId - 兵种ID
 * @returns {object|null} 应用加成后的兵种配置
 */
export const getUnitWithFactionBonus = (factionType, unitId) => {
  const unit = getFactionUnit(factionType, unitId)
  if (!unit) return null
  
  const faction = getFactionConfig(factionType)
  if (!faction || !faction.traits) return unit
  
  // 应用军事加成到攻击力和防御力
  const militaryBonus = faction.traits.militaryBonus || 1.0
  const buildingBonus = faction.traits.buildingBonus || 1.0
  
  return {
    ...unit,
    // 应用军事加成
    attack: Math.floor(unit.attack * militaryBonus),
    infantryDefense: Math.floor(unit.infantryDefense * militaryBonus),
    cavalryDefense: Math.floor(unit.cavalryDefense * militaryBonus),
    // 应用建筑加成到训练时间（建筑加成越高，训练时间越短）
    trainTime: Math.floor(unit.trainTime / buildingBonus),
    // 保留原始数据用于对比
    originalStats: {
      attack: unit.attack,
      infantryDefense: unit.infantryDefense,
      cavalryDefense: unit.cavalryDefense,
      trainTime: unit.trainTime
    }
  }
}

// ===== 向后兼容的导出 =====

/**
 * 向后兼容：根据国家获取兵种列表
 * @param {string} faction - 阵营类型
 * @returns {array} 兵种配置数组
 */
export const getUnitsByFaction = (faction) => {
  return getFactionUnits(faction)
}

/**
 * 向后兼容：根据国家和兵种类型获取兵种列表
 * @param {string} faction - 阵营类型
 * @param {string} unitType - 兵种类型
 * @returns {array} 兵种配置数组
 */
export const getUnitsByFactionAndType = (faction, unitType) => {
  return getFactionUnitsByType(faction, unitType)
}