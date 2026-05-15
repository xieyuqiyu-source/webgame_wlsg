<template>
  <div class="battle-simulator">
    <div class="simulator-header">
      <div>
        <h2 class="title">战斗模拟器</h2>
        <p class="subtitle">极简录入模式，优先方便数值调试</p>
      </div>
      <div class="battle-actions header-actions">
        <button @click="clearAllUnits" class="action-button ghost-button">
          清空
        </button>
        <button @click="randomizeArmies" class="action-button ghost-button">
          随机
        </button>
        <button
          @click="startBattle"
          :disabled="!canStartBattle"
          :class="['action-button', 'primary-button', { disabled: !canStartBattle }]"
        >
          开始战斗
        </button>
      </div>
    </div>

    <section class="preset-panel">
      <div class="preset-block">
        <div class="preset-block-header">
          <h3 class="preset-title">单兵种快捷预设</h3>
          <div class="preset-header-actions">
            <p class="preset-subtitle">一键给攻方或守方填入指定兵种和数量</p>
            <div class="apply-mode-toggle">
              <button
                :class="['mode-button', { active: presetApplyMode === 'replace' }]"
                @click="presetApplyMode = 'replace'"
              >
                覆盖
              </button>
              <button
                :class="['mode-button', { active: presetApplyMode === 'append' }]"
                @click="presetApplyMode = 'append'"
              >
                追加
              </button>
            </div>
          </div>
        </div>
        <div class="preset-grid">
          <div
            v-for="preset in quickUnitPresets"
            :key="preset.id"
            class="preset-card"
          >
            <div class="preset-card-main">
              <div class="preset-card-title">{{ preset.label }}</div>
              <div class="preset-card-meta">
                {{ getFactionLabel(preset.faction) }} · {{ preset.unitName }} × {{ preset.count }}
              </div>
            </div>
            <div class="preset-card-actions">
              <button class="mini-button" @click="applySingleUnitPreset('attacker', preset)">攻</button>
              <button class="mini-button" @click="applySingleUnitPreset('defender', preset)">守</button>
            </div>
          </div>
        </div>
      </div>

      <div class="preset-block">
        <div class="preset-block-header">
          <h3 class="preset-title">常用对战场景</h3>
          <p class="preset-subtitle">一键填入整场攻守兵力，方便快速压测战斗规则</p>
        </div>
        <div class="scenario-grid">
          <button
            v-for="preset in battleScenarioPresets"
            :key="preset.id"
            class="scenario-button"
            @click="applyScenarioPreset(preset)"
          >
            <span class="scenario-name">{{ preset.label }}</span>
            <span class="scenario-detail">{{ preset.summary }}</span>
          </button>
        </div>
      </div>

      <div class="preset-block">
        <div class="preset-block-header">
          <h3 class="preset-title">极端压测场景</h3>
          <p class="preset-subtitle">专门拿来测试破防、僵持、碾压、近乎无损这些边界情况</p>
        </div>
        <div class="scenario-grid">
          <button
            v-for="preset in extremeScenarioPresets"
            :key="preset.id"
            class="scenario-button extreme-button"
            @click="applyScenarioPreset(preset)"
          >
            <span class="scenario-name">{{ preset.label }}</span>
            <span class="scenario-detail">{{ preset.summary }}</span>
          </button>
        </div>
      </div>
    </section>

    <div class="army-config-container">
      <section class="army-config">
        <div class="army-panel-header">
          <h3 class="army-title">攻击方</h3>
          <select v-model="attackerFaction" class="faction-select">
            <option v-for="faction in availableFactions" :key="faction.id" :value="faction.id">
              {{ faction.icon }} {{ faction.name }}
            </option>
          </select>
        </div>

        <div class="units-config">
          <div v-for="category in unitCategories" :key="category.type" class="category-section">
            <div class="category-title">{{ category.icon }} {{ category.name }}</div>
            <div class="units-list">
              <div v-for="unit in getUnitsByCategory(attackerFaction, category.type)" :key="unit.id" class="unit-item">
                <div class="unit-main">
                  <HoverCard
                    density="compact"
                    :show="hoveredUnitKey === `attacker-${unit.id}`"
                    @mouseenter="hoveredUnitKey = `attacker-${unit.id}`"
                    @mouseleave="hoveredUnitKey = null"
                  >
                    <template #trigger>
                      <span class="unit-name">{{ unit.icon }} {{ unit.name }}</span>
                    </template>
                    <UnitHoverContent :unit="unit" />
                  </HoverCard>
                  <span class="unit-stats">攻{{ unit.attack }} / 步防{{ unit.infantryDefense }} / 骑防{{ unit.cavalryDefense }} / 速{{ unit.speed }}</span>
                </div>
                <input
                  type="number"
                  v-model.number="attackerUnits[unit.id]"
                  min="0"
                  max="999999"
                  class="unit-count-input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="army-summary">
          <div class="summary-item">兵力 {{ getArmyTotalUnits(attackerUnits) }}</div>
          <div class="summary-item">攻击 {{ getArmyTotalAttack(attackerFaction, attackerUnits) }}</div>
          <div class="summary-item">步防 {{ getArmyTotalInfantryDefense(attackerFaction, attackerUnits) }}</div>
          <div class="summary-item">骑防 {{ getArmyTotalCavalryDefense(attackerFaction, attackerUnits) }}</div>
          <div class="summary-item">载重 {{ getArmyTotalCarryCapacity(attackerFaction, attackerUnits) }}</div>
          <div class="summary-item">最低速度 {{ getArmySlowestSpeed(attackerFaction, attackerUnits) }}</div>
        </div>
      </section>

      <section class="army-config">
        <div class="army-panel-header">
          <h3 class="army-title">防守方</h3>
          <select v-model="defenderFaction" class="faction-select">
            <option v-for="faction in availableFactions" :key="faction.id" :value="faction.id">
              {{ faction.icon }} {{ faction.name }}
            </option>
          </select>
        </div>

        <div class="units-config">
          <div v-for="category in unitCategories" :key="category.type" class="category-section">
            <div class="category-title">{{ category.icon }} {{ category.name }}</div>
            <div class="units-list">
              <div v-for="unit in getUnitsByCategory(defenderFaction, category.type)" :key="unit.id" class="unit-item">
                <div class="unit-main">
                  <HoverCard
                    density="compact"
                    :show="hoveredUnitKey === `defender-${unit.id}`"
                    @mouseenter="hoveredUnitKey = `defender-${unit.id}`"
                    @mouseleave="hoveredUnitKey = null"
                  >
                    <template #trigger>
                      <span class="unit-name">{{ unit.icon }} {{ unit.name }}</span>
                    </template>
                    <UnitHoverContent :unit="unit" />
                  </HoverCard>
                  <span class="unit-stats">攻{{ unit.attack }} / 步防{{ unit.infantryDefense }} / 骑防{{ unit.cavalryDefense }} / 速{{ unit.speed }}</span>
                </div>
                <input
                  type="number"
                  v-model.number="defenderUnits[unit.id]"
                  min="0"
                  max="999999"
                  class="unit-count-input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="army-summary">
          <div class="summary-item">兵力 {{ getArmyTotalUnits(defenderUnits) }}</div>
          <div class="summary-item">攻击 {{ getArmyTotalAttack(defenderFaction, defenderUnits) }}</div>
          <div class="summary-item">步防 {{ getArmyTotalInfantryDefense(defenderFaction, defenderUnits) }}</div>
          <div class="summary-item">骑防 {{ getArmyTotalCavalryDefense(defenderFaction, defenderUnits) }}</div>
          <div class="summary-item">载重 {{ getArmyTotalCarryCapacity(defenderFaction, defenderUnits) }}</div>
          <div class="summary-item">最低速度 {{ getArmySlowestSpeed(defenderFaction, defenderUnits) }}</div>
        </div>
      </section>
    </div>

    <div class="battle-config">
      <div class="config-row">
        <label class="config-label">战斗规则</label>
        <select v-model="selectedBattleRule" class="rule-select">
          <option v-for="rule in availableBattleRules" :key="rule.id" :value="rule.id">
            {{ rule.name }}
          </option>
        </select>
      </div>
      <div class="rule-description">
        {{ availableBattleRules.find(rule => rule.id === selectedBattleRule)?.description }}
      </div>
    </div>

    <BattleReport 
      v-if="showBattleReport" 
      :battle-report-data="battleReportData" 
      @close="closeBattleReport" 
    />

    <div v-if="showData" class="data-display">
      <div class="data-header">
        <h3 class="data-title">{{ dataTitle }}</h3>
        <button class="close-button" @click="closeData">×</button>
      </div>
      <pre class="json-display">{{ formattedData }}</pre>
    </div>
  </div>
</template>

<script>
import { FACTION_CONFIG, FACTION_TYPES, UNIT_CATEGORIES, UNIT_TYPES } from '@/config/factionConfig.js'
import { getBattleRule, BATTLE_RULES, BATTLE_RULE_IDS } from '@/config/battleRulesConfig.js'
import BattleReport from './Test/BattleReport.vue'
import HoverCard from '@/components/hover/HoverCard.vue'
import UnitHoverContent from '@/components/hover/UnitHoverContent.vue'

export default {
  name: 'BattleSimulator',
  
  components: {
    BattleReport,
    HoverCard,
    UnitHoverContent
  },

  data() {
    return {
      //=== 攻击方配置
      attackerFaction: FACTION_TYPES.WEI,
      attackerUnits: {},
      
      //=== 防守方配置
      defenderFaction: FACTION_TYPES.SHU,
      defenderUnits: {},
      
      //=== 战斗配置
      selectedBattleRule: BATTLE_RULE_IDS.CLASSIC_CRUSH,
      presetApplyMode: 'replace',
      
      //=== 显示控制
      showBattleReport: false,
      battleReportData: null,
      showData: false,
      dataTitle: '',
      currentData: null,
      hoveredUnitKey: null
    }
  },

  computed: {
    //=== availableFactions 可用阵营列表
    availableFactions() {
      return Object.values(FACTION_CONFIG).map(faction => ({
        id: faction.id,
        name: faction.name,
        icon: faction.icon
      }))
    },

    //=== unitCategories 兵种分类
    unitCategories() {
      return Object.entries(UNIT_CATEGORIES).map(([type, category]) => ({
        type,
        name: category.name,
        icon: category.icon
      }))
    },

    //=== availableBattleRules 可用战斗规则
    availableBattleRules() {
      return Object.values(BATTLE_RULES).map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description
      }))
    },

    quickUnitPresets() {
      return [
        this.createSingleUnitPreset('wei-qingzhou-100', FACTION_TYPES.WEI, 'qingZhouArmy', 100),
        this.createSingleUnitPreset('wei-qingzhou-300', FACTION_TYPES.WEI, 'qingZhouArmy', 300),
        this.createSingleUnitPreset('wei-jinwei-100', FACTION_TYPES.WEI, 'jinWeiSoldier', 100),
        this.createSingleUnitPreset('wei-hubao-50', FACTION_TYPES.WEI, 'huBaoQi', 50),
        this.createSingleUnitPreset('wei-hubao-100', FACTION_TYPES.WEI, 'huBaoQi', 100),
        this.createSingleUnitPreset('shu-greedy-100', FACTION_TYPES.SHU, 'greedyWolf', 100),
        this.createSingleUnitPreset('shu-qilin-100', FACTION_TYPES.SHU, 'qilinGuard', 100),
        this.createSingleUnitPreset('shu-xiliang-80', FACTION_TYPES.SHU, 'xiLiangCavalry', 80),
        this.createSingleUnitPreset('shu-elephant-50', FACTION_TYPES.SHU, 'southernElephant', 50),
        this.createSingleUnitPreset('wu-shadow-100', FACTION_TYPES.WU, 'shadowGuard', 100),
        this.createSingleUnitPreset('wu-xiuluo-100', FACTION_TYPES.WU, 'xiuLuo', 100),
        this.createSingleUnitPreset('wu-zhuque-80', FACTION_TYPES.WU, 'zhuQueRider', 80),
        this.createSingleUnitPreset('wu-overlord-50', FACTION_TYPES.WU, 'overlordRider', 50),
        this.createSingleUnitPreset('wu-divine-120', FACTION_TYPES.WU, 'divineWind', 120)
      ]
    },

    battleScenarioPresets() {
      return [
        this.createScenarioPreset('mirror-qingzhou', '100青州军 vs 100青州军', FACTION_TYPES.WEI, { qingZhouArmy: 100 }, FACTION_TYPES.WEI, { qingZhouArmy: 100 }),
        this.createScenarioPreset('qingzhou-vs-jinwei', '300青州军 vs 100禁卫甲士', FACTION_TYPES.WEI, { qingZhouArmy: 300 }, FACTION_TYPES.WEI, { jinWeiSoldier: 100 }),
        this.createScenarioPreset('hubao-vs-qilin', '50虎豹骑 vs 200麒麟卫', FACTION_TYPES.WEI, { huBaoQi: 50 }, FACTION_TYPES.SHU, { qilinGuard: 200 }),
        this.createScenarioPreset('hubao-vs-xiliang', '100虎豹骑 vs 100西凉铁骑', FACTION_TYPES.WEI, { huBaoQi: 100 }, FACTION_TYPES.SHU, { xiLiangCavalry: 100 }),
        this.createScenarioPreset('elephant-vs-hubao', '60南蛮象 vs 80虎豹骑', FACTION_TYPES.SHU, { southernElephant: 60 }, FACTION_TYPES.WEI, { huBaoQi: 80 }),
        this.createScenarioPreset('overlord-vs-jinwei', '60霸王骑 vs 200禁卫甲士', FACTION_TYPES.WU, { overlordRider: 60 }, FACTION_TYPES.WEI, { jinWeiSoldier: 200 }),
        this.createScenarioPreset('xiuluo-vs-qingzhou', '150修罗 vs 200青州军', FACTION_TYPES.WU, { xiuLuo: 150 }, FACTION_TYPES.WEI, { qingZhouArmy: 200 }),
        this.createScenarioPreset('zhuque-vs-divine', '120朱雀骑 vs 120神风', FACTION_TYPES.WU, { zhuQueRider: 120 }, FACTION_TYPES.WU, { divineWind: 120 }),
        this.createScenarioPreset('greedy-vs-shadow', '300贪狼营 vs 300影卫', FACTION_TYPES.SHU, { greedyWolf: 300 }, FACTION_TYPES.WU, { shadowGuard: 300 }),
        this.createScenarioPreset('tuzu-vs-han', '10土族 vs 10汉室宗亲', FACTION_TYPES.WEI, { tuZu: 10 }, FACTION_TYPES.SHU, { hanRoyalty: 10 }),
        this.createScenarioPreset('taiping-vs-elephant', '20太平士 vs 80南蛮象', FACTION_TYPES.WU, { taiPingShi: 20 }, FACTION_TYPES.SHU, { southernElephant: 80 }),
        this.createScenarioPreset(
          'mixed-mainline',
          '主力混编对撞',
          FACTION_TYPES.WEI,
          { qingZhouArmy: 240, jinWeiSoldier: 80, huBaoQi: 60 },
          FACTION_TYPES.SHU,
          { greedyWolf: 200, qilinGuard: 120, southernElephant: 40 }
        )
      ]
    },

    extremeScenarioPresets() {
      return [
        this.createScenarioPreset('stall-jinwei-zhuque', '破防测试: 80禁卫甲士 vs 60朱雀骑', FACTION_TYPES.WEI, { jinWeiSoldier: 80 }, FACTION_TYPES.WU, { zhuQueRider: 60 }),
        this.createScenarioPreset('draw-hubao-elephant', '势均力敌: 80虎豹骑 vs 90南蛮象', FACTION_TYPES.WEI, { huBaoQi: 80 }, FACTION_TYPES.SHU, { southernElephant: 90 }),
        this.createScenarioPreset('crush-hubao-greedy', '碾压: 300虎豹骑 vs 120贪狼营', FACTION_TYPES.WEI, { huBaoQi: 300 }, FACTION_TYPES.SHU, { greedyWolf: 120 }),
        this.createScenarioPreset('crush-overlord-qilin', '大优: 180霸王骑 vs 90麒麟卫', FACTION_TYPES.WU, { overlordRider: 180 }, FACTION_TYPES.SHU, { qilinGuard: 90 }),
        this.createScenarioPreset('anti-cavalry-wall', '反骑墙: 220麒麟卫 vs 80虎豹骑', FACTION_TYPES.SHU, { qilinGuard: 220 }, FACTION_TYPES.WEI, { huBaoQi: 80 }),
        this.createScenarioPreset('anti-infantry-charge', '步兵海: 500青州军 vs 120霸王骑', FACTION_TYPES.WEI, { qingZhouArmy: 500 }, FACTION_TYPES.WU, { overlordRider: 120 }),
        this.createScenarioPreset('special-elite-duel', '顶级兵试压: 12太平士 vs 10土族', FACTION_TYPES.WU, { taiPingShi: 12 }, FACTION_TYPES.WEI, { tuZu: 10 }),
        this.createScenarioPreset(
          'mixed-crush',
          '混编碾压: 魏主力 vs 吴轻骑',
          FACTION_TYPES.WEI,
          { qingZhouArmy: 300, jinWeiSoldier: 180, huBaoQi: 90 },
          FACTION_TYPES.WU,
          { shadowGuard: 80, divineWind: 60, zhuQueRider: 30 }
        )
      ]
    },

    //=== canStartBattle 是否可以开始战斗
    canStartBattle() {
      const attackerHasUnits = this.getArmyTotalUnits(this.attackerUnits) > 0
      const defenderHasUnits = this.getArmyTotalUnits(this.defenderUnits) > 0
      return attackerHasUnits && defenderHasUnits && this.selectedBattleRule
    },

    //=== formattedData 格式化数据
    formattedData() {
      return this.currentData ? JSON.stringify(this.currentData, null, 2) : ''
    }
  },

  methods: {
    createSingleUnitPreset(id, faction, unitId, count) {
      const unit = FACTION_CONFIG[faction]?.units?.[unitId]
      return {
        id,
        faction,
        unitId,
        unitName: unit?.name || unitId,
        label: `${count}${unit?.name || unitId}`,
        count
      }
    },

    createScenarioPreset(id, label, attackerFaction, attackerUnits, defenderFaction, defenderUnits) {
      return {
        id,
        label,
        attackerFaction,
        attackerUnits,
        defenderFaction,
        defenderUnits,
        summary: `${this.getFactionLabel(attackerFaction)}攻 · ${this.getFactionLabel(defenderFaction)}守`
      }
    },

    getFactionLabel(factionId) {
      return FACTION_CONFIG[factionId]?.name || factionId
    },

    normalizeUnits(units) {
      return Object.entries(units).reduce((result, [unitId, count]) => {
        if (count > 0) {
          result[unitId] = count
        }
        return result
      }, {})
    },

    mergeUnits(baseUnits, patchUnits) {
      const mergedUnits = { ...baseUnits }

      Object.entries(patchUnits).forEach(([unitId, count]) => {
        const nextCount = (mergedUnits[unitId] || 0) + count
        if (nextCount > 0) {
          mergedUnits[unitId] = nextCount
        }
      })

      return this.normalizeUnits(mergedUnits)
    },

    applyArmyPreset(side, factionId, units) {
      const normalizedUnits = this.normalizeUnits(units)
      const shouldAppend = this.presetApplyMode === 'append'

      if (side === 'attacker') {
        this.attackerFaction = factionId
        this.attackerUnits = shouldAppend
          ? this.mergeUnits(this.attackerUnits, normalizedUnits)
          : normalizedUnits
        return
      }

      this.defenderFaction = factionId
      this.defenderUnits = shouldAppend
        ? this.mergeUnits(this.defenderUnits, normalizedUnits)
        : normalizedUnits
    },

    applySingleUnitPreset(side, preset) {
      this.applyArmyPreset(side, preset.faction, {
        [preset.unitId]: preset.count
      })
    },

    applyScenarioPreset(preset) {
      this.applyArmyPreset('attacker', preset.attackerFaction, preset.attackerUnits)
      this.applyArmyPreset('defender', preset.defenderFaction, preset.defenderUnits)
    },
    
    //=== getUnitsByCategory 根据阵营和兵种类型获取兵种列表
    getUnitsByCategory(factionId, unitType) {
      // 直接从配置文件获取阵营兵种
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return []
      }
      
      const factionUnits = factionConfig.units
      return Object.entries(factionUnits)
        .filter(([_, unit]) => unit.unitType === unitType)
        .map(([unitId, unit]) => ({
          id: unitId,
          name: unit.name,
          attack: unit.attack,
          infantryDefense: unit.infantryDefense,
          cavalryDefense: unit.cavalryDefense,
          speed: unit.speed,
          carryCapacity: unit.carryCapacity,
          unitType: unit.unitType,
          cost: unit.cost,
          totalCost: unit.totalCost,
          trainTime: unit.trainTime,
          icon: unit.icon,
          description: unit.description
        }))
    },

    //=== getArmyTotalUnits 计算军队总兵力
    getArmyTotalUnits(units) {
      return Object.values(units).reduce((total, count) => total + (count || 0), 0)
    },

    //=== getArmyTotalAttack 计算军队总攻击力
    getArmyTotalAttack(factionId, units) {
      // 直接从配置文件获取阵营兵种数据
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return 0
      }
      
      const factionUnits = factionConfig.units
      return Object.entries(units).reduce((total, [unitId, count]) => {
        if (count > 0 && factionUnits[unitId]) {
          return total + (factionUnits[unitId].attack * count)
        }
        return total
      }, 0)
    },

    //=== getArmyTotalInfantryDefense 计算军队总步兵防御力
    getArmyTotalInfantryDefense(factionId, units) {
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return 0
      }
      
      const factionUnits = factionConfig.units
      return Object.entries(units).reduce((total, [unitId, count]) => {
        if (count > 0 && factionUnits[unitId]) {
          return total + (factionUnits[unitId].infantryDefense * count)
        }
        return total
      }, 0)
    },

    //=== getArmyTotalCavalryDefense 计算军队总骑兵防御力
    getArmyTotalCavalryDefense(factionId, units) {
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return 0
      }
      
      const factionUnits = factionConfig.units
      return Object.entries(units).reduce((total, [unitId, count]) => {
        if (count > 0 && factionUnits[unitId]) {
          return total + (factionUnits[unitId].cavalryDefense * count)
        }
        return total
      }, 0)
    },

    //=== getArmyTotalCarryCapacity 计算军队总载重
    getArmyTotalCarryCapacity(factionId, units) {
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return 0
      }
      
      const factionUnits = factionConfig.units
      return Object.entries(units).reduce((total, [unitId, count]) => {
        if (count > 0 && factionUnits[unitId]) {
          return total + (factionUnits[unitId].carryCapacity * count)
        }
        return total
      }, 0)
    },

    //=== getArmySlowestSpeed 计算军队最慢速度
    getArmySlowestSpeed(factionId, units) {
      const factionConfig = FACTION_CONFIG[factionId]
      if (!factionConfig || !factionConfig.units) {
        return 0
      }
      
      const factionUnits = factionConfig.units
      let slowestSpeed = Infinity
      
      Object.entries(units).forEach(([unitId, count]) => {
        if (count > 0 && factionUnits[unitId]) {
          const unitSpeed = factionUnits[unitId].speed
          if (unitSpeed < slowestSpeed) {
            slowestSpeed = unitSpeed
          }
        }
      })
      
      return slowestSpeed === Infinity ? 0 : slowestSpeed
    },

    //=== generateUUID 生成UUID
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },

    //=== clearAllUnits 清空所有兵种配置
    clearAllUnits() {
      this.attackerUnits = {}
      this.defenderUnits = {}
    },

    //=== randomizeArmies 随机配置军队
    randomizeArmies() {
      console.log('🎲 开始随机配置军队')
      
      // 清空现有配置
      this.clearAllUnits()
      
      // 为攻击方随机配置 - 从配置文件获取兵种
      const attackerFactionConfig = FACTION_CONFIG[this.attackerFaction]
      const attackerUnits = attackerFactionConfig.units
      const attackerUnitIds = Object.keys(attackerUnits)
      const attackerRandomCount = Math.floor(Math.random() * 3) + 2 // 2-4种兵种
      
      for (let i = 0; i < attackerRandomCount; i++) {
        const randomUnitId = attackerUnitIds[Math.floor(Math.random() * attackerUnitIds.length)]
        const randomCount = Math.floor(Math.random() * 50) + 10 // 10-59个
        this.attackerUnits[randomUnitId] = randomCount
      }
      
      // 为防守方随机配置 - 从配置文件获取兵种
      const defenderFactionConfig = FACTION_CONFIG[this.defenderFaction]
      const defenderUnits = defenderFactionConfig.units
      const defenderUnitIds = Object.keys(defenderUnits)
      const defenderRandomCount = Math.floor(Math.random() * 3) + 2 // 2-4种兵种
      
      for (let i = 0; i < defenderRandomCount; i++) {
        const randomUnitId = defenderUnitIds[Math.floor(Math.random() * defenderUnitIds.length)]
        const randomCount = Math.floor(Math.random() * 50) + 10 // 10-59个
        this.defenderUnits[randomUnitId] = randomCount
      }
      
      console.log('🎲 随机配置完成', {
        攻击方: this.attackerUnits,
        防守方: this.defenderUnits
      })
    },

    //=== startBattle 开始战斗
    startBattle() {
      if (!this.canStartBattle) {
        console.warn('无法开始战斗：缺少必要条件')
        return
      }

      console.log('🔥 ========== 战斗模拟器开始 ==========')
      console.log('⚔️ 战斗规则:', this.selectedBattleRule)
      console.log('📅 战斗时间:', new Date().toLocaleString())

      // 构建攻击方军队数据
      const attackerArmyData = this.buildArmyData(this.attackerFaction, this.attackerUnits, '攻击方')
      
      // 构建防守方军队数据
      const defenderArmyData = this.buildArmyData(this.defenderFaction, this.defenderUnits, '防守方')

      // 创建攻击方军队数据（与TestList.vue格式一致）
      const attackerArmy = {
        playerInfo: attackerArmyData.data.playerInfo,
        faction: attackerArmyData.data.faction,
        units: attackerArmyData.data.units,
        resources: { wood: 0, soil: 0, iron: 0, food: 0 }
      }
      
      // 创建防守方军队数据（与TestList.vue格式一致）
      const defenderArmy = {
        ...defenderArmyData.data,
        resources: { wood: 5000, soil: 4000, iron: 3000, food: 6000 }
      }

      // 根据选择的战斗规则进行计算（与TestList.vue完全一致）
      const battleRule = getBattleRule(this.selectedBattleRule)
      const result = battleRule.calculateBattle(attackerArmy, defenderArmy)
      
      // 输出到控制台（与TestList.vue一致）
      console.log(`${battleRule.name}计算结果:`, result)
      console.log('攻击方数据:', attackerArmy)
      console.log('防守方数据:', defenderArmy)
      console.log('使用的战斗规则:', battleRule)

      // 设置战报数据并显示战报（与TestList.vue一致）
      this.battleReportData = result
      this.showBattleReport = true
      
      console.log('🏁 ========== 战斗模拟器结束 ==========')
    },

    //=== buildArmyData 构建军队数据
    buildArmyData(factionId, units, armyName) {
      console.log(`🏗️ ========== 开始构建${armyName}数据 ==========`)
      console.log(`🏛️ 阵营ID: ${factionId}`)
      console.log(`👥 军队名称: ${armyName}`)
      console.log(`📊 原始兵种数据:`, units)
      
      // 从配置文件获取阵营配置
      const factionConfig = FACTION_CONFIG[factionId]
      console.log(`🏛️ 阵营配置:`, factionConfig)
      
      if (!factionConfig) {
        console.error(`❌ 未找到阵营配置: ${factionId}`)
        return null
      }
      
      // 从配置文件获取该阵营的所有兵种
      const availableUnits = factionConfig.units
      console.log(`⚔️ 阵营可用兵种:`, Object.keys(availableUnits))
      
      // 构建军队兵种数据 - 只使用配置文件中的兵种
      const armyUnits = []
      let totalUnits = 0
      let totalAttack = 0
      let totalInfantryDefense = 0
      let totalCavalryDefense = 0
      let totalCarryCapacity = 0
      let slowestSpeed = Infinity
      
      Object.entries(units).forEach(([unitId, count]) => {
        if (count > 0 && availableUnits[unitId]) {
          const unitConfig = availableUnits[unitId]
          const unitData = {
            id: unitId,
            name: unitConfig.name,
            count: count,
            attack: unitConfig.attack,
            infantryDefense: unitConfig.infantryDefense,
            cavalryDefense: unitConfig.cavalryDefense,
            unitType: unitConfig.unitType,
            speed: unitConfig.speed,
            carryCapacity: unitConfig.carryCapacity
          }
          armyUnits.push(unitData)
          
          // 计算总计数据
          totalUnits += count
          totalAttack += unitConfig.attack * count
          totalInfantryDefense += unitConfig.infantryDefense * count
          totalCavalryDefense += unitConfig.cavalryDefense * count
          totalCarryCapacity += unitConfig.carryCapacity * count
          
          // 找到最慢的速度
          if (unitConfig.speed < slowestSpeed) {
            slowestSpeed = unitConfig.speed
          }
        }
      })
      
      // 如果没有兵种，设置最慢速度为0
      if (slowestSpeed === Infinity) {
        slowestSpeed = 0
      }
      
      console.log(`🪖 过滤后的军队兵种:`, armyUnits)
      console.log(`📈 ${armyName}总兵力: ${totalUnits}`)
      console.log(`⚔️ ${armyName}总攻击力: ${totalAttack}`)
      console.log(`🛡️ ${armyName}总步兵防御: ${totalInfantryDefense}`)
      console.log(`🐎 ${armyName}总骑兵防御: ${totalCavalryDefense}`)
      console.log(`📦 ${armyName}总载重: ${totalCarryCapacity}`)
      console.log(`🐌 ${armyName}最慢速度: ${slowestSpeed}`)
      
      // 构建最终军队数据 - 按照指定格式
      const armyData = {
        title: `${armyName}军队信息`,
        data: {
          playerInfo: {
            userUUID: this.generateUUID(),
            nickname: factionConfig.name
          },
          faction: factionId,
          totalUnits: totalUnits,
          totalAttack: totalAttack,
          totalInfantryDefense: totalInfantryDefense,
          totalCavalryDefense: totalCavalryDefense,
          totalCarryCapacity: totalCarryCapacity,
          slowestSpeed: slowestSpeed,
          units: armyUnits
        }
      }
      
      console.log(`✅ ${armyName}最终数据:`, armyData)
      console.log(`🏗️ ========== ${armyName}数据构建完成 ==========`)
      
      return armyData
    },



    //=== closeBattleReport 关闭战报
    closeBattleReport() {
      this.showBattleReport = false
      this.battleReportData = null
    },

    //=== closeData 关闭数据显示
    closeData() {
      this.showData = false
      this.currentData = null
      this.dataTitle = ''
    }
  },

  //=== 初始化默认配置
  mounted() {
    // 初始化攻击方默认兵种
    this.attackerUnits = {
      qingZhouArmy: 20,
      huBaoQi: 10
    }
    
    // 初始化防守方默认兵种
    this.defenderUnits = {
      qingZhouArmy: 15,
      jinWeiSoldier: 12
    }
  }
}
</script>

<style scoped>
.battle-simulator {
  padding: 16px;
  background: #f5f6f8;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #111827;
}

.simulator-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #d9dde5;
  border-radius: 8px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}

.subtitle {
  color: #6b7280;
  font-size: 12px;
  margin: 0;
}

.preset-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preset-block {
  background: #ffffff;
  border: 1px solid #d9dde5;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preset-block-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.preset-header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
}

.preset-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.preset-subtitle {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.preset-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafafa;
}

.preset-card-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.preset-card-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.preset-card-meta {
  font-size: 11px;
  color: #6b7280;
}

.preset-card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.apply-mode-toggle {
  display: inline-flex;
  border: 1px solid #cfd5df;
  border-radius: 6px;
  overflow: hidden;
}

.mode-button {
  padding: 6px 10px;
  border: none;
  background: #ffffff;
  color: #4b5563;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.mode-button.active {
  background: #111827;
  color: #ffffff;
}

.mode-button + .mode-button {
  border-left: 1px solid #cfd5df;
}

.mini-button {
  min-width: 36px;
  padding: 6px 8px;
  border: 1px solid #cfd5df;
  border-radius: 6px;
  background: #ffffff;
  color: #111827;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.mini-button:hover,
.scenario-button:hover {
  background: #f3f4f6;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
}

.scenario-button {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
}

.extreme-button {
  background: #fff7ed;
  border-color: #fed7aa;
}

.scenario-name {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.scenario-detail {
  font-size: 11px;
  color: #6b7280;
}

.army-config-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 1024px) {
  .army-config-container {
    grid-template-columns: 1fr;
  }
}

.army-config {
  background: #ffffff;
  border: 1px solid #d9dde5;
  border-radius: 8px;
  padding: 12px;
}

.army-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.army-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.faction-selector {
  margin-bottom: 24px;
}

.config-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.faction-select, .rule-select {
  width: 220px;
  padding: 8px 10px;
  border: 1px solid #cfd5df;
  border-radius: 6px;
  background-color: #fff;
  color: #111827;
  font-size: 13px;
}

.faction-select:focus, .rule-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
}

.units-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-section {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.category-title {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  padding: 8px 10px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.units-list {
  display: flex;
  flex-direction: column;
}

.unit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-bottom: 1px solid #eef2f7;
}

.unit-item:last-child {
  border-bottom: none;
}

.unit-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.unit-name {
  font-weight: 600;
  color: #111827;
  font-size: 13px;
}

.unit-stats {
  font-size: 12px;
  color: #6b7280;
}

.unit-count-input {
  width: 92px;
  padding: 6px 8px;
  border: 1px solid #cfd5df;
  border-radius: 6px;
  text-align: center;
  font-size: 13px;
  background: #fff;
}

.unit-count-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
}

.army-summary {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.summary-item {
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafafa;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.battle-config {
  background: #ffffff;
  border: 1px solid #d9dde5;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.battle-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-button {
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 600;
  border: 1px solid #cfd5df;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  background: #fff;
  color: #111827;
}

.action-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
}

.ghost-button:hover {
  background: #f3f4f6;
}

.primary-button {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.primary-button:hover:not(.disabled) {
  background: #000;
  border-color: #000;
}

.primary-button.disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

.header-actions {
  justify-content: flex-end;
}

.rule-description {
  font-size: 12px;
  color: #6b7280;
}

.data-display {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  z-index: 1000;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.data-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  color: #6b7280;
  font-size: 1.25rem;
  font-weight: bold;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.json-display {
  background-color: #f3f4f6;
  padding: 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
  overflow: auto;
  max-height: 384px;
  margin: 0;
  border: 1px solid #e5e7eb;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .battle-simulator {
    padding: 12px;
  }

  .simulator-header {
    flex-direction: column;
    align-items: stretch;
  }

  .preset-block-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .preset-header-actions {
    width: 100%;
    align-items: flex-start;
    flex-direction: column;
  }

  .army-panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .faction-select,
  .rule-select {
    width: 100%;
  }

  .summary-item {
    font-size: 11px;
  }

  .army-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
