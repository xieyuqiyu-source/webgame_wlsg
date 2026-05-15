import { computed } from 'vue'
import { getUnitById } from '@/config/factionConfig.js'
import { useGameStore } from '@/store/modules/gameStore.js'
import { useMilitaryStore } from '@/store/modules/militaryStore.js'

const RESOURCE_ICONS = {
  wood: '🪵',
  soil: '🏔️',
  iron: '⚒️',
  food: '🌾'
}

export function useMilitaryHelpers() {
  const gameStore = useGameStore()
  const militaryStore = useMilitaryStore()

  const recruitmentQueue = computed(() => militaryStore.recruitmentQueue)

  const getUnitIcon = (unitId) => {
    const unit = getUnitById(unitId)
    return unit?.icon || '⚔️'
  }

  const getResourceIcon = (resource) => RESOURCE_ICONS[resource] || '❓'

  const formatTrainTime = (milliseconds) => {
    const minutes = Math.ceil(milliseconds / 60000)
    return `${minutes} 分钟`
  }

  return {
    gameStore,
    militaryStore,
    getResourceIcon,
    getUnitIcon,
    recruitmentQueue,
    formatTrainTime
  }
}
