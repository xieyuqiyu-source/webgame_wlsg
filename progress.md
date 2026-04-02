Original prompt: 基础的 Playwright 冒烟用例，把这些关键交互固化下来，重点验证游戏逻辑有没有坏。

- 2026-03-30: 开始补 Playwright 测试基线，目标覆盖建筑升级、仓库操作、征兵和路由切换后的状态保持。
- 2026-03-30: 当前策略优先使用预置 localStorage 存档起盘，减少初始化弹窗对测试稳定性的影响。
- 2026-03-30: 已补 `playwright.config.js`、`tests/e2e/game-logic.spec.js` 和测试辅助工具，首轮 `pnpm test:e2e` 5/5 通过。
- 2026-03-30: 为关键交互补了少量 `data-testid`，当前覆盖建筑升级启动与恢复、仓库爆仓与容量加成、仓库升级恢复、征兵入队。
