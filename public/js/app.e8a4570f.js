(function(e){function t(t){for(var o,r,c=t[0],i=t[1],l=t[2],s=0,d=[];s<c.length;s++)r=c[s],Object.prototype.hasOwnProperty.call(a,r)&&a[r]&&d.push(a[r][0]),a[r]=0;for(o in i)Object.prototype.hasOwnProperty.call(i,o)&&(e[o]=i[o]);h&&h(t);while(d.length)d.shift()();return u.push.apply(u,l||[]),n()}function n(){for(var e,t=0;t<u.length;t++){for(var n=u[t],o=!0,r=1;r<n.length;r++){var c=n[r];0!==a[c]&&(o=!1)}o&&(u.splice(t--,1),e=i(i.s=n[0]))}return e}var o={},r={app:0},a={app:0},u=[];function c(e){return i.p+"js/"+({about:"about"}[e]||e)+"."+{about:"fa7d59d7","chunk-0ee6c981":"4585df93","chunk-17ca3dea":"758a1de7","chunk-0854fbce":"51d5e318","chunk-5ad56cb4":"251de923","chunk-550c98ee":"6ed36e8b","chunk-6ed759d5":"c088bc78","chunk-7459d976":"6b19ec49","chunk-bdce7322":"2509f84a"}[e]+".js"}function i(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.e=function(e){var t=[],n={"chunk-0ee6c981":1,"chunk-550c98ee":1,"chunk-bdce7322":1};r[e]?t.push(r[e]):0!==r[e]&&n[e]&&t.push(r[e]=new Promise((function(t,n){for(var o="css/"+({about:"about"}[e]||e)+"."+{about:"31d6cfe0","chunk-0ee6c981":"66ad6079","chunk-17ca3dea":"31d6cfe0","chunk-0854fbce":"31d6cfe0","chunk-5ad56cb4":"31d6cfe0","chunk-550c98ee":"6ea2835e","chunk-6ed759d5":"31d6cfe0","chunk-7459d976":"31d6cfe0","chunk-bdce7322":"dda4dbc4"}[e]+".css",a=i.p+o,u=document.getElementsByTagName("link"),c=0;c<u.length;c++){var l=u[c],s=l.getAttribute("data-href")||l.getAttribute("href");if("stylesheet"===l.rel&&(s===o||s===a))return t()}var d=document.getElementsByTagName("style");for(c=0;c<d.length;c++){l=d[c],s=l.getAttribute("data-href");if(s===o||s===a)return t()}var h=document.createElement("link");h.rel="stylesheet",h.type="text/css",h.onload=t,h.onerror=function(t){var o=t&&t.target&&t.target.src||a,u=new Error("Loading CSS chunk "+e+" failed.\n("+o+")");u.code="CSS_CHUNK_LOAD_FAILED",u.request=o,delete r[e],h.parentNode.removeChild(h),n(u)},h.href=a;var p=document.getElementsByTagName("head")[0];p.appendChild(h)})).then((function(){r[e]=0})));var o=a[e];if(0!==o)if(o)t.push(o[2]);else{var u=new Promise((function(t,n){o=a[e]=[t,n]}));t.push(o[2]=u);var l,s=document.createElement("script");s.charset="utf-8",s.timeout=120,i.nc&&s.setAttribute("nonce",i.nc),s.src=c(e);var d=new Error;l=function(t){s.onerror=s.onload=null,clearTimeout(h);var n=a[e];if(0!==n){if(n){var o=t&&("load"===t.type?"missing":t.type),r=t&&t.target&&t.target.src;d.message="Loading chunk "+e+" failed.\n("+o+": "+r+")",d.name="ChunkLoadError",d.type=o,d.request=r,n[1](d)}a[e]=void 0}};var h=setTimeout((function(){l({type:"timeout",target:s})}),12e4);s.onerror=s.onload=l,document.head.appendChild(s)}return Promise.all(t)},i.m=e,i.c=o,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)i.d(n,o,function(t){return e[t]}.bind(null,o));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="/",i.oe=function(e){throw console.error(e),e};var l=window["webpackJsonp"]=window["webpackJsonp"]||[],s=l.push.bind(l);l.push=t,l=l.slice();for(var d=0;d<l.length;d++)t(l[d]);var h=s;u.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"034f":function(e,t,n){"use strict";n("85ec")},"43d4":function(e,t,n){e.exports={server:"http://127.0.0.1:8088/",serverDevPort:8087,auth:{git:["admin","qa","pm"],trans:["admin","pm"],add:["admin"]},transLangBase:"en",transLangs:[{field:"en",title:"En (base)"},{field:"en_prod",title:"EN(polished)"},{field:"zh",title:"Zh"},{field:"de",title:"De"},{field:"fr",title:"Fr"}],transPriorityList:[{label:"0",value:0,color:null},{label:"1",value:1,color:"#FFD6BB"},{label:"2",value:2,color:"#FFA366"},{label:"3",value:3,color:"#FF6600"}],transLangUpdByBaseColor:"#E0EEEE"}},"56d7":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var o=n("2b0e"),r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("div",{attrs:{id:"nav"}},[n("router-link",{attrs:{to:"/git?b=dev"}},[e._v(" Config dev ")]),e._v(" | "),n("router-link",{attrs:{to:"/git?b=prod"}},[e._v(" Config prod ")]),e._v(" | "),n("router-link",{attrs:{to:"/trans"}},[e._v(" Trans ")]),n("router-link",{attrs:{to:"/oplog"}},[e._v(" 操作日志 ")])],1),n("router-view")],1)},a=[],u=(n("034f"),n("2877")),c={},i=Object(u["a"])(c,r,a,!1,null,null,null),l=i.exports,s=(n("d3b7"),n("8c4f"));o["a"].use(s["a"]);var d=[{path:"/",redirect:"/login"},{path:"/login",name:"Login",component:function(){return n.e("chunk-0ee6c981").then(n.bind(null,"a55b"))}},{path:"/register",name:"Register",component:function(){return n.e("chunk-550c98ee").then(n.bind(null,"73cf"))}},{path:"/change",name:"Change",component:function(){return n.e("chunk-bdce7322").then(n.bind(null,"06c6"))}},{path:"/git",name:"Git",component:function(){return n.e("chunk-7459d976").then(n.bind(null,"9a96"))},props:function(e){return{b:e.query.b}}},{path:"/trans",name:"Trans",component:function(){return n.e("chunk-6ed759d5").then(n.bind(null,"11e3"))}},{path:"/user",name:"User",component:function(){return Promise.all([n.e("chunk-17ca3dea"),n.e("chunk-5ad56cb4")]).then(n.bind(null,"8c0c"))}},{path:"/oplog",name:"OpLog",component:function(){return Promise.all([n.e("chunk-17ca3dea"),n.e("chunk-0854fbce")]).then(n.bind(null,"f4c8e"))}},{path:"/todo",name:"Todo",component:function(){return n.e("about").then(n.bind(null,"a3b3"))},props:function(e){return{d:e.query.d}}}],h=new s["a"]({mode:"hash",routes:d});h.beforeEach((function(e,t,n){if("/login"===e.path||"/register"===e.path)n();else{var o=localStorage.getItem("Authorization");console.log("token,",o),null===o||""===o?(console.log("导航守卫生效，转移到login",o),n("/login")):(console.log("导航守卫不生效",null==o),n())}}));var p=h,f=n("2f62");o["a"].use(f["a"]);var g=new f["a"].Store({state:{Authorization:localStorage.getItem("Authorization")?localStorage.getItem("Authorization"):"",Authority:localStorage.getItem("Authority")?localStorage.getItem("Authority"):"op"},mutations:{changeLogin:function(e,t){console.log("enter login",e,t),console.log(e.Authorization,t.Authorization),console.log(e.Authority,t.Authority),e.Authorization=t.Authorization,e.Authority=t.Authority,localStorage.setItem("Authorization",t.Authorization),localStorage.setItem("Authority",t.Authority)}},actions:{},modules:{}}),m=n("c695"),b=n.n(m);o["a"].prototype.$utils=b.a;var v=n("a388"),y=n.n(v);n("5d37");o["a"].use(y.a),o["a"].prototype.$XModal=y.a.modal;n("ac1f"),n("5319");var k=n("bc3a"),A=n.n(k),S=n("cca1"),w=n.n(S);A.a.interceptors.request.use((function(e){return console.log("localStorage.token",localStorage.Authorization),localStorage.Authorization&&(console.log("config.headers",e.headers),e.headers.Authorization=localStorage.Authorization),console.log("request is",e),e}),(function(e){return Promise.reject(e)})),A.a.interceptors.response.use((function(e){return 999===e.data.errno&&(console.log("token过期"),p.replace("/login")),998===e.data.errno&&(S["Message"].error({message:"该用户已经存在"}),p.push("/login")),997===e.data.errno?(S["Message"].error({message:"登录密码错误"}),p.push("/login")):e}),(function(e){return console.log("response",e),504==e.response.status||404==e.response.status?S["Message"].error({message:"服务器被吃了⊙﹏⊙∥"}):403==e.response.status?S["Message"].error({message:"权限不足,请联系管理员!"}):S["Message"].error({message:"未知错误!"}),Promise.resolve(e)}));var E=A.a;n("8842");o["a"].use(w.a),E.defaults.headers.post["Content-Type"]="application/json",E.defaults.timeout=6e4,o["a"].prototype.$axios=E,o["a"].config.productionTip=!1,o["a"].prototype.Conf=n("43d4"),new o["a"]({router:p,store:g,render:function(e){return e(l)}}).$mount("#app")},"85ec":function(e,t,n){}});
//# sourceMappingURL=app.e8a4570f.js.map