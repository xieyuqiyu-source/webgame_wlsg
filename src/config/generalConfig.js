export const GENERAL_ATTRIBUTE_KEYS = {
  COMMAND: 'command',
  MARTIAL: 'martial',
  POLITICS: 'politics',
  STRATEGY: 'strategy'
}

export const GENERAL_ATTRIBUTES = {
  [GENERAL_ATTRIBUTE_KEYS.COMMAND]: {
    name: '统率',
    description: '提升部队防御、运载与行军组织能力'
  },
  [GENERAL_ATTRIBUTE_KEYS.MARTIAL]: {
    name: '武力',
    description: '提升部队攻击能力'
  },
  [GENERAL_ATTRIBUTE_KEYS.POLITICS]: {
    name: '政务',
    description: '提升资源产出效率'
  },
  [GENERAL_ATTRIBUTE_KEYS.STRATEGY]: {
    name: '谋略',
    description: '提升建设与征兵效率'
  }
}

export const GENERAL_EFFECT_TYPES = {
  ECONOMY: 'economy',
  BUILDING_SPEED: 'buildingSpeed',
  RECRUITMENT_SPEED: 'recruitmentSpeed',
  ATTACK: 'attack',
  DEFENSE: 'defense',
  CARRY: 'carry',
  MARCH_SPEED: 'marchSpeed',
  SCOUT_INSIGHT: 'scoutInsight'
}

export const GENERAL_CONFIG = {
  zhangQing: {
    id: 'zhangQing',
    faction: 'wei',
    name: '张青',
    title: '募兵老手',
    description: '善于整训新军，让兵营运转更快。',
    baseAttributes: { command: 4, martial: 3, politics: 4, strategy: 7 },
    trait: {
      name: '强募',
      description: '征兵速度提升，谋略越高效果越强。',
      effects: [
        { type: GENERAL_EFFECT_TYPES.RECRUITMENT_SPEED, base: 0.08, scaleAttribute: 'strategy', perPoint: 0.004 }
      ]
    }
  },
  chenJin: {
    id: 'chenJin',
    faction: 'wei',
    name: '陈禁',
    title: '斥候统领',
    description: '擅长军情搜集与行军侦测。',
    baseAttributes: { command: 5, martial: 3, politics: 4, strategy: 6 },
    trait: {
      name: '鹰眼',
      description: '侦查情报更完整，谋略越高越敏锐。',
      effects: [
        { type: GENERAL_EFFECT_TYPES.SCOUT_INSIGHT, base: 1, scaleAttribute: 'strategy', perPoint: 0.08 }
      ]
    }
  },
  wangHu: {
    id: 'wangHu',
    faction: 'wei',
    name: '王虎',
    title: '虎贲将',
    description: '攻守均衡，适合正面作战。',
    baseAttributes: { command: 6, martial: 6, politics: 3, strategy: 3 },
    trait: {
      name: '虎威',
      description: '全军攻防提升，统率与武力都会放大效果。',
      effects: [
        { type: GENERAL_EFFECT_TYPES.ATTACK, base: 0.04, scaleAttribute: 'martial', perPoint: 0.003 },
        { type: GENERAL_EFFECT_TYPES.DEFENSE, base: 0.04, scaleAttribute: 'command', perPoint: 0.003 }
      ]
    }
  },
  tangWen: {
    id: 'tangWen',
    faction: 'shu',
    name: '唐文',
    title: '转运使',
    description: '擅长调配辎重，出征收获更丰。',
    baseAttributes: { command: 6, martial: 4, politics: 5, strategy: 3 },
    trait: {
      name: '善载',
      description: '部队运载提升，统率越高效果越强。',
      effects: [
        { type: GENERAL_EFFECT_TYPES.CARRY, base: 0.12, scaleAttribute: 'command', perPoint: 0.004 }
      ]
    }
  },
  fuLin: {
    id: 'fuLin',
    faction: 'shu',
    name: '付麟',
    title: '经略使',
    description: '长于内政，能稳步抬高资源收益。',
    baseAttributes: { command: 3, martial: 3, politics: 7, strategy: 5 },
    trait: {
      name: '经略',
      description: '资源产量提升，政务越高效果越强。',
      effects: [
        { type: GENERAL_EFFECT_TYPES.ECONOMY, base: 0.06, scaleAttribute: 'politics', perPoint: 0.004 }
      ]
    }
  },
  guanAo: {
    id: 'guanAo',
    faction: 'shu',
    name: '关傲',
    title: '坚阵将',
    description: '擅守阵线，能减少部队在会战中的破绽。',
    baseAttributes: { command: 7, martial: 5, politics: 3, strategy: 3 },
    trait: {
      name: '坚阵',
      description: '全军防御提升，统率越高效果越强。',
      effects: [
        { type: GENERAL_EFFECT_TYPES.DEFENSE, base: 0.08, scaleAttribute: 'command', perPoint: 0.004 }
      ]
    }
  },
  sunCe: {
    id: 'sunCe',
    faction: 'wu',
    name: '孙策',
    title: '破阵将',
    description: '冲阵果决，最适合主动进攻。',
    baseAttributes: { command: 5, martial: 7, politics: 2, strategy: 4 },
    trait: {
      name: '霸王',
      description: '全军攻击提升，武力越高效果越强。',
      effects: [
        { type: GENERAL_EFFECT_TYPES.ATTACK, base: 0.08, scaleAttribute: 'martial', perPoint: 0.004 }
      ]
    }
  },
  daQiao: {
    id: 'daQiao',
    faction: 'wu',
    name: '大乔',
    title: '辅政',
    description: '善理城务，发展节奏更加顺滑。',
    baseAttributes: { command: 3, martial: 2, politics: 7, strategy: 6 },
    trait: {
      name: '辅政',
      description: '资源产量与建设速度提升，政务和谋略共同生效。',
      effects: [
        { type: GENERAL_EFFECT_TYPES.ECONOMY, base: 0.05, scaleAttribute: 'politics', perPoint: 0.003 },
        { type: GENERAL_EFFECT_TYPES.BUILDING_SPEED, base: 0.05, scaleAttribute: 'strategy', perPoint: 0.003 }
      ]
    }
  },
  lingTong: {
    id: 'lingTong',
    faction: 'wu',
    name: '凌统',
    title: '轻骑先锋',
    description: '擅长快速出击，让部队往返更利落。',
    baseAttributes: { command: 6, martial: 5, politics: 2, strategy: 5 },
    trait: {
      name: '疾行',
      description: '行军速度提升，统率越高效果越强。',
      effects: [
        { type: GENERAL_EFFECT_TYPES.MARCH_SPEED, base: 0.1, scaleAttribute: 'command', perPoint: 0.004 }
      ]
    }
  }
}

export const getGeneralById = (generalId) => GENERAL_CONFIG[generalId] || null

export const getGeneralsByFaction = (faction) => (
  Object.values(GENERAL_CONFIG).filter((general) => general.faction === faction)
)

export const getGeneralExpForNextLevel = (level = 1) => (
  Math.max(100, level * level * 100)
)

export const createGeneralProgress = (generalId) => {
  const general = getGeneralById(generalId)
  if (!general) return null

  return {
    id: general.id,
    level: 1,
    exp: 0,
    unspentPoints: 0,
    attributes: { ...general.baseAttributes }
  }
}
