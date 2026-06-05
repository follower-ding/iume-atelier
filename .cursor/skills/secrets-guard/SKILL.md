---
name: secrets-guard
description: >-
  密钥与敏感文件提交前检查。git push、CD 部署前强制执行。
  用户说「检查密钥」「secrets 扫描」时使用。
---

# 密钥安全检查（secrets-guard）

## 何时使用（强制）

- **每次 `git push` 前**
- **每次 merge 到 `main` 前**
- 创建新项目时生成 `scripts/check-secrets.ps1`

## 检查项

| 模式 | 说明 |
|------|------|
| `.env` / `deploy/.env` / `repo.env` | 环境密钥 |
| `deploy_key` / `*.pem` / `github.token` | SSH/Token |
| `ghp_` / `gho_` / `AKIA` / `sk-` | 常见密钥前缀 |
| `JWT_SECRET=` 明文长串 | 生产密钥 |
| `password=` / `api_key=` 在已暂存文件 | 可疑配置 |

## 执行

```powershell
.\scripts\check-secrets.ps1
```

退出码 `0` = 通过；`1` = 发现风险，**禁止 push**。

## 新项目 .gitignore 必须含

```
deploy/.env
deploy/repo.env
deploy/github.token
**/.env
**/deploy_key
**/*.pem
```

## 与 CD 配合

- GitHub Secrets 存密钥，**禁止**写入 workflow 明文
- `check-secrets.ps1` 可加入 pre-push 钩子（可选）

## 禁止

- 禁止跳过检查直接 push
- 禁止把 `check-secrets.ps1` 结果忽略
