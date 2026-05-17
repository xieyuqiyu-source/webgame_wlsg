import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getUnitById } from '../src/config/factionConfig.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT || 18790)
const HOST = process.env.HOST || '0.0.0.0'
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../data/saves')
const PLAYER_DATA_FILE = process.env.PLAYER_DATA_FILE || path.resolve(DATA_DIR, '../players.json')
const MAX_BODY_SIZE = 1024 * 1024
const USER_ID_PATTERN = /^[a-zA-Z0-9_-]{8,80}$/
const GAME_SAVE_VERSION = 2
const ONLINE_WINDOW_MS = 90 * 1000
let playerWriteQueue = Promise.resolve()

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

const isUnifiedSavePayload = (data) => {
  return isObject(data) && (Object.hasOwn(data, 'game') || Object.hasOwn(data, 'military') || Object.hasOwn(data, 'npc'))
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

const normalizeSavePayload = (rawData) => {
  if (!isUnifiedSavePayload(rawData)) {
    throw new Error('无法识别的存档格式')
  }

  return {
    version: GAME_SAVE_VERSION,
    savedAt: rawData.savedAt || rawData.exportTime || new Date().toISOString(),
    game: isObject(rawData.game) ? rawData.game : {},
    military: isObject(rawData.military) ? rawData.military : {},
    npc: normalizeNpcSection(rawData.npc)
  }
}

const json = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  response.end(JSON.stringify(payload))
}

const getSaveFilePath = (userId) => path.join(DATA_DIR, `${userId}.json`)

const ensureDataDir = async () => {
  await mkdir(DATA_DIR, { recursive: true })
}

const ensurePlayerDataDir = async () => {
  await mkdir(path.dirname(PLAYER_DATA_FILE), { recursive: true })
}

const validateUserId = (userId) => {
  return USER_ID_PATTERN.test(userId)
}

const readRequestBody = async (request) => {
  const chunks = []
  let totalLength = 0

  for await (const chunk of request) {
    totalLength += chunk.length
    if (totalLength > MAX_BODY_SIZE) {
      throw new Error('请求体过大')
    }
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    throw new Error('请求体不能为空')
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const loadSave = async (userId) => {
  try {
    const raw = await readFile(getSaveFilePath(userId), 'utf8')
    const parsed = JSON.parse(raw)
    return {
      exists: true,
      save: parsed.save,
      meta: parsed.meta
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        exists: false
      }
    }

    throw error
  }
}

const loadPlayerDirectory = async () => {
  try {
    const raw = await readFile(PLAYER_DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return isObject(parsed) ? parsed : {}
  } catch (error) {
    if (error.code === 'ENOENT') return {}
    throw error
  }
}

const savePlayerDirectory = async (players) => {
  await ensurePlayerDataDir()
  await writeFile(PLAYER_DATA_FILE, JSON.stringify(players, null, 2), 'utf8')
}

const updatePlayerDirectory = async (updater) => {
  const operation = playerWriteQueue.then(async () => {
    const players = await loadPlayerDirectory()
    const result = await updater(players)
    await savePlayerDirectory(players)
    return result
  })
  playerWriteQueue = operation.catch(() => {})
  return operation
}

const getArmyPower = (army = {}) => (
  Object.values(army).reduce((sum, count) => sum + (Number(count) || 0), 0)
)

const createPublicProfileFromSave = (userId, save) => {
  const game = save?.game || {}
  const military = save?.military || {}
  if (!game.userNickname || !game.userFaction) return null

  return {
    id: userId,
    name: game.userNickname,
    cityName: `${game.userNickname}的城池`,
    faction: game.userFaction,
    civilization: Number(game.citycivilization || 0),
    civilizationLevel: game.civilizationLevel || '',
    generalId: game.generalProgress?.id || '',
    armyPower: getArmyPower(military.army),
    hasProtection: false
  }
}

const normalizePublicProfile = (userId, rawProfile = {}) => {
  const profile = {
    id: userId,
    name: String(rawProfile.name || '').trim().slice(0, 40),
    cityName: String(rawProfile.cityName || '').trim().slice(0, 60),
    faction: String(rawProfile.faction || '').trim(),
    civilization: Math.max(0, Number(rawProfile.civilization) || 0),
    civilizationLevel: String(rawProfile.civilizationLevel || '').trim().slice(0, 40),
    generalId: String(rawProfile.generalId || '').trim().slice(0, 80),
    armyPower: Math.max(0, Number(rawProfile.armyPower) || 0),
    hasProtection: Boolean(rawProfile.hasProtection)
  }

  if (isObject(rawProfile.resources) || isObject(rawProfile.army)) {
    profile.snapshot = {
      resources: isObject(rawProfile.resources) ? {
        wood: Math.max(0, Number(rawProfile.resources.wood) || 0),
        soil: Math.max(0, Number(rawProfile.resources.soil) || 0),
        iron: Math.max(0, Number(rawProfile.resources.iron) || 0),
        food: Math.max(0, Number(rawProfile.resources.food) || 0)
      } : null,
      army: isObject(rawProfile.army)
        ? Object.fromEntries(
          Object.entries(rawProfile.army)
            .map(([unitId, count]) => [unitId, Math.max(0, Number(count) || 0)])
            .filter(([, count]) => count > 0)
        )
        : {}
    }
  }

  return profile
}

const upsertPlayerProfile = async (userId, rawProfile = {}, { touch = false } = {}) => {
  const profile = normalizePublicProfile(userId, rawProfile)
  if (!profile.name || !profile.faction) return null

  return updatePlayerDirectory(async (players) => {
    const previous = players[userId] || {}
    const now = new Date().toISOString()
    players[userId] = {
      ...previous,
      ...profile,
      createdAt: previous.createdAt || now,
      updatedAt: now,
      lastSeenAt: touch ? now : (previous.lastSeenAt || null)
    }
    return players[userId]
  })
}

const toPublicPlayer = (player) => {
  const lastSeenAt = player.lastSeenAt || null
  const lastSeenTime = lastSeenAt ? Date.parse(lastSeenAt) : 0
  return {
    id: player.id,
    name: player.name,
    cityName: player.cityName,
    faction: player.faction,
    civilization: player.civilization,
    civilizationLevel: player.civilizationLevel,
    generalId: player.generalId,
    armyPower: player.armyPower,
    hasProtection: player.hasProtection,
    lastActive: lastSeenTime || 0,
    isOnline: lastSeenTime > 0 && (Date.now() - lastSeenTime) <= ONLINE_WINDOW_MS
  }
}

const createScoutData = (player) => {
  const units = Object.entries(player.snapshot?.army || {}).reduce((result, [unitId, count]) => {
    const unit = getUnitById(unitId)
    if (!unit || count <= 0) return result
    result.push({
      id: unitId,
      ...unit,
      count
    })
    return result
  }, [])

  return {
    totalUnits: units.reduce((sum, unit) => sum + unit.count, 0),
    unitTypes: units.length,
    units,
    resources: player.snapshot?.resources || {
      wood: 0,
      soil: 0,
      iron: 0,
      food: 0
    }
  }
}

const saveCloudPayload = async (userId, rawPayload) => {
  const normalizedSave = normalizeSavePayload(rawPayload)
  const meta = {
    userId,
    updatedAt: new Date().toISOString(),
    version: normalizedSave.version
  }

  await writeFile(
    getSaveFilePath(userId),
    JSON.stringify({
      meta,
      save: normalizedSave
    }, null, 2),
    'utf8'
  )

  const profile = createPublicProfileFromSave(userId, normalizedSave)
  if (profile) {
    await upsertPlayerProfile(userId, profile)
  }

  return {
    save: normalizedSave,
    meta
  }
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  const pathname = requestUrl.pathname

  try {
    if (request.method === 'OPTIONS') {
      json(response, 204, {})
      return
    }

    if (request.method === 'GET' && pathname === '/api/health') {
      json(response, 200, {
        status: 'ok',
        service: 'wlsg-save-api'
      })
      return
    }

    if (request.method === 'GET' && pathname === '/api/players') {
      const players = await loadPlayerDirectory()
      const excludeUserId = requestUrl.searchParams.get('excludeUserId')
      json(response, 200, {
        ok: true,
        players: Object.values(players)
          .filter((player) => player.id !== excludeUserId)
          .map(toPublicPlayer)
          .sort((left, right) => Number(right.isOnline) - Number(left.isOnline) || right.lastActive - left.lastActive)
      })
      return
    }

    const heartbeatMatch = pathname.match(/^\/api\/players\/([a-zA-Z0-9_-]{8,80})\/heartbeat$/)
    if (heartbeatMatch && request.method === 'POST') {
      const [, userId] = heartbeatMatch
      const body = await readRequestBody(request)
      const player = await upsertPlayerProfile(userId, body, { touch: true })
      if (!player) {
        json(response, 400, { error: '玩家资料不完整' })
        return
      }
      json(response, 200, {
        ok: true,
        player: toPublicPlayer(player)
      })
      return
    }

    const scoutMatch = pathname.match(/^\/api\/players\/([a-zA-Z0-9_-]{8,80})\/scout$/)
    if (scoutMatch && request.method === 'POST') {
      const [, userId] = scoutMatch
      const players = await loadPlayerDirectory()
      const player = players[userId]
      if (!player) {
        json(response, 404, { error: '目标玩家不存在' })
        return
      }
      json(response, 200, {
        ok: true,
        scoutedAt: Date.now(),
        scoutData: createScoutData(player)
      })
      return
    }

    const saveMatch = pathname.match(/^\/api\/saves\/([a-zA-Z0-9_-]{8,80})$/)
    if (!saveMatch) {
      json(response, 404, {
        error: '接口不存在'
      })
      return
    }

    const [, userId] = saveMatch
    if (!validateUserId(userId)) {
      json(response, 400, {
        error: '无效的同步码'
      })
      return
    }

    await ensureDataDir()

    if (request.method === 'GET') {
      const result = await loadSave(userId)
      json(response, 200, {
        ok: true,
        ...result
      })
      return
    }

    if (request.method === 'PUT') {
      const body = await readRequestBody(request)
      const result = await saveCloudPayload(userId, body)
      json(response, 200, {
        ok: true,
        meta: result.meta
      })
      return
    }

    json(response, 405, {
      error: '不支持的请求方法'
    })
  } catch (error) {
    console.error('[save-api] request failed:', error)
    json(response, 500, {
      error: error.message || '服务异常'
    })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`[save-api] listening on ${HOST}:${PORT}, data dir: ${DATA_DIR}`)
})
