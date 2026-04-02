# webgame_wlsg

一个基于 `Vue 3 + Pinia + Vite + Tailwind CSS` 的三国题材文字放置类网页游戏原型。

当前项目定位是单机前端原型，重点验证以下核心循环：
- 城池资源增长
- 建筑升级与仓库容量
- 阵营选择与差异化加成
- 征兵与军队展示
- 地图 NPC 与战斗相关原型页面
- 本地存档、通知、GM 调试功能

## 技术栈

- `Vue 3`
- `Pinia`
- `Vue Router`
- `Vite`
- `Tailwind CSS`
- `Naive UI`

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

默认开发地址通常是：

```text
http://localhost:5173/
```

## 页面结构

- `/city`：正式首页，城池经营主界面
- `/military`：军事与征兵页面
- `/map`：地图、NPC、战斗测试页面
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
- `docs/`：玩法规则与系统设计文档
  其中包含开发路线文档 [docs/开发路线与待办清单.md](/Users/xieyuqiyu/Documents/Game/webgame_wlsg/docs/开发路线与待办清单.md)

## 当前实现情况

已完成：
- 用户初始化与阵营选择
- 资源产出与仓库容量限制
- 建筑升级基础逻辑
- 征兵队列与兵种展示
- NPC 生成、侦查、攻击相关原型
- 本地存档与读取
- 全局通知与部分 GM 功能

开发中或待整理：
- 调度器链路仍需进一步按 Pinia 彻底收口
- 页面模块仍有部分测试视图和演示残留
- 自动化测试目前只有基础 Playwright 逻辑冒烟用例
- 首屏资源与分包还可以继续优化

## 开发约定

- 当前状态数据主要持久化在浏览器 `localStorage`
- 默认首页为 `/city`，`/demo` 不再作为正式入口
- `tests/e2e/` 提供基础 Playwright 冒烟测试，当前覆盖建筑升级、仓库操作、征兵与路由切换
- Stagewise 开发工具默认关闭，如需启用可在本地设置：

```bash
VITE_ENABLE_STAGEWISE=true
```

## 后续建议

适合继续推进的方向：
- 统一整理城池、军事、地图三条主玩法的数据流
- 将调度器和离线收益逻辑进一步模块化
- 增加基础测试，至少覆盖核心 store 行为
- 将测试页面与正式功能页面彻底分层
