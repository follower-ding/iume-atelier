export type SnippetCategory =
  | 'java'
  | 'spring'
  | 'react'
  | 'sql'
  | 'markdown'
  | 'cursor'
  | 'mcp'

export interface Snippet {
  id: string
  title: string
  category: SnippetCategory
  tags: string[]
  content: string
}

export const snippetCategories: { id: SnippetCategory; label: string }[] = [
  { id: 'java', label: 'Java' },
  { id: 'spring', label: 'Spring' },
  { id: 'react', label: 'React' },
  { id: 'sql', label: 'SQL' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'mcp', label: 'MCP' },
]

export const snippets: Snippet[] = [
  {
    id: 'spring-controller',
    title: 'REST Controller',
    category: 'spring',
    tags: ['api', 'rest'],
    content: `@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public Result<List<ItemResponse>> list() {
        return Result.success(itemService.listAll());
    }

    @PostMapping
    public Result<ItemResponse> create(@Valid @RequestBody ItemRequest request) {
        return Result.success(itemService.create(request));
    }
}`,
  },
  {
    id: 'spring-page-result',
    title: '分页响应 PageResult',
    category: 'spring',
    tags: ['pagination'],
    content: `public static <T> PageResult<T> of(long page, long size, long total, List<T> records) {
    return PageResult.<T>builder()
            .page(page)
            .size(size)
            .total(total)
            .records(records)
            .build();
}`,
  },
  {
    id: 'java-record-dto',
    title: 'Java Record DTO',
    category: 'java',
    tags: ['dto'],
    content: `public record ArticleRequest(
        @NotBlank String title,
        @NotBlank String content,
        String summary,
        ArticleStatus status,
        Long categoryId,
        List<Long> tagIds
) {}`,
  },
  {
    id: 'react-fetch-hook',
    title: 'useFetch Hook',
    category: 'react',
    tags: ['hook', 'api'],
    content: `function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getData<T>(url)
      .then((res) => { if (!cancelled) setData(res) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error }
}`,
  },
  {
    id: 'react-page-meta',
    title: 'SEO PageMeta 用法',
    category: 'react',
    tags: ['seo'],
    content: `<PageMeta
  title="文章标题"
  description="摘要文字"
  canonical={\`/article/\${slug}\`}
  jsonLd={{
    '@type': 'Article',
    headline: title,
    datePublished: publishedAt,
  }}
/>`,
  },
  {
    id: 'sql-pagination',
    title: '分页查询 SQL',
    category: 'sql',
    tags: ['mysql'],
    content: `SELECT a.*, u.nickname AS author_name
FROM articles a
LEFT JOIN users u ON u.id = a.author_id
WHERE a.status = 'PUBLISHED'
ORDER BY a.published_at DESC
LIMIT :offset, :size;`,
  },
  {
    id: 'md-callout',
    title: '提示 Callout 块',
    category: 'markdown',
    tags: ['writing'],
    content: `> **提示**
>
> 这里是正文说明，适合强调注意事项或最佳实践。

> **警告**
>
> 破坏性操作前请先备份数据。`,
  },
  {
    id: 'md-code-compare',
    title: '代码对比块',
    category: 'markdown',
    tags: ['writing'],
    content: `### Before

\`\`\`java
articleMapper.selectList(null);
\`\`\`

### After

\`\`\`java
articleMapper.selectList(
    new LambdaQueryWrapper<Article>()
        .eq(Article::getStatus, ArticleStatus.PUBLISHED)
        .orderByDesc(Article::getPublishedAt)
);
\`\`\``,
  },
  {
    id: 'cursor-rule',
    title: 'Cursor Rule 片段',
    category: 'cursor',
    tags: ['rules', 'ai'],
    content: `---
description: Spring Boot API 规范
globs: **/*.java
---

- Controller 只做参数校验与调用 Service
- 统一返回 Result<T>，业务异常用 BusinessException
- DTO 与 Entity 分离，禁止直接暴露 Entity`,
  },
  {
    id: 'cursor-skill',
    title: 'Agent Skill 骨架',
    category: 'cursor',
    tags: ['skill'],
    content: `# Skill Name

## When to use
- 用户说「同步 API」「生成类型」时使用

## Steps
1. 读取 OpenAPI / swagger 输出
2. 生成 TypeScript 类型到 src/types/
3. 验证与 api/index.ts 导出一致`,
  },
  {
    id: 'mcp-config',
    title: 'MCP Server 配置',
    category: 'mcp',
    tags: ['config'],
    content: `{
  "mcpServers": {
    "my-mysql": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-mysql"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "your_password",
        "MYSQL_DATABASE": "iume_atelier"
      }
    }
  }
}`,
  },
  {
    id: 'mcp-tool-schema',
    title: 'MCP Tool JSON Schema',
    category: 'mcp',
    tags: ['tool'],
    content: `{
  "name": "search_articles",
  "description": "Search published articles by keyword",
  "inputSchema": {
    "type": "object",
    "properties": {
      "keyword": { "type": "string", "description": "Search keyword" },
      "limit": { "type": "number", "default": 10 }
    },
    "required": ["keyword"]
  }
}`,
  },
]
