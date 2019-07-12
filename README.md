# localstorage-expires
对localStorage进行了扩展，可以设置超时时间，添加了序列化方法

## 用法
```
yarn add @zhangwj0520/localstorage-expires
import cacheStorage from '@zhangwj0520/localstorage-expires';

const storage = new cacheStorage();


// 获取localstorage中 'user' 的值
storage.get('user');

// 缓存localstorage，默认使用序列化方法为JSON.stringify。
storage.set('user', { name: 'DaBai', phone: '188012345678'});

// 设置时间,可以设置Number,多少秒过期,或者String,例如 2020-10-10 10:10:10
storage.set('user', 'DaBai', 1000);

// 清除localstorage
storage.clear();
```