import { sendPlayerHeartbeat } from './playerDirectoryService.js'

export const buildPlayerPresenceProfile = (gameStore, militaryStore) => ({
  name: gameStore.userNickname,
  cityName: `${gameStore.userNickname || '未命名'}的城池`,
  faction: gameStore.userFaction,
  civilization: gameStore.citycivilization,
  civilizationLevel: gameStore.civilizationLevel?.level || '',
  generalId: gameStore.generalProgress?.id || '',
  armyPower: militaryStore.totalArmyCount,
  hasProtection: false,
  resources: { ...gameStore.resources },
  army: { ...militaryStore.army }
})

export const reportPlayerPresence = async (gameStore, militaryStore) => {
  if (!gameStore.userUUID || !gameStore.userNickname || !gameStore.userFaction) {
    return null
  }

  return sendPlayerHeartbeat(
    gameStore.userUUID,
    buildPlayerPresenceProfile(gameStore, militaryStore)
  )
}
