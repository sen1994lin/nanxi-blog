/*
 * 南曦笔话 后台界面全中文化补丁（完整版 v5）
 * 做法：扫描页面所有可见文字，按完整翻译表逐条替换为中文。
 * 特点：
 *   1. 保留 %{...} 占位符，不会破坏 Decap 动态数据
 *   2. 只改文字内容，绝不增删 DOM 节点 → 不会引发 CMS 崩溃
 *   3. 出错静默忽略，浏览器空闲时执行，MutationObserver 兜底
 */
(function () {
  'use strict';

  /* ============ 一、精确匹配字典（英文 → 中文） ============ */
  var EXACT = {
    // —— 通用 ——
    'Publish': '发布',
    'Publishing...': '发布中…',
    'Published': '已发布',
    'Unpublish': '取消发布',
    'Unpublishing...': '取消发布中…',
    'Duplicate': '复制',
    'Save': '保存',
    'Saving...': '保存中…',
    'Saved': '已保存',
    'Delete': '删除',
    'Deleting...': '删除中…',
    'Updating...': '更新中…',
    'Cancel': '取消',
    'Confirm': '确认',
    'OK': '确定',
    'Yes': '是',
    'No': '否',
    'None': '无',
    'All': '全部',
    'Default': '默认',
    'Custom': '自定义',
    'More actions': '更多操作',
    'Edit': '编辑',
    'View': '查看',
    'Settings': '设置',
    'Close': '关闭',
    'Back': '返回',
    'Next': '下一步',
    'Previous': '上一步',
    'Done': '完成',
    'Copy': '复制',
    'Copied': '已复制',
    'Open': '打开',
    'Insert': '插入',
    'Remove': '移除',
    'Add': '添加',
    'Loading...': '加载中…',
    'Loading': '加载中…',
    'Error': '错误',
    'Details': '详情',
    'Search': '搜索',
    'Filter': '筛选',
    'Sort by': '排序方式',
    'Media': '媒体库',
    'Upload': '上传',
    'Uploading...': '上传中…',
    'Download': '下载',
    'Login': '登录',
    'Log in': '登录',
    'Log Out': '退出登录',
    'Logout': '退出登录',
    'Logging in...': '登录中…',
    'Email': '邮箱',
    'Password': '密码',
    'Forgot password?': '忘记密码？',
    'Title': '标题',
    'Name': '名称',
    'Description': '描述',
    'Date': '日期',
    'Author': '作者',
    'Content': '内容',
    'Body': '正文',
    'Field': '字段',
    'Value': '值',
    'Path': '路径',
    'URL': '地址',
    'Type': '类型',
    'Size': '大小',
    'Slug': '链接别名',
    'Move up': '上移',
    'Move down': '下移',
    'No results.': '没有结果。',
    'No entries found': '暂无内容，点「新增」来创建第一条吧～',
    'No assets found.': '未找到媒体资源。',
    'No images found.': '未找到图片。',
    'Images': '图片',
    'Media assets': '媒体资源',
    'Delete selected': '删除选中',
    'Choose selected': '选择选中',
    'Go back to site': '返回站点',
    'Search...': '搜索…',
    'Search entries': '搜索内容…',
    'Search all': '搜索全部',
    'View as': '查看方式',
    'Ascending': '升序',
    'Descending': '降序',
    'Loading Entries': '正在加载条目',
    'Caching entries': '正在缓存条目',
    'This might take a few minutes': '这可能需要几分钟',
    'No Entries': '暂无条目',
    'Updated': '更新于',
    'optional': '选填',
    'Collections': '内容集合',
    'New Post': '新建文章',
    'New': '新增',
    'Draft': '草稿',
    'Drafts': '草稿箱',
    'In review': '审核中',
    'In Review': '审核中',
    'Ready': '就绪',
    'Publish now': '现在发布',
    'Publish and create new': '发布并创建新篇',
    'Publish and duplicate': '发布并复制',
    'Delete unpublished changes': '删除未发布的修改',
    'Delete unpublished entry': '删除未发布的条目',
    'Delete published entry': '删除已发布的条目',
    'Delete entry': '删除条目',
    'Delete changes': '删除修改',
    'Delete new entry': '删除新条目',
    'Publish changes': '发布修改',
    'Publish new entry': '发布新条目',
    'Entry saved': '条目已保存',
    'Entry published': '条目已发布',
    'Entry unpublished': '条目已取消发布',
    'Entry status updated': '条目状态已更新',
    'Editorial Workflow': '编辑流',
    'View Preview': '查看预览',
    'Check for Preview': '查看预览',
    'View Live': '查看线上',
    'Toggle preview': '切换预览',
    'Toggle i18n': '切换多语言',
    'Sync scrolling': '同步滚动',
    'Bold': '加粗',
    'Italic': '斜体',
    'Code': '代码',
    'Link': '链接',
    'Enter the URL of the link': '请输入链接地址',
    'Headings': '标题',
    'Quote': '引用',
    'Bulleted List': '无序列表',
    'Numbered List': '有序列表',
    'Add Component': '添加组件',
    'Rich Text': '富文本',
    'Markdown': 'Markdown',
    'Choose a file': '选择文件',
    'Choose files': '选择文件',
    'Insert from URL': '从网址插入',
    'Replace with URL': '替换为网址',
    'Enter the URL of the file': '请输入文件网址',
    'Choose different file': '选择其他文件',
    'Add more files': '添加更多文件',
    'Remove file': '移除文件',
    'Remove all files': '移除全部文件',
    'Heading 1': '一级标题',
    'Heading 2': '二级标题',
    'Heading 3': '三级标题',
    'Heading 4': '四级标题',
    'Heading 5': '五级标题',
    'Heading 6': '六级标题',
    'Now': '今天',
    'Clear': '清空',
    'Copy URL': '复制链接',
    'Copy Path': '复制路径',
    'Copy Name': '复制名称',
    'Copy to clipboard': '复制到剪贴板',
    'Are you sure you want to delete selected media?': '确定要删除选中的媒体文件吗？',
    'Are you sure you want to delete this entry?': '确定要删除这条条目吗？',
    'Are you sure you want to publish this entry?': '确定要发布这条条目吗？',
    'Recovered document': '已恢复文档',
    'Please copy/paste this somewhere before navigating away!': '离开前请先复制此内容保存！',
    'You have been logged out, please back up any data and login again': '你已退出登录，请备份数据后重新登录',
    "Oops, you've missed a required field. Please complete before saving.": '哎呀，你漏填了一个必填项，保存前请先补全。',
    'Unsaved Changes': '⚠️ 有修改未保存！',
    'CHANGES SAVED': '✅ 修改已保存',
    'Changes saved': '✅ 修改已保存',
    // 浏览器原生 confirm/alert 弹窗
    'Are you sure you want to leave this page?': '⚠️ 当前页面有未保存的修改，确定要离开吗？',
    'Waiting for backend...': '正在等待后台服务…',
    'Not found': '未找到',
    'Config Errors:': '配置错误：',
    'Check your config.yml file.': '请检查你的 config.yml 文件。',
    'Error loading CMS configuration': '加载 CMS 配置出错',
    'Log in with Netlify Identity': '使用 Netlify Identity 登录',
    'Log in with GitHub': '使用 GitHub 登录',
    'Log in with GitLab': '使用 GitLab 登录',
    'Log in with Bitbucket': '使用 Bitbucket 登录',
    'Log in with Gitea': '使用 Gitea 登录',
    'Please enter your email.': '请输入你的邮箱。',
    'Please enter your password.': '请输入你的密码。',
    'Could not access the Identity settings. When using the git-gateway backend, make sure that you enable Identity and Git Gateway services.': '无法访问 Identity 设置。使用 git-gateway 后台时，请确认已开启 Identity 和 Git Gateway 服务。',
    'A local backup was recovered for this entry, would you like to use it?': '检测到这条内容的本地备份，是否恢复备份内容？',
    'Loading entry...': '正在加载内容…',
    'Private ': '私有 ',
    'There\'s been an error - please ': '出错了 - 请',
    'open an issue on GitHub.': '在 GitHub 上提交问题。',
    'Opening an issue pre-populates it with the error message and debugging data.\nPlease verify the information is correct and remove sensitive data if exists.': '提交问题时会自动填入错误信息和调试数据。\n请确认信息无误，如有敏感数据请先移除。',
    'Entry status is set to draft. To finalize and submit it for review, set the status to ‘In review’': '条目状态为草稿。要提交审核，请将状态设为「审核中」',
    'Entry is being reviewed, no further actions are required. However, you can still make additional changes while it is being reviewed.': '条目正在审核中，无需其他操作。但审核期间你仍可继续修改。',
    'Fill in from another locale': '从其他语言复制',
    // 下面这些译文为空字符串的，遇到直接隐藏（避免英文残留）
    'collection': '',
    'PUBLISH': '发布',
  };

  /* ============ 二、正则替换（处理含占位符 / 动态拼接的文本） ============ */
  var REGEX = [
    // "%{fieldLabel} is required."  →  "xxx 是必填项。"
    { re: /^(.*?) is required\.$/, fn: function (m) { return m[1] + ' 是必填项。'; } },
    // "%{fieldLabel} didn't match the pattern: %{pattern}."  →  格式不匹配
    { re: /^(.*?) didn't match the pattern: (.*?)\.$/, fn: function (m) { return m[1] + ' 与格式要求不匹配：' + m[2]; } },
    // "%{fieldLabel} is being processed."  →  处理中
    { re: /^(.*?) is being processed\.$/, fn: function (m) { return m[1] + ' 处理中。'; } },
    // "%{fieldLabel} must be at least %{minValue}."  →  至少需
    { re: /^(.*?) must be at least (.*?)\.$/, fn: function (m) { return m[1] + ' 至少需 ' + m[2] + '。'; } },
    // "%{fieldLabel} must be at most %{maxValue}."  →  最多
    { re: /^(.*?) must be at most (.*?)\.$/, fn: function (m) { return m[1] + ' 最多 ' + m[2] + '。'; } },
    // "Writing in XXX collection" / "Writing in XXX"  →  "正在编辑 XXX"
    { re: /Writing in\s+([^\n]+?)\s*collection\s*$/i, fn: function (m) { return '正在编辑 ' + m[1].trim(); } },
    { re: /^Writing in\s+(.+)$/i, fn: function (m) { return '正在编辑 ' + m[1].trim(); } },
    // "Add XXX" 按钮（标签添加等），但保留 "Add" 独立情况
    { re: /^Add\s+(.+)$/, fn: function (m) { return '添加' + m[1]; } },
    // "Copy XXX" 类
    { re: /^Copy\s+(.+)$/, fn: function (m) { return '复制' + m[1]; } },
    // "Remove XXX"
    { re: /^Remove\s+(.+)$/, fn: function (m) { return '移除' + m[1]; } },
    // "Choose XXX"
    { re: /^Choose\s+(.+)$/, fn: function (m) { return '选择' + m[1]; } },
  ];

  /* ============ 三、安全的 DOM 扫描 ============ */
  function isSkippable(el) {
    if (!el) return true;
    var tag = el.tagName;
    return tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE';
  }

  function translateTextNode(node) {
    try {
      if (!node || node.nodeType !== 3) return;
      var parent = node.parentElement;
      if (isSkippable(parent)) return;
      var raw = node.nodeValue;
      if (!raw || !raw.trim()) return;
      var txt = raw.trim();

      // 1) 精确匹配
      if (EXACT.hasOwnProperty(txt)) {
        var rep = EXACT[txt];
        if (rep === '') {
          // 空翻译：清空该文本节点（隐藏英文残留）
          node.nodeValue = '';
        } else if (raw !== rep) {
          node.nodeValue = raw.replace(txt, rep);
        }
        return;
      }

      // 2) 正则匹配（动态/占位符文本）
      for (var i = 0; i < REGEX.length; i++) {
        var m = txt.match(REGEX[i].re);
        if (m) {
          var out = REGEX[i].fn(m);
          if (out !== txt) {
            node.nodeValue = raw.replace(txt, out);
          }
          return;
        }
      }
    } catch (e) { /* 静默忽略，绝不崩溃 */ }
  }

  function scanAll() {
    try {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      var n;
      while ((n = walker.nextNode())) {
        translateTextNode(n);
      }
    } catch (e) { /* 静默忽略 */ }
  }

  /* ============ 四、调度（空闲执行 + 定时兜底 + 变更监听） ============ */
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    var run = function () { pending = false; scanAll(); };
    if (window.requestIdleCallback) {
      window.requestIdleCallback(run, { timeout: 1500 });
    } else {
      setTimeout(run, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { schedule(); setTimeout(schedule, 600); });
  } else {
    schedule();
    setTimeout(schedule, 600);
  }
  window.addEventListener('load', function () { schedule(); setTimeout(schedule, 1200); });

  // 每 1.5 秒兜底扫描一次，确保动态加载/弹窗内容也被翻译
  setInterval(schedule, 1500);

  // 监听 DOM 变化触发扫描（仅调度，不阻塞 CMS 渲染）
  try {
    var obs = new MutationObserver(function () { schedule(); });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { /* 不支持就靠定时器 */ }

  /* ============ 五、拦截浏览器原生对话框（confirm / alert / prompt） ============ */
  function translateNativeText(text) {
    if (!text) return text;
    var t = text.trim();
    if (EXACT.hasOwnProperty(t)) {
      var rep = EXACT[t];
      if (rep === '') return '';
      return t.replace(t, rep);
    }
    for (var i = 0; i < REGEX.length; i++) {
      var m = t.match(REGEX[i].re);
      if (m) return REGEX[i].fn(m);
    }
    return text;
  }

  try {
    var _confirm = window.confirm;
    window.confirm = function (msg) {
      return _confirm.call(window, translateNativeText(msg || ''));
    };

    var _alert = window.alert;
    window.alert = function (msg) {
      _alert.call(window, translateNativeText(msg || ''));
    };

    var _prompt = window.prompt;
    window.prompt = function (msg, def) {
      return _prompt.call(window, translateNativeText(msg || ''), def || '');
    };
  } catch (e) { /* 拦截失败静默忽略 */ }
})();
