# 项目总览
- 目标：构建一款以“高手做局”战略驱动、可解释、可复用的 Web 轻应用，实现对用户疼痛的全链路生物力学解读与“解局思路”输出。
- 架构：Next.js App Router + Serverless Functions（Vercel）+ Gemini API（gemini-2.5-flash）+ NoSQL RAG 库（MongoDB Atlas，可替换 Firestore）。
- 交付：一键部署到 Vercel，安全地使用环境变量；端到端测试与验收清单。

## System Prompt（硬编码到 systemInstruction）
- 身份设定：专业的“身体的翻译官”和“过来人探索者”。
- 哲学核心：严格遵循“张拉整体观”，视局部症状为“受害者”，强调分析远端结构（肇事者）。
- 分析流程：强制按「结构层 -> 神经层 -> 生化层」顺序进行全链路扫描与推理。
- 输出风格：语言专业、具备认知升级力量；产出为“解局思路”，非泛化诊断或运动处方。
- 使用方式：于后端调用 Gemini 时，固定注入到 `systemInstruction` 字段。示例：
  - 角色：你是“身体翻译官/过来人探索者”。
  - 方法论：张拉整体观；局部症状是受害者，远端结构可能是肇事者。
  - 流程：严格按结构层->神经层->生化层逐层推理；每层给出侦察点位与作战策略；明确因果链与优先级。
  - 输出：只给“解局思路”与行动框架，避免医疗诊断；用专业生物力学用语；条理清晰，可执行。

## 技术栈与架构
- 前端/框架：Next.js（App Router）。表单提交流程基于 React `useActionState`；可视化 `isPending`（按钮加载）与错误态。
- AI 模型：Gemini API（推荐 `gemini-2.5-flash`）。将 `systemInstruction` 与 RAG 上下文组合后调用。
- 后端：Vercel Serverless `app/api/translate/route.ts`（Node.js runtime）。
- 数据存储（RAG）：MongoDB Atlas（集合 `knowledge_blocks`），支持关键词检索与同义扩展；后续可加 embedding 检索。
- 配置与安全：所有密钥放置 Vercel 环境变量：`GOOGLE_API_KEY`、`MONGODB_URI`、`MONGODB_DB`、`MONGODB_COLLECTION`。

## 数据库与 RAG Schema
- 集合名称：`knowledge_blocks`
- 文档结构（JSON）：
  - `id`: 唯一标识符，如 `S001`（结构层）、`N002`（神经层）。
  - `category`: 兵法层级，如 `结构层_地基`、`作战部署_攻其必救`。
  - `keywords`: 高权重检索关键词（症状、部位、技术名词，如 `颈椎痛`、`迷走神经`、`深前线`）。
  - `content_cn`: 中文核心知识内容，需包含生物力学专业词汇、侦察点位与作战策略的清晰描述。
- 索引建议：
  - 基本索引：`keywords`（text / Atlas Search）。
  - 组合索引：`category` + `keywords`，便于层级过滤。
  - 同义词词典：症状/结构同义词（如“颈痛/颈椎痛”、“胸锁乳突/SCM”）。

## RAG 检索服务（/lib/rag.ts）
- 输入：用户症状描述（中文）。
- 处理：
  - 关键词抽取：分词与医学/生物力学术语识别；注入同义词扩展。
  - 检索：在 `knowledge_blocks` 中检索 3–5 个最相关文档；优先匹配结构层、远端结构；若不足再扩展到神经/生化层。
  - 排序：依据层级权重（结构>神经>生化）+ 关键词命中率 + 领域先验（如深前线、后浅线等）。
- 输出：标准化 RAG 上下文块（含 `id`、`category`、`content_cn` 摘要与要点清单）。

## 后端 API 设计（`/api/translate`）
- 路径：`app/api/translate/route.ts`
- 方法：`POST`
- 请求体：`{ question: string }`（用户症状/问题）
- 流程（三步 RAG）：
  1) Retrieve：调用 RAG 服务，检索 3–5 个《人体兵法》知识块（含侦察点位/作战策略）。
  2) Combine：组装 `systemInstruction` + RAG 上下文 + 用户原始问题，明确输出格式与约束（只输出“解局思路”）。
  3) Call：调用 Gemini `gemini-2.5-flash`；返回全链路分析结果。
- 响应：`{ result: string, sources: Array<{ id, category }> }`
- 运行时：Node（非 Edge），确保 SDK/网络依赖稳定。
- 错误处理：输入校验、空检索回退、模型超时与重试；不泄露敏感信息。

## 前端交互与 UI/UX
- 页面：`app/page.tsx`，表单使用 `useActionState`（Server Actions）。
- 交互：
  - `isPending` 明确加载态（按钮禁用、spinner、提示文案）。
  - 错误/空态：无检索结果时提供引导（示例问题/常见症状）。
  - 结果展示：
    - 顶部：本次“解局思路”（结构->神经->生化分段、带策略要点）。
    - 底部：来源卡片（RAG 命中文档 `id` 与 `category`），提升可解释性与可信度。

## 安全与合规
- 环境变量仅在 Server 侧使用；前端不可见。
- 速率限制与基础防滥用（IP/Token 限流）。
- 输入清洗与最大长度限制；拒绝包含个人隐私的持久化。
- 监控与日志：Serverless 可观测（请求耗时、检索命中率、模型调用成功率）。

## 部署到 Vercel
- 项目创建：导入 Git 仓库到 Vercel。
- 环境变量：在 Vercel Dashboard 设置 `GOOGLE_API_KEY`、`MONGODB_URI`、`MONGODB_DB`、`MONGODB_COLLECTION`。
- MongoDB Atlas：创建 Cluster、数据库与集合；导入初始《人体兵法》知识块（遵循 RAG Schema）。
- 构建与运行时：Next.js App Router；`/api/translate` 设为 Node runtime。
- 验证：Preview 环境进行端到端测试；通过后 Promote 到 Production。

## 测试与验收
- 单元测试：RAG 关键词抽取与检索排序。
- 集成测试：`/api/translate` 对典型症状输入的响应（含空检索回退）。
- 端到端测试：页面提交与 `isPending` 状态、结果与来源卡片展示。
- 验收口径：输出为“解局思路”（结构->神经->生化分段），含明确优先级与策略；RAG 来源可追溯。

## 交付物与后续
- 交付物：
  - Next.js 项目（App Router）、`/api/translate` Serverless 实现、RAG 服务、MongoDB Atlas 初始化脚本与示例数据。
  - 部署说明与环境变量配置清单。
- 后续扩展：
  - 向量检索与多模态（图片/动作）增强；
  - 用户会话与历史“解局”归档；
  - 专家策略 A/B 实验与策略知识迭代。

请确认以上方案。一旦确认，我将按该方案创建项目结构、实现核心模块、准备示例数据、配置部署并提交到 Vercel。