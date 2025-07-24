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

//=== 兵种配置数据
//=== 每个兵种包含：描述、名字、攻击、步防、骑防、速度、运载量、所属兵种
export const UNITS_CONFIG = {
  // 步兵营
  spearman: {
    name: '长矛兵',
    description: '装备长矛的基础步兵，对骑兵有额外伤害',
    attack: 15,
    infantryDefense: 20,  // 步防
    cavalryDefense: 25,   // 骑防
    speed: 4,
    carryCapacity: 25,    // 运载量
    unitType: UNIT_TYPES.INFANTRY,  // 所属兵种
    cost: { wood: 50, iron: 30, food: 20 },
    trainTime: 60,
    icon: '🛡️'
  },
  swordsman: {
    name: '剑士',
    description: '装备剑盾的精锐步兵，攻防平衡',
    attack: 25,
    infantryDefense: 18,
    cavalryDefense: 15,
    speed: 5,
    carryCapacity: 30,
    unitType: UNIT_TYPES.INFANTRY,
    cost: { wood: 30, iron: 60, food: 30 },
    trainTime: 90,
    icon: '⚔️'
  },
  archer: {
    name: '弓箭手',
    description: '远程攻击单位，射程优势明显',
    attack: 20,
    infantryDefense: 10,
    cavalryDefense: 8,
    speed: 6,
    carryCapacity: 20,
    unitType: UNIT_TYPES.INFANTRY,
    cost: { wood: 80, iron: 20, food: 25 },
    trainTime: 75,
    icon: '🏹'
  },
  
  // 骑兵营
  lightCavalry: {
    name: '轻骑兵',
    description: '快速机动的侦察骑兵，适合骚扰和追击',
    attack: 22,
    infantryDefense: 12,
    cavalryDefense: 15,
    speed: 12,
    carryCapacity: 40,
    unitType: UNIT_TYPES.CAVALRY,
    cost: { wood: 40, iron: 50, food: 80 },
    trainTime: 100,
    icon: '🐎'
  },
  heavyCavalry: {
    name: '重骑兵',
    description: '重装冲锋骑兵，具有强大的冲击力',
    attack: 40,
    infantryDefense: 25,
    cavalryDefense: 30,
    speed: 8,
    carryCapacity: 60,
    unitType: UNIT_TYPES.CAVALRY,
    cost: { wood: 60, iron: 100, food: 120 },
    trainTime: 180,
    icon: '🏇'
  },
  
  // 攻城武器
  catapult: {
    name: '投石车',
    description: '远程攻城器械，对建筑物造成巨大伤害',
    attack: 80,
    infantryDefense: 5,
    cavalryDefense: 3,
    speed: 2,
    carryCapacity: 0,
    unitType: UNIT_TYPES.SIEGE,
    cost: { wood: 200, iron: 150, food: 50 },
    trainTime: 300,
    icon: '🏗️'
  },
  batteringRam: {
    name: '攻城锤',
    description: '专门破坏城门的重型攻城器械',
    attack: 100,
    infantryDefense: 8,
    cavalryDefense: 5,
    speed: 1,
    carryCapacity: 0,
    unitType: UNIT_TYPES.SIEGE,
    cost: { wood: 300, iron: 100, food: 30 },
    trainTime: 240,
    icon: '🔨'
  },
  
  // 特殊兵种
  ninja: {
    name: '忍者',
    description: '隐秘行动的特殊兵种，具有潜行和暗杀能力',
    attack: 35,
    infantryDefense: 15,
    cavalryDefense: 20,
    speed: 10,
    carryCapacity: 15,
    unitType: UNIT_TYPES.SPECIAL,
    cost: { wood: 80, iron: 120, food: 100 },
    trainTime: 200,
    icon: '🥷'
  },
  warElephant: {
    name: '战象',
    description: '巨型战争单位，具有极高的攻击力和防御力',
    attack: 60,
    infantryDefense: 40,
    cavalryDefense: 45,
    speed: 3,
    carryCapacity: 100,
    unitType: UNIT_TYPES.SPECIAL,
    cost: { wood: 150, iron: 200, food: 300 },
    trainTime: 400,
    icon: '🐘'
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