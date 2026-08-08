# 南曦笔话 · nanxi-blog

> 个人博客（随想 / 生活 / 技术），纯静态站点，部署在 **GitHub Pages**。
> 访问地址：<https://sen1994lin.github.io/nanxi-blog/>

---

## 1. 项目简介

一个**零成本、无后端**的个人博客：

- 全部文章以 JSON 文件形式存放在 GitHub 仓库（`sen1994lin/nanxi-blog`）中；
- 前台是一个单文件 `index.html`（原生 HTML/CSS/JS，无框架、无构建步骤），直接从仓库读取数据渲染；
- 后台用 **Decap CMS**（原 Netlify CMS）可视化写文章、改配置，挂在 Netlify 上；
- GitHub 同时承担「文件存储」和「静态服务器」两重角色，无需任何数据库或云服务器。

---

## 2. 技术栈 (Tech Stack)

| 层 | 技术 | 说明 |
|---|---|---|
| **前端** | 原生 HTML + CSS + JavaScript（单文件 `index.html`） | 无框架、无打包，浏览器直接运行 |
| **静态托管** | GitHub Pages | 从 `main` 分支根目录直接服务，提交后约 1–2 分钟自动部署 |
| **后台 CMS** | Decap CMS（原 Netlify CMS） | 纯前端写作界面，位于 `admin/` 目录，由 Netlify 托管 |
| **身份认证** | Netlify Identity | 后台登录鉴权（**需 VPN** 才能打开后台） |
| **数据桥梁** | Netlify Git Gateway | 让 Decap 以你的身份通过 GitHub API 读写仓库文件，免写后端 |
| **评论系统** | Twikoo（可选） | 在 `config.json` 填入 Vercel 地址后开启 |
| **数据格式** | JSON + Markdown | 每篇文章一个 JSON，正文是 Markdown 文本 |
| **RSS** | `rss.xml` | 自动生成的订阅源 |

**没有**：数据库、应用服务器、云函数、付费中间件。

---

## 3. 目录结构 (Repository Layout)

```
nanxi-blog/
├── index.html          # 前台页面（含全部渲染逻辑，~46KB）
├── config.json         # 站点配置（站名、菜单、关于我、相册、评论…），由后台「站点设置」维护
├── posts.json          # 全量文章清单（manifest），前台主数据源（~4MB，含全部文章）
├── posts/              # 文章目录
│   ├── {id}.json       #   近期活跃文章（约 99 篇）——后台可编辑、前台会扫描覆盖
│   └── archive/        #   历史老文章（900+ 篇）——仅通过 posts.json 展示，后台不列
├── images/             # 图片资源（后台上传）
├── admin/              # Decap CMS 后台（config.yml + index.html）
├── vendor/             # Decap CMS 依赖的静态资源
└── rss.xml             # RSS 订阅源
```

---

## 4. 中间件 / 中间层 (Middleware & Bridges)

这个架构里没有传统意义的「后端服务」，但有若干**把"写作 ↔ 存储 ↔ 展示"连接起来的中间层**，它们才是整个系统能跑起来的关键：

1. **Decap CMS（`admin/`）** —— 写作界面。一个纯前端应用，让你不用碰代码也能发文/改配置。
2. **Netlify Identity** —— 鉴权层。管理谁可以登录后台。
3. **Netlify Git Gateway** —— **最重要的桥梁**。它把 Decap 的操作翻译成 GitHub API 调用，直接读写仓库里的 JSON 文件，于是"无后端也能写博客"。
4. **GitHub** —— 存储 + 托管合一体：既当数据库（存 JSON），又当 Web 服务器（GitHub Pages）。
5. **`posts.json`（数据聚合层）** —— 把上千篇散落的小文件聚合成**一个清单**，前台只需拉一次就能展示全部文章，绕开"逐个文件加载上千次"的性能坑。
6. **浏览器 localStorage（客户端缓存层）** —— 前台把拉到的文章缓存 2 分钟，减少重复请求、加快翻页。

```
作者 ──> Decap CMS ──> Netlify Identity(鉴权) ──> Git Gateway ──> GitHub 仓库(文件)
                                                                      │
读者 ──> index.html ──> 读 posts.json + 扫描 posts/ ──> 渲染展示 ───────┘
                  └──────────> localStorage(2分钟缓存)
```

---

## 5. 数据模型 (Article Schema)

每篇文章是 `posts/{id}.json` 一个文件，字段如下：

```json
{
  "id": 20260808,          // number，唯一编号，同时决定文件名 posts/这个数字.json
  "title": "文章标题",
  "cat": "mind",           // 分类：tech(技术) / life(生活) / mind(随想)
  "date": "2026-08-08",    // 发布日期 YYYY-MM-DD，前台按此倒序排列
  "tags": ["标签1", "标签2"],
  "excerpt": "列表里显示的简短摘要",
  "content": "# 正文（Markdown 格式）\n\n支持 **加粗**、列表、`代码` 等。"
}
```

`config.json`（站点配置）由后台「站点设置」维护，包含：网站名称、作者、首页介绍、关于我、社交/自媒体链接、相册、简历、友情链接、打赏码、SEO 分享卡片、导航菜单等。

---

## 6. 流程 (Workflow)

### A. 读者访问前台（展示流程）

1. 浏览器打开 `index.html`；
2. `loadPosts()` 先拉取 **`posts.json`**（全量清单，含所有文章）；
3. 再**扫描 `posts/` 根目录**的活文章（约 99 篇），用根目录最新内容**覆盖/追加**同 `id` 的文章——保证后台改动实时可见；
4. 按 `date` 倒序排列，首屏展示 `PAGE_SIZE = 10` 篇，点「加载更多」每次再 +10 篇；
5. 结果写入 `localStorage`（**2 分钟** TTL），期间刷新不重复请求。

> 回退机制：清单与根目录都不可用时，降级读旧的 `posts/1.json ~ posts/60.json`。

### B. 作者写 / 改文章（后台编辑流程）

1. 打开后台 <https://inspiring-stardust-41c216.netlify.app/admin/>（**需 VPN**），用 Netlify Identity 登录；
2. Decap 只扫描 `posts/` **根目录**（约 99 篇），因此列表流畅、可编辑；
3. 新增 / 编辑后，经 Git Gateway **写回 `posts/{id}.json`**；
4. 因为文章落在根目录，前台 `loadPosts()` 下一步扫描时就会自动发现并展示，**无需手动改 `posts.json`**；
5. 提交触发 GitHub Pages 重新部署，约 1–2 分钟后前台刷新可见（受 2 分钟缓存影响，最多等约 2 分钟）。

### C. 批量 / 带排版发布（脚本或 AI 代发）

适合"公众号同步""一次性批量导入"等场景，流程为：

1. 生成 `posts/{id}.json`（Markdown 正文）；
2. 把该文章**追加进 `posts.json` 清单**（否则它只存在于根目录、靠前台扫描才显示，进了 `archive/` 则完全看不到）；
3. 用 GitHub API 推送到 `main` 分支。

相关能力（本机已配置）：

- **公众号 → 博客同步**：`wechat-to-blog-sync` 技能，抓取微信文章 → 转 Markdown → 生成 `posts/{id}.json` + 更新 `posts.json` → 推送 GitHub；
- **博客 → 公众号草稿**：`mp-draft-push` 通道，调用微信公众平台 API 把文章推到公众号草稿箱。

### D. 部署流程

- 任何对 `main` 分支的推送（无论前台改文件、还是后台经 Git Gateway 写文件）都会触发 GitHub Pages 自动重新构建；
- 无需手动部署，等待 1–2 分钟即可生效。

---

## 7. 关键约定与注意事项

- **文章编号**：历史文章已占用 `1 ~ 1031`，新增请填 **`2000` 以上**（如 2001、2002…），切勿使用 1–1031，否则会覆盖老文章。
- **分页粒度**：`index.html` 中 `PAGE_SIZE = 10`（首屏 10 篇，每次「加载更多」+10）。
- **前台缓存**：`localStorage` 缓存 2 分钟，后台改完**等 1–2 分钟再刷新**前台才能看到。
- **文章可见性**：前台展示 = `posts.json`（全部）+ `posts/` 根目录活文章；`posts/archive/` 里的老文靠 `posts.json` 展示，但**后台不可编辑**（要改早年文章请找维护者直接改文件）。
- **后台登录需 VPN**：Netlify Identity 在国内需翻墙才能打开后台。
- **大文件限制**：单文件 > 1MB（如 `posts.json` 约 4MB）不能用普通「单文件更新」接口，必须走 **Git Data API**（blob → tree → commit → ref）。
- **后台卡顿根因已解决**：早期 `posts/` 下有 1000+ 文件，导致 Decap 列表打爆；现已把 900+ 篇老文搬入 `posts/archive/`，根目录只留近期活跃文章。

---

## 8. 维护与恢复

- 所有文章都是 GitHub 仓库里的文件，**任何误删/误改都能用 Git 历史回滚**；
- 后台看不到列表、或改完前台不更新，优先检查：① 文章是否在 `posts/` 根目录（不在则后台不可见）；② 是否等够了 2 分钟缓存 + Pages 部署时间；
- 要加新分类、改菜单、换站名等，直接在后台「站点设置」改 `config.json` 即可。

---

*本文档由维护脚本于 2026-08-08 梳理生成。*
