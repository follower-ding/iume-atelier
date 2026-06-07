# Cloudflare R2 对象存储配置

Railway 等 PaaS 的本地磁盘会在重启后丢失上传文件。将 `iume.storage.type` 设为 `s3` 后，图片/音频会写入 Cloudflare R2（S3 兼容 API），并通过公网 URL 访问。

## 1. 创建 R2 Bucket

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2**
2. **Create bucket**，例如 `iume-atelier-uploads`
3. **Settings** → **Public access** → 启用 R2.dev 子域或绑定自定义域名  
   记下公网前缀，例如 `https://pub-xxxxxxxx.r2.dev`

## 2. 创建 API Token

**R2** → **Manage R2 API Tokens** → **Create API Token**

- 权限：Object Read & Write（限定到上述 bucket）
- 记下 **Access Key ID**、**Secret Access Key**
- Endpoint 形如：`https://<account_id>.r2.cloudflarestorage.com`

## 3. Railway 环境变量

在 backend 服务添加：

```env
IUME_STORAGE_TYPE=s3
IUME_S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
IUME_S3_REGION=auto
IUME_S3_BUCKET=iume-atelier-uploads
IUME_S3_ACCESS_KEY=<access_key_id>
IUME_S3_SECRET_KEY=<secret_access_key>
IUME_S3_PUBLIC_BASE_URL=https://pub-xxxxxxxx.r2.dev
IUME_S3_PREFIX=uploads/
```

重启后，Studio / Console 新上传的封面与图片 URL 将变为 R2 公网地址。

## 4. 本地开发

默认 `IUME_STORAGE_TYPE=local`，文件仍写入 `uploads/` 并由 `/api/uploads/**` 提供访问，无需 R2。

## 5. 验证

1. 登录 Studio，上传一张测试图片
2. 响应 JSON 的 `url` 应为 `https://pub-xxx.r2.dev/uploads/...`
3. 在浏览器直接打开该 URL 应能显示图片

## 6. 已有本地图片迁移

旧文章若引用 `/api/uploads/...`，需手动重新上传或编写一次性迁移脚本将本地文件 PUT 到 R2 并更新数据库 `cover_image` / Markdown 内链。
