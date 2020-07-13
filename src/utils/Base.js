// JavaScript Document
// 加载图片
var BEGINCOORD = 1 ;   //X，Y坐标开始的下标
var WYWIDTH   = 20 ;                            //为了能够装下1-19的数字所需要的数组的宽度                           //增加了0和20线的虚拟棋盘的宽度，方便用来比较
var MAX_WORDCOORD = 448 ;                        //WORD的坐标数组的范围
var MAX_COORD     = 418 ;             //最大坐标
var MIN_COORD     = 22  ;             //最小坐标
var PASSMOVE_COORD = 0  ;            //PASS的位置值
var MAX_VALID_COORD_COUNT = 361 ;      //空位的个数
var BLANK =     0      ;                                   //空格的颜色
var WHITE =    1    ;                                    //白色
var BLACK =    2     ;                                   //黑色
var OUTBOARD =  -1    ;                           //棋盘外部的颜色
var LANGUAGE =   0    ;
var g_seq=0;
var	game_room_type_30M                    =0;
var	game_room_type_45M                    =1;
var	game_room_type_60M                    =2;
var	game_room_type_120M                   =3;
var	game_room_type_6H                     =4;
var	game_room_type_24H                    =5;
var	game_room_type_dumiao_30S_10M         =6;
var	game_room_type_dumiao_60S_15M         =7;
var	game_room_type_dumiao_15S_10M         =8;
var	game_room_type_dumiao_15S_5M          =9;
var	game_room_type_15M_60S                =10;
var	game_room_type_10M_30S                =11;
var LANGUAGE_CHN                          =0;
var LANGUAGE_ENG                          =1;
var mylanguage=0;
var in_progress_text=null;
var is_chrome=false;
var is_ie=false;
var is_firefox=false;
var is_safari=false;
var is_mozilla=false;
var is_opera=false;



function FormatFloat(src, pos)
{
    return Math.round(src*Math.pow(10, pos))/Math.pow(10, pos);
}
function isMobile()
{
	if(navigator.userAgent.match(/(iPhone|iPod|iPad|Android|ios)/i))
	{
		return true;
	}
	return false;
}

function isIos()
{
	if(navigator.userAgent.match(/(iPhone|iPod|iPad|ios)/i))
	{
		return true;
	}
	return false;
}



function loadImage(srcList,callback){
	var imgs={};
	var totalCount=srcList.length;
	var loadedCount=0;
	for (var i=0;i<totalCount;i++){
		var img=srcList[i];
		var image=imgs[img.id]=new Image();
		image.src=img.url;
		image.onload=function(event){
			loadedCount++;
		}
	}
	if (typeof callback=="function"){
		var Me=this;
		function check(){
			if (loadedCount>=totalCount){
				callback.apply(Me,arguments);
			}else{
				setTimeout(check,100);
			}
		}
		check();
	}
	return imgs;
}
function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

//有关 日期时间的几个函数
function GetDateYMD()
{
   var d, s = "";           // 声明变量。
   d = new Date();                           // 创建 Date 对象。
   s += d.getFullYear() + "-";                         // 获取年份
   s += (d.getMonth() + 1) + "-";            // 获取月份。
   s += d.getDate() ;                   // 获取日。
   return(s);                                // 返回日期。
}

function FormatMilliSecondDate(s)
{
	var d = new Date(s);
	var s = d.getFullYear() + "-";                         // 获取年份
   	s += (d.getMonth() + 1) + "-";            // 获取月份。
   	s += d.getDate() ;  
   	s +=" ";
   	s += d.getHours() + ":";                         // 获取年份
	s += (d.getMinutes() ) + ":";            // 获取月份。
	s += d.getSeconds() + " ";                     
	return s;
}

function GetTimeHMS()
{
   var d, s = "";           // 声明变量。
   d = new Date();                           // 创建 Date 对象。
   s += d.getHours() + ":";                         // 获取年份
   s += (d.getMinutes() ) + ":";            // 获取月份。
   s += d.getSeconds() + " ";                   // 获取日。
   return(s);                                // 返回日期。
}
function FormatFloat(src, pos)
{
    return Math.round(src*Math.pow(10, pos))/Math.pow(10, pos);
}
function changeTwoDecimal(x)  
{  
	var f_x = parseFloat(x);  
	if (isNaN(f_x))  
	{  
		alert('function:changeTwoDecimal->parameter error');  
		return false;  
	}  
	var f_x = Math.round(x*100)/100;  
	  
	return f_x;  
}  
function Div(exp1, exp2)
{
    var n1 = Math.round(exp1); //四舍五入
    var n2 = Math.round(exp2); //四舍五入
    var rslt = n1 / n2; //除

    if (rslt >= 0)
    {
        rslt = Math.floor(rslt); //返回值为小于等于其数值参数的最大整数值。
    }
    else
    {
        rslt = Math.ceil(rslt); //返回值为大于等于其数字参数的最小整数。
    }
    return rslt;
}
function S4()
{
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function NewGuid()
{
	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function GetWinRaio(wincount, losecount)
{
	if(wincount+losecount==0)
	{
		return 0;
	}
	var r=wincount*100/(wincount+losecount);
	return r.toFixed(2);
}
function GetDateTime()
{
  return (GetDate()+" "+GetTime()) ;
}
function IsValidCoord2(n1,n2,boardsize=19)
{
	return IsValidCoord(n1,boardsize)&&IsValidCoord(n2,boardsize);
}
function IsValidCoord(n,boardsize=19)
{
	if(n>=BEGINCOORD&&n<=boardsize)
	{
		return true;
	}
	return false;
}
function IsValidWordCoord(coord,boardsize=19)
{
	if(IsValidCoord(GetCoordX(coord,boardsize))&&IsValidCoord(GetCoordY(coord,boardsize)))
	{
		return true;
	}
	return false;
}
function CoordToWord(nX, nY,boardsize=19)
{
	let x= Math.floor(nX);
	let y= Math.floor(nY);
	return x*(boardsize+2)+y;
}
function GetCoordX(coord,boardsize=19)
{
	return Div(coord,(boardsize+2));
}
function GetCoordY(coord,boardsize=19)
{
	return coord%(boardsize+2);
}
function GetLeft(coord,boardsize=19)
{
	return coord-(boardsize+2);
}
function GetTop(coord,boardsize=19)
{
	return coord-1;
}
function GetRight(coord,boardsize=19)
{
	return coord+(boardsize+2);
}
function GetBottom(coord,boardsize=19)
{
	return coord+1;
}
function GetLeftTop(wCoord,boardsize=19)
{
   return wCoord-(boardsize+2)-1;
}
function GetRightTop(wCoord,boardsize=19)
{
   return wCoord+(boardsize+2)-1;
}
function GetRightBottom(wCoord,boardsize=19)
{
   return wCoord+(boardsize+2)+1;
}
function GetLeftBottom(wCoord,boardsize=19)
{
   return wCoord-(boardsize+2)+1;
}
function  GetRivalColor(color)
{
	return 3-color;
}

function IsValidUserID(userid)
{
	if(userid>10000)
	{
		return true;
	}
	return false;

}
function getTime()
{
	var myDate = new Date();
	var time=Math.floor(myDate.getTime()/1000);
	return time;
}
function getCurTime()
{
	 var timestamp = Date.parse(new Date());
	 return timestamp/1000;
}
function getToday()
{
	var date = new Date();
	var seperator1 = "-";
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var currentdate = year *10000 +  + month*100 + day; 
	return currentdate;
}
function getTickCount()
{
	var myDate = new Date();
	return myDate.getTime();
}
function GetSeq()
{
	g_seq++;
	return g_seq%65535
}

function GetLevelStr(score)
{
	var level="";
	if(score>=1000)
	{
	   var s=Math.floor((score-900)/100);
	   level="9."+s;
	   level+="D";
	}
	else if(score>=100)
    {
		level+=Div(score,100)+"D";
    }
    else
    {
		level+=Div(199-score,100)+"K";
    }
	return level;
}

function GetTimeStr(time)  // time is second
{
	var hour=Div(time,3600);
	var min=Div(time%3600,60);
	var second=time%60;
	var result="";
	if(hour>0)
	{
		if(hour<10)
		{
			result+="0";
			result+=hour;
		}
		else
		{
			result+=hour;
		}
		result+=":";
	}
	if(min<10)
	{
		result+="0";
		result+=min;
	}
	else
	{
		result+=min;
	}
	result+=":";
	if(second<10)
	{
		result+="0";
		result+=second;
	}
	else
	{
		result+=second;
	}
	return result;
}

var move=function(e)
{
	e.preventDefault && e.preventDefault();
	e.returnValue=false;
	e.stopPropagation && e.stopPropagation();
	return false;
}
var keyFunc=function(e)
{
	if(37<=e.keyCode && e.keyCode<=40){
		return move(e);
	}
}
var oldoverflow=null;
var oldonkeydown=null;
var oldonmousewheel=null;

function enableButton(btn)
{
	btn.mouseEnabled=true;
	btn.buttonMode=true;
}
function disableButton(btn)
{
	btn.mouseEnabled=false;
	btn.buttonMode=false;
}
function updateButtonText(btn, btntext)
{
	btn.bitmap_over.getChildAt(0).text = btn.bitmap_up.back.getChildAt(0).text = btntext;
	btn.baseWidth = btn.width = btn.bitmap_up.back.getChildAt(0).getWidth() + btn.bitmap_up.back.getChildAt(0).size;
	btn.backgroundSet = null;
}

function TrimNick(nick)
{
	var newNick=nick.replace("(不能为空)","");
	if(newNick.length>8)
	{
		newNick=newNick.substr(0,8);
	}
	return newNick;

}

function getBrowserInfo()
{
	var agent = navigator.userAgent.toLowerCase() ;

	var regStr_ie = /msie [\d.]+;/gi ;
	var regStr_ff = /firefox\/[\d.]+/gi
	var regStr_chrome = /chrome\/[\d.]+/gi ;
	var regStr_saf = /safari\/[\d.]+/gi ;
	var regStr_mozilla = /mozilla\/[\d.]+/gi ;
	var regStr_opera = /opr\/[\d.]+/gi ;
	var rst=null;
	if(agent.indexOf("opr") > 0)
	{
		rst=agent.match(regStr_opera);
		if(rst!=null)	return  rst;
	}
	if(agent.indexOf("msie") > 0)
	{
		rst=agent.match(regStr_ie) ;
		if(rst!=null)	return  rst;
	}

	//firefox
	if(agent.indexOf("firefox") > 0)
	{
		rst=agent.match(regStr_ff) ;
		if(rst!=null)	return  rst;
	}

	//Chrome
	if(agent.indexOf("chrome") > 0)
	{
		rst=agent.match(regStr_chrome) ;
		if(rst!=null)	return  rst;
	}

	//Safari
	if(agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0)
	{
		rst= agent.match(regStr_saf) ;
		if(rst!=null)	return  rst;
	}
	if(agent.indexOf("mozilla") > 0)
	{
		rst= agent.match(regStr_mozilla) ;
		if(rst!=null)	return  rst;
	}

	return null;


}

function IsSupported()
{
	var binfo=getBrowserInfo();
	if(binfo==null)
	{
		return false;
	}
	var browser = binfo[0] ;
	var verinfo = (browser+"").replace(/[^0-9.]/ig,"");
	var ver=parseInt(verinfo);
	//console.log("browser="+browser+"verinfo="+verinfo);
	var a=browser.indexOf("chrome");
    //以下进行测试
    if(browser.indexOf("ie")>=0)
    {
    	is_ie=true;
       	if(ver>=9)
    	{
    		return true;
    	}
    }
    else if(browser.indexOf("firefox")>=0)
    {
    	is_firefox=true;
    	if(ver>=22)
    	{
    		return true;
    	}
    }
    else if(browser.indexOf("chrome")>=0)
    {
    	is_chrome=true;
    	if(ver>=30)
    	{
    		return true;
    	}
    }
    else if(browser.indexOf("opr")>=0)
    {
    	is_opera=true;
    	if(ver>=21)
    	{
    		return true;
    	}
    }
    else if(browser.indexOf("safari")>=0)
    {
    	is_safari=true;
    	if(ver>=537)
    	{
    		return true;
    	}
    }
    else if(browser.indexOf("mozilla")>=0)
    {
    	is_mozilla=true;
    	if(ver>=5)
    	{
    		return true;
    	}
    }
    return false;
}

function GetSquareDistance(x1,y1,x2,y2)
{
	return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}

function ShowInProgress()
{
	DeleteInProgress();
	var text="正在处理中，请稍候...";
	in_progress_text= new LTextField();
	in_progress_text.color = "#0000FF";
	in_progress_text.size = 30;
	in_progress_text.text = text;
	in_progress_text.x=clientwidth/2-in_progress_text.getWidth()/2;
	in_progress_text.y=clientwidth/4;
	g_backLayer.addChild(in_progress_text);
}
function DeleteInProgress()
{
	if(in_progress_text!=null)
	{
		g_backLayer.removeChild(in_progress_text);
		in_progress_text=null;
	}
}

function addWin_Game_Text(win,x,y,text)
{
	var title_text= new LTextField();
	title_text.color = "#000000";
	title_text.size = gametextsize;
	title_text.text = text;
	title_text.x=x;
	title_text.y=y;
	win.addChild(title_text);
}

function addWin_Text(win,x,y,text)
{
	var title_text= new LTextField();
	title_text.color = "#000000";
	title_text.size = commontextsize;
	title_text.text = text;
	title_text.x=x;
	title_text.y=y;
	win.addChild(title_text);
}
function addWin_Game_MultiText(win,x,y,text)
{
	var title_text= new LTextField();
	title_text.color = "#000000";
	title_text.size = gametextsize;
	title_text.text = text;
	title_text.x=x;
	title_text.y=y;
	title_text.width=win.getWidth()-2*x;
	title_text.setWordWrap(true,0);
	win.addChild(title_text);
}

function addWin_MultiText(win,x,y,text)
{
	var title_text= new LTextField();
	title_text.color = "#000000";
	title_text.size = commontextsize;
	title_text.text = text;
	title_text.x=x;
	title_text.y=y;
	title_text.width=win.getWidth()-2*x;
	title_text.setWordWrap(true,0);
	win.addChild(title_text);
}

function setBackMusicOn(b)
{
	if(window.localStorage)
	{
		window.localStorage.setItem("BackMusicSet",b);
	}
}
function getBackMusicOn()
{
	if(window.localStorage)
	{
		var a=window.localStorage.getItem("BackMusicSet");
		if(a==null)
		{
			return true;
		}
		if(a=="true")
		{
			return true;
		}
	}
	return false;
}

function setPlayMusicOn(b)
{
	if(window.localStorage)
	{
		window.localStorage.setItem("PlayMusicSet",b);
	}
}
function getPlayMusicOn()
{
	if(window.localStorage)
	{
		var a=window.localStorage.getItem("PlayMusicSet");
		if(a==null)
		{
			return true;
		}
		if(a=="true")
		{
			return true;
		}
	}
	return false;
}

function CheckTitleBar()
{
	if(g_titlebar==null)
	{
		g_titlebar =new TitleBar();
		g_backLayer.addChild(g_titlebar);
	}
}

function setDuMiaoMusicOn(b)
{
	if(window.localStorage)
	{
		window.localStorage.setItem("DuMiaoMusicSet",b);
	}
}
function getDuMiaoMusicOn()
{
	if(window.localStorage)
	{
		var a=window.localStorage.getItem("DuMiaoMusicSet");
		if(a==null)
		{
			return true;
		}
		if(a=="true")
		{
			return true;
		}
	}
	return false;
}

function S4()
{
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function NewGuid()
{
	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function EnableScroll()
{
	if(oldoverflow!=null)
	{
		document.body.style.overflow = oldoverflow;
	}
	if(	oldonkeydown!=null)
	{
		document.body.onkeydown=oldonkeydown;
	}
	if(oldonmousewheel!=null)
	{
		document.body.onmousewheel = oldonmousewheel;
	}
}
function DisableScroll()
{
	window.scrollTo(0,0);
	oldoverflow=document.body.style.overflow;
	oldonkeydown=document.body.onkeydown;
	oldonmousewheel=document.body.onmousewheel;
	document.body.style.overflow = 'hidden';
	document.body.onkeydown=keyFunc;
	document.body.onmousewheel = function(){return;}
}
Array.prototype.remove=function(obj){
    for(var i =0;i <this.length;i++){
        var temp = this[i];
        if(!isNaN(obj)){
            temp=i;
        }
        if(temp == obj){
            for(var j = i;j <this.length;j++){
                this[j]=this[j+1];
            }
            this.length = this.length-1;
        }
    }
}

Array.prototype.removeAt=function(index){
	if(index>this.length-1)
	{
		return;
	}
    for(var i =0;i <this.length;i++)
    {
    	if(i == index)
        {
            for(var j = i;j <this.length;j++)
            {
                this[j]=this[j+1];
            }
            this.length = this.length-1;
            break;
        }
    }
}

Array.prototype.contain=function(obj){
    for(var i =0;i <this.length;i++){
        if(this[i]==obj){
            return true;
        }
	}
	return false;
}

module.exports = {
  getTickCount: getTickCount,
  getTime: getTime,
  getCurTime: getCurTime,
  getToday: getToday,
  isMobile: isMobile,
  isIos: isIos,
  loadImage: loadImage,
  isArray: isArray,
  GetDateYMD: GetDateYMD,
  GetTimeHMS: GetTimeHMS,
  FormatMilliSecondDate: FormatMilliSecondDate,
  FormatFloat: FormatFloat,
  Div: Div,
  S4: S4,
  NewGuid: NewGuid,
  GetWinRaio: GetWinRaio,
  GetDateTime: GetDateTime,
  IsValidCoord2: IsValidCoord2,
  IsValidCoord: IsValidCoord,
  IsValidWordCoord: IsValidWordCoord,
  CoordToWord: CoordToWord,
  GetCoordX: GetCoordX,
  GetCoordY: GetCoordY,
  GetLeft: GetLeft,
  GetTop: GetTop,
  GetRight: GetRight,
  GetBottom: GetBottom,
  GetLeftTop: GetLeftTop,
  GetRightTop: GetRightTop,
  GetRightBottom: GetRightBottom,
  GetLeftBottom: GetLeftBottom,
  GetRivalColor: GetRivalColor,
  IsValidUserID: IsValidUserID,
  GetSquareDistance:GetSquareDistance,
  changeTwoDecimal:changeTwoDecimal,
  FormatFloat:FormatFloat,
  NewGuid:NewGuid,
  GetTimeStr:GetTimeStr,
  GetLevelStr:GetLevelStr
}














