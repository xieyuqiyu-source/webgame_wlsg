/**
 * 格式化工具函数
 * 提供数字、时间、文本等格式化功能
 */

//=== 格式化大数字显示
export function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

//=== 格式化文明度数值显示
export function formatCivilization(value) {
  return Math.floor(value).toLocaleString()
}

//=== 格式化时间显示（秒转换为时分秒）
export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}时${minutes}分${secs}秒`
  }
  if (minutes > 0) {
    return `${minutes}分${secs}秒`
  }
  return `${secs}秒`
}

//=== 格式化百分比显示
export function formatPercentage(value, decimals = 1) {
  return (value * 100).toFixed(decimals) + '%'
}

//=== 格式化资源显示（带单位）
export function formatResource(amount, resourceType) {
  const resourceUnits = {
    food: '粮食',
    wood: '木材', 
    stone: '石料',
    iron: '铁矿'
  }
  
  return `${formatNumber(amount)} ${resourceUnits[resourceType] || ''}`
}

//=== 防抖函数
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

//=== 节流函数
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}