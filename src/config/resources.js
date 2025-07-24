//=== 游戏资源配置 - 定义游戏中各种资源的图标URL

/**
 * 游戏资源图标配置
 * 包含木材、泥土、铁矿、粮食等基础资源的图标URL
 */
export const RESOURCE_ICONS = {
  // 木材图标
  wood: 'http://static.sg.9wee.com/newsg/pic_mc.gif',
  
  // 泥土图标
  soil: 'http://static.sg.9wee.com/newsg/pic_nt.gif',
  
  // 铁矿图标
  iron: 'http://static.sg.9wee.com/newsg/pic_tk.gif',
  
  // 粮食图标
  food: 'http://static.sg.9wee.com/newsg/pic_ls.gif'
}

/**
 * 资源名称映射
 * 用于显示中文名称
 */
export const RESOURCE_NAMES = {
  wood: '木材',
  soil: '泥土', 
  iron: '铁矿',
  food: '粮食'
}

/**
 * 获取资源图标URL
 * @param {string} resourceType - 资源类型
 * @returns {string} 图标URL
 */
export const getResourceIcon = (resourceType) => {
  return RESOURCE_ICONS[resourceType] || ''
}

/**
 * 获取资源名称
 * @param {string} resourceType - 资源类型
 * @returns {string} 资源中文名称
 */
export const getResourceName = (resourceType) => {
  return RESOURCE_NAMES[resourceType] || resourceType
}