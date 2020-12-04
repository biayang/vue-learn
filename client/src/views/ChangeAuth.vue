
<template>
  <div class="login clearfix">
    <div class="login-wrap">
      <el-row type="flex" justify="center">
        <el-form ref="loginForm" :model="user" status-icon label-width="80px">
          <h3>修改权限</h3>
          <hr />
          <el-form-item prop="username" label="用户名">
            <el-input v-model="user.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item prop="authority" label="设置权限">
            <el-select v-model="user.auth" placeholder="请设置权限【op，qa, admin, pm]">
              <el-option label="pm(不可修改其他用户权限)" value="pm"></el-option>
              <el-option label="qa(不可打开翻译)" value="qa"></el-option>
              <el-option label="op(不可各种操作，属于默认权限)" value="op"></el-option>
              <el-option label="admin(全开)" value="admin"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon @click="doChange()">修改权限</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </div>
  </div>
</template>
 
<script>
import axios from "axios";
export default {
  name: "login",
  data() {
    return {
      user: {
        username: "",
        auth: ""
      }
    };
  },
  created() {
    // console.log($);
    // console.log("1111");
  },
  methods: {
    doChange() {
      if (!this.user.username) {
        this.$message.error("请输入用户名！");
        return;
      } else {
        // this.$router.push({ path: "/" }); //无需向后台提交数据，方便前台调试
        this.$axios
          .post("auth/change", {
            name: this.user.username,
            auth: this.user.auth
          })
          .then(res => {
            console.log("输出response.data", res);
            console.log("输出response.data.status", res.status);
            if (res.status === 200) {
              alert("修改权限成功！");
              this.$router.push({ path: "/git?b=dev" });
            }
          });
      }
    }
  }
};
</script>
 
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login {
  width: 100%;
  height: 740px;
  overflow: hidden;
}
.login-wrap {
  width: 400px;
  height: 300px;
  margin: 215px auto;
  overflow: hidden;
  padding-top: 10px;
  line-height: 20px;
}

h3 {
  color: #0babeab8;
  font-size: 24px;
}
hr {
  background-color: #444;
  margin: 20px auto;
}

.el-button {
  width: 80%;
  margin-left: -50px;
}
</style>