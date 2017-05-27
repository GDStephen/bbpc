angular.module('path', [])
    .factory('pathService',[ function() {
    
    var os = require('os');
    var path = require('path');
    var fs = require("fs");
    function BBHomeDir() {
        if ('win32' == os.platform())
        {
            return path.join(os.homedir(), "AppData/Roaming/BangBng/");
        }
        else if ('darwin' == os.platform())
        {
            return path.join(os.homedir(), "Library/Caches/com.BangBang.MAC/");//"~/Library/Caches/com.BangBang.MAC/";//
        }
    };
    var BBHomeDir = BBHomeDir();
    surePath(BBHomeDir);

    //登录前使用临时头像目录，登录后更新到UserDir下
    var avatarPath = path.join(BBHomeDir, "tmpAvatar/");
    surePath(avatarPath);

    var UserDir = "";
    
    
    function setBBDir (username) {
        username = username.split('@')[0];
        UserDir = path.join(BBHomeDir, username);
        surePath(UserDir);
        avatarPath = path.join(UserDir, "avatar/");
        surePath(avatarPath);

    };

    function getBBHomeDir(){
        return BBHomeDir;
    }
    function getUserDir(){
        return UserDir;
    }
    function getAvatarPath(){
        return avatarPath;
    }
    function surePath(filePath){
        console.log("调用 surePath，filePath="+filePath);
        var fs=require("fs");

        try{
            fs.accessSync(filePath,fs.F_OK);
        }catch(e){
            //目录不存在
            try{
                //创建目录
                fs.mkdirSync(filePath);
            }catch(e){
                console.log("创建目录失败,目录="+filePath+"   错误原因："+e);
                return false;
            }
            return false;
        }
        console.log("调用 surePath，filePath="+filePath+"存在");
        return true;
    }

    return {
            //获取政企小应用列表
            getBBHomeDir: getBBHomeDir,
            getUserDir:getUserDir,
            getAvatarPath:getAvatarPath,
            setBBDir:setBBDir
        };
}]);
