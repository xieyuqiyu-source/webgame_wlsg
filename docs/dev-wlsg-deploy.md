# `dev-wlsg` 自动部署说明

目标：

- 以 `dev-wlsg` 作为开发与自动部署分支
- 每次推送到 `dev-wlsg`，服务器自动更新
- 通过 `wlsg.ccoos.cn` 提供访问

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
3. 服务器首次部署时执行 `git clone`
4. 后续执行 `git fetch + reset --hard origin/dev-wlsg`
5. 服务器内执行 `pnpm install --frozen-lockfile` 和 `pnpm build`
6. 将 `dist/` 同步到 `/var/www/wlsg.ccoos.cn`
7. `nginx -t` 后 reload

## 需要配置的 GitHub Secrets

仓库 Settings -> Secrets and variables -> Actions 中新增：

- `WLSG_DEV_SSH_HOST`
- `WLSG_DEV_SSH_PORT`
- `WLSG_DEV_SSH_USER`
- `WLSG_DEV_SSH_PRIVATE_KEY`

## 服务器预期环境

建议服务器具备：

- `git`
- `node >= 20`
- `npm`
- `pnpm`（如没有，工作流会尝试自动安装）
- `nginx`
- `rsync`
- `sudo` 权限（至少对 `rsync`、`nginx -t`、`systemctl reload nginx` 可用）

## 服务器首次手动准备

1. 放置 SSL 证书到：
   - `/etc/nginx/ssl/ccoos.cn/fullchain.pem`
   - `/etc/nginx/ssl/ccoos.cn/privkey.pem`
2. 将模板复制为正式站点配置：
   - `/etc/nginx/sites-available/wlsg.ccoos.cn.conf`
3. 建立软链接到 `sites-enabled`
4. 创建静态站点目录：
   - `/var/www/wlsg.ccoos.cn`
5. 执行：
   - `sudo nginx -t`
   - `sudo systemctl reload nginx`

## 当前还缺的一步

仓库侧已经准备好，但要真正打通部署，还需要拿到服务器登录方式并在服务器上放好证书。
