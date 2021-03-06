/**
 * Created by PrincessofUtopia on 2016/3/22.
 */

var BBExpression = (function() {
    // web端发转手机端
	var exMap = {
        "1.png" : "[笑]",
        "2.png" : "[大笑]",
        "3.png" : "[微笑]",
        "4.png" : "[不开心]",
        "5.png" : "[呆萌]",
        "6.png" : "[花痴]",
        "7.png" : "[害羞]",
        "8.png" : "[闭嘴]",
        "9.png" : "[睡着]",
        "10.png" : "[哈欠]",
        "11.png" : "[吃惊]",
        "12.png" : "[困]",
        "13.png" : "[疯了]",
        "14.png" : "[被批评]",
        "15.png" : "[偷笑]",
        "16.png" : "[无视]",
        "17.png" : "[尴尬]",
        "18.png" : "[打脸]",
        "19.png" : "[努力]",
        "20.png" : "[女哭]",
        "21.png" : "[小哭]",
        "22.png" : "[吃东西]",
        "23.png" : "[狂笑]",
        "24.png" : "[汗]",
        "25.png" : "[鬼脸]",
        "26.png" : "[发火]",
        "27.png" : "[小火]",
        "28.png" : "[泪流成河]",
        "29.png" : "[安慰]",
        "30.png" : "[发呆]",
        "31.png" : "[鄙视]",
        "32.png" : "[飞吻]",
        "33.png" : "[喷人]",
        "34.png" : "[糗大了]",
        "35.png" : "[思考]",
        "36.png" : "[挑逗]",
        "37.png" : "[喝水]",
        "38.png" : "[花心]",
        "39.png" : "[惊悚]",
        "40.png" : "[亮牙]",
        "41.png" : "[抠鼻]",
        "42.png" : "[呕吐]",
        "43.png" : "[撇嘴]",
        "44.png" : "[委屈]",
        "45.png" : "[财迷]",
        "46.png" : "[惊吓]",
        "47.png" : "[阴险]",
        "48.png" : "[再见]",
        "49.png" : "[晕]",
        "50.png" : "[疑问]",
        "51.png" : "[嘘]",
        "52.png" : "[烟]",
        "53.png" : "[敲打]",
        "54.png" : "[口罩]",
        "55.png" : "[左哼哼]",
        "56.png" : "[右哼哼]",
        "57.png" : "[笑哭]",
        "58.png" : "[小瞧]",
        "59.png" : "[潜水]",
        "60.png" : "[衰]",
        "61.png" : "[倒]",
        "62.png" : "[勾引]",
        "63.png" : "[拳头]",
        "64.png" : "[握手]",
        "65.png" : "[耶]",
        "66.png" : "[赞]",
        "67.png" : "[no]",
        "68.png" : "[ok]",
        "69.png" : "[抱拳]",
        "70.png" : "[鼓掌]",
        "71.png" : "[猪头]",
        "72.png" : "[鲜花]",
        "73.png" : "[凋谢]",
        "74.png" : "[心]",
        "75.png" : "[心碎]",
        "76.png" : "[蛋糕]",
        "77.png" : "[雷]",
        "78.png" : "[礼物]",
        "79.png" : "[西瓜]",
        "80.png" : "[药]",
        "81.png" : "[刀]",
        "82.png" : "[茶杯]",
        "83.png" : "[米饭]",
        "84.png" : "[喇叭]",
        "85.png" : "[甲虫]",
        "86.png" : "[红包]",
        "87.png" : "[粑粑]",
        "88.png" : "[羽毛球]",
        "89.png" : "[篮球]",
        "90.png" : "[乒乓球]",
        "91.png" : "[足球]",
        "92.png" : "[嘴唇]"
	};

    // 手机端转web端
	var exMap2 = {
        "[笑]":         '<img src="face/1.png" width="24px" height="24px">',
        "[大笑]":       '<img src="face/2.png" width="24px" height="24px">',
        "[微笑]":       '<img src="face/3.png" width="24px" height="24px">',
        "[不开心]":      '<img src="face/4.png" width="24px" height="24px">',
        "[呆萌]":       '<img src="face/5.png" width="24px" height="24px">',
        "[花痴]":       '<img src="face/6.png" width="24px" height="24px">',
        "[害羞]":       '<img src="face/7.png" width="24px" height="24px">',
        "[闭嘴]":       '<img src="face/8.png" width="24px" height="24px">',
        "[睡着]":       '<img src="face/9.png" width="24px" height="24px">',
        "[哈欠]":      '<img src="face/10.png" width="24px" height="24px">',
        "[吃惊]":      '<img src="face/11.png" width="24px" height="24px">',
        "[困]":        '<img src="face/12.png" width="24px" height="24px">',
        "[疯了]":      '<img src="face/13.png" width="24px" height="24px">',
        "[被批评]":      '<img src="face/14.png" width="24px" height="24px">',
        "[偷笑]":      '<img src="face/15.png" width="24px" height="24px">',
        "[无视]":      '<img src="face/16.png" width="24px" height="24px">',
        "[尴尬]":     '<img src="face/17.png" width="24px" height="24px">',
        "[打脸]":      '<img src="face/18.png" width="24px" height="24px">',
        "[努力]":      '<img src="face/19.png" width="24px" height="24px">',
        "[女哭]":      '<img src="face/20.png" width="24px" height="24px">',
        "[小哭]":      '<img src="face/21.png" width="24px" height="24px">',
        "[吃东西]":      '<img src="face/22.png" width="24px" height="24px">',
        "[狂笑]":      '<img src="face/23.png" width="24px" height="24px">',
        "[汗]":        '<img src="face/24.png" width="24px" height="24px">',
        "[鬼脸]":      '<img src="face/25.png" width="24px" height="24px">',
        "[发火]":      '<img src="face/26.png" width="24px" height="24px">',
        "[小火]":      '<img src="face/27.png" width="24px" height="24px">',
        "[泪流成河]":    '<img src="face/28.png" width="24px" height="24px">',
        "[安慰]":      '<img src="face/29.png" width="24px" height="24px">',
        "[发呆]":      '<img src="face/30.png" width="24px" height="24px">',
        "[鄙视]":      '<img src="face/31.png" width="24px" height="24px">',
        "[飞吻]":      '<img src="face/32.png" width="24px" height="24px">',
        "[喷人]":      '<img src="face/33.png" width="24px" height="24px">',
        "[糗大了]":      '<img src="face/34.png" width="24px" height="24px">',
        "[思考]":      '<img src="face/35.png" width="24px" height="24px">',
        "[挑逗]":      '<img src="face/36.png" width="24px" height="24px">',
        "[喝水]":      '<img src="face/37.png" width="24px" height="24px">',
        "[花心]":      '<img src="face/38.png" width="24px" height="24px">',
        "[惊悚]":      '<img src="face/39.png" width="24px" height="24px">',
        "[亮牙]":      '<img src="face/40.png" width="24px" height="24px">',
        "[抠鼻]":      '<img src="face/41.png" width="24px" height="24px">',
        "[呕吐]":      '<img src="face/42.png" width="24px" height="24px">',
        "[撇嘴]":      '<img src="face/43.png" width="24px" height="24px">',
        "[委屈]":      '<img src="face/44.png" width="24px" height="24px">',
        "[财迷]":      '<img src="face/45.png" width="24px" height="24px">',
        "[惊吓]":      '<img src="face/46.png" width="24px" height="24px">',
        "[阴险]":      '<img src="face/47.png" width="24px" height="24px">',
        "[再见]":      '<img src="face/48.png" width="24px" height="24px">',
        "[晕]":        '<img src="face/49.png" width="24px" height="24px">',
        "[疑问]":      '<img src="face/50.png" width="24px" height="24px">',
        "[嘘]":        '<img src="face/51.png" width="24px" height="24px">',
        "[烟]":        '<img src="face/52.png" width="24px" height="24px">',
        "[敲打]":      '<img src="face/53.png" width="24px" height="24px">',
        "[口罩]":      '<img src="face/54.png" width="24px" height="24px">',
        "[左哼哼]":      '<img src="face/55.png" width="24px" height="24px">',
        "[右哼哼]":      '<img src="face/56.png" width="24px" height="24px">',
        "[笑哭]":      '<img src="face/57.png" width="24px" height="24px">',
        "[小瞧]":      '<img src="face/58.png" width="24px" height="24px">',
        "[潜水]":      '<img src="face/59.png" width="24px" height="24px">',
        "[衰]":        '<img src="face/60.png" width="24px" height="24px">',
        "[倒]":        '<img src="face/61.png" width="24px" height="24px">',
        "[勾引]":      '<img src="face/62.png" width="24px" height="24px">',
        "[拳头]":      '<img src="face/63.png" width="24px" height="24px">',
        "[握手]":      '<img src="face/64.png" width="24px" height="24px">',
        "[耶]":        '<img src="face/65.png" width="24px" height="24px">',
        "[赞]":        '<img src="face/66.png" width="24px" height="24px">',
        "[no]":        '<img src="face/67.png" width="24px" height="24px">',
        "[ok]":        '<img src="face/68.png" width="24px" height="24px">',
        "[抱拳]":      '<img src="face/69.png" width="24px" height="24px">',
        "[鼓掌]":      '<img src="face/70.png" width="24px" height="24px">',
        "[猪头]":      '<img src="face/71.png" width="24px" height="24px">',
        "[鲜花]":        '<img src="face/72.png" width="24px" height="24px">',
        "[凋谢]":      '<img src="face/73.png" width="24px" height="24px">',
        "[心]":      '<img src="face/74.png" width="24px" height="24px">',
        "[心碎]":        '<img src="face/75.png" width="24px" height="24px">',
        "[蛋糕]":      '<img src="face/76.png" width="24px" height="24px">',
        "[雷]":      '<img src="face/77.png" width="24px" height="24px">',
        "[礼物]":        '<img src="face/78.png" width="24px" height="24px">',
        "[西瓜]":        '<img src="face/79.png" width="24px" height="24px">',
        "[药]":      '<img src="face/80.png" width="24px" height="24px">',
        "[刀]":      '<img src="face/81.png" width="24px" height="24px">',
        "[茶杯]":      '<img src="face/82.png" width="24px" height="24px">',
        "[米饭]":      '<img src="face/83.png" width="24px" height="24px">',
        "[喇叭]":        '<img src="face/84.png" width="24px" height="24px">',
        "[甲虫]":      '<img src="face/85.png" width="24px" height="24px">',
        "[红包]":      '<img src="face/86.png" width="24px" height="24px">',
        "[粑粑]":        '<img src="face/87.png" width="24px" height="24px">',
        "[羽毛球]":      '<img src="face/88.png" width="24px" height="24px">',
        "[篮球]":      '<img src="face/89.png" width="24px" height="24px">',
        "[乒乓球]":        '<img src="face/90.png" width="24px" height="24px">',
        "[足球]":        '<img src="face/91.png" width="24px" height="24px">',
        "[嘴唇]":      '<img src="face/92.png" width="24px" height="24px">'

    };

    var exMap3 = {
        "[笑]" :       "[smile]"       ,
        "[大笑]" :     "[laugh]"       ,
        "[微笑]" :     "[happy]"       ,
        "[不开心]" :   "[unhappy]"     ,
        "[呆萌]" :     "[dull]"        ,
        "[花痴]" :     "[lust]"        ,
        "[害羞]" :     "[shy]"         ,
        "[闭嘴]" :     "[shutup]"      ,
        "[睡着]" :     "[sleep]"       ,
        "[哈欠]" :     "[yawn]"        ,
        "[吃惊]" :     "[amaze]"       ,
        "[困]" :       "[tired]"       ,
        "[疯了]" :     "[crazy]"       ,
        "[被批评]" :   "[shamed]"      ,
        "[偷笑]" :     "[titter]"      ,
        "[无视]" :     "[ignore]"      ,
        "[尴尬]" :   "[awkward]"     ,
        "[打脸]" :     "[beat]"        ,
        "[努力]" :     "[strive]"      ,
        "[女哭]" :     "[cry]"         ,
        "[小哭]" :     "[weep]"        ,
        "[吃东西]" :   "[eat]"         ,
        "[狂笑]" :     "[wild]"        ,
        "[汗]" :       "[sweat]"       ,
        "[鬼脸]" :     "[funny]"       ,
        "[发火]" :     "[mad]"         ,
        "[小火]" :     "[angry]"       ,
        "[泪流成河]" : "[cryriver]"    ,
        "[安慰]" :     "[comfort]"     ,
        "[发呆]" :     "[daze]"        ,
        "[鄙视]" :     "[despise]"     ,
        "[飞吻]" :     "[kiss]"        ,
        "[喷人]" :     "[spew]"        ,
        "[糗大了]" :   "[embarrass]"   ,
        "[思考]" :     "[think]"       ,
        "[挑逗]" :     "[tease]"       ,
        "[喝水]" :     "[drink]"       ,
        "[花心]" :     "[fickle]"      ,
        "[惊悚]" :     "[horror]"      ,
        "[亮牙]" :     "[showteeth]"   ,
        "[抠鼻]" :     "[picknose]"    ,
        "[呕吐]" :     "[vomit]"       ,
        "[撇嘴]" :     "[twitch]"      ,
        "[委屈]" :     "[wronged]"     ,
        "[财迷]" :     "[greedy]"      ,
        "[惊吓]" :     "[scare]"       ,
        "[阴险]" :     "[sinister]"    ,
        "[再见]" :     "[bye]"         ,
        "[晕]" :       "[faint]"       ,
        "[疑问]" :     "[question]"    ,
        "[嘘]" :       "[hush]"        ,
        "[烟]" :       "[smoke]"       ,
        "[敲打]" :     "[strike]"      ,
        "[口罩]" :     "[mask]"        ,
        "[左哼哼]" :   "[leftgroan]"   ,
        "[右哼哼]" :   "[rightgroan]"  ,
        "[笑哭]" :     "[cryout]"      ,
        "[小瞧]" :     "[contempt]"    ,
        "[潜水]" :     "[dive]"        ,
        "[衰]" :       "[tragic]"      ,
        "[倒]" :       "[bad]"         ,
        "[勾引]" :     "[tempt]"       ,
        "[拳头]" :     "[fist]"        ,
        "[握手]" :     "[shake]"       ,
        "[耶]" :       "[yeah]"        ,
        "[赞]" :       "[good]"        ,
        "[no]" :       "[no]"          ,
        "[ok]" :       "[ok]"          ,
        "[猪头]" :     "[pig]"         ,
        "[鲜花]" :     "[flower]"      ,
        "[凋谢]" :     "[wither]"      ,
        "[心]" :       "[heart]"       ,
        "[心碎]" :     "[broken]"      ,
        "[蛋糕]" :     "[cake]"        ,
        "[雷]" :       "[bomb]"        ,
        "[礼物]" :     "[gift]"        ,
        "[西瓜]" :     "[melon]"       ,
        "[药]" :       "[drug]"        ,
        "[刀]" :       "[knife]"       ,
        "[茶杯]":       "[tea]",
        "[粑粑]":       "[poop]",
        "[抱拳]" :     "[fight]"      ,
        "[鼓掌]" :       "[clap]"       ,
        "[红包]" :     "[red packet]"      ,
        "[甲虫]" :     "[bettle]"        ,
        "[喇叭]" :       "[loudspeak]"        ,
        "[篮球]" :     "[basketball]"        ,
        "[米饭]" :     "[rice]"       ,
        "[兵乓球]" :       "[ping-pong]"        ,
        "[羽毛球]" :       "[badminton]"       ,
        "[足球]":       "[football]",
        "[嘴唇]":       "[lip]"
    };

	var getExName = function(exId) {
		var exName = exMap[exId];
		if (typeof exName != "undefined") {
			return exName;
		} else {
			return "";
		}
	};
	
	var getExHtml = function(exId) {
		var exHtml = exMap2[exId];
		if (typeof exHtml != "undefined") {
			return exHtml;
		} else {
			return "";
		}
	};
    var getExEng = function(exId) {
        var exEng = exMap3[exId];
        if (typeof exEng != "undefined") {
            return exEng;
        } else {
            return "";
        }
    };

    return {
		getExName : getExName,
		getExHtml : getExHtml,
        getExEng : getExEng
	};
})();
