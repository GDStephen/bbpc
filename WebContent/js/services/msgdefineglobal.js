(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);

    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    }

    // Browser globals
    var MDService = {};
    root.MDService = MDService;
    factory(MDService);
}((typeof window === 'object' && window) || this, function (msgdefservice) {
    function GetPubObj(dataObj) {
        return {
            MsgType: this.MsgType,
            data: dataObj
        }
    }
     /**
     * 登陆二维码
     * 发送的消息的对象
     * 都应该是这种结构 msgObj = {msgtype:msgtype,data:data}
     * msgtype是子消息类型：如LoginQRcode100（程序可以选择使用或者不使用）
     * data是需要传递的数据结构，即需要接收消息的的模块需要的参数
     * 可以在每个子消息或者主消息上面加上data的参数注释
     */
    msgdefservice.login = {
        name: 'login',
        //获取二维码，附加参数为空
        LoginGetQrcode: 'OnLoginqrCodeSuccuss',
        //有附加参数data，类型为解密之后用户真实姓名realname
        LoginQRcode100: 'OnLoginMessage100',
        //有附加参数data，类型为{username:name,pwd:pwd}
        LoginQRcode101: 'OnLoginMessage101',
        //附加参数data暂时为{}
        LoginQRcode900: 'OnLoginMessage900'
    };

     /**
     * 网络状态变化
     * 发送的消息的对象
     */
    msgdefservice.netStatus = {
        name: 'netStatus',
        // 连上网络
        OnLine: {
            msgtype: 'OnLine',
            data: true,
        },
        // 断开网络
        OffLine: {
            msgtype: 'OffLine',
            data: false,
        },
    };

}));
