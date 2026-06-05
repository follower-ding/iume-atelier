---
name: api-contract-sync
description: >-
  前后端 API 契约同步。Spring Boot OpenAPI → 前端 TypeScript 类型。
  创建全栈项目、用户说「同步 API」「生成接口类型」时使用。
---

# API 契约同步（api-contract-sync）

## 何时使用

- 创建 **React/Vue + Spring Boot** 全栈项目时（**强制**）
- 后端新增/修改 Controller、DTO 后
- 用户说「同步 API 类型」「更新接口定义」

## 新项目必生成

```
项目名/
├── scripts/sync-api-types.ps1
└── 项目名-frontend/src/types/api-generated.ts   # 自动生成，勿手改
```

## 同步流程

1. 确保后端已启动（或 CI 构建后可访问 OpenAPI JSON）
2. 执行：

```powershell
.\scripts\sync-api-types.ps1
```

默认从 `http://127.0.0.1:8080/api/v3/api-docs` 拉取 OpenAPI 3.0 JSON。

3. 前端 `types/api.ts` 重新导出 `api-generated.ts` 中的类型
4. 业务代码只引用 `api.ts`，不直接改 `api-generated.ts`

## 脚本逻辑（sync-api-types.ps1）

- `Invoke-WebRequest` 下载 `/api/v3/api-docs`
- 若有 `npx openapi-typescript`：生成 TS 类型
- 若无：生成简化版 interface 骨架 + 提示安装 `openapi-typescript`

## 与 Swagger 对齐

- 后端必须启用 springdoc，`context-path: /api`
- 所有 DTO 加 `@Schema` 注释
- 前端 `request.ts` 的 `ApiResult<T>` 与后端 `Result<T>` 字段一致

## 禁止

- 禁止前端手写与后端重复的 DTO 类型（除 UI 专用类型）
- 禁止修改 `api-generated.ts`（会被覆盖）
