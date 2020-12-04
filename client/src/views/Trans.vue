<template>
  <!-- grid -->
  <vxe-grid
    round
    border
    show-header-overflow
    show-overflow
    export-config
    import-config
    auto-resize
    ref="xTable1"
    highlight-hover-row
    :toolbar="tableToolbar"
    :align="allAlign"
    :data="tableData"
    :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
    :sort-config="{ defaultSort: { field: '_prio', order: 'desc' } }"
    :cell-style="cellStyle"
    :row-style="rowStyle"
    keep-source
    @edit-closed="editClosedEvent"
    :context-menu="tableMenu"
    @context-menu-click="contextMenuClickEvent"
  >
    >
    <!-- toolbar -->
    <template v-slot:toolbar_buttons>
      <!-- <vxe-input v-model="filterName" type="search" placeholder="全表搜索"></vxe-input> -->
      <vxe-button @click="insertEvent" status="success">insert</vxe-button>
      <router-link v-if="hasAuthority()" to="/user">
        <vxe-button status="danger">用户管理</vxe-button>
      </router-link>
      <vxe-button status="primary" @click="loginOut()">登出</vxe-button>
      <vxe-button
        v-if="!saveAuto"
        @click="saveEvent('all')"
        status="primary"
        :loading="saveLoading"
        >save (as import)</vxe-button
      >

      <vxe-input
        v-model="filterName"
        type="search"
        placeholder="全表搜索"
      ></vxe-input>
      <vxe-switch
        v-model="saveAuto"
        on-label="auto save"
        :on-value="1"
        off-label="auto save"
        :off-value="0"
      />
    </template>

    <!-- column -->
    <!-- <vxe-table-column type="checkbox" width="60"></vxe-table-column> -->
    <!-- <vxe-table-column type="seq" title="Seq" width="50" /> -->
    <vxe-table-column
      field="_prio"
      title="Priority"
      sortable
      resizable
      width="50"
      :edit-render="{ name: '$select', options: priorityList }"
    />
    <vxe-table-column
      field="ident"
      title="Ident"
      sortable
      resizable
      :edit-render="{
        name: 'textarea',
        immediate: true,
        attrs: { type: 'text' },
      }"
    />
    <vxe-table-column
      v-for="lang in langs"
      :key="lang.field"
      :field="lang.field"
      :title="lang.title"
      sortable
      resizable
      :edit-render="{
        name: 'textarea',
        immediate: true,
        attrs: { type: 'text' },
      }"
    />
    <vxe-table-column
      field="_date"
      title="Date"
      sortable
      resizable
      :edit-render="{ name: '$input', props: { type: 'date' } }"
    />
    <vxe-table-column
      field="_comment"
      title="Comment"
      :edit-render="{ name: 'textarea' }"
    />
  </vxe-grid>
</template>

<script>
import XEUtils from "xe-utils";
import XEClipboard from "xe-clipboard";
import { mapMutations } from "vuex";

let tableToolbar = {
  custom: true,
  slots: {
    buttons: "toolbar_buttons",
  },
  zoom: {},
  print: {},
  import: { mode: "insert" },
  export: { original: true, type: "txt" },
};

let tableMenu = {
  header: {},
  body: {
    options: [
      [
        {
          code: "copy",
          name: "copy",
        },
      ],
      [
        {
          code: "delete",
          name: "delete",
        },
      ],
    ],
  },
};

export default {
  data() {
    return {
      /**
       * config
       */
      langBase: this.Conf.transLangBase,
      langs: this.Conf.transLangs,
      priorityList: this.Conf.transPriorityList,
      langUpdByBaseColor: this.Conf.transLangUpdByBaseColor,
      /**
       * switch
       */
      saveLoading: false,
      saveAuto: 1,
      /**
       * data
       */
      filterName: "",
      allAlign: "left",
      tableData: [],
      /**
       * plugs
       */
      tableToolbar: tableToolbar, // 工具条
      tableMenu: tableMenu, // 右键菜单
      fullHeight: document.documentElement.clientHeight - 88, // 屏幕完整高度，锁定列头时用到。由于锁定列头后会令搜索(渲染)变得复杂，暂时去掉了这个
    };
  },

  /**
   * methods
   */
  methods: {
    ...mapMutations(["changeLogin"]),
    loadData() {
      this.loading = true;
      return new Promise((resolve) => {
        this.$axios.get("trans/load", "").then((res) => {
          const data = res.data;
          if (data.err) {
            this.$XModal.message({
              status: "error",
              message: data.err,
            });
          }
          this.tableData = data.d;

          // console.log('111', this.tableData.length);
          let repeatIdent = {};
          this.tableData.forEach((ele) => {
            if (ele.ident == "") {
              return;
            }
            let i = ele.ident;
            if (repeatIdent[i]) {
              repeatIdent[i] += 1;
            } else {
              repeatIdent[i] = 1;
            }
          });
          Object.keys(repeatIdent).forEach((key) => {
            if (repeatIdent[key] <= 1) {
              delete repeatIdent[key];
              return;
            }
            this.$XModal.message({
              status: "warning",
              message: "重复ident: " + key,
            });
          });

          this.loading = false;
        });
        this.loading = false;

        resolve();
      });
    },
    saveEvent(opt) {
      let xTable1 = this.$refs.xTable1;
      const {
        insertRecords,
        removeRecords,
        updateRecords,
      } = xTable1.getRecordset();
      // 手动保存导入文件(推荐txt)
      if (insertRecords.length > 0) {
        this.tableData.push(...insertRecords);
      }

      this.saveLoading = true;
      if (opt == "all") {
        this.$axios.post("trans/save", { tbData: this.tableData }).then(() => {
          this.saveLoading = false;
          this.loadData();
        });
      } else {
        if (updateRecords.length) {
          //TODO batch
          updateRecords.forEach((ele) => {
            this.$axios.get("trans/update", { row: ele });
          });
          this.saveLoading = false;
        }
        if (removeRecords.length) {
          console.warn(removeRecords);
        }
        if (insertRecords.length) {
          console.warn(insertRecords);
        }
      }
      // this.$XModal.message({
      //   message: `insert: ${insertRecords.length} ，delete: ${removeRecords.length} ，update: ${updateRecords.length} `,
      //   status: "success"
      // });

      // this.loadData();
    },
    insertEvent() {
      let xTable1 = this.$refs.xTable1;
      xTable1
        .insertAt(
          [
            {
              ident: "",
              _prio: 3,
            },
          ],
          null
        )
        .then(({ row }) => {
          // xTable1.setActiveCell(row, "ident");
          return { row: row };
        })
        .then(({ row }) => {
          var uniqueSlug = require("unique-slug");
          var randomSlug = uniqueSlug();
          row._XID = randomSlug;
          this.tableData.unshift(row);
        })
        .then(() => {
          this.saveEvent("all");
        });
    },
    editClosedEvent({ row, column }) {
      let xTable1 = this.$refs.xTable1;
      let field = column.property;
      // if (typeof str == "string") {
      //   row[field] = row[field].trim();
      // }
      let cellValue = row[field];

      let saveHandler = function (that) {
        // 判断单元格值是否被修改
        if (xTable1.isUpdateByRow(row, field)) {
          setTimeout(() => {
            that.$XModal.message({
              message: `[save] ${field}=${cellValue}`,
              status: "success",
            });
            if (that.saveAuto) {
              // 局部更新单元格为已保存状态
              that.saveEvent("all");
              // that.$refs.xTable1.reloadRow(row, null, field);
            }
          }, 100);
        }
        // 基础语言修改后， 自动变更优先级
        if (field == that.langBase) {
          row._prio = 2;
        }
        var needDown = true;
        that.langs.forEach((ele) => {
          var someT = "_" + ele.field + "T";
          var basesomeT = "_" + that.langBase + "T";
          if (field == ele.field) {
            row[someT] = that.timeStamp();
          }

          if (typeof row[someT] == "undefined" || row[someT] < row[basesomeT]) {
            needDown = false;
          }
        });
        // 全部编辑 则下沉
        if (needDown) {
          row._prio = 0;
        }
      };

      var pattern = new RegExp(
        "[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】\\\\‘；：”“'。，、？\\s]"
      );
      let chr = pattern.exec(cellValue);
      let that = this;
      if (field == "ident" && chr != null) {
        this.$XModal.confirm("匹配到特殊字符 " + chr).then((type) => {
          if (type === "confirm") {
            saveHandler(that); // save
            return;
          } else {
            return; // no save
          }
        });
      } else {
        saveHandler(that); // save
        return;
      }
    },
    contextMenuClickEvent({ menu, row, column }) {
      switch (menu.code) {
        case "copy":
          // 示例
          if (row && column) {
            if (XEClipboard.copy(row[column.property])) {
              this.$XModal.message({
                message: "copy success",
                status: "success",
              });
            }
          }
          break;
        case "delete":
          this.tableData.forEach((ele, k, arr) => {
            if (row == ele) {
              let r = arr.splice(k, 1);
              this.saveEvent("all");
              this.$XModal.message({
                status: "success",
                message: "[delete] ident=" + r[0].ident,
              });
              this.$refs.xTable1.remove(row);
            }
          });
          break;
        default:
          this.$XModal.message(`点击了 ${menu.name} 选项`);
      }
    },
    hasAuthority() {
      if (this.Conf.auth.add.includes(this.$store.state.Authority)) {
        console.log(
          "if authority pass",
          this.Conf.auth.add.includes(this.$store.state.Authority)
        );
        return true;
      }
      return false;
    },
    loginOut() {
      const _this = this;
      // 将用户token保存到vuex中
      _this.changeLogin({ Authorization: "" });
      this.$router.push({ path: "/login" });
    },
    rowStyle({ row }) {
      let fieldArr = [];
      this.langs.forEach((ele) => {
        fieldArr.push(ele.field);
      });
      fieldArr.push("ident");
      let show = false;
      XEUtils.objectEach(row, (item, k) => {
        if (!fieldArr.includes(k)) {
          return;
        }
        if (
          XEUtils.toString(item).toLowerCase().indexOf(this.filterName) > -1
        ) {
          show = true;
        }
      });
      if (show) {
        return {};
      } else {
        return { display: "none" };
      }
    },
    cellStyle({ row, column }) {
      // prio变色
      let bgC = null;
      if (column.property == "_prio") {
        this.priorityList.forEach((ele) => {
          if (ele.label == row._prio) {
            bgC = ele.color;
          }
        });
        return { backgroundColor: bgC };
      }

      // en有变更 其他lang变色
      let langsArr = [];
      this.langs.forEach((ele) => {
        langsArr.push(ele.field);
      });
      if (langsArr.includes(column.property)) {
        let someT = "_" + column.property + "T";
        let basesomeT = "_" + this.langBase + "T";
        if (typeof row[someT] == "undefined" || row[someT] < row[basesomeT]) {
          bgC = this.langUpdByBaseColor;
        }
        return { backgroundColor: bgC };
      }

      return {};
    },
    timeStamp() {
      return Date.parse(new Date().toString()) / 1000;
    },
    sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    },
  },

  /**
   * computed
   */
  computed: {
    // tableDataSearch() {
    //   const filterName = XEUtils.toString(this.filterName).trim().toLowerCase();
    //   console.log("fn", this.filterName);
    //   if (filterName) {
    //     const filterRE = new RegExp(filterName, "gi");
    //     const searchProps = ["ident", "en", "zh"];
    //     const rest = this.tableData.filter((item) =>
    //       searchProps.some(
    //         (key) =>
    //           XEUtils.toString(item[key]).toLowerCase().indexOf(filterName) > -1
    //       )
    //     );
    //     console.log("rest", rest);
    //     return rest.map((row) => {
    //       const item = Object.assign({}, row);
    //       searchProps.forEach((key) => {
    //         item[key] = XEUtils.toString(item[key]).replace(
    //           filterRE,
    //           (match) => `<span class="keyword-lighten">${match}</span>`
    //         );
    //       });
    //       console.log("-----", item);
    //       return item;
    //     });
    //   }
    //   return this.tableData;
    // },
  },

  // 实例化后 && 数据观测（data observer）和event/watcher事件之前
  beforeCreate: function () {},

  // 实例化后
  created: function () {
    this.loadData();
  },

  // 挂载之前： 渲染函数首次调用
  beforeMount: function () {},

  // 挂载成功后： el被新创建的vm.$el替换
  mounted: function () {},

  // 更新前
  befoureUpdate: function () {},

  // DOM更新后
  updated: function () {},
};
</script>