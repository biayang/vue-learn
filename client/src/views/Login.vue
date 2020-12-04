
<template>
  <div class="login" clearfix>
    <div class="login-wrap">
      <el-row type="flex" justify="center">
        <el-form ref="loginForm" :model="user" :rules="rules" status-icon label-width="100px">
          <h3>登录</h3>
          <hr />
          <el-form-item prop="username" label="用户名">
            <el-input v-model="user.username" placeholder="请输入用户名" prefix-icon></el-input>
          </el-form-item>
          <el-form-item id="password" prop="password" label="密码">
            <el-input v-model="user.password" show-password placeholder="请输入密码"></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary"  @click="doLogin()">登 录</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </div>
  </div>
</template>
 
<script>
import axios from "axios";
import { mapMutations } from 'vuex';
export default {
  name: "login",
  data() {
    return {
      user: {
        username: "",
        password: ""
      }
    };
  },
  created() {},
  methods: {
    ...mapMutations(['changeLogin']),
    doLogin() {
      let _this = this;
      if (!this.user.username) {
        this.$message.error("请输入用户名！");
        return;
      } else if (!this.user.password) {
        this.$message.error("请输入密码！");
        return;
      } else {
        //校验用户名和密码是否正确;
        // this.$router.push({ path: "/personal" });
        this.$axios
          .post("auth/login", {
            name: this.user.username,
            password: this.user.password
          })
          .then(res => {
            // console.log("输出response.data.status", res.data.status);
            console.log('res is',res.data);
            _this.userToken = res.data.token;
            _this.userOp = res.data.authority;
            // 将用户token保存到vuex中
            _this.changeLogin({ Authorization: _this.userToken, Authority:  _this.userOp});
            if (res.status === 200) {
              this.$router.push({ path: "/git?b=dev" });
            } else {
              alert("您输入的用户名或密码错误！");
            }
          });
      }
    },
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
  line-height: 40px;
}
#password {
  margin-bottom: 5px;
}
h3 {
  color: #0babeab8;
  font-size: 24px;
}
hr {
  background-color: #444;
  margin: 20px auto;
}
a {
  text-decoration: none;
  color: #aaa;
  font-size: 15px;
}
a:hover {
  color: coral;
}
.el-button {
  width: 80%;
  margin-left: -50px;
}

.el-row {
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap
}

</style>