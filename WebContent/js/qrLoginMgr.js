/**
 * zhengwei 2017.04.25 添加注释 
 * 该模块主要处理
 * 二维码登录相关流程
 */

(function(root, factory) {
    /**
     * zhengwei 2017.04.25
     * 这中封装方法学习自pubsub
     * 好处是封装不依赖第三方库
     * 在普通js中使用require来引用
     * 在浏览器中通过qrLoginMgr来直接
     * 访问
     */
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);

    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    }

    // Browser globals
    var qrLoginMgr = {};
    root.qrLoginMgr = qrLoginMgr;
    factory(qrLoginMgr);
}((typeof window === 'object' && window) || this, function(qrLoginMgr) {
    /**
     * zhengwei 2017.04.25
     * 该变量存储二维码
     * 相关信息，有多个模块需要使用它
     */
    qrLoginMgr.qr = {};

    var _comet = null;
   
    /**
     * zhengwei 2017.04.25
     * 处理二维码通信消息回调
     * 具体消息流程还需要补充
     */
    function initIComet() {
        var conf = {
            channel: qrLoginMgr.qr.id,
            sub_url: "https://web.bangcommunity.com/icomet/sub?cname=" + qrLoginMgr.qr.id,
            callback: function(content) {
                try {
                    content = content.replace(/[\r\n]/g, ""); //去掉回车换行
                    var decryptcontent = utilService.decryptByDES(content, qrLoginMgr.qr.key);
                    console.log("JSON=" + decryptcontent);
                    var msg = JSON.parse(decryptcontent);
                    var MsgObj = {};
                    //MsgObj.data = msg;
                    switch (msg.cmd) {
                        case 100:
                            {
                                sessionStorage.setItem("loginRealName", msg.data.realname);
                                sessionStorage.setItem("loginAvatar", msg.data.loginAvatar);
                                globalService.SetUserInfo('loginAvatar',msg.data.avatar);
                                globalService.SetUserInfo('loginName',msg.data.realname);
                                globalService.SetUserInfo('token',msg.data.apptoken);
                                sessionStorage.setItem("token", msg.data.apptoken);
                                MsgObj.msgtype = MDService.login.LoginQRcode100;
                                MsgObj.data = msg.data.realname;
                                PubSub.publish(MDService.login.name, MsgObj);
                                break;
                            }
                        case 101:
                            {
                                sessionStorage.setItem("content", content);
                                globalService.SetUserInfo('username',msg.data.username);
                                globalService.SetUserInfo('pwd',msg.data.pwd);
                                globalService.SetUserInfo('chatListArray',msg.data.jsonArray);

                                globalService.SetUserInfo('comp',msg.jsonArray);
                                var jid = msg.data.username;
                                if(msg.data.username.indexOf('.com')>-1){
                                    var jid = msg.data.username.slice(0,msg.data.username.indexOf('/'));
                                }
                                globalService.SetUserInfo('jid',jid);
                                
                                //connection.connect(msg.data.username, msg.data.pwd, BBWeb.onConnect);
                                var cvalue = localStorage.getItem("cjid");
                                localStorage.setItem("cjid", msg.data.username);
                                MsgObj.msgtype = MDService.login.LoginQRcode101;
                                MsgObj.data = {username:msg.data.username,pwd:msg.data.pwd};
                                PubSub.publish(MDService.login.name, MsgObj);
                                _comet.stop();
                                break;
                            }
                        case 900:
                            {
                                //提示用户：系统更新。将在1分种后重启。
                                MsgObj.msgtype = MDService.login.LoginQRcode900;
                                MsgObj.data = {};
                                PubSub.publish(MDService.login.name, MsgObj);
                                break;
                            }
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        };
        _comet = new iComet(conf);
        var refresh = false;
    }

    //停止监听Comet。
    qrLoginMgr.stop = function() {
        if (_comet && _comet.stopped === false) {
            _comet.stop();
        }
    }

    /**
     * zhengwei 2017.04.25
     * 对外的登录二维码登录接口
     * 我认为这个接口和二维码变量
     * 才应该是接口唯一应该被调用的接口
     */
    qrLoginMgr.Login = function() {
        //修改为使用BBAjax访问协议 guoda 2017.04.27

        /**
         * 获取二维码信息
         */
        //郭达注意下能不能加cookie
        var ajax = new AJAXRequest({
            url: "https://web.bangcommunity.com/qrCode",
            timeout: (5 * 1000),
            oncomplete: function(xhr) {
                var x = xhr.responseText;
                qrLoginMgr.qr.key = JSON.parse(x).data.desKey;
                qrLoginMgr.qr.id = JSON.parse(x).data.sessionid;
                
                var MsgObj = {};
                MsgObj.data = {};
                MsgObj.msgtype = MDService.login.LoginGetQrcode;
                PubSub.publish(MDService.login.name, MsgObj);
                initIComet();
            },
            ontimeout:  function(ev) {
                // 超时重连
                ajax.get();
            },
            onexception: function(ev) {
                // 失败重连
                ajax.get();
            }
        });
        ajax.get();
    }
}));