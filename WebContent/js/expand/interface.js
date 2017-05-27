//接口类，用来创建接口
var Interface = function(name,methods){
    this.name = name;
    this.methods = [];
    for(var i=0;i<methods.length;i++){
        if(typeof methods[i] != 'string'){
            throw new Error('Interface constructor expects method names to be passes in as a string');
        }
        this.methods.push(methods[i]);
    }
}

//判断是否实现
Interface.prototype.ensureImplements = function(objs){
    for(var i=0;i<objs.length;i++){
        var obj = objs[i];
        for(var j=0;j<this.methods.length;j++){
            var method = this.methods[j];
            
            if(!obj[method] || typeof obj[method] != 'function'){
                throw new Error('Function Interface.ensureImplements:implements interface ' + this.name + ',obj.method ' + method + ' was not found in ' + obj );
            }
        }
    }
}

var extendObject = function() {};

//定义extend方法
extendObject.extend = function(destination, source) {
    for (property in source) {
        console.log('Object.extend = function(destination, source): ' + property);
        destination[property] = source[property];
    }
    return destination;
}

extendObject.prototype.extend = function(object) { 
    console.log('Object.prototype.extend = function(object)');
    return extendObject.extend.apply(this, [this, object]); 
}