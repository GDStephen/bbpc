/**
 * Created by xiaozhao on 2017/4/24.
 *
 * 消息管理服务:
 *      收/发消息
 *      收/发文件
 *      消息回执
 *      部分工具方法暴露
 */
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
    var messageManageService = {};
    root.messageManageService = messageManageService;
    factory(messageManageService);

}(( typeof window === 'object' && window ) || this, function (messageManageService) {
    'use strict';

    //------------------------------------------变量声明区-----------------------------------------------------------------
    /**
     * 保存对回调函数的引用，这个回调是页面传递过来的接受消息回调函数
     * @type {函数引用}
     * @private 私有
     */
    var _receiveMessageListener = null;
    /**
     * 消息回执字典
     * @type {{}}
     * @private
     */
    var _ackDictionary = {};

    //存储没有成功发送的消息
    var _tempMessageDictionary={};

    /**
     * 网络状态是否可用
     * @type {boolean}
     * @private
     */
    var _isConnectionAvailable= true;

    /**
     * 消息回执监听函数
     * @type {null}
     * @private
     */
    var _ackChangeListener = null;

    //------------------------------------------接口暴露区-----------------------------------------------------------------
    /**
     *
     * 发送聊天文本消息
     *
     * @param param
     *  {
     *      message     {string}        聊天对话框的内容
     *      type        {string}        是否为群聊:chat或者groupchat
     *      toJid       {string}        聊天对象的jid
     *      fromJid     {string}        本人的jid
     *      atMembers   {Map}           群聊中的at的集合
     *
     *  }
     * @param callBack  回调函数
     */
    messageManageService.sendMessage = function (param, callBack) {
        if(_isConnectionAvailable===false){
            console.log('网络异常，发送服务停止执行');
            callBack({
                netError:true
            });
            return;
        }

        //调用BBXmpp的发送普通文本接口
        BBXmpp.sendText(param.toJid, param.fromJid, param.type, param.uuid, param.message, param.atMembers);
        _tempMessageDictionary[param.uuid]= param;
        //页面的回调
        if (callBack)
            callBack();
    };

    /**
     *  发送图片或者文件
     * @param param   发送文件必要的参数
     *  {
     *      toJid       {string}        聊天对象的jid
     *      subject     {string}        image或者document
     *      fromJid     {string}        本人的jid
     *      type        {string}        是否为群聊:chat或者groupchat
     *      uuid        {string}        文件的唯一码
     *  }
     * @param file    发送的文件数组，但是目前只是单文件功能，发送第一个文件
     * @param successFunc  发送文件成功的回调
     *      回调函数中有参数：{
     *                            isFail       {boolean}        是否失败
                                  data         {object}         扩展和修改之后的param
     *                      }
     * @param errorFunc    发送文件失败的回调
     * @param progressFunc 发送文件过程中的回调
     * @param startFunc 发送文件开始的回调
     */
    messageManageService.sendFile = function (param, file, successFunc, errorFunc, progressFunc,startFunc) {
        var url = config.url.baseUrl;
        var files=[file];
        var isImage = param.subject==='image';
        if(isImage)
            url += '/imageUpload';
        else
            url += '/documentUpload';

        //首先执行ajax上传文件
        new AJAXRequest().upload(url,files, compelte, error, progress, start);

        /**------------------------------------------------回调函数子函数  BEGIN------------------------------------------------*/
        //调用上传服务完毕，服务成功响应的代理函数
        function compelte(data) {
            var response = JSON.parse(data);
            var result={
                isFail: true,
                msg:'',
                data:{}
            };
            var dataForCallback={};
            //如果文件上传成功，则发送消息
            if (response.serverCode + '' === "1") {
                var URL = window.URL || window.webkitURL;
                var imgURL = URL.createObjectURL(file);
                //发送图片
                if (isImage) {
                    dataForCallback.message = response.imgBase64;
                    dataForCallback.link = response.key + "?name=" + param.uuid + ".jpg";
                    dataForCallback.fileUrl = imgURL;
                    BBXmpp.sendImage(param.toJid, param.fromJid, param.type, param.uuid, response.imgBase64, response.key);
                }
                else {//发送文件
                    var fileName = file.name;
                    var fileSize = file.size;
                    var fileType = file.type;
                    var encodeFileName = encodeURI(fileName);
                    dataForCallback.message = fileName;
                    dataForCallback.link = response.key + "?name=" + encodeFileName;
                    dataForCallback.fileUrl = imgURL;
                    dataForCallback.fileType = fileType;
                    dataForCallback.size = getFileSize(fileSize);
                    BBXmpp.sendDocument(param.toJid, param.fromJid, param.type, param.uuid, fileName, fileSize, fileType, response.key);
                }
                if (successFunc){
                    result.isFail = false;
                    result.data=dataForCallback;
                    successFunc(result);
                }

            }
            else {//如果文件上传失败，执行回调，告诉页面上传失败
                if (successFunc)
                    successFunc(result);
                return;
            }
        }

        //服务调用出错的代理函数
        function error() {
            if(errorFunc){
                var result ={

                };
                errorFunc(result);
            }
        }

        //服务调用进度的代理函数
        function progress() {
            if(progressFunc){
                var result ={

                };
                progressFunc(result);
            }
        }

        //服务调用开始的代理函数
        function start() {
            if(startFunc){
                var result ={

                };
                startFunc(result);
            }
        }

        /**------------------------------------------------回调函数子函数  END--------------------------------------------------- */
    };


    /**
     * 对要发送的消息做转换处理，比如过滤特殊字符，表情处理
     * @param （string）originalMessage  从聊天对话框中获取的原始字符串
     * @returns
     *  {
     *      message（string) 供界面使用的message
     *      msgForSending(string) 发送给服务端的message
     *  }
     */
    messageManageService.formatChatContent = function (originalMessage) {
        originalMessage = dealSendInput(originalMessage);
        originalMessage = originalMessage.replace(/(^\s*)|(\s*$)/g, '');
        originalMessage = filterPasteText(originalMessage);
        if (CheckUrl(originalMessage) && originalMessage.indexOf('<img') == -1) {
            originalMessage = CheckUrl(originalMessage);
        }
        var msgForSending = dealExpression(originalMessage);
        msgForSending = dealChar(msgForSending);
        return {
            message: originalMessage,
            msgForSending: msgForSending
        };
    };

    /**
     * 接收到推送的消息之后，这里注册回调函数
     * 这里把参数回调函数赋值给私有变量_receiveMessageListener
     *
     * @param callBack {function}   页面注册的回调函数
     */
    messageManageService.onReceiveMessage = function (callBack) {
        _receiveMessageListener = callBack;
    };


    /**
     * 页面注册消息回执服务，当有服务有回执响应或者检查到定时器检查到超时，触发回调
     * 保存页面传递的回调引用
     * 回调的触发在本文件的私有方法onAckReturn中
     * @param callBack 页面传递的回调方法
     */
    messageManageService.onAckflagChange = function(callBack) {
        _ackChangeListener = callBack;
    };

    //对字符串进行处理
    messageManageService.filterPasteText = filterPasteText;

    //对字符串进行处理
    messageManageService.dealSendInput = dealSendInput;

    


    //------------------------------------------初始化执行区-----------------------------------------------------------------

    function bbxmppCallback() {
        var messageType = arguments[0];
        switch (messageType) {
            case BBXmpp.Listeners.CHAT_MESSAGE: {
                var data = arguments[1];
                if (_receiveMessageListener) {
                    _receiveMessageListener(data);
                }
                break;
            }
            case BBXmpp.Listeners.ADD_ACK: {
                addAckToDictionary(arguments[1], arguments[2], arguments[3]);
                break;
            }
            case BBXmpp.Listeners.REMOVE_ACK: {
                onAckReturn(arguments[1]);
                break;
            }
        }
    }

    /**
     * 登录成功之后注册BBXmpp的监听函数，当接收到新消息之后执行
     */
    var _token = PubSub.subscribe('LoginStateChange', function (msgid, msgData) {
        BBXmpp.addListener(bbxmppCallback);

        //启动消息回执队列的定时检查
        setInterval(function () {
            checkAckMap();
        },config.msgTimeOut * 1000);
    });


    //------------------------------------------私有方法区-----------------------------------------------------------------


    /**
     *
     * 调用xmpp协议的发送消息方法之后，会调用这个方法，把发送消息对应的ack存储起来
     * @param jid
     * @param uuid
     * @param ack
     */
    var addAckToDictionary = function (jid, uuid, ack) {
        var ackObj={
            jid:jid,
            uuid:uuid,
            ack:ack,
            date:+ new Date()
        };
        _ackDictionary[ack]=ackObj;
    };

    /**
     * xmpp收到消息回执之后调用此方法
     * @param ack
     */
    function onAckReturn(ack) {
        var ackObj = _ackDictionary[ack];
        if(!ackObj) return;
        delete _ackDictionary[ack];
        delete _tempMessageDictionary[ackObj.uuid];
        var arg=[{
            jid:ackObj.jid,
            uuid:ackObj.uuid,
            ackflag:1
        }];

        if(_ackChangeListener){
            _ackChangeListener(arg);
        }
    }

    /**
     * 每20秒刷新一次ackMap，判断是否有超时，超时回置状态
     */
    var checkAckMap = function () {

        var now = new Date().getTime();
        var timeOutArray=[];
        for(var p in _ackDictionary){
            if(_ackDictionary.hasOwnProperty(p)){
                var ackObj = _ackDictionary[p];
                if(now - ackObj.date > config.msgTimeOut * 1000){
                    timeOutArray.push({
                        jid:ackObj.jid,
                        uuid:ackObj.uuid,
                        ackflag:2
                    });
                    delete  _ackDictionary[p];
                    delete _tempMessageDictionary[ackObj.uuid];
                }
            }
        }
        console.log('定时器检查发送消息超时，检测到超时消息数：'+timeOutArray.length);
        if(_ackChangeListener){
            _ackChangeListener(timeOutArray);
        }
    };

    /**
     *  网络连接成功广播之后的代理方法，再次发送回执集合中的消息
     */
    function onNetConnectedDelegate() {
        console.log('再次发送未成功的消息');
        for(var p in _ackDictionary){
            if(_ackDictionary.hasOwnProperty(p)){
                var ackObj = _ackDictionary[p];
                var param =_tempMessageDictionary[ackObj.uuid];
                BBXmpp.sendText(param.toJid, param.fromJid, param.type, param.uuid, param.message, param.atMembers);
                delete  _ackDictionary[p];
            }
        }
    }

    /**
     * 根据文件的大小返回一个可阅读的格式，比如返回10MB或者200KB
     * @param charSize
     * @returns {string}
     */
    function getFileSize(charSize) {
        var size = charSize / 1024;
        if (size > 1024) {
            return (size / 1024).toFixed(2) + "MB";
        } else {
            return size.toFixed(2) + "KB";
        }
    }

    /**
     * 检查聊天内容中的字符串，做过滤处理
     * @param str_url
     * @returns {*}
     * @constructor
     */
    function CheckUrl(str_url) {
        var strRegex = '[A-Z0-9a-z._%+-:]+[A-Za-z0-9.-]+\\.[A-Za-z0-9_%+-/#:?&=]{2,61}';
        //var strRegex ='62})+\.?';
        var re = new RegExp(strRegex, 'g');
        if (str_url.match(re)) {
            var matcharray = str_url.match(re);
            var matcharraylen = matcharray.length;
            for (var i = 0; i < matcharraylen; i++) {
                if (matcharray[i].indexOf('http') == -1) {
                    matcharray[i] = '<a style="color:blue;text-decoration:underline;font-size:14px" target="_blank" href="http://' + matcharray[i] + '">' + matcharray[i] + '</a>';
                } else {
                    matcharray[i] = '<a style="color:blue;text-decoration:underline;font-size:14px" target="_blank" href="' + matcharray[i] + '">' + matcharray[i] + '</a>';
                }
            }
            matcharray[matcharraylen] = '';
            var otherarray = str_url.split(re);
            var result = '';
            for (var j = 0; j < otherarray.length; j++) {
                result += otherarray[j] + matcharray[j]
            }
            return result;
        } else {
            return false;
        }
        //return str_url.match(re);
    }

    /**
     * 粘贴内容过滤
     * @param str
     * @returns {string|XML|*}
     * @constructor
     */
    function filterPasteText(str) {
        var reg = /(<img(?:(?!id|>).)*)(id[\=\"\'\s]+)?([^\"\'\s]*)([\"\']?)([^>]*>)/gi;
        var strMatch = str.match(reg);
        if (strMatch != null) {
            for (var i = 0; i < strMatch.length; i++) {
                if (strMatch[i].indexOf('face') <= -1 || strMatch[i].indexOf('http') > -1) {
                    str = str.replace(strMatch[i], "");
                }
            }
        }

        //str = str.replace(/\r\n|\n|\r/ig, "");
        //remove html body form
        str = str.replace(/<\/?(html|body|form)(?=[\s\/>])[^>]*>/ig, "");
        //remove doctype
        str = str.replace(/<(!DOCTYPE)(\n|.)*?>/ig, "");
        //remove xml tags
        str = str.replace(/<(\/?(\?xml(:\w )?|xml|\w :\w )(?=[\s\/>]))[^>]*>/gi, "");
        //remove head
        str = str.replace(/<head[^>]*>(\n|.)*?<\/head>/ig, "");
        //remove <xxx />
        str = str.replace(/<(script|style|link|title|meta|textarea|option|select|iframe|hr)(\n|.)*?\/>/ig, "");
        //remove empty span
        str = str.replace(/<span[^>]*?><\/span>/ig, "");
        //remove <xxx>...</xxx>
        str = str.replace(/<(head|script|style|textarea|button|select|option|iframe)[^>]*>(\n|.)*?<\/\1>/ig, "");
        //remove table and <a> tag, <img> tag,<input> tag (this can help filter unclosed tag)
        str = str.replace(/<\/?(a|table|tr|td|tbody|thead|th|input|iframe|div|pre|p|span|font|code|o:p|br|h1|h2|h3|h4|ul|li|strong|label|section|em|b|!--|i )[^>]*>/ig, "");
        //remove bad attributes
        do {
            var len = str.length;
            str = str.replace(/(<[a-z][^>]*\s)(?:id|name|language|type|class|style|on\w |\w :\w )=(?:"[^"]*"|\w )\s?/gi, "$1");
        } while (len != str.length);

        return str;

    }

    // 处理输入框的特殊字符
    function dealChar(charContent) {
        if (charContent.indexOf('&nbsp;') > -1) {
            charContent = charContent.replace(/\&nbsp;/g, " ");
        }
        if (charContent.indexOf('&amp;') > -1) {
            charContent = charContent.replace(/\&amp;/g, "&");
        }
        /*if(charContent.indexOf('&amp;quot;')>-1){
         charContent = charContent.replace(/\&amp;quot;/g,'&quot;');
         }
         if(charContent.indexOf('&amp;lt;')>-1){
         charContent = charContent.replace(/\&amp;lt;/g,'&lt;');
         }
         if(charContent.indexOf('&amp;gt;')>-1){
         charContent = charContent.replace(/\&amp;gt;/g,'&gt;');
         }*/
        if (charContent.indexOf('&quot;') > -1) {
            charContent = charContent.replace(/\&quot;/g, '"');
        }
        if (charContent.indexOf('&lt;') > -1) {
            charContent = charContent.replace(/\&lt;/g, '<');
        }
        if (charContent.indexOf('&gt;') > -1) {
            charContent = charContent.replace(/\&gt;/g, '>');
        }
        return charContent;
    }

    // 对字符串做转换处理
    function dealSendInput(strMessage) {
        var expression = 'id="([^"]*)"';
        var strValue = new RegExp(expression, ["g"]);
        var valueArray = strMessage.match(strValue);
        if (valueArray == null) return strMessage;
        for (var i = 0; i < valueArray.length; i++) {
            valueArray[i] = valueArray[i].substring(4, valueArray[i].length - 1);
            var inputVal = inputsMap.get(valueArray[i]);
            var inputName = new RegExp("(<input).*?(id=\"" + valueArray[i] + "\").*?([^>]*>)", ["g"]);
            if (inputVal == undefined) {
                var val = document.getElementById(valueArray[i]).value;
                strMessage = strMessage.replace(inputName, val);
            } else {
                strMessage = strMessage.replace(inputName, inputVal);
            }

        }
        return strMessage;
    }

    //处理聊天内容中的表情
    function dealExpression(strMessage) {
        var expression = '((?:\\/[\\w\\.\\-]+)+)'; // Unix Path 2
        var p = new RegExp(expression, ["g"]);
        var imgArray = strMessage.match(p);
        if (imgArray != null) imgArray.sort();
        else return strMessage;
        var re = [undefined];
        var faceName;
        var expressionName;
        for (var i = 1; i < imgArray.length + 1; i++) {
            // 判断浏览器类型
            var mb = utilService.getBrowser();
            if (mb == 'IE') {
                re.push(imgArray[i - 1]);
                expressionName = BBExpression.getExName(imgArray[i - 1].split("/")[1]);
                faceName = "<img width=\"24\" height=\"24\" src=\"face" + imgArray[i - 1] + "\">";
            } else if (mb == 'FF') {
                re.push(imgArray[i - 1]);
                expressionName = BBExpression.getExName(imgArray[i - 1].split("/")[1]);
                faceName = "<img src=\"face" + imgArray[i - 1] + "\" height=\"24px\" width=\"24px\">";
            } else {
                if (imgArray[i - 1] !== re[re.length - 1]) {
                    re.push(imgArray[i - 1]);
                    expressionName = BBExpression.getExName(imgArray[i - 1].split("/")[1]);
                    faceName = new RegExp("<img src=\"face" + imgArray[i - 1] + "\" width=\"24px\" height=\"24px\">", ["g"]);
                }
            }
            strMessage = strMessage.replace(faceName, expressionName);
        }
        return strMessage;
    }
}));