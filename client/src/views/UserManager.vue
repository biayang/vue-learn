<template>
  <div>
    <vxe-toolbar>
      <template v-slot:buttons>
        <vxe-button icon="fa fa-plus" @click="insertEvent()">新增</vxe-button>
      </template>
    </vxe-toolbar>

    <vxe-table
      border
      resizable
      row-key
      show-overflow
      highlight-hover-row
      ref="xTable"
      height="500"
      :data="tableData"
      @cell-dblclick="cellDBLClickEvent"
    >
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column field="nickname" title="Name"></vxe-table-column>
      <vxe-table-column field="password" title="密码"></vxe-table-column>
      <vxe-table-column field="authority" title="权限" :formatter="formatterSex"></vxe-table-column>
      <vxe-table-column title="操作" width="100" show-overflow>
        <template v-slot="{ row }">
          <vxe-button type="text" icon="fa fa-edit" @click="editEvent(row)">编辑</vxe-button>
          <vxe-button type="text" icon="fa fa-trash-o" @click="removeEvent(row)">删除</vxe-button>
        </template>
      </vxe-table-column>
    </vxe-table>

    <vxe-modal
      v-model="showEdit"
      :title="selectRow ? '编辑&保存' : '新增&保存'"
      width="800"
      min-width="600"
      min-height="300"
      :loading="submitLoading"
      resize
      destroy-on-close
    >
      <template v-slot>
        <vxe-form
          :data="formData"
          :items="formItems"
          :rules="formRules"
          title-align="right"
          title-width="100"
          @submit="submitEvent"
        ></vxe-form>
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
      selectRow: null,
      showEdit: false,
      authlist: [
        { label: "pm", value: "pm" },
        { label: "qa", value: "qa" },
        { label: "op", value: "op" },
        { label: "admin", value: "admin" }
      ],
      formData: {
        password: null,
        nickname: null,
        role: null,
        authority: null
      },
      formRules: {
        password: [
          { required: true, message: "请输入密码" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符" }
        ],
        nickname: [{ required: true, message: "请输用户名" }],
        authority: [{ required: true, message: "请选择权限" }]
      },
      formItems: [
        {
          title: "Basic information",
          span: 24,
          titleAlign: "left",
          titleWidth: 200,
          titlePrefix: { icon: "fa fa-address-card-o" }
        },
        {
          field: "nickname",
          title: "用户名",
          span: 12,
          itemRender: { name: "$input", props: { placeholder: "请输入用户名" } }
        },
        {
          field: "password",
          title: "密码",
          span: 12,
          itemRender: { name: "$input", props: { placeholder: "请输入密码" } }
        },
        {
          field: "authority",
          title: "权限",
          span: 12,
          itemRender: { name: "$select", options: [] }
        },
        {
          align: "center",
          span: 24,
          titleAlign: "left",
          itemRender: {
            name: "$buttons",
            children: [
              { props: { type: "submit", content: "提交", status: "primary" } },
              { props: { type: "reset", content: "重置" } }
            ]
          }
        }
      ]
    };
  },
  created() {
    this.formItems[3].itemRender.options = this.authlist;
    console.log(window.MOCK_DATA_LIST, this.formItems);
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
          .post("auth")
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
            data.authlist.forEach(item => {
              tb.push({
                nickname: item.user,
                password: item.pass,
                authority: item.authority
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
    formatterSex({ cellValue }) {
      let item = this.authlist.find(item => item.value === cellValue);
      return item ? item.label : "";
    },
    visibleMethod({ data }) {
      return data.flag1 === "Y";
    },
    cellDBLClickEvent({ row }) {
      this.editEvent(row);
    },
    insertEvent() {
      this.formData = {
        password: "",
        nickname: "",
        authority: ""
      };
      this.selectRow = null;
      this.showEdit = true;
    },
    editEvent(row) {
      this.formData = {
        password: row.password,
        nickname: row.nickname,
        authority: row.authority
      };
      this.selectRow = row;
      this.showEdit = true;
    },
    removeEvent(row) {
      this.$XModal.confirm("您确定要删除该数据?").then(type => {
        if (type === "confirm") {
          this.$axios
            .post("auth/delete", {
              name: row.nickname,
              password: row.password,
              auth: row.authority
            })
            .then(res => {
              if (res.status === 200) {
                this.$XModal.message({
                  message: "删除成功",
                  status: "success"
                });
                console.log(this.$refs.xTable.afterFullData);
                //   Object.assign(this.selectRow, this.formData);
              }
            });
        }
        this.loadData();
      });
    },
    submitEvent() {
      this.submitLoading = true;
      setTimeout(() => {
        this.submitLoading = false;
        this.showEdit = false;
        if (this.selectRow) {
          this.$axios
            .post("auth/change", {
              name: this.formData.nickname,
              password: this.formData.password,
              auth: this.formData.authority
            })
            .then(res => {
              if (res.status === 200) {
                this.$XModal.message({
                  message: "保存成功",
                  status: "success"
                });
                console.log(this.$refs.xTable.afterFullData);
                //   Object.assign(this.selectRow, this.formData);
              }
            });
        } else {
          this.$axios
            .post("auth/register", {
              name: this.formData.nickname,
              password: this.formData.password,
              auth: this.formData.authority
            })
            .then(res => {
              if (res.status === 200) {
                this.$router.push({ path: "/git" });
                this.$XModal.message({
                  message: "新增成功",
                  status: "success"
                });
                this.$refs.xTable.insert(this.formData);
                console.log(this.$refs.xTable.afterFullData);
              } else {
                alert("添加用户失败");
              }
            });
        }
        this.loadData();
      }, 500);
    }
  }
};
</script>

