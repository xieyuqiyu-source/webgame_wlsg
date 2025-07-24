//=== 兵种配置文件（重构版）
//=== 现在兵种配置已整合到阵营配置中，此文件主要用于向后兼容

// 从阵营配置中导入兵种相关的类型和函数
import {
  UNIT_TYPES,
  UNIT_CATEGORIES,
  FACTION_TYPES,
  getFactionUnits,
  getAllUnits,
  getUnitById,
  getUnitsByType,
  getUnitsByFaction,
  getUnitsByFactionAndType
} from './factionConfig.js'

// 重新导出兵种类型和分类（保持向后兼容）
export { UNIT_TYPES, UNIT_CATEGORIES }

// ===== 向后兼容的兵种配置导出 =====
// 注意：实际的兵种配置现在存储在 factionConfig.js 中

/**
 * 获取蜀国兵种配置（向后兼容）
 */
export const SHU_UNITS_CONFIG = (() => {
  const units = getFactionUnits(FACTION_TYPES.SHU)
  const config = {}
  units.forEach(unit => {
    const { id, faction, ...unitData } = unit
    config[id] = unitData
  })
  return config
})()

/**
 * 获取魏国兵种配置（向后兼容）
 */
export const WEI_UNITS_CONFIG = (() => {
  const units = getFactionUnits(FACTION_TYPES.WEI)
  const config = {}
  units.forEach(unit => {
    const { id, faction, ...unitData } = unit
    config[id] = unitData
  })
  return config
})()

/**
 * 获取吴国兵种配置（向后兼容）
 */
export const WU_UNITS_CONFIG = (() => {
  const units = getFactionUnits(FACTION_TYPES.WU)
  const config = {}
  units.forEach(unit => {
    const { id, faction, ...unitData } = unit
    config[id] = unitData
  })
  return config
})()

//=== 统一兵种配置（向后兼容）
export const UNITS_CONFIG = (() => {
  const allUnits = getAllUnits()
  const config = {}
  allUnits.forEach(unit => {
    const { id, faction, ...unitData } = unit
    config[id] = unitData
  })
  return config
})()

//=== 获取兵种信息的辅助函数（向后兼容）
export function getUnitInfo(unitId) {
  const unit = getUnitById(unitId)
  if (!unit) return null
  const { id, faction, ...unitData } = unit
  return unitData
}

// 注意：以下函数现在直接使用从 factionConfig.js 导入的函数
// 这些导出保持向后兼容性
export {
  getAllUnits,
  getUnitById,
  getUnitsByType as getUnitsByTypeFromFaction,
  getFactionUnits as getUnitsByFaction,
  getUnitsByFactionAndType as getFactionUnitsByType
} from './factionConfig.js'