import axios from 'axios';
import router from './router';
import { Message } from 'element-ui'



// http request 拦截器
axios.interceptors.request.use(
    config => {
        console.log("localStorage.token", localStorage.Authorization)
        if (localStorage.Authorization) { //判断token是否存在
            console.log('config.headers', config.headers)
            config.headers.Authorization = localStorage.Authorization;  //将token设置成请求头
        }
        console.log('request is', config)
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);

// http response 拦截器
axios.interceptors.response.use(
    response => {
        if (response.data.errno === 999) {
            console.log("token过期");
            router.replace('/login');
        }
        if (response.data.errno === 998) {
            Message.error({ message: '该用户已经存在' });
            router.push('/login');
        }
        if (response.data.errno === 997) {
            Message.error({ message: '登录密码错误' });
            return router.push('/login');
        }
        return response;
    },
    error => {
        console.log('response', error)
        if (error.response.status == 504 || error.response.status == 404) {
            Message.error({ message: '服务器被吃了⊙﹏⊙∥' });
        } else if (error.response.status == 403) {
            Message.error({ message: '权限不足,请联系管理员!' });
        } else {
            Message.error({ message: '未知错误!' });
        }
        return Promise.resolve(error);
    }
);
export default axios;
