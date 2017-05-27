/**
 * Created by lileilei
 * 头像服务
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
    var avatarService = {};
    root.avatarService = avatarService;
    factory(avatarService);

}(( typeof window === 'object' && window ) || this, function (avatarService) {
    'use strict';

    //--------------------------------变量声明区----------------------------------------

    var fs = require("fs");
    var http = require("http");
    var https = require("https");

    /** ------------------------------------------逻辑区 ------------------------------------------*/
    
    function getAvatar(pathObj,callback){
        // 缓存回调
        var _callback = callback;
        var _jid = pathObj.jid;
        // 缓存路径
        var _avatar = pathObj.path;
        var _avatarPath = pathObj.avatarPath;

        

        //web版，返回网络地址 并返回 online 字段
        if(utilService.getRunEnv()=='BrowserApp'){
            if(_avatarPath && _callback){
                _callback({
                    path:_avatarPath,
                    jid:_jid,
                    message:'online',
                    statusCode:'100'
                })
            }else if(_callback){
                _avatarPath = config.url.tfsUrl + pathObj._avatar;
                _callback({
                    path:_avatarPath,
                    jid:_jid,
                    message:'online',
                    statusCode:'100'
                })
            }
            return _avatarPath;
        }

        // 判断有没有18个16位格式的字符串 主要针对群头像验证
        if(_avatar === ''){
            consoel.log('群头像未拼接或未拼接成功');
            getLocalPath(obj)
            if(_callback){
                _callback({
                    path:getLocalPath(pathObj),
                    jid:_jid,
                    statusCode:res.statusCode
                })
            }
            return;
        }
        // 本地路径头
        var avatarPath= pathService.getAvatarPath();
        var localPath = avatarPath + _avatar+".png";
        if(isHasImg(localPath)){
            console.log("找到本地头像:"+localPath);
            return localPath;
        }else{
            console.log("没有找到本地头像");
            var url = config.url.tfsUrl + _avatar;
            https.get(url, function(res){
                // statusCode只有等于200才下载头像。
                if(res.statusCode === 200){
                    var imgData = "";
                    //一定要设置response的编码为binary否则会下载下来的图片打不开
                    res.setEncoding("binary"); 
                    res.on("data", function(chunk){
                        imgData+=chunk;
                    });
                    res.on("end", function(){
                        var savePath = avatarPath+_avatar+".png";
                        // _path = savePath;
                        fs.writeFile(savePath, imgData, "binary", function(err){
                            if(err){
                                console.log(err)
                            }
                            else{
                                console.log("完成写入下载的头像");
                                console.log("savePath="+savePath);
                                //调用缓存的回掉 statusCode==200时
                                if(_callback){
                                    _callback({
                                        path:savePath,
                                        jid:_jid,
                                        statusCode:res.statusCode
                                    })
                                }
                            }
                        })
                    })
                }else{
                    // 下载不成功的回调
                    if(_callback){
                        _callback({
                            path:getLocalPath(pathObj),
                            jid:_jid,
                            statusCode:res.statusCode
                        })
                    }
                }
            });

            // 下载头像前先返回本地默认头像路径
            return getLocalPath(pathObj);
        }
    }
 
    // 获取本地默认头像路径 不传jid返回好友默认头像
    function getLocalPath(obj){
        if(obj.jid && obj.jid.indexOf('@ab-insurance.com') > -1){
            return 'imgs/nohead.gif';
        }else if(obj.jid && obj.jid.indexOf('@circle-muc.ab-insurance.com') > -1){
            return 'imgs/grouphead40.jpg';
        }else{
            return 'imgs/nohead.gif';
        }
    }

    // 判断是否对应路径里面有图片
    function isHasImg(filePath){
        console.log("调用 isHasImg，filePath="+filePath);
        try{
            fs.accessSync(filePath,fs.F_OK);
        }catch(e){
            console.log("调用 isHasImg，filePath="+filePath+"不存在");
            return false;
        }
        console.log("调用 isHasImg，filePath="+filePath+"存在");
        return true;
    }

    

    /** ------------------------------------------暴露接口 ------------------------------------------*/
    // 获取头像地址
    avatarService.getAvatar = getAvatar;
}));