import moment from 'moment';
const defaultExpiresTime = '9999-12-31 23:59:59';
/**
 *
 * @param {String} key
 * @returns 判断输入的key是否是字符串,否则进行转换.
 */
function _checkAndWrapKeyAsString(key) {
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }
    return key;
}

/**
 * @description 判断localStorage中值的类型
 * @param {*} item
 */
function _isCacheItem(item) {
    if (typeof item !== 'object') {
        return false;
    }
    if (item) {
        if (item.value && item.createTime && item.expiresTime) {
            return true;
        }
    }
    return false;
}

//序列化
const defaultSerializer = {
    serialize: function(item) {
        return JSON.stringify(item);
    },
    deserialize: function(data) {
        return data && JSON.parse(data);
    },
};

/**
 * @description 构造函数
 * @param {*} value 值
 * @param {*} expires 过期时间
 */
function CacheItemConstructor(value, expires) {
    //序列话value
    let val = defaultSerializer.serialize(value);
    //获取当前时间,创建时间
    const c = new Date(); //当前时间戳
    let exp;
    if (typeof expires === 'number') {
        exp = expires === Infinity ? new Date(defaultExpiresTime) : new Date(c.getTime() + expires * 1000 * 60);
    } else if (typeof expires === 'string') {
        let times = new Date(expires).getTime();
        if (isNaN(times)) {
            throw new Error('expires格式错误,Number或者String[2020-10-10 10:10:10]');
        } else {
            exp = times;
        }
    }

    this.value = val;
    this.expiresTime = moment(exp).format('YYYY-MM-DD HH:mm:ss');
    this.createTime = moment(c).format('YYYY-MM-DD HH:mm:ss');
}

class cacheStorage {
    constructor(props) {
        this.props = props || {};
        this.source = this.props.source || window.localStorage;
        this.initRun();
    }
    /**
     * @description 初始化执行,判断是否过期
     */
    initRun() {
        const timeNow = new Date().getTime();
        let data = this.source;
        Object.entries(data).forEach(item => {
            let [key, val] = item;
            let cacheItem = val;
            try {
                cacheItem = defaultSerializer.deserialize(cacheItem);
            } catch (e) {
                // console.error(e);
            }
            if (_isCacheItem(cacheItem)) {
                const exp = new Date(cacheItem.expiresTime).getTime();
                if (timeNow > exp) {
                    console.log(`超时删除 {${key}:${cacheItem.value}}`);
                    this.remove(key);
                }
            }
        });
    }
    /**
     * @description 在localStorage中 存储值
     * @param {String} key key
     * @param {*} val value
     * @param {*} exp 过期时间，Number=>分钟,String=>时间
     */
    set(key, val, exp = defaultExpiresTime) {
        let source = this.source;
        key = _checkAndWrapKeyAsString(key);
        if (val === undefined) {
            return this.remove(key);
        }
        let cacheItem = new CacheItemConstructor(val, exp);
        try {
            source[key] = defaultSerializer.serialize(cacheItem);
        } catch (e) {
            console.error(e);
        }
        return val;
    }

    /**
     * @description
     * @param {String} 	key 键
     *
     */
    get(key) {
        const source = this.source;
        const timeNow = new Date().getTime();
        let value;
        key = _checkAndWrapKeyAsString(key);
        var cacheItem = null;
        try {
            cacheItem = defaultSerializer.deserialize(source[key]);
        } catch (e) {
            return null;
        }
        if (_isCacheItem(cacheItem)) {
            let exp = new Date(cacheItem.expiresTime).getTime();
            if (timeNow < exp) {
                value = defaultSerializer.deserialize(cacheItem.value);
            } else {
                this.remove(key);
            }
        }
        return value;
    }

    /**
     *
     * @description 删除localStorage 的key
     * @param {String} key
     */
    remove(key) {
        key = _checkAndWrapKeyAsString(key);
        const data = this.source;
        let value = data[key];
        delete data[key];
        return value;
    }

    clear() {
        const source = this.source;
        source.clear();
    }
}
export default cacheStorage;
