import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 存储token
    Authorization: localStorage.getItem('Authorization') ? localStorage.getItem('Authorization') : '',
    Authority: localStorage.getItem('Authority') ? localStorage.getItem('Authority') : 'op',
  },
  mutations: {
    // 修改token，并将token存入localStorage
    changeLogin (state, user) {
      console.log('enter login',state , user)
      console.log(state.Authorization, user.Authorization)
      console.log(state.Authority, user.Authority)
      state.Authorization = user.Authorization;
      state.Authority = user.Authority;
      localStorage.setItem('Authorization', user.Authorization);
      localStorage.setItem('Authority', user.Authority);
    }
  },
  actions: {
  },
  modules: {
  }
})
