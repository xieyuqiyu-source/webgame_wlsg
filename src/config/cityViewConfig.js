const createBuildings = (label, buildingType, icon, startId) => (
  Array.from({ length: 5 }, (_, index) => ({
    id: startId + index,
    name: `${label} ${index + 1}`,
    buildingType,
    buildingIndex: index,
    icon
  }))
)

export const RESOURCE_BUILDINGS = {
  wood: createBuildings('伐木场', 'woodMill', '🪓', 1),
  soil: createBuildings('泥土矿', 'soilMine', '⛏️', 6),
  iron: createBuildings('铁矿', 'ironMine', '⚒️', 11),
  food: createBuildings('农场', 'farm', '🌾', 16)
}
