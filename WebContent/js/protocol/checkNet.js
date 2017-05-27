/**
 * Created by guoda on 2017/5/22.
 *
 * 检测网络环境
 * 可以通过 online 和 offline 事件来侦听是否断网，
 * 但是这个在 IE 和 Firefox 中，并非断网了就是真的断网了。
 * （如火狐中在选择 菜单>>文件>>脱机工作才会触发 online 和 offline 事件）
 * 因此在IE和Firefox上使用Ajax轮询检查网络是否断了(依赖文件onLine.js)，实例如下：
 * var BBCheckNet = onlinenetwork({
 *     "time":1000,
 *     "url":"http://www.baidu.com"
 * });
 * 
 * bbCheckNet.onLineHandler(function() {
 *     _isConnected = true;
 *     _listener.forEach(func => func(true));
 * });
 * 
 * bbCheckNet.offLineHandler(function() {
 *     _isConnected = false;
 *     _listener.forEach(func => func(false));
 * });
 * 
 * 其他浏览器上使用 online 和offline事件 侦听网络。实例如下：
 * function updateOnlineStatus(event) {
 *     _isConnected = navigator.onLine;
 *     _listener.forEach(func => func(_isConnected));
 * }
 * window.addEventListener('online',  updateOnlineStatus);
 * window.addEventListener('offline', updateOnlineStatus);
 * 
 * 逻辑层使用方法： 
 * BBCheckNet.addListener(netType => {
 *   var isConnected = netType;
 * });
 * 或者（上层使用方法）：
 * var msgDef = MDService.netStatus;
 * subMsg= PubSub.subscribe(msgDef.name, function(msgid, msgObj) {
 *   var isConnected = (msgObj === msgDef.OnLine); //if offLine: msgObj === msgDef.OffLine
 * });
 */

(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);

    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    }

    // Browser globals
    // var BBCheckNet = onlinenetwork({
    //     "time":1000,
    //     "url":"http://www.baidu.com"
    // });

    var BBCheckNet = {};
    root.BBCheckNet = BBCheckNet;
    factory(BBCheckNet);
}((typeof window === 'object' && window) || this, function(bbCheckNet) {
    'use strict';

    var _listener = [];
    var _isConnected = navigator.onLine;

    // bbCheckNet.onLineHandler(function() {
    //     _isConnected = true;
    //     _listener.forEach(func => func(true));
    // });

    // bbCheckNet.offLineHandler(function() {
    //     _isConnected = false;
    //     _listener.forEach(func => func(false));
    // });

    bbCheckNet.addListener = function(func) {
        _listener.push(func);
    };

    bbCheckNet.deleteListener = function(func) {
        _listener.remove(func);
    };

    bbCheckNet.isConnected = function() { return _isConnected; };

    function updateOnlineStatus(event) {
        _isConnected = navigator.onLine;
        _listener.forEach(func => func(_isConnected));
        var msgDef = MDService.netStatus;
        var msgObj = _isConnected ? msgDef.OnLine : msgDef.OffLine;
        PubSub.publish(msgDef.name, msgObj);
    }
    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return bbCheckNet;
}));