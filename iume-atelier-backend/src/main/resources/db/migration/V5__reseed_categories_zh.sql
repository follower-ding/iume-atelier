-- 大类：编程 / AI / 生活（可在后台继续新增）
UPDATE categories
SET name = '编程',
    slug = 'programming',
    description = '软件开发、架构、框架与工程实践'
WHERE slug IN ('technology', 'Technology') OR name IN ('Technology', '编程');

UPDATE categories
SET name = 'AI',
    slug = 'ai',
    description = '人工智能、大模型、智能体与 AI 开发工具'
WHERE slug IN ('design', 'Design') OR name IN ('Design', 'AI');

UPDATE categories
SET name = '生活',
    slug = 'life',
    description = '随笔、效率、思考与日常记录'
WHERE slug IN ('life', 'Life') OR name IN ('Life', '生活');
