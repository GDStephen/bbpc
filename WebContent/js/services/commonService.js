/**
 * Created by xiaozhao on 2017/4/25.
 *
 * 常用的一些帮助方法
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
    var commonService = {};
    root.commonService = commonService;
    factory(commonService);

}(( typeof window === 'object' && window ) || this, function (commonService) {
    'use strict';

    /**
     * 字符串转表情HTML
     * @param message
     * @returns {*}
     */
    var getStringForExpression = function (message) {
        //var expressionArray =  message.match(/\[([\u4e00-\u9fa5]{0,4}|ok)\]/g);
        var re1 = '(\\[.*?\\])';
        re1 = new RegExp(re1, ["g"]);
        //var expressionArray =  message.match(/\[([\u4e00-\u9fa5]{0,4}|ok)\]/g);
        var expressionArray = message.match(re1);
        if (expressionArray != null) expressionArray.sort();
        else return message;
        var re = [this[0]];
        for (var i = 1; i < expressionArray.length + 1; i++) {
            if (expressionArray[i - 1] !== re[re.length - 1]) {
                re.push(expressionArray[i - 1]);
                var html = BBExpression.getExHtml(expressionArray[i - 1]);
                if (html == "") {
                    continue;
                }
                //var re = new RegExp(expressionArray[i],"gim"); //注意，反斜杠需要转义
                var faceName = eval("/\\[" + expressionArray[i - 1].split("[")[1].split("]")[0] + "\\]/g");
                message = message.replace(faceName, html);
            }
        }
        return message;
    };

    /**
     * 根据jid查找某个人的详细信息
     * @param jid 被查找人的jid
     * @returns {*}
     */
    var getUserInfoByJid = function (jid, callBack) {
        /*    var contact = contactManageService.getContactById(jid);
         if (contact) {
         return contact;
         } else {
         var memberInfo = groupManageService.getUserInfoFromGroup(jid);
         if (memberInfo) {
         return memberInfo;
         } else {
         var userInfoObj = {};
         userInfoObj.jid = jid;
         userInfoObj.avatar = 'imgs/nohead.gif';
         userInfoObj.name = jid;
         userInfoObj.type = 'chat';
         return userInfoObj;
         }
         }*/

        addressbookService.GetInfoBatch([jid], function (strTypeFlag, strGetFlag, UseInfoMap, UseMapErr) {
            if (callBack) {
                if (strTypeFlag === 'end') {
                    callBack(UseInfoMap.get(jid));
                }
            }

        });
    };

    /**
     * 获取时间
     * @returns {string} 格式如：13:10
     */
    function getTime() {
        var now = new Date();
        var hour = now.getHours();
        if (hour < 10) {
            hour = "0" + hour;
        }
        var minute = now.getMinutes();
        if (minute < 10) {
            minute = "0" + minute;
        }
        return hour + ":" + minute;
    }

    /**
     * 格式化时间表达式
     * @param msgTime
     * @returns {string}
     */
    var formatMsgTime = function (msgTime) {
        var hour = parseInt(msgTime.split("T")[1].substr(0, 2), 10) + 8;
        if (hour > 23) {
            hour = hour - 24;
        } else if (hour < 10) {
            hour = "0" + hour;
        }
        return hour + ":" + msgTime.split("T")[1].substr(3, 2);
    };

    function getTimestamp(msgTime) {
        //"2017-05-25T07:04:22.409Z"
        var ymdStringArr = msgTime.split("T")[0].split('-');
        var hmsString = msgTime.split("T")[1];
        var year = parseInt(ymdStringArr[0]),
            month = parseInt(ymdStringArr[1]),
            day = parseInt(ymdStringArr[2]);
        var hour = parseInt(hmsString.substr(0, 2), 10) + 8;
        if (hour > 23) {
            hour = hour - 24;
        }
        var min = parseInt(hmsString.substr(3, 2), 10);
        var sec = parseInt(hmsString.substr(6, 2), 10);
        var miSec = parseInt(hmsString.substr(9, 3), 10);
        return new Date(year, month, day, hour, min, sec, miSec).getTime();

    }


    /** ------------------------------------------暴露接口 ------------------------------------------*/


    //获取当前时间，格式如：13：45
    commonService.getTime = getTime;

    //把消息字符串的表情符号转换为html表情
    commonService.getStringForExpression = getStringForExpression;

    //根据jid查找某个人的详细信息
    commonService.getUserInfoByJid = getUserInfoByJid;

    //格式化时间戳
    commonService.formatMsgTime = formatMsgTime;

    commonService.getTimestamp = getTimestamp;
}));