<template>
  <Teleport to="body">
    <div v-if="visible" class="battle-report-overlay" @click.self="$emit('close')">
      <div class="battle-report-dialog">
      <div class="dialog-header">
        <div>
          <h2 class="dialog-title">战斗战报</h2>
          <p class="dialog-subtitle">
            {{ battleReportData?.attacker?.nickname || '攻击方' }} 攻击 {{ battleReportData?.defender?.nickname || '防守方' }}
          </p>
        </div>
        <div class="header-actions">
          <div :class="['result-pill', resultClass]">
            {{ resultText }}
          </div>
          <button class="close-button" @click="$emit('close')">关闭</button>
        </div>
      </div>

      <div class="battle-meta">
        <span>时间 {{ formatBattleTime(battleReportData?.details?.battleTime) }}</span>
        <span>规则 {{ getRuleName(battleReportData?.ruleId) }}</span>
        <span>档位 {{ getBattleTierText(battleReportData?.details?.battleTier) }}</span>
        <span>攻防比 {{ formatNumber(battleReportData?.details?.powerRatio) }}</span>
        <span v-if="battleReportData?.details?.generalExperience">将领经验 +{{ battleReportData.details.generalExperience }}</span>
      </div>

      <section class="resource-section">
        <div class="resource-row">
          <span class="resource-title">带回资源</span>
          <span>{{ formatResourceBundle(battleReportData?.details?.plundered) }}</span>
        </div>
        <div class="resource-row">
          <span class="resource-title">入仓资源</span>
          <span>{{ formatResourceBundle(battleReportData?.details?.storedResources) }}</span>
        </div>
        <div class="resource-row" v-if="hasOverflowResources">
          <span class="resource-title">未入仓</span>
          <span>{{ formatResourceBundle(battleReportData?.details?.overflowResources) }}</span>
        </div>
      </section>

      <section class="army-section">
        <div class="section-header attacker-header">
          <span class="section-title">攻击方</span>
          <span class="section-meta">
            {{ battleReportData?.attacker?.nickname || '攻击方' }} · {{ getFactionName(battleReportData?.attacker?.faction) }}
          </span>
        </div>

        <div class="army-table-wrap">
          <table class="army-table">
            <tbody>
              <tr>
                <th>兵种</th>
                <td v-for="unit in attackerUnitColumns" :key="`attacker-name-${unit.id}`">{{ unit.name }}</td>
              </tr>
              <tr>
                <th>出动</th>
                <td v-for="unit in attackerUnitColumns" :key="`attacker-send-${unit.id}`">{{ getOriginalCount(battleReportData?.attacker?.originalUnits, unit.name) }}</td>
              </tr>
              <tr>
                <th>阵亡</th>
                <td v-for="unit in attackerUnitColumns" :key="`attacker-loss-${unit.id}`">{{ getLossCount(battleReportData?.attacker?.losses, unit.name) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="army-section">
        <div class="section-header defender-header">
          <span class="section-title">防守方</span>
          <span class="section-meta">
            {{ battleReportData?.defender?.nickname || '防守方' }} · {{ getFactionName(battleReportData?.defender?.faction) }}
          </span>
        </div>

        <div class="army-table-wrap">
          <table class="army-table">
            <tbody>
              <tr>
                <th>兵种</th>
                <td v-for="unit in defenderUnitColumns" :key="`defender-name-${unit.id}`">{{ unit.name }}</td>
              </tr>
              <tr>
                <th>出动</th>
                <td v-for="unit in defenderUnitColumns" :key="`defender-send-${unit.id}`">{{ getOriginalCount(battleReportData?.defender?.originalUnits, unit.name) }}</td>
              </tr>
              <tr>
                <th>阵亡</th>
                <td v-for="unit in defenderUnitColumns" :key="`defender-loss-${unit.id}`">{{ getLossCount(battleReportData?.defender?.losses, unit.name) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { FACTION_CONFIG } from '@/config/factionConfig.js'
import { getCombatRule } from '@/domain/combat/combatService.js'

export default {
  name: 'BattleReport',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    battleReportData: {
      type: Object,
      default: () => ({
        ruleId: 'CLASSIC_CRUSH',
        battleResult: 'ATTACKER_VICTORY',
        attacker: {
          nickname: '攻击方',
          faction: 'wei',
          originalUnits: [],
          losses: []
        },
        defender: {
          nickname: '防守方',
          faction: 'shu',
          originalUnits: [],
          losses: []
        },
        details: {
          battleTime: null,
          battleTier: 'ADVANTAGE',
          powerRatio: 0
        }
      })
    }
  },
  emits: ['close'],
  computed: {
    resultText() {
      return this.battleReportData?.battleResult === 'ATTACKER_VICTORY' ? '进攻方胜利' : '防守方胜利'
    },

    resultClass() {
      return this.battleReportData?.battleResult === 'ATTACKER_VICTORY' ? 'attacker-win' : 'defender-win'
    },

    attackerUnitColumns() {
      return this.getFactionUnits(this.battleReportData?.attacker?.faction)
    },

    defenderUnitColumns() {
      return this.getFactionUnits(this.battleReportData?.defender?.faction)
    },

    hasOverflowResources() {
      const overflow = this.battleReportData?.details?.overflowResources || {}
      return Object.values(overflow).some((value) => (value || 0) > 0)
    }
  },
  methods: {
    getFactionUnits(faction) {
      const units = FACTION_CONFIG[faction]?.units || {}
      return Object.entries(units).map(([id, unit]) => ({
        id,
        name: unit.name
      }))
    },

    getRuleName(ruleId) {
      if (!ruleId) return '未知规则'
      return getCombatRule(ruleId)?.name || ruleId
    },

    getBattleTierText(tier) {
      const tierMap = {
        ANNIHILATION: '歼灭',
        CRUSH: '碾压',
        DOMINATE: '大优',
        ADVANTAGE: '优势',
        DESPERATE: '惨胜'
      }
      return tierMap[tier] || '未知'
    },

    getFactionName(faction) {
      const factions = {
        wei: '魏国',
        shu: '蜀国',
        wu: '吴国',
        unknown: '未知阵营'
      }
      return factions[faction] || '未知阵营'
    },

    formatBattleTime(timeString) {
      if (!timeString) return '未知时间'
      const date = new Date(timeString)
      if (Number.isNaN(date.getTime())) return '无效时间'
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    formatNumber(value) {
      return Number(value || 0).toFixed(2)
    },

    getOriginalCount(units, unitName) {
      const matchedUnit = (units || []).find((unit) => unit.name === unitName)
      return matchedUnit?.count || 0
    },

    getLossCount(losses, unitName) {
      const matchedLoss = (losses || []).find((loss) => loss.name === unitName)
      return matchedLoss?.count || 0
    },

    formatResourceBundle(bundle = {}) {
      const items = [
        ['木材', bundle?.wood || 0],
        ['泥土', bundle?.soil || 0],
        ['铁矿', bundle?.iron || 0],
        ['粮食', bundle?.food || 0]
      ]

      if (items.every(([, value]) => value <= 0)) {
        return '无'
      }

      return items
        .map(([label, value]) => `${label} ${Math.floor(value)}`)
        .join(' / ')
    }
  }
}
</script>

<style scoped>
.battle-report-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(17, 24, 39, 0.48);
  backdrop-filter: blur(2px);
}

.battle-report-dialog {
  width: min(1280px, 100%);
  max-height: calc(100vh - 40px);
  overflow: auto;
  background: #f5f6f8;
  border: 1px solid #d9dde5;
  border-radius: 10px;
  color: #111827;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  background: #ffffff;
  border-bottom: 1px solid #d9dde5;
}

.dialog-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
}

.dialog-subtitle {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-pill {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.result-pill.attacker-win {
  background: #fee2e2;
  color: #b91c1c;
}

.result-pill.defender-win {
  background: #dbeafe;
  color: #1d4ed8;
}

.close-button {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #cfd5df;
  background: #fff;
  color: #111827;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.battle-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 16px 0;
}

.battle-meta span {
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #ffffff;
  font-size: 12px;
  color: #4b5563;
}

.army-section {
  padding: 12px 16px 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #d9dde5;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.attacker-header {
  border-left: 4px solid #b91c1c;
}

.defender-header {
  border-left: 4px solid #1d4ed8;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
}

.section-meta {
  font-size: 12px;
  color: #6b7280;
}

.army-table-wrap {
  overflow-x: auto;
  border: 1px solid #d9dde5;
  border-radius: 0 0 8px 8px;
  background: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.army-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 840px;
}

.army-table th,
.army-table td {
  padding: 10px 12px;
  border-right: 1px solid #eef2f7;
  border-bottom: 1px solid #eef2f7;
  text-align: center;
  font-size: 13px;
  white-space: nowrap;
}

.army-table tr:last-child td,
.army-table tr:last-child th {
  border-bottom: none;
}

.army-table td:last-child,
.army-table th:last-child {
  border-right: none;
}

.army-table th {
  background: #f8fafc;
  font-weight: 700;
  color: #374151;
  min-width: 74px;
}

.army-table td {
  color: #111827;
  background: #ffffff;
}

@media (max-width: 768px) {
  .battle-report-overlay {
    padding: 12px;
  }

  .dialog-header,
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
