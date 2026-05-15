const DEFAULT_API_BASE = '/api'
const CLOUD_SYNC_ID_STORAGE_KEY = 'wlsg_cloud_sync_id'

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

export const getStoredCloudSyncId = (fallbackId = '') => {
  return localStorage.getItem(CLOUD_SYNC_ID_STORAGE_KEY) || fallbackId
}

export const setStoredCloudSyncId = (syncId) => {
  const normalizedId = String(syncId || '').trim()
  if (!normalizedId) {
    localStorage.removeItem(CLOUD_SYNC_ID_STORAGE_KEY)
    return ''
  }

  localStorage.setItem(CLOUD_SYNC_ID_STORAGE_KEY, normalizedId)
  return normalizedId
}

export const fetchCloudSave = async (syncId) => {
  const normalizedId = String(syncId || '').trim()
  if (!normalizedId) {
    throw new Error('同步码不能为空')
  }

  return requestJson(`/saves/${encodeURIComponent(normalizedId)}`, {
    method: 'GET'
  })
}

export const uploadCloudSave = async (syncId, payload) => {
  const normalizedId = String(syncId || '').trim()
  if (!normalizedId) {
    throw new Error('同步码不能为空')
  }

  return requestJson(`/saves/${encodeURIComponent(normalizedId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}

export const checkCloudSaveHealth = async () => {
  return requestJson('/health', {
    method: 'GET'
  })
}
