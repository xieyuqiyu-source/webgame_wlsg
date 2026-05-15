export const COMBAT_RULE_IDS = {
  CLASSIC_CRUSH: 'CLASSIC_CRUSH',
  PLUNDER_STRIKE: 'PLUNDER_STRIKE'
}

export const COMBAT_ACTION_TYPES = {
  ATTACK: 'ATTACK',
  PLUNDER: 'PLUNDER'
}

export const COMBAT_RESULTS = {
  ATTACKER_VICTORY: 'ATTACKER_VICTORY',
  DEFENDER_VICTORY: 'DEFENDER_VICTORY'
}

export const COMBAT_TIME_CONFIG = {
  BASE_MARCH_TIME: 2,

  calculateMarchTime(distance, army) {
    const slowestSpeed = this.getArmySlowestSpeed(army)
    const baseTime = distance * this.BASE_MARCH_TIME
    const speedModifier = slowestSpeed / 100
    return Math.ceil(baseTime / Math.max(speedModifier, 0.1))
  },

  getArmySlowestSpeed(army) {
    if (!army.units || army.units.length === 0) return 100
    return Math.min(...army.units.map((unit) => unit.speed || 100))
  }
}
