import { COMBAT_RULE_DEFINITIONS, DEFAULT_COMBAT_RULE_ID } from './combatRules.js'
import { executeCombat } from './combatEngine.js'

const createRuleRuntime = (ruleDefinition) => ({
  ...ruleDefinition,
  calculateBattle(attackerArmy, defenderArmy) {
    return executeCombat({
      rule: ruleDefinition,
      attackerArmy,
      defenderArmy
    })
  }
})

export const getCombatRule = (ruleId) => {
  const definition = COMBAT_RULE_DEFINITIONS[ruleId] || COMBAT_RULE_DEFINITIONS[DEFAULT_COMBAT_RULE_ID]
  return createRuleRuntime(definition)
}

export const getAllCombatRules = () => Object.values(COMBAT_RULE_DEFINITIONS).map(createRuleRuntime)

export const isValidCombatRuleId = (ruleId) => Object.hasOwn(COMBAT_RULE_DEFINITIONS, ruleId)

export const resolveCombat = ({ ruleId, attackerArmy, defenderArmy }) => {
  return getCombatRule(ruleId).calculateBattle(attackerArmy, defenderArmy)
}
