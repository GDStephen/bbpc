
// 用于存放UI的工具方法 使用工具方式时，需要在控制器里添加依赖uiTolls 
(function(angular){
  'use strict';
  var app = angular.module('toolsService',[]);
  app.service('uiTolls',[function(){
    // 通过this添加工具方法.
    this.test=function(demo){
        console.log(demo);
    }
  }]);
})(angular);
