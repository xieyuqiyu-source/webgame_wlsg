import { createGeneralProgress } from '../../../src/config/generalConfig.js'

const DEFAULT_UUID = '11111111-1111-4111-8111-111111111111'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function mergeDeep(target, source) {
  if (!source) return target

  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      target[key] = clone(value)
      return
    }

    if (value && typeof value === 'object') {
      target[key] = mergeDeep(target[key] ? { ...target[key] } : {}, value)
      return
    }

    target[key] = value
  })

  return target
}

export function createGameState(overrides = {}) {
  const now = Date.now()
  const baseState = {
    userUUID: DEFAULT_UUID,
    userNickname: 'e2e_tester',
    userFaction: 'wei',
    generalProgress: createGeneralProgress('wangHu'),
    isFirstTime: false,
    resources: {
      wood: 4800,
      soil: 4800,
      iron: 4800,
      food: 4800
    },
    coins: 1000,
    buildings: {
      woodMill: [1, 0, 0, 0, 0],
      soilMine: [1, 0, 0, 0, 0],
      ironMine: [1, 0, 0, 0, 0],
      farm: [1, 0, 0, 0, 0]
    },
    buildingUpgrades: {
      woodMill: [null, null, null, null, null],
      soilMine: [null, null, null, null, null],
      ironMine: [null, null, null, null, null],
      farm: [null, null, null, null, null]
    },
    warehouseLevel: 1,
    warehouseUpgrade: null,
    lastUpdateTime: now,
    isPaused: false,
    accumulatedProduction: {
      wood: 0,
      soil: 0,
      iron: 0,
      food: 0
    },
    army: {},
    recruitmentQueue: [],
    recruitmentConfig: {
      baseTrainTime: 5 * 60 * 1000,
      speedMultiplier: 1
    },
    productionBoost: {
      isActive: false,
      multiplier: 1.4,
      startTime: null,
      duration: 0,
      endTime: null
    },
    warehouseBoost: {
      isActive: false,
      multiplier: 2,
      startTime: null,
      duration: 24 * 60 * 60 * 1000,
      endTime: null
    }
  }

  return mergeDeep(baseState, overrides)
}

export async function seedGameState(page, overrides = {}) {
  const state = createGameState(overrides)

  await page.addInitScript((gameState) => {
    window.localStorage.clear()
    window.localStorage.setItem('wlsg_user_uuid', gameState.userUUID)
    window.localStorage.setItem('wlsg_game_data', JSON.stringify(gameState))
    window.localStorage.removeItem('wlsg_messages')
    window.localStorage.removeItem('npc_store_data')
  }, state)

  return state
}

export async function persistGameState(page) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('beforeunload'))
  })
}

export async function readSavedGameState(page) {
  return page.evaluate(() => {
    const savedData = JSON.parse(window.localStorage.getItem('wlsg_game_data') || 'null')
    if (!savedData?.game) return savedData

    return {
      ...savedData.game,
      ...(savedData.military || {}),
      npc: savedData.npc
    }
  })
}
