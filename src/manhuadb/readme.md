1. 执行 raw.js
   访问 manhuadb.com
   得到 1994-2019 年的漫画条目索引数据
   生成 raw.json

2. 执行 detail.js
   遍历 raw.json 的每个条目, 访问 manhuadb.com 详情页
   得到对应 item 的 ep, jp, cn 新增数据
   生成 detail.json

3. 手动修改 detail.json
   暂时手动匹配 bgm.tv 搜索数据
   bgm 的漫画系列条目 id 替换掉 detail.json 对应 item.id
   (本步骤以后开发半自动)

4. 执行 manga.js
   遍历 detail.json 的每个条目
   假如 key 与 item.id 不一致, 调用 bgm api 更新 id, 分数, 封面图地址
   匹配成功的 item 从 detail.json 剪切到 matched.json
   生成 manga.json

5. manga.json 发布到 CDN
   更新 CDN 版本号
   Bangumi APP 检测到版本号变化, 重新同步数据
   找漫画 功能使用
