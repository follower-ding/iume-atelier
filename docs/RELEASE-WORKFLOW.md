# 发版与提交规范

> 适用：iume-atelier · PaaS 部署（Railway + Vercel/Netlify）

## 三层分离

| 层级 | 何时做 | 做什么 |
|------|--------|--------|
| **Commit** | 每次改代码 | 写清楚 commit message，push 到 `main` |
| **Deploy** | push `main` 后 | Railway / Vercel **自动**部署，无需每次手动点 |
| **Tag + Release** | 正式发版时 | 打 `vX.Y.Z` tag，更新 `RELEASE.md`，可选建 GitHub Release |

**不要**每次 commit 都打 tag — 历史会乱，Releases 页也无法阅读。

---

## Commit message 格式（**必须使用中文**）

> GitHub 提交列表、发版备注、部署核对均依赖可读的中文说明。**禁止**仅写 `update` / `fix` / 纯英文一句话。

```
<type>(<scope>): <中文简短说明>

<中文正文：分模块列出本次改动>
```

| type | 用途 | 示例（中文） |
|------|------|--------------|
| `feat` | 新功能 | `feat(music): 社区曲库全员上传共享` |
| `fix` | 修 bug | `fix(cors): 允许 Vercel 域名跨域` |
| `docs` | 文档 | `docs: 补充 Vercel 部署与发版流程` |
| `refactor` | 重构 | `refactor(tools): catalog 单源化` |
| `chore` | 工具/CI | `chore(ci): 构建改用 npm install` |
| `release` | **正式发版** | `release(v1.2.2): 社区曲库与 Vercel 部署` |

### 示例（正式发版）

```
release(v1.2.2): 社区曲库与 Vercel 部署

迭代内容：
- 后端：社区曲库 API，Flyway V8–V10
- 前端：设置页社区歌单、Console 管理、注册页校验
- 部署：前端切换 Vercel，版本号 1.2.2
```

日常 fix/feat：**只 commit，不打 tag**；正文仍建议写「迭代内容」 bullet。

---

## 正式发版 checklist（v1.x.y）

1. 更新 [`RELEASE.md`](../RELEASE.md) — 表格加一行 + 详情段落
2. 更新 [`deploy/.env.example`](../deploy/.env.example) — `APP_VERSION=vX.Y.Z`
3. 更新版本号（如 `iume-atelier-frontend/package.json`、`application-prod.yml` 默认值）
4. Commit（**中文**）：`release(vX.Y.Z): 一句话摘要` + 正文「迭代内容」
5. 打 tag 并推送：
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z 中文摘要"
   git push origin main
   git push origin vX.Y.Z
   ```
6. GitHub → **Releases** → **Create a new release** → 选 tag，正文粘贴 `RELEASE.md` 对应段落（可选）
7. 确认生产：`curl https://iume-atelier-production.up.railway.app/api/health`

---

## 部署与 GitHub Actions

| 路径 | 说明 |
|------|------|
| **Railway + Vercel/Netlify** | 连 GitHub `main`，push 即部署 — **实际生产路径** |
| **Actions → CI** | 构建 + 测试，失败需排查但不阻止 PaaS 部署 |
| **Actions → CD** | 自有 VPS + GHCR，需配 `DEPLOY_*` Secrets；未配置时会一直红，**可忽略** |

---

## 回滚

| 方式 | 场景 |
|------|------|
| Railway / Vercel **Rollback** | 最快，不动 Git |
| GitHub **Revert** commit | 要永久回退代码并触发 PaaS 重新部署 |
| `git checkout vX.Y.Z` | 本地对照某版本代码 |

注意：Flyway 数据库迁移**不会**随代码回滚自动撤销。

---

## 历史在哪看

- **代码**：GitHub → `16 Commits` / [commits/main](https://github.com/follower-ding/iume-atelier/commits/main)
- **版本说明**：仓库 `RELEASE.md` + GitHub **Releases**（打 tag 后才有）
- **线上部署**：Railway → Deployments；Vercel/Netlify → Deployments
- **当前版本**：`/api/health` 的 `version` 字段
