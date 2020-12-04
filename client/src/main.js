import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './plugins/utils'
import './plugins/table'

import axios from './http'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI)
//全局配置
// axios 配置
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.timeout = 60000;
Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.prototype.Conf = require('../conf')

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
