<template>
  <!-- grid -->
  <vxe-grid
    round
    border
    show-header-overflow
    show-overflow
    auto-resize
    ref="xTable1"
    highlight-hover-row
    :toolbar="tableToolbar"
    :align="allAlign"
    :data="tableData"
    keep-source
    :cell-style="cellStyle"
    :sort-config="{defaultSort: {field: 'prio', order:'desc'}}"
    :max-height="20"
  >
    <!-- :checkbox-config="{trigger: 'row', highlight: true, range: true}" -->
    <!-- toolbar -->
    <template v-slot:toolbar_buttons>
      <vxe-button status="info" @click="logEvent('')">Log</vxe-button>
      <vxe-modal v-model="logAllWin" :width="1000" :mask-closable="false" :mask="false">
        <vxe-grid :data="logWinData">
          <vxe-table-column field="author_name" title="Author" />
          <vxe-table-column field="date" title="Date" />
          <vxe-table-column field="message" title="Msg" />
          <vxe-table-column field="hash" title="Hash" />
        </vxe-grid>
      </vxe-modal>

      <vxe-button status="warning" @click="diffEvent('')">Diff</vxe-button>
      <vxe-modal v-model="diffAllWin" :width="1000" :mask-closable="false" :mask="false">
        <div>
          <pre>{{diffWinData}}</pre>
        </div>
      </vxe-modal>
      <vxe-button status="success"  v-if="hasCloneAuthority()" @click="cloneEvent()">CLONE</vxe-button>
      <router-link v-if="hasAuthority()" to="/user">
        <vxe-button status="danger">用户管理</vxe-button>
      </router-link>
      <vxe-button status="primary" @click="loginOut()">登出</vxe-button>
    </template>

    <!-- column -->
    <!-- <vxe-table-column type="checkbox" width="50" /> -->
    <vxe-table-column type="seq" title="Seq" width="50" />
    <vxe-table-column field="prio" title="Status" sortable resizable width="50" />
    <vxe-table-column field="fileName" title="FileName" sortable resizable />
    <vxe-table-column field="operation" title="Operation" sortable resizable>
      <template v-slot="{ row }">
        <vxe-button status="info" @click="logEvent(row.fileName)">log</vxe-button>
        <vxe-button status="success" :loading="loading" @click="downEvent(row.fileName)">down</vxe-button>
        <vxe-button status="warning" @click="diffEvent(row.fileName)" v-if="row.prio>=1">diff</vxe-button>
        <vxe-button status="danger" @click="commitEvent(row.fileName)" v-if="row.prio>=1">commit</vxe-button>

        <div v-if="logWinName===row.fileName">
          <vxe-modal
            v-model="logWin"
            :title="logWinTitle"
            :width="1000"
            :mask-closable="false"
            :mask="false"
          >
            <vxe-grid :data="logWinData">
              <vxe-table-column field="author_name" title="Author" />
              <vxe-table-column field="date" title="Date" />
              <vxe-table-column field="message" title="Msg" />
              <vxe-table-column field="hash" title="Hash" />
            </vxe-grid>
          </vxe-modal>
        </div>

        <div v-if="diffWinName===row.fileName">
          <vxe-modal
            v-model="diffWin"
            :title="diffWinTitle"
            :width="1000"
            :mask-closable="false"
            :mask="false"
          >
            <div>
              <pre>{{diffWinData}}</pre>
            </div>
          </vxe-modal>
        </div>
      </template>
    </vxe-table-column>
  </vxe-grid>
</template>

<script>
import axios from "axios";
import { mapMutations } from "vuex";
let tableToolbar = {
  custom: true,
  slots: {
    buttons: "toolbar_buttons"
  },
  zoom: {},
  print: {}
};
export default {
  data() {
    return {
      /**
       * data
       */
      tableData: [],
      allAlign: "left",
      priorityList: this.Conf.transPriorityList,
      diffWinData: [],
      logWinData: [],
      logWinTitle: "",
      diffWinTitle: "",
      /**
       * switch
       */
      diffWin: false,
      diffAllWin: false,
      diffWinName: "",
      logWin: false,
      logAllWin: false,
      logWinName: "",
      loading: false,
      /**
       * plugs
       */
      tableToolbar: tableToolbar
    };
  },
  methods: {
    ...mapMutations(["changeLogin"]),
    hasAuthority() {
      console.log("check this.$store.state.Authority",this.$store.state.Authority)
        if(this.Conf.auth.add.includes(this.$store.state.Authority)) {
          console.log("if authority pass", this.Conf.auth.add.includes(this.$store.state.Authority))
          return true;
        }
        return false;
    },
    hasCloneAuthority() {
        if(this.Conf.auth.git.includes(this.$store.state.Authority)) {
          console.log("if authority pass", this.Conf.auth.git.includes(this.$store.state.Authority))
          return true;
        }
        return false;
    },
    loadData(b) {
      this.loading = true;
      return new Promise(resolve => {
        this.$axios
          .post("git", { branch: b })
          .then(res => {
            const data = res.data;
            if (data.err) {
              this.$XModal.message({
                status: "error",
                message: data.err
              });
            }
            console.log("data", data);
            let tb = [];
            data.files.forEach(item => {
              if (data.status.modified.includes(item)) {
                tb.push({ fileName: item, prio: 1 });
              } else if (data.status.not_added.includes(item)) {
                tb.push({ fileName: item, prio: 2 });
              } else {
                tb.push({ fileName: item, prio: 0 });
              }
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
    downEvent(fileName) {
      this.loading = true;
      this.$axios
        .post("git/down", {
          file: fileName,
          branch: this.$route.query.b
        })
        .then(res => {
          const data = res.data;
          if (data.out) {
            this.$XModal.message({ message: data.out, status: "success" });
          }
          if (data.err) {
            this.$XModal.message({
              message: data.err,
              status: "error",
              duration: 10000
            });
          }
          this.loadData(this.$route.query.b);
          this.loading = false;
        });
    },
    logEvent(fileName) {
      this.$axios
        .post("git/log", {
          file: fileName,
          branch: this.$route.query.b
        })
        .then(res => {
          console.log(res);
          this.logWinTitle = res.data.file;
          this.logWinData = res.data.log.all;
          this.logWin = true;
          this.logWinName = res.data.file;
          if (!res.data.file) {
            this.logAllWin = true;
          }
        });
    },
    diffEvent(fileName) {
      this.$axios
        .post("git/diff", {
          file: fileName,
          branch: this.$route.query.b
        })
        .then(res => {
          const data = res.data;
          this.diffWinTitle = data.file;
          this.diffWinData = data.diff;
          this.diffWin = true;
          this.diffWinName = data.file;
          console.log(data);
          if (!data.file) {
            this.diffAllWin = true;
          }
        });
    },
    commitEvent(fileName) {
      this.loading = true;
      this.$axios
        .post("git/commit", {
          file: fileName,
          branch: this.$route.query.b
        })
        .then(res => {
          const data = res.data;
          if (data.out) {
            this.$XModal.message({ message: data.out, status: "success" });
          }
          if (data.err) {
            this.$XModal.message({
              message: data.err,
              status: "error",
              duration: 10000
            });
          }
          this.loadData(this.$route.query.b);
          this.loading = false;
        });
    },
    cloneEvent() {
      this.loading = true;
      this.$axios
        .post("git/clone", {
          branch: this.$route.query.b
        })
        .then(res => {
          const data = res.data;
          if (data.out) {
            this.$XModal.message({ message: data.out, status: "success" });
          }
          if (data.err) {
            this.$XModal.message({
              message: data.err,
              status: "error",
              duration: 10000
            });
          }
          this.loadData(this.$route.query.b);
          this.loading = false;
        });
    },
    loginOut() {
      const _this = this;
      // 将用户token保存到vuex中
      _this.changeLogin({ Authorization: "" });
      this.$router.push({ path: "/login" });
    },
    cellStyle({ row, column }) {
      // prio变色
      let bgC = null;
      if (column.property == "prio") {
        this.priorityList.forEach(ele => {
          if (ele.label == row.prio) {
            bgC = ele.color;
          }
        });
        return { backgroundColor: bgC };
      }
      return {};
    }
  },
  mounted: function() {
    this.loadData(this.$route.query.b);
  },
  watch: {
    $route: function() {
      this.loadData(this.$route.query.b);
    }
  }
};
</script>