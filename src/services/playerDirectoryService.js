const DEFAULT_API_BASE = '/api'

const resolveApiBase = () => {
  const base = import.meta.env.VITE_SAVE_API_BASE || DEFAULT_API_BASE
  return base.endsWith('/') ? base.slice(0, -1) : base
}

const parseErrorMessage = async (response) => {
  try {
    const data = await response.json()
    return data.error || `请求失败：${response.status}`
  } catch {
    return `请求失败：${response.status}`
  }
}

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${resolveApiBase()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json()
}

export const fetchPlayers = async (excludeUserId = '') => {
  const query = excludeUserId ? `?excludeUserId=${encodeURIComponent(excludeUserId)}` : ''
  return requestJson(`/players${query}`, { method: 'GET' })
}

export const sendPlayerHeartbeat = async (userId, profile) => {
  if (!userId) throw new Error('用户标识不能为空')
  return requestJson(`/players/${encodeURIComponent(userId)}/heartbeat`, {
    method: 'POST',
    body: JSON.stringify(profile)
  })
}

export const scoutPlayer = async (userId) => {
  if (!userId) throw new Error('目标玩家不能为空')
  return requestJson(`/players/${encodeURIComponent(userId)}/scout`, {
    method: 'POST',
    body: JSON.stringify({})
  })
}
