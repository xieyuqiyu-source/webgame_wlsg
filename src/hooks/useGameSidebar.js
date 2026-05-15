import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { calculateProduction, calculateWarehouseUpgradeCost, BUILDING_TYPES, WAREHOUSE_CONFIG } from '@/config/gameConfig.js'
import { getFactionConfig, getUnitById } from '@/config/factionConfig.js'
import { getResourceIcon, getResourceName } from '@/config/resources.js'
import { useGameStore } from '@/store/modules/gameStore.js'
import { formatCivilization, formatNumber, formatTime } from '@/utils/formatters.js'

const NAV_ITEMS = [
  {
    key: 'city',
    label: '城池',
    route: '/city',
    iconPath: 'M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z'
  },
  {
    key: 'military',
    label: '军事',
    route: '/military',
    iconPath: 'M12 2L13.09 8.26L22 9L17 14L18.18 22.74L12 19.27L5.82 22.74L7 14L2 9L10.91 8.26L12 2Z'
  },
  {
    key: 'map',
    label: '地图',
    route: '/map',
    iconPath: 'M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3Z'
  },
  {
    key: 'settings',
    label: '设置',
    route: '/settings',
    iconPath: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z'
  },
  {
    key: 'message',
    label: '信函',
    route: '/message',
    iconPath: 'M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z'
  },
  {
    key: 'notification-test',
    label: '通知',
    route: '/notification-test',
    iconPath: 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 6.5C21 8.43 19.43 10 17.5 10S14 8.43 14 6.5 15.57 3 17.5 3 21 4.57 21 6.5ZM10 6.5C10 8.43 8.43 10 6.5 10S3 8.43 3 6.5 4.57 3 6.5 3 10 4.57 10 6.5ZM12 8C15.31 8 18 10.69 18 14V16L20 18V19H4V18L6 16V14C6 10.69 8.69 8 12 8ZM10 20H14C14 21.1 13.1 22 12 22S10 21.1 10 20Z'
  }
]

export function useGameSidebar(props, emit) {
  const router = useRouter()
  const gameStore = useGameStore()
  const isCollapsed = ref(false)
  const showTooltip = ref(false)
  const showProductionTooltip = ref(null)
  const showBoostDialog = ref(false)
  const showFillTooltip = ref(false)
  const showBoostTooltip = ref(false)
  const currentTime = ref(Date.now())
  let progressTimer = null

  const isWarehouseUpgrading = computed(() => gameStore.isWarehouseUpgrading)

  const warehouseUpgradeProgress = computed(() => {
    if (!gameStore.warehouseUpgrade) return 0
    const elapsed = currentTime.value - gameStore.warehouseUpgrade.startTime
    return Math.min((elapsed / gameStore.warehouseUpgrade.duration) * 100, 100)
  })

  const warehouseUpgradeTimeLeft = computed(() => {
    if (!gameStore.warehouseUpgrade) return 0
    const elapsed = currentTime.value - gameStore.warehouseUpgrade.startTime
    const remaining = Math.max(0, gameStore.warehouseUpgrade.duration - elapsed)
    return Math.ceil(remaining / 1000)
  })

  const resources = computed(() => (
    ['wood', 'soil', 'iron', 'food'].map((type) => ({
      name: getResourceName(type),
      type,
      icon: getResourceIcon(type),
      current: Math.floor(gameStore.resources[type] || 0),
      max: Math.floor(gameStore.warehouseCapacity || 0)
    }))
  ))

  const productions = computed(() => (
    ['wood', 'soil', 'iron', 'food'].map((type) => {
      let baseProduction = 0
      const buildingTypeMap = {
        wood: BUILDING_TYPES.WOOD_MILL,
        soil: BUILDING_TYPES.SOIL_MINE,
        iron: BUILDING_TYPES.IRON_MINE,
        food: BUILDING_TYPES.FARM
      }

      const buildingType = buildingTypeMap[type]
      if (buildingType && gameStore.buildings[buildingType]) {
        gameStore.buildings[buildingType].forEach((level) => {
          if (level > 0) {
            baseProduction += calculateProduction(buildingType, level, null)
          }
        })
      }

      let bonusText = '无加成'
      let bonusClass = 'text-gray-400'

      if (gameStore.userFaction) {
        const factionConfig = getFactionConfig(gameStore.userFaction)
        const economyBonus = factionConfig?.traits?.economyBonus || 1.0
        const bonusPercent = Math.round((economyBonus - 1) * 100)

        if (bonusPercent > 0) {
          bonusText = `+${bonusPercent}% (${factionConfig.name})`
          bonusClass = 'text-green-400'
        } else if (bonusPercent < 0) {
          bonusText = `${bonusPercent}% (${factionConfig.name})`
          bonusClass = 'text-red-400'
        }
      }

      return {
        name: getResourceName(type),
        type,
        icon: getResourceIcon(type),
        rate: Math.floor(gameStore.hourlyProduction[type] || 0),
        baseProduction: Math.floor(baseProduction),
        bonusText,
        bonusClass
      }
    })
  ))

  const warehouseUpgradeCost = computed(() => calculateWarehouseUpgradeCost(gameStore.warehouseLevel))
  const boostOptions = computed(() => ([
    { hours: 1, cost: gameStore.calculateBoostCost(1), description: '短期加速，适合快速收集资源' },
    { hours: 4, cost: gameStore.calculateBoostCost(4), description: '中期加速，性价比较高' },
    { hours: 8, cost: gameStore.calculateBoostCost(8), description: '长期加速，适合离线挂机' },
    { hours: 24, cost: gameStore.calculateBoostCost(24), description: '全天加速，效果最佳' }
  ]))
  const warehouseBoostCost = computed(() => 50)
  const isWarehouseBoostActive = computed(() => gameStore.isWarehouseBoostActive)
  const warehouseBoostTimeLeft = computed(() => {
    if (!gameStore.warehouseBoost) return 0
    const elapsed = currentTime.value - gameStore.warehouseBoost.startTime
    const remaining = Math.max(0, gameStore.warehouseBoost.duration - elapsed)
    return Math.ceil(remaining / 1000)
  })

  const getUnitIcon = (unitId) => getUnitById(unitId)?.icon || '⚔️'
  const getUnitName = (unitId) => getUnitById(unitId)?.name || '未知兵种'

  const startProgressTimer = () => {
    stopProgressTimer()
    progressTimer = setInterval(() => {
      currentTime.value = Date.now()
    }, 100)
  }

  const stopProgressTimer = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }

  const watchUpgradeStatus = () => {
    if (isWarehouseUpgrading.value) {
      startProgressTimer()
    } else {
      stopProgressTimer()
    }
  }

  const startBoost = (hours) => {
    if (gameStore.coins < gameStore.calculateBoostCost(hours)) return
    if (gameStore.startProductionBoost(hours)) {
      showBoostDialog.value = false
    }
  }

  const fillWarehouse = () => {
    if (gameStore.coins < 10) return
    gameStore.fillWarehouse()
  }

  const activateWarehouseBoost = () => {
    if (gameStore.coins < warehouseBoostCost.value || isWarehouseBoostActive.value) return
    gameStore.activateWarehouseBoost()
  }

  const toggleSidebar = () => {
    if (props.isMobile) {
      emit('close-mobile')
      return
    }

    isCollapsed.value = !isCollapsed.value
    emit('toggle', isCollapsed.value)
  }

  const upgradeWarehouse = () => {
    gameStore.upgradeWarehouse()
  }

  const handleNavClick = (navType) => {
    emit('nav-click', navType)
    const navItem = NAV_ITEMS.find((item) => item.key === navType)
    if (navItem && router.currentRoute.value.path !== navItem.route) {
      router.push(navItem.route)
    }
    if (props.isMobile) {
      emit('close-mobile')
    }
  }

  const handleCoinsClick = () => {
    const amount = prompt('GM操作：请输入要添加的金币数量', '100')
    if (amount && !Number.isNaN(Number.parseInt(amount, 10)) && Number.parseInt(amount, 10) > 0) {
      gameStore.addCoins(Number.parseInt(amount, 10))
    }
  }

  onMounted(() => {
    watchEffect(() => {
      watchUpgradeStatus()
    })
  })

  onUnmounted(() => {
    stopProgressTimer()
  })

  return {
    NAV_ITEMS,
    WAREHOUSE_CONFIG,
    activateWarehouseBoost,
    boostOptions,
    fillWarehouse,
    formatCivilization,
    formatNumber,
    formatTime,
    gameStore,
    getResourceName,
    getUnitIcon,
    getUnitName,
    handleCoinsClick,
    handleNavClick,
    isCollapsed,
    isWarehouseBoostActive,
    isWarehouseUpgrading,
    productions,
    resources,
    showBoostDialog,
    showBoostTooltip,
    showFillTooltip,
    showProductionTooltip,
    showTooltip,
    startBoost,
    toggleSidebar,
    upgradeWarehouse,
    warehouseBoostCost,
    warehouseBoostTimeLeft,
    warehouseUpgradeCost,
    warehouseUpgradeProgress,
    warehouseUpgradeTimeLeft
  }
}
