
<template>
  <div class="login clearfix">
    <div class="login-wrap">
      <el-row type="flex" :gutter="40">
        <el-form ref="loginForm" :model="user" status-icon label-width="100px">
          <h3>添加用户</h3>
          <hr />
          <el-form-item prop="username" label="用户名">
            <el-input v-model="user.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item prop="password" label="设置密码">
            <el-input v-model="user.password" show-password placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item prop="authority" label="设置权限">
            <el-select v-model="user.authority" placeholder="请设置权限【op，qa, admin, pm]">
              <el-option label="pm(不可修改其他用户权限)" value="pm"></el-option>
              <el-option label="qa(不可打开翻译)" value="qa"></el-option>
              <el-option label="op(不可各种操作，属于默认权限)" value="op"></el-option>
              <el-option label="admin(全开)" value="admin"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon @click="doRegister()">注册账号</el-button>
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
        authority: "",
        password: ""
      }
    };
  },
  created() {
    // console.log($);
    // console.log("1111");
  },
  methods: {
    doRegister() {
      if (!this.user.username) {
        this.$message.error("请输入用户名！");
        return;
      } else if (!this.user.password) {
        this.$message.error("请输入密码！");
        return;
      }  else if (!this.user.authority) {
        this.$message.error("请选择用户权限！");
        return;
      } else {
        // this.$router.push({ path: "/" }); //无需向后台提交数据，方便前台调试
        this.$axios
          .post("auth/register", {
            name: this.user.username,
            password: this.user.password,
            authority:this.user.authority
          })
          .then(res => {
            console.log("输出response.data", res);
            console.log("输出response.data.status", res.status);
            if (res.status === 200) {
              this.$router.push({ path: "/git" });
            } else {
              alert("您输入的用户名已存在！");
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
  height: 960px auto;
  overflow: auto;
}
.login-wrap {
  width: 400px;
  height: 500px;
  margin: 215px auto;
  overflow: auto;
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