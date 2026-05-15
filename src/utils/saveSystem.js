export const GAME_SAVE_STORAGE_KEY = 'wlsg_game_data'
export const LEGACY_NPC_STORAGE_KEY = 'npc_store_data'
export const GAME_SAVE_VERSION = 2

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

const isUnifiedSavePayload = (data) => {
  return isObject(data) && (Object.hasOwn(data, 'game') || Object.hasOwn(data, 'military') || Object.hasOwn(data, 'npc'))
}

const isLegacyFlatGameData = (data) => {
  return isObject(data) && isObject(data.resources) && isObject(data.buildings)
}

const normalizeNpcSection = (npcData) => {
  if (!isObject(npcData)) {
    return {
      npcs: [],
      lastGeneratedTime: 0,
      generationInterval: 3600000,
      manualRefreshCost: 50,
      isInitialized: false
    }
  }

  return {
    npcs: Array.isArray(npcData.npcs) ? npcData.npcs : [],
    lastGeneratedTime: npcData.lastGeneratedTime || 0,
    generationInterval: npcData.generationInterval || 3600000,
    manualRefreshCost: npcData.manualRefreshCost || 50,
    isInitialized: Boolean(npcData.isInitialized)
  }
}

export const createUnifiedSavePayload = ({ game = {}, military = {}, npc = {}, savedAt = new Date().toISOString() } = {}) => {
  return {
    version: GAME_SAVE_VERSION,
    savedAt,
    game,
    military,
    npc: normalizeNpcSection(npc)
  }
}

export const normalizeSavePayload = (rawData, legacyNpcData = null) => {
  if (!isObject(rawData)) {
    throw new Error('无效的存档数据')
  }

  if (isUnifiedSavePayload(rawData)) {
    return createUnifiedSavePayload({
      game: rawData.game || {},
      military: rawData.military || {},
      npc: rawData.npc || {},
      savedAt: rawData.savedAt || rawData.exportTime || new Date().toISOString()
    })
  }

  if (isLegacyFlatGameData(rawData)) {
    return createUnifiedSavePayload({
      game: {
        userUUID: rawData.userUUID,
        userNickname: rawData.userNickname,
        userFaction: rawData.userFaction,
        isFirstTime: rawData.isFirstTime,
        resources: rawData.resources,
        coins: rawData.coins,
        buildings: rawData.buildings,
        buildingUpgrades: rawData.buildingUpgrades,
        warehouseLevel: rawData.warehouseLevel,
        warehouseUpgrade: rawData.warehouseUpgrade,
        lastUpdateTime: rawData.lastUpdateTime,
        isPaused: rawData.isPaused,
        accumulatedProduction: rawData.accumulatedProduction,
        productionBoost: rawData.productionBoost,
        warehouseBoost: rawData.warehouseBoost
      },
      military: {
        army: rawData.army,
        recruitmentQueue: rawData.recruitmentQueue,
        recruitmentConfig: rawData.recruitmentConfig
      },
      npc: normalizeNpcSection(legacyNpcData),
      savedAt: rawData.savedAt || rawData.exportTime || new Date().toISOString()
    })
  }

  throw new Error('无法识别的存档格式')
}

export const saveUnifiedGameData = (payload) => {
  localStorage.setItem(GAME_SAVE_STORAGE_KEY, JSON.stringify(payload))
  localStorage.removeItem(LEGACY_NPC_STORAGE_KEY)
}

export const loadUnifiedGameData = () => {
  const rawPrimary = localStorage.getItem(GAME_SAVE_STORAGE_KEY)
  const rawLegacyNpc = localStorage.getItem(LEGACY_NPC_STORAGE_KEY)
  const legacyNpcData = rawLegacyNpc ? JSON.parse(rawLegacyNpc) : null

  if (!rawPrimary) {
    return null
  }

  const primaryData = JSON.parse(rawPrimary)
  return normalizeSavePayload(primaryData, legacyNpcData)
}

export const clearUnifiedGameData = () => {
  localStorage.removeItem(GAME_SAVE_STORAGE_KEY)
  localStorage.removeItem(LEGACY_NPC_STORAGE_KEY)
}
