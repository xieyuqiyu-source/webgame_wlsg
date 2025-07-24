//=== 兵种配置文件
//=== 定义各种兵种的属性和分类

export const UNIT_TYPES = {
  INFANTRY: 'infantry',     // 步兵
  CAVALRY: 'cavalry',       // 骑兵
  SIEGE: 'siege',          // 攻城武器
  SPECIAL: 'special'       // 特殊兵种
}

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

//=== 蜀国兵种配置数据
//=== 每个兵种包含：兵种、进攻、步防、骑御、速度、耗粮、运输、木材、泥土、铁矿、粮食、总造价
export const UNITS_CONFIG = {
  // 步兵营
  greedyWolf: {
    name: '贪狼营',
    description: '蜀国精锐步兵，攻守兼备的基础作战单位',
    attack: 8,
    infantryDefense: 4,  // 步防
    cavalryDefense: 1,   // 骑防
    speed: 7,
    carryCapacity: 120,    // 运载量
    unitType: UNIT_TYPES.INFANTRY,  // 所属兵种
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
  weiMerchant: {
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

//=== getUnitsByType 根据兵种类型获取兵种列表
export function getUnitsByType(unitType) {
  return Object.entries(UNITS_CONFIG)
    .filter(([key, unit]) => unit.unitType === unitType)
    .map(([key, unit]) => ({ id: key, ...unit }))
}

//=== getAllUnits 获取所有兵种
export function getAllUnits() {
  return Object.entries(UNITS_CONFIG)
    .map(([key, unit]) => ({ id: key, ...unit }))
}

//=== getUnitById 根据ID获取兵种信息
export function getUnitById(unitId) {
  return UNITS_CONFIG[unitId] ? { id: unitId, ...UNITS_CONFIG[unitId] } : null
}