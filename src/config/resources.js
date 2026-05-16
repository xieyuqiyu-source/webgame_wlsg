//=== 游戏资源配置 - 定义游戏中各种资源的图标URL

import woodIcon from '@/assets/resources/wood.gif'
import soilIcon from '@/assets/resources/soil.gif'
import ironIcon from '@/assets/resources/iron.gif'
import foodIcon from '@/assets/resources/food.gif'

/**
 * 游戏资源图标配置
 * 包含木材、泥土、铁矿、粮食等基础资源的图标URL
 */
export const RESOURCE_ICONS = {
  wood: woodIcon,
  soil: soilIcon,
  iron: ironIcon,
  food: foodIcon
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
