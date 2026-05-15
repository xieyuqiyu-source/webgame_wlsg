import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT || 18790)
const HOST = process.env.HOST || '0.0.0.0'
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../data/saves')
const MAX_BODY_SIZE = 1024 * 1024
const USER_ID_PATTERN = /^[a-zA-Z0-9_-]{8,80}$/
const GAME_SAVE_VERSION = 2

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
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  response.end(JSON.stringify(payload))
}

const getSaveFilePath = (userId) => path.join(DATA_DIR, `${userId}.json`)

const ensureDataDir = async () => {
  await mkdir(DATA_DIR, { recursive: true })
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
