# webgame_wlsg

一个基于 `Vue 3 + Pinia + Vite + Tailwind CSS` 的三国题材文字放置类网页游戏原型。

当前项目定位是可持续迭代的网页游戏原型，当前重点验证以下核心循环：
- 城池资源增长
- 建筑升级与仓库容量
- 阵营选择与差异化加成
- 征兵与军队展示
- 地图 NPC、攻击、掠夺与战报闭环
- 本地存档、云存档、通知、GM 调试功能

## 技术栈

- `Vue 3`
- `Pinia`
- `Vue Router`
- `Vite`
- `Tailwind CSS`
- `Naive UI`
- Node.js 原生 `http` 云存档服务

## 本地开发

推荐使用 `pnpm`，因为仓库已提交 `pnpm-lock.yaml`。

安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

构建生产包：

```bash
pnpm build
```

运行 Playwright 逻辑冒烟测试：

```bash
pnpm test:e2e
```

本地预览构建结果：

```bash
pnpm preview
```

本地启动云存档服务：

```bash
pnpm save-api
```

默认开发地址通常是：

```text
http://localhost:5173/
```

## 页面结构

- `/city`：正式首页，城池经营主界面
- `/military`：军事与征兵页面
- `/map`：正式地图、NPC、攻击与掠夺
- `/map-debug`：战斗模拟器与规则调试入口
- `/settings`：存档、GM、游戏设置
- `/message`：信函系统
- `/notification-test`：通知组件测试页
- `/demo`：旧版演示页，保留用于 UI 对照

## 目录说明

- `src/views/`：页面级视图
- `src/components/`：公共组件与复用 UI
- `src/store/`：Pinia 状态管理
- `src/config/`：阵营、单位、资源、战斗等配置
- `src/hooks/`：计时器、调度器等组合式逻辑
- `src/utils/`：格式化、UUID、调度器等基础工具
- `src/services/`：云存档等接口服务
- `server/`：云存档后端
- `docs/`：玩法规则与系统设计文档
其中包含开发路线文档 [docs/开发路线与待办清单.md](/Users/xieyuqiyu/Documents/Game/webgame_wlsg/docs/开发路线与待办清单.md)
  以及开发分支自动部署说明 [docs/dev-wlsg-deploy.md](/Users/xieyuqiyu/Documents/Game/webgame_wlsg/docs/dev-wlsg-deploy.md)

## 当前实现情况

已完成：
- 用户初始化与阵营选择
- 资源产出与仓库容量限制
- 建筑升级基础逻辑
- 征兵队列与兵种展示
- NPC 生成、侦查、攻击相关原型
- NPC 攻击、掠夺、选兵出征、资源回写
- 本地存档与版本迁移
- 云存档上传与下载
- 全局通知与部分 GM 功能

开发中或待整理：
- 调度器链路仍需进一步按 Pinia 彻底收口
- 页面模块仍有部分测试视图和演示残留
- 自动化测试目前只有基础 Playwright 逻辑冒烟用例
- 首屏资源与分包还可以继续优化

## 开发约定

- 当前存档主结构为统一 `version=2` 结构，兼容旧平铺存档
- 默认仍有浏览器 `localStorage` 本地存档
- 同域 `wlsg.ccoos.cn/api` 提供最小云存档接口，按同步码读写
- `dev-wlsg` 自动部署到 `https://wlsg.ccoos.cn`
- `phonedev` 自动部署到 `https://mobilewlsg.ccoos.cn`
- 正式桌面入口为 `wlsg.ccoos.cn`，移动端入口为 `mobilewlsg.ccoos.cn`
- 默认首页为 `/city`，`/demo` 不再作为正式入口
- `tests/e2e/` 提供基础 Playwright 冒烟测试，当前覆盖建筑升级、仓库操作、征兵与路由切换
- Stagewise 开发工具默认关闭，如需启用可在本地设置：

```bash
VITE_ENABLE_STAGEWISE=true
```

## 后续建议

适合继续推进的方向：
- 将行军、返回、冷却补成正式地图行为
- 给云存档补自动同步策略和冲突处理
- 增加基础测试，至少覆盖核心 store 行为和云存档接口
- 将侦查从“信息揭示”收成正式玩法规则
