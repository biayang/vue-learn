<template>
  <div id="app">
    <div id="nav">
      <router-link to="/git?b=dev">
        Config dev
      </router-link> |
      <router-link to="/git?b=prod">
        Config prod
      </router-link> |
      <router-link to="/trans">
        Trans
      </router-link> 
      <router-link to="/oplog">
        操作日志
      </router-link> 
      <!-- <router-link to="/todo?d=self">
        我的Todo
      </router-link> |
      <router-link to="/todo?d=dd">
        项目Todo
      </router-link> -->
    </div>
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
