import {
  GENERAL_EFFECT_TYPES,
  getGeneralById
} from '@/config/generalConfig.js'

const createBaseBonuses = () => ({
  economyMultiplier: 1,
  buildingTimeMultiplier: 1,
  recruitmentTimeMultiplier: 1,
  attackMultiplier: 1,
  defenseMultiplier: 1,
  carryMultiplier: 1,
  marchSpeedMultiplier: 1,
  scoutInsight: 0
})

const getAttributeValue = (progress, key) => Math.max(0, progress?.attributes?.[key] || 0)

const resolveEffectValue = (effect, progress) => {
  const scaled = effect.scaleAttribute
    ? getAttributeValue(progress, effect.scaleAttribute) * (effect.perPoint || 0)
    : 0
  return Math.max(0, (effect.base || 0) + scaled)
}

export const resolveGeneralBonuses = (generalProgress) => {
  const bonuses = createBaseBonuses()
  const general = getGeneralById(generalProgress?.id)
  if (!general) return bonuses

  general.trait.effects.forEach((effect) => {
    const value = resolveEffectValue(effect, generalProgress)

    switch (effect.type) {
      case GENERAL_EFFECT_TYPES.ECONOMY:
        bonuses.economyMultiplier += value
        break
      case GENERAL_EFFECT_TYPES.BUILDING_SPEED:
        bonuses.buildingTimeMultiplier = Math.max(0.5, bonuses.buildingTimeMultiplier - value)
        break
      case GENERAL_EFFECT_TYPES.RECRUITMENT_SPEED:
        bonuses.recruitmentTimeMultiplier = Math.max(0.5, bonuses.recruitmentTimeMultiplier - value)
        break
      case GENERAL_EFFECT_TYPES.ATTACK:
        bonuses.attackMultiplier += value
        break
      case GENERAL_EFFECT_TYPES.DEFENSE:
        bonuses.defenseMultiplier += value
        break
      case GENERAL_EFFECT_TYPES.CARRY:
        bonuses.carryMultiplier += value
        break
      case GENERAL_EFFECT_TYPES.MARCH_SPEED:
        bonuses.marchSpeedMultiplier += value
        break
      case GENERAL_EFFECT_TYPES.SCOUT_INSIGHT:
        bonuses.scoutInsight += value
        break
      default:
        break
    }
  })

  return bonuses
}

export const applyGeneralBonusesToUnit = (unit, generalBonuses) => ({
  ...unit,
  attack: Math.floor((unit.attack || 0) * generalBonuses.attackMultiplier),
  infantryDefense: Math.floor((unit.infantryDefense || 0) * generalBonuses.defenseMultiplier),
  cavalryDefense: Math.floor((unit.cavalryDefense || 0) * generalBonuses.defenseMultiplier),
  carryCapacity: Math.floor((unit.carryCapacity || 0) * generalBonuses.carryMultiplier),
  speed: Math.max(1, Math.floor((unit.speed || 0) * generalBonuses.marchSpeedMultiplier))
})
