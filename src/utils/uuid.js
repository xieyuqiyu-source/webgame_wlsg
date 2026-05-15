//=== UUID 工具函数 - 生成和管理用户唯一标识

/**
 * 生成UUID v4格式的唯一标识符
 * @returns {string} UUID字符串
 */
export function generateUUID() {
  // 使用crypto.randomUUID()如果可用，否则使用fallback方法
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback方法：使用Math.random()生成UUID v4格式
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 获取或生成用户UUID
 * 如果本地存储中已有UUID则返回，否则生成新的UUID并保存
 * @returns {string} 用户UUID
 */
export function getUserUUID() {
  const STORAGE_KEY = 'wlsg_user_uuid'
  
  // 尝试从本地存储获取现有UUID
  let userUUID = localStorage.getItem(STORAGE_KEY)
  
  // 如果没有UUID或UUID格式无效，则生成新的
  if (!userUUID || !isValidUUID(userUUID)) {
    userUUID = generateUUID()
    localStorage.setItem(STORAGE_KEY, userUUID)
    console.log('生成新的用户UUID:', userUUID)
  } else {
    console.log('使用现有用户UUID:', userUUID)
  }
  
  return userUUID
}

/**
 * 将指定UUID写入本地存储
 * @param {string} uuid - 需要持久化的UUID
 * @returns {string} 持久化后的UUID
 */
export function setStoredUserUUID(uuid) {
  const STORAGE_KEY = 'wlsg_user_uuid'
  if (!isValidUUID(uuid)) {
    throw new Error('无效的UUID，无法写入本地存储')
  }

  localStorage.setItem(STORAGE_KEY, uuid)
  return uuid
}

/**
 * 验证UUID格式是否正确
 * @param {string} uuid - 要验证的UUID字符串
 * @returns {boolean} 是否为有效的UUID格式
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return typeof uuid === 'string' && uuidRegex.test(uuid)
}

/**
 * 重新生成用户UUID（慎用！会丢失与旧UUID的关联）
 * @returns {string} 新的用户UUID
 */
export function regenerateUserUUID() {
  const STORAGE_KEY = 'wlsg_user_uuid'
  const newUUID = generateUUID()
  localStorage.setItem(STORAGE_KEY, newUUID)
  console.log('重新生成用户UUID:', newUUID)
  return newUUID
}
