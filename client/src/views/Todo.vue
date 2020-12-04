<template>
  <article v-html="parseMarkDown()" />
</template>

<script>
import marked from "marked";

export default {
  data() {
    return {
      dd: `
- [x] 基础表格
  - [x] 可编辑
  - [x] 悬停高亮
  - [x] 多选框
- [x] 单列排序
- [x] 优先级
  - [x] 新增优先级上调
  - [x] 所有语言编辑完优先级下沉
  - [x] 修改基础语言，变色并优先级上调
- [x] 编辑
  - [x] 新增
  - [x] 修改
- [ ] 权限控制
  - [ ] 接入SSO
      `,
      self: `
- [x] 导入导出
  - [x] csv
  - [x] txt
  - [x] json
- [x] 可配置
- [x] 列筛选
- [x] 点击保存
- [ ] 注释图标
- [ ] 版本控制
  - [x] git
  - [ ] diff
  - [ ] 冲突 or 通知变更
  - [ ] 友好commit message
- [ ] 实时保存
- [ ] 右键菜单
- [ ] 编辑
  - [ ] 新增(右键)
  - [ ] 删除
  - [ ] 删除(右键)
  - [ ] 修改（实时）
- [ ] 统计概览
- [x] 固定表头
`,
    };
  },
  methods: {
    parseMarkDown() {
      switch (this.$route.query.d) {
        case "dd":
          return marked(this.dd, {});
        case "self":
          return marked(this.self, {});

        default:
          break;
      }
    },
  },
  created() {},
};
</script>