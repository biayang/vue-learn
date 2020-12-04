<template>
  <div>
    <vxe-toolbar>
      <template v-slot:buttons>
        <vxe-button icon="fa fa-plus" @click="filterLog()">过滤</vxe-button>
      </template>
    </vxe-toolbar>

    <vxe-table
      border
      resizable
      row-key
      show-overflow
      highlight-hover-row
      ref="xTable"
      height="900"
      :data="tableData"
    >
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column field="user" title="用户"></vxe-table-column>
      <vxe-table-column field="date" title="操作时间"></vxe-table-column>
      <vxe-table-column field="message" title="操作日志"></vxe-table-column>
      <vxe-table-column field="path" title="操作文件（路径），空表示全部内容"></vxe-table-column>
    </vxe-table>

    <vxe-modal v-model="showEdit" width="800" min-width="600" min-height="300" :loading="submitLoading" resize destroy-on-close>
      <template v-slot>
        <vxe-form :data="formData" :items="formItems" :rules="formRules" title-align="right" title-width="100" @submit="loadFilterData"></vxe-form>
      </template>
    </vxe-modal>
  </div>
</template>
<script>
import hljs from "highlight.js";
export default {
  data() {
    return {
      submitLoading: false,
      tableData: [],
      showEdit: false,
      formData: {
        name: null,
        starttime: null,
        endtime: null
      },
      formItems: [
        { field: 'name', title: 'Name', span: 12, itemRender: { name: '$input', props: { placeholder: '请输入名称' } } },
        { field: 'starttime', title: 'StartDate', span: 12, itemRender: { name: '$input', props: { type: 'date', placeholder: '请选择日期' } } },
        { field: 'endtime', title: 'EndDate', span: 12, itemRender: { name: '$input', props: { type: 'date', placeholder: '请选择日期' } } },
        { align: 'center', span: 24, titleAlign: 'left', itemRender: { name: '$buttons', children: [{ props: { type: 'submit', content: '提交', status: 'primary' } }] } }
],
    };
  },
  created() {
    this.loadData();
  },
  mounted() {
    Array.from(this.$el.querySelectorAll("pre code")).forEach(block => {
      hljs.highlightBlock(block);
    });
  },
  methods: {
    loadData() {
      this.loading = true;
      return new Promise(resolve => {
        this.$axios
          .post("auth/op")
          .then(res => {
            const data = res.data;
            if (data.err) {
              this.$XModal.message({
                status: "error",
                message: data.err
              });
            }
            console.log("data", data, res);
            let tb = [];
            data.oplist.forEach(item => {
              tb.push({
                user: item.user,
                date: item.date,
                message: item.message,
                path: item.path,
              });
            });
            return tb;
          })
          .then(tb => {
            this.tableData = tb;
            this.loading = false;
          });
        resolve();
      });
    },
    filterLog() {
      this.formData = {
        name: "",
        starttime: "",
        endtime: ""
      };
      this.showEdit = true;      
    },
    loadFilterData() {
      this.submitLoading = true;
      setTimeout(() => {
        this.submitLoading = false;
        this.showEdit = false;
          this.$axios
          .post("auth/opfilter", {
            name: this.formData.name,
            starttime: this.formData.starttime,
            endtime: this.formData.endtime
          })
          .then(res => {
            const data = res.data;
            if (data.err) {
              this.$XModal.message({
                status: "error",
                message: data.err
              });
            }
            console.log("data", data, res);
            let tb = [];
            data.oplist.forEach(item => {
              tb.push({
                user: item.user,
                date: item.date,
                message: item.message,
                path: item.path,
              });
            });
            return tb;
          })
          .then(tb => {
            this.tableData = tb;
            this.loading = false;
          });
      }, 500);
    }
  }
};
</script>

