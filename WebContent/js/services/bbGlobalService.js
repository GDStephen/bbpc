/**
 * Created by shuren on 2017/5/12
 *
 * 全局变量服务
 */
( function ( root,factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    }
    // Browser globals
    var globalService = {};
    root.globalService = globalService;
    factory(globalService);
}((typeof window === ' boject ' && window) || this,function (globalService) {
    'use strict';
    // 封闭式的内部全局对象
    var _bbglobal={};
    /**
     * @param {*} key 想要获取的键名
     * 可以获取的信息
     * * {
     *  jid: 标识
     *  token: 意义不详
     *  loginAvatar: 用户头像
     *  loginName: 用户名
     *  username: jid的值
     *  pwd: 密码
     *  chatListArray: 最近联系人窗口序列数组
     *  comp: 意义不详
     * }
     */
    // 获取信息接口
    function GetUserInfo(key) {
        return _bbglobal[key];
    }
    // 设置信息接口
    function SetUserInfo(key,value){
        _bbglobal[key]=value;
    }
    /** -----------------------   暴露接口----------------*/
    globalService.SetUserInfo = SetUserInfo;
    globalService.GetUserInfo = GetUserInfo;
}));