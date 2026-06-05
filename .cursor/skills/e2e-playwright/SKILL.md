---
name: e2e-playwright
description: >-
  Playwright 端到端测试脚手架。中型/大型项目创建时自动启用；
  用户说「加 E2E」「端到端测试」时使用。
---

# E2E 测试（e2e-playwright）

## 自动启用条件

- 项目规模：**中型 / 大型** → 自动挂载
- 小型项目 → 跳过（除非用户明确要求）

## 新项目必生成

```
项目名-frontend/
├── playwright.config.ts
├── e2e/
│   ├── auth.spec.ts       # 登录流程
│   ├── home.spec.ts       # 首页加载
│   └── smoke.spec.ts      # 核心路径冒烟
├── package.json           # 追加 test:e2e 脚本
└── .github/workflows/ci.yml  # 追加 e2e job（可选）
```

## package.json 脚本

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:install": "playwright install chromium"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0"
  }
}
```

## 最低测试覆盖（冒烟）

1. 首页 200 加载，无 console error
2. 登录页可打开，admin 登录成功（或注册+登录）
3. 核心 API `/api/health` 返回 UP
4. 后台/主功能页可访问（按项目类型）

## 与 final-all-in-one 全局规则配合

功能完成标准 = `npm run test:e2e` 全部通过。

## CI 集成（中型+）

```yaml
e2e:
  runs-on: ubuntu-latest
  needs: [backend, frontend]
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npx playwright install chromium
    - run: npm run test:e2e
      working-directory: 项目名-frontend
```

## 禁止

- 禁止中型项目无任何 E2E
- 禁止测试只有 `expect(true).toBe(true)` 占位
