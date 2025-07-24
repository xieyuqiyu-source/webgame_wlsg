/**
 * 城池文明度配置
 * 定义文明度等级阈值、描述和样式
 */

//=== 文明度等级配置数组
export const CIVILIZATION_LEVELS = [
  { threshold: 1000, level: '繁荣昌盛', color: 'text-purple-600', statusColor: 'purple' },
  { threshold: 500, level: '兴旺发达', color: 'text-blue-600', statusColor: 'blue' },
  { threshold: 200, level: '蒸蒸日上', color: 'text-green-600', statusColor: 'green' },
  { threshold: 100, level: '小有成就', color: 'text-yellow-600', statusColor: 'yellow' },
  { threshold: 50, level: '初具规模', color: 'text-orange-600', statusColor: 'orange' },
  { threshold: 0, level: '起步发展', color: 'text-gray-600', statusColor: 'gray' }
]

//=== 文明度计算系数配置
export const CIVILIZATION_COEFFICIENTS = {
  // 产量分数系数：每小时总产量除以此值得到产量分数
  PRODUCTION_DIVISOR: 10,
  
  // 建筑等级分数系数：建筑等级总和乘以此值得到建筑分数
  BUILDING_MULTIPLIER: 2,
  
  // 仓库等级加成系数：仓库等级乘以此值得到仓库加成
  WAREHOUSE_MULTIPLIER: 5,
  
  // 建筑产量系数：每级建筑每小时产出单位数
  BUILDING_PRODUCTION_PER_LEVEL: 10,
  
  // 最低文明度值
  MIN_CIVILIZATION: 1
}

//=== 根据文明度值获取等级信息
export function getCivilizationLevel(civilizationValue) {
  for (const level of CIVILIZATION_LEVELS) {
    if (civilizationValue >= level.threshold) {
      return level
    }
  }
  // 默认返回最低等级
  return CIVILIZATION_LEVELS[CIVILIZATION_LEVELS.length - 1]
}

//=== 计算文明度值的核心函数
export function calculateCivilization(buildings, warehouseLevel) {
  const {
    PRODUCTION_DIVISOR,
    BUILDING_MULTIPLIER,
    WAREHOUSE_MULTIPLIER,
    BUILDING_PRODUCTION_PER_LEVEL,
    MIN_CIVILIZATION
  } = CIVILIZATION_COEFFICIENTS
  
  // 计算总产量
  const totalProduction = Object.values(buildings).flat().reduce((total, level) => {
    return total + level * BUILDING_PRODUCTION_PER_LEVEL
  }, 0)
  
  // 计算各项分数
  const productionScore = totalProduction / PRODUCTION_DIVISOR
  const buildingLevelScore = Object.values(buildings).flat().reduce((sum, level) => sum + level, 0) * BUILDING_MULTIPLIER
  const warehouseBonus = warehouseLevel * WAREHOUSE_MULTIPLIER
  
  // 计算总文明度
  const totalCivilization = productionScore + buildingLevelScore + warehouseBonus
  
  return Math.max(MIN_CIVILIZATION, totalCivilization)
}