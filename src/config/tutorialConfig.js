export const TUTORIAL_KEYS = {
  MILITARY_TECHNOLOGY: 'militaryTechnology',
  UNIT_DETAILS: 'unitDetails'
}

export const TUTORIALS = {
  [TUTORIAL_KEYS.MILITARY_TECHNOLOGY]: {
    title: '科技',
    body: '后续会承载兵种强化、经济发展和专属加成等长期成长内容。',
    items: ['当前先预留说明位，文案可逐步补齐']
  },
  [TUTORIAL_KEYS.UNIT_DETAILS]: {
    title: '兵种详情',
    body: '这里用于比较不同兵种的定位、消耗和战斗参数。出征前先看一眼，通常能少走不少弯路。',
    items: ['后续可继续补充克制关系、适用场景和养成建议']
  }
}

export const getTutorial = (key) => {
  return TUTORIALS[key] || null
}
