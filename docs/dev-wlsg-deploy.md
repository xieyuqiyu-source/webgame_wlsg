# `dev-wlsg` 自动部署说明

目标：

- 以 `dev-wlsg` 作为开发与自动部署分支
- 每次推送到 `dev-wlsg`，服务器自动更新
- 通过 `wlsg.ccoos.cn` 提供访问
- 同域提供 `wlsg.ccoos.cn/api` 云存档接口

## 已落地的仓库侧内容

- GitHub Actions 工作流：
  [deploy-dev-wlsg.yml](/Users/xieyuqiyu/Documents/Game/webgame_wlsg/.github/workflows/deploy-dev-wlsg.yml)
- Nginx 站点配置模板：
  [wlsg.ccoos.cn.conf.example](/Users/xieyuqiyu/Documents/Game/webgame_wlsg/deploy/nginx/wlsg.ccoos.cn.conf.example)

工作流触发规则：

- push 到 `dev-wlsg`
- 手动触发 `workflow_dispatch`

部署方式：

1. GitHub Actions 本地先执行 `pnpm build`
2. 通过 SSH 连到服务器
3. 同步前端 `dist/` 到 `/var/www/wlsg.ccoos.cn`
4. 同步 `server/` 到 `/srv/wlsg-dev/server`
5. 同步 `deploy/systemd/wlsg-save-api.service` 到 `/etc/systemd/system/`
6. `systemctl daemon-reload && enable --now wlsg-save-api.service`
7. `nginx -t` 后 reload

## 需要配置的 GitHub Secrets

仓库 Settings -> Secrets and variables -> Actions 中新增：

- `WLSG_DEV_SSH_HOST`
- `WLSG_DEV_SSH_PORT`
- `WLSG_DEV_SSH_USER`
- `WLSG_DEV_SSH_PRIVATE_KEY`

## 服务器预期环境

建议服务器具备：

- `node >= 20`
- `nginx`
- `rsync`
- `systemd`
- root 或等效权限（至少对 `rsync`、`nginx -t`、`systemctl` 可用）

## 服务器首次手动准备

1. 通过 `certbot` 为 `wlsg.ccoos.cn` 签发证书
2. 将模板复制为正式站点配置：
   - `/etc/nginx/conf.d/wlsg.ccoos.cn.conf`
3. 在 HTTPS server 段加入：
   - `location /api/ { proxy_pass http://127.0.0.1:18790/api/; ... }`
4. 创建静态站点目录：
   - `/var/www/wlsg.ccoos.cn`
5. 创建 API 工作目录：
   - `/srv/wlsg-dev/data/saves`
6. 执行：
   - `sudo nginx -t`
   - `sudo systemctl reload nginx`

## 云存档说明

- API 监听：`127.0.0.1:18790`
- 健康检查：`GET /api/health`
- 读取存档：`GET /api/saves/:syncId`
- 写入存档：`PUT /api/saves/:syncId`
- 当前按同步码读写，不做账号系统
- 建议直接使用玩家 `UUID` 作为默认同步码

## 已知部署故障记录

- 2026-05-18 的线上 `502` 与自动部署失败经过，见：
  [线上部署故障记录.md](./线上部署故障记录.md)
