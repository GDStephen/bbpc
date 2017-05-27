/**
 * Created by xiaozhao on 2017/4/25.
 *
 * 工具类服务，一些常用的工具方法集合
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
    var utilService = {};
    root.utilService = utilService;
    factory(utilService);

}((typeof window === 'object' && window) || this, function(utilService) {
    'use strict';
    /**
     * 获取当前系统的协议（http或者https）
     * @returns {string}
     */
    utilService.bashPath = function() {
        return window.location.protocol + "//" + window.location.host;
    };
    /**
     * 设置Cookie
     */
    utilService.setCookie = function(cname, cvalue) {
        document.cookie = cname + "=" + cvalue;
    };


    /**
     * 获取Cookie
     */
    utilService.getCookie = function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
        }
        return "";
    };
    /**
     * 获取浏览器
     */
    utilService.getBrowser = function() {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1;
        //判断是否Opera浏览器
        if (isOpera) {
            return "Opera"
        }
        //判断是否Firefox浏览器
        if (userAgent.indexOf("Firefox") > -1) {
            return "FF";
        }
        //判断是否Chrome浏览器
        if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        }
        //判断是否Safari浏览器
        if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        }
        //判断是否IE浏览器
        if (userAgent.indexOf("compatible") > -1 || userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
            return "IE";
        }
    };
    /**
     * 判断字符串中是否有汉字
     */
    utilService.cal = function(str) {
        var re = /[\u4E00-\u9FA5]/g; //测试中文字符的正则
        if (re.test(str)) //使用正则判断是否存在中文
            return str.match(re).length; //返回中文的个数
        else
            return 0;
    };
    /**
     * 判断当前执行环境
     * 这里存疑，如果能通过API检测就应该
     * 放在这里，否则就应该放在配置文件中
     */
    utilService.getRunEnv = function() {
        if (typeof(global) === 'undefined') {
            return 'BrowserApp';
        } else {
            return 'DesktopApp';
        }
    };
    /**
     * 作为一个工具类 Des解密
     * @param {*} ciphertext 
     * @param {*} key 
     */
    utilService.decryptByDES =  function(ciphertext, key) {
        var keyHex = CryptoJS.enc.Utf8.parse(key);
        var decrypted = CryptoJS.DES.decrypt({
            ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
        }, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }




}));