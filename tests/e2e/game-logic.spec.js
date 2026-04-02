import { expect, test } from '@playwright/test'
import {
  BUILDING_TYPES,
  calculateUpgradeCost,
  calculateWarehouseUpgradeCost
} from '../../src/config/gameConfig.js'
import { getUnitById } from '../../src/config/factionConfig.js'
import {
  persistGameState,
  readSavedGameState,
  seedGameState
} from './helpers/gameState.js'

test.describe('game logic smoke', () => {
  test('building upgrade deducts resources and survives route switches', async ({ page }) => {
    await seedGameState(page)
    await page.goto('/city')

    await page.getByTestId('building-upgrade-button-woodMill-0').click()
    await expect(page.getByTestId('building-upgrade-button-woodMill-0')).toContainText('升级中')

    await persistGameState(page)
    const savedState = await readSavedGameState(page)
    const upgradeCost = calculateUpgradeCost(BUILDING_TYPES.WOOD_MILL, 1)

    expect(savedState.resources).toEqual({
      wood: 4800 - upgradeCost.wood,
      soil: 4800 - upgradeCost.soil,
      iron: 4800 - upgradeCost.iron,
      food: 4800 - upgradeCost.food
    })
    expect(savedState.buildingUpgrades.woodMill[0]).toMatchObject({
      targetLevel: 2
    })

    await page.getByTestId('sidebar-nav-map').click()
    await expect(page).toHaveURL(/\/map$/)
    await page.getByTestId('sidebar-nav-city').click()
    await expect(page).toHaveURL(/\/city$/)
    await expect(page.getByTestId('building-upgrade-button-woodMill-0')).toContainText('升级中')
  })

  test('expired building upgrade completes during store restore', async ({ page }) => {
    const now = Date.now()

    await seedGameState(page, {
      buildings: {
        woodMill: [1, 0, 0, 0, 0]
      },
      buildingUpgrades: {
        woodMill: [
          { startTime: now - 61000, duration: 60000, targetLevel: 2 },
          null,
          null,
          null,
          null
        ]
      }
    })

    await page.goto('/city')
    await expect(page.getByTestId('building-upgrade-button-woodMill-0')).toContainText('升级 (2 → 3)')

    await persistGameState(page)
    const savedState = await readSavedGameState(page)
    expect(savedState.buildings.woodMill[0]).toBe(2)
    expect(savedState.buildingUpgrades.woodMill[0]).toBeNull()
  })

  test('warehouse fill and capacity boost update stored values', async ({ page }) => {
    await seedGameState(page, {
      resources: {
        wood: 1200,
        soil: 800,
        iron: 600,
        food: 400
      }
    })

    await page.goto('/city')

    await page.getByTestId('sidebar-fill-warehouse').click()
    await expect(page.getByTestId('sidebar-resource-value-wood')).toHaveText('4800/4800')
    await expect(page.getByTestId('sidebar-coins-amount')).toHaveText('990')

    await page.getByTestId('sidebar-warehouse-boost').click()
    await expect(page.getByTestId('sidebar-resource-value-wood')).toHaveText('4800/9600')
    await expect(page.getByTestId('sidebar-coins-amount')).toHaveText('930')

    await persistGameState(page)
    const savedState = await readSavedGameState(page)
    expect(savedState.coins).toBe(930)
    expect(savedState.resources.wood).toBe(4800)
    expect(savedState.warehouseBoost.isActive).toBe(true)
  })

  test('warehouse upgrade completes after reload when timer already expired', async ({ page }) => {
    const now = Date.now()
    const upgradeCost = calculateWarehouseUpgradeCost(1)

    await seedGameState(page, {
      resources: {
        wood: 4800 - upgradeCost.wood,
        soil: 4800 - upgradeCost.soil,
        iron: 4800 - upgradeCost.iron,
        food: 4800 - upgradeCost.food
      },
      warehouseUpgrade: {
        startTime: now - 31000,
        duration: 30000,
        targetLevel: 2
      }
    })

    await page.goto('/city')
    await expect(page.getByTestId('sidebar-warehouse-upgrade')).toContainText('升级 (2 → 3)')

    await persistGameState(page)
    const savedState = await readSavedGameState(page)
    expect(savedState.warehouseLevel).toBe(2)
    expect(savedState.warehouseUpgrade).toBeNull()
  })

  test('recruitment creates a queue item and deducts unit cost', async ({ page }) => {
    await seedGameState(page, {
      resources: {
        wood: 10000,
        soil: 10000,
        iron: 10000,
        food: 10000
      }
    })

    await page.goto('/military')
    await page.getByTestId('recruit-unit-qingZhouArmy').click()
    await expect(page.getByTestId('recruitment-modal')).toBeVisible()

    await page.getByTestId('recruitment-quantity-input').fill('2')
    await page.getByTestId('recruitment-start-button').click()

    await expect(page.getByTestId('recruitment-task-qingZhouArmy')).toBeVisible()

    await persistGameState(page)
    const savedState = await readSavedGameState(page)
    const unit = getUnitById('qingZhouArmy')

    expect(savedState.recruitmentQueue).toHaveLength(1)
    expect(savedState.recruitmentQueue[0]).toMatchObject({
      unitId: 'qingZhouArmy',
      count: 2
    })
    expect(savedState.resources).toEqual({
      wood: 10000 - unit.cost.wood * 2,
      soil: 10000 - unit.cost.soil * 2,
      iron: 10000 - unit.cost.iron * 2,
      food: 10000 - unit.cost.food * 2
    })
  })
})
