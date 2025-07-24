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
      economyBonus: 1.2,      // 经济加成 20% (强)
      militaryBonus: 1.8,     // 军事加成 80% ( 非常强)
      buildingBonus: 0.8      // 建筑速度加成 -20% (弱，建筑时间增加)
    },
    // 特色兵种（后期扩展）
    specialUnits: ['heavy_cavalry', 'crossbow_unit'],
    // 特色科技（后期扩展）
    specialTechs: ['advanced_farming', 'trade_routes'],
    // 阵营图标
    icon: '⚔️',
    // 阵营标语
    slogan: '挟天子以令诸侯'
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
      economyBonus: 1.8,      // 经济加成 80% (非常强)
      militaryBonus: 0.8,     // 军事加成 -20% (弱)
      buildingBonus: 1.2      // 建筑速度加成 20% (比较快)
    },
    // 特色兵种（后期扩展）
    specialUnits: ['elite_infantry', 'mountain_troops'],
    // 特色科技（后期扩展）
    specialTechs: ['military_tactics', 'defensive_engineering'],
    // 阵营图标
    icon: '🛡️',
    // 阵营标语
    slogan: '匡扶汉室，兴复中原'
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
    // 特色兵种（后期扩展）
    specialUnits: ['naval_fleet', 'archer_unit'],
    // 特色科技（后期扩展）
    specialTechs: ['shipbuilding', 'navigation'],
    // 阵营图标
    icon: '⚓',
    // 阵营标语
    slogan: '据江东之险，成霸业之基'
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