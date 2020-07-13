<template>
<view>
<!--index.wxml-->
<view :class="hideclass1">
  <view class="view_center">
      <view class="page__desc" style="align-items: center; color:black;">忘忧围棋题库需要使用微信账号登录后才可以做题，你也也可以选择不登录进入人机对弈，体验人机对弈初中级功能</view>
  </view>
  <button type="primary" open-type="getUserInfo" @tap="openTiku">使用微信登录进入</button>
  <button type="primary" @tap="openNoUser">不登录进入人机对弈</button>
</view>
<view :class="hideclass2">
<view class="allview" catchtouchmove="preventScroll">
<ad class="joygoad" v-if="showad" unit-id="adunit-3d98c96fef501b5d"></ad>
<view class="commentview" :style="'top: ' + commentview_top + 'px; height: ' + commentview_height + 'px;'" @tap="btn_commenttext">
 <text class="commenttext">{{gamecomment}}</text>
</view>

<view class="gmboard" :style="'top: ' + gmboard_top + 'px; height: ' + gmboard_height + 'px;'" catchtouchmove="preventScroll">
<canvas :style="'width:' + canvasview.width + 'px;height:' + canvasview.height + 'px;'" canvas-id="image-canvas-1" catchtouchmove="preventScroll" @touchstart="touchBegin" @touchend="touchEnd"></canvas>
</view>


<view class="bottombtnview" v-if="showbottombtnview==1" :style="'flex-direction:row; top: ' + bottombtnview_top + 'px; height: ' + bottombtnview_height + 'px;'">
   <button class="bottombtn" @tap="btn_reporterr" :disabled="btn_reporterr_disabled">{{btn_reporterr_text}}</button>
  <button class="bottombtn" @tap="btn_undo" :disabled="btn_undo_disabled">{{btn_undo_text}}</button>
  <button class="bottombtn" @tap="btn_ai" :disabled="btn_ai_disabled">{{btn_ai_text}}</button>
  <button class="bottombtn" @tap="btn_export" :disabled="btn_export_disabled">{{btn_export_text}}</button>
   <button class="bottombtn" @tap="btn_commit" :disabled="btn_commit_disabled">{{btn_commit_text}}</button>
</view>
</view>

  <view class="startgame-dialog" :style="'top: ' + inputview_top + 'px; height: ' + inputview_height + 'px;'" v-if="showinputview">
    <view class="modal-title">提交到题目交流区，请输入简介和设置先手方</view>
    <view class="modal-content">  
         <view class="title_container" style="width: 70%;">
        <view class="modal-input">
          <input placeholder-class="input-holder" name="inputtopictitle'" maxlength="30" @input="topictitleInput" class="input" placeholder="请输入题目简介"></input>
        </view>
        </view>
        <view class="title_container" style="width: 30%;">
              <view>{{firstmovecolortext}}</view>
              <picker @change="bindPickerChangeFirstMoveColor" :value="firstmovecolorindex" :range="firstmovecolorarray">
                <button class="weui-btn mini-btn" type="primary" size="mini">选择</button>
              </picker>
          </view>
    </view>
    <view class="modal-footer">
      <view class="btn-confirm" style="color: black;" @tap="onInputViewCancel" data-status="cancel">取消</view>
      <view class="btn-confirm" style="color: black;" @tap="btn_real_submit" data-status="confirm">提交</view>
    </view>
  </view>

   <view class="startgame-dialog" :style="'top: ' + inputview_top + 'px; height: ' + inputview_height + 'px;'" v-if="showsgfpathview">
    <view class="modal-title">复制SGF地址</view>
    <view class="modal-content">  
         <view class="title_container" style="width: 70%;height:60%;">
        <view>{{sgfdownloadpath}}</view>
        </view>
        <view class="title_container" style="width: 50%;height:40%;">
        <button class="weui-btn mini-btn" type="primary" style="width: 50%;height:60rpx;" size="mini" @tap="btn_path_copy">复制URL</button>
          </view>
    </view>
    <view class="modal-footer">
      <view class="btn-confirm" style="color: black;" @tap="btn_path_submit" data-status="confirm">确定</view>
    </view>
  </view>

  <view class="startgame-dialog" :style="'top: ' + inputview_top + 'px; height: ' + inputview_height + 'px;'" v-if="showscanissueview">
    <view class="modal-title">上报棋局识别问题</view>
    <view class="modal-content">  
         <view class="title_container" style="width: 70%;">
        <view class="modal-input">
          <input placeholder-class="input-holder" name="inputtopictitle'" maxlength="30" @input="reportissueInput" class="input" placeholder="请输入识别问题简要说明"></input>
        </view>
        </view>
    </view>
    <view class="modal-footer">
      <view class="btn-confirm" style="color: black;" @tap="onScanIssueViewCancel" data-status="cancel">取消</view>
      <view class="btn-confirm" style="color: black;" @tap="btn_scanissue_submit" data-status="confirm">提交</view>
    </view>
  </view>




</view>
</view>
</template>

<script>
//index.js
import LifeBoard from '../../utils/lifeboard';
import WyGo from '../../utils/WyGo';
import ScanLifeGame from './scanlifegogame'; //var wezrender = require('../../lib/wezrender');
//var wezrender = require('../../lib/wezrender');
var BEGINCOORD = 1; //X，Y坐标开始的下标
//X，Y坐标开始的下标
var WYWIDTH = 20; //为了能够装下1-19的数字所需要的数组的宽度
//为了能够装下1-19的数字所需要的数组的宽度
var WYMATRIXWIDTH = 21; //增加了0和20线的虚拟棋盘的宽度，方便用来比较
//增加了0和20线的虚拟棋盘的宽度，方便用来比较
var MAX_WORDCOORD = 448; //WORD的坐标数组的范围
//WORD的坐标数组的范围
var MAX_COORD = 418; //最大坐标
//最大坐标
var MIN_COORD = 22; //最小坐标
//最小坐标
var PASSMOVE_COORD = 0; //PASS的位置值
//PASS的位置值
var MAX_VALID_COORD_COUNT = 361; //空位的个数
//空位的个数
var BLANK = 0; //空格的颜色
//空格的颜色
var WHITE = 1; //白色
//白色
var BLACK = 2; //黑色
//黑色
var OUTBOARD = -1; //棋盘外部的颜色
//棋盘外部的颜色
var LANGUAGE = 0;
var LANGUAGE_CHN = 0;
var LANGUAGE_ENG = 1; //获取应用实例
//获取应用实例
var app = getApp();
var zr;
var theimage;
var circle;
var droplet;
var wygolifegame = null;

export default {
  data() {
    return {
      showad: false,
      next_game_view: "",
      toMovePos: null,
      option: null,
      hideclass1: 'hideview',
      hideclass2: 'showview',
      showWinView: false,
      showFailView: false,
      showFailViewContent: '',
      showToMoveView: false,
      topbtnview_top: 0,
      commentview_top: 0,
      gmboard_top: 0,
      bottombtnview_top: 0,
      topbtnview_height: 0,
      commentview_height: 0,
      gmboard_height: 0,
      bottombtnview_height: 0,
      winview_top: 0,
      winview_height: 0,
      canvasview: {
        width: 320,
        height: 320
      },
      opentype: 0,
      //为0是缺省，为1表示被分享过来的不管怎么样都可以打开
      gamecomment: "Loading",
      btn_undo_text: "后退",
      btn_undo_disabled: false,
      btn_ai_text: "AI求解",
      btn_ai_disabled: false,
      btn_export_text: "导出SGF",
      btn_export_disabled: false,
      btn_msg_text: "提交评论",
      btn_msg_disabled: false,
      btn_commit_text: "转到交流区",
      btn_commit_disabled: false,
      btn_share_text: "求助",
      btn_share_disabled: false,
      btn_reporterr_text: "报告问题",
      btn_reporterr_disabled: false,
      showbottombtnview: 1,
      inputimmsg: '',
      showchatview: true,
      chatview_top: 0,
      chatview_height: 0,
      chatscrolltop: '',
      chatmsg_array: [],
      gamecomment: "Loading",
      showinputview: false,
      firstmovecolor: BLACK,
      firstmovecolorarray: ['黑先行', '白先行'],
      firstmovecolortext: "黑先行",
      topictitleinput: "",
      inputview_top: 100,
      inputview_height: 200,
      sgfdownloadpath: "https://",
      showsgfpathview: false,
      showscanissueview: false,
      reportissueinput: ""
    };
  },

  components: {},
  props: {},
  onShareAppMessage: function () {
    let thepath = "/pages/scan/scan?type=1&fromuserid=" + app.globalData.userid;
    return {
      title: '棋力提高就用忘忧围棋题库',
      path: thepath,
      imageUrl: '/',
      success: function (res) {
        /*  console.log(res.shareTickets[0])
          // console.log
          uni.getShareInfo({
            shareTicket: res.shareTickets[0],
            success: function (res) { console.log(res) },
            fail: function (res) { console.log(res) },
            complete: function (res) { console.log(res) }
          })*/
      },
      fail: function (res) {
        // 分享失败
        console.log(res);
      }
    };
  },
  onLoad: function (option) {
    this.option = option;

    if (app.globalData.userid > 0) {
      this.setData({
        hideclass1: 'hideview'
      });
      this.setData({
        hideclass2: 'showview'
      });
      this.initPage();
    } else {
      this.setData({
        hideclass1: 'showview'
      });
      this.setData({
        hideclass2: 'hideview'
      });
    }
  },
  onReady: function () {
    /*
    			var context = uni.createContext();  
     
       			 context.setStrokeStyle("#FFD700")  
    			    context.setLineWidth(2);  
    			    context.arc(100, 100, 60, -Math.PI/2, Math.PI, false);  
    			    context.moveTo(100, 40);  
    			    context.arc(65.36, 100, 69.28, -Math.PI/3, 2*Math.PI/3, false)  
    			    context.stroke() ; 
    
    			    context.drawImage('../../images/blackstone.png', 100, 100, 30, 30);
    		      	context.drawImage('../../images/whitestone.png', 200, 200, 30, 30);
    		        //context.draw();  
    			  
    			    //调用uni.drawCanvas，通过canvasId指定在哪张画布上绘制，通过actions指定绘制行为  
    			    uni.drawCanvas({  
    			      canvasId: 'image-canvas-1',  
    			      actions: context.getActions() //获取绘图动作数组  
    			    });  
    				// console.log('onReady');
    				//var that = this;
           			//var sgf = "(;AW[dq][dr][ep][fp][fq][ko][kq][co][bo][dn][en][gm][el][cl]AB[cp][dp][do][eo][eq][er][fr][fn][iq]LB[gr:甲][fo:乙]C[黑先：把分裂着的黑子连络起来是要花费一番苦心的。黑甲则白乙断，黑如走乙 ，则白走甲，黑不行。怎么走最好?]; B[gp]; W[gq]; B[gr]; W[hp]; B[hq]; W[go]; B[fo]; W[gp]; B[bq]C[白8 = 黑1黑1的碰绝妙。因中间的白三子图逃而定2、4，则被黑3、5打，至黑9，不但显示了黑1“一子两用”把两方的缺陷都补好了的效果，而且使白成为愚形。])";
    				//wygogame=new WyGoGame(this,0,sgf,0,10,1000);
    				*/
  },
  onUnload: function () {
    if (zr) {
      zr.dispose();
    }
  },
  methods: {
    layout(adheight) {
      /*	if(adheight==0)
      	{
      		adheight=95;
      	}*/
      let winwidth = uni.getSystemInfoSync().windowWidth;
      let winheight = uni.getSystemInfoSync().windowHeight;
      let diff = winheight - winwidth;
      let topbtnviewtop = adheight;
      let commemnt_top = adheight + diff * 0.05;
      let gameboard_top = adheight + diff * 0.1;
      let chatviewtop = gameboard_top + winwidth;
      let charviewheight = (winheight - chatviewtop) * 0.8;
      let bottombtnview_top = chatviewtop + charviewheight;
      let bottombtnview_height = winheight - bottombtnview_top;
      this.setData({
        canvasview: {
          width: winwidth,
          height: winwidth
        },
        topbtnview_top: topbtnviewtop,
        commentview_top: topbtnviewtop,
        gmboard_top: gameboard_top,
        bottombtnview_top: bottombtnview_top,
        topbtnview_height: commemnt_top - topbtnviewtop,
        commentview_height: gameboard_top - adheight,
        gmboard_height: winwidth,
        chatview_top: chatviewtop,
        chatview_height: charviewheight,
        bottombtnview_height: bottombtnview_height,
        winview_top: bottombtnview_top,
        winview_height: bottombtnview_height - 20,
        inputview_top: chatviewtop,
        inputview_height: charviewheight
      });
    },

    initPage() {
      //this.testData(this.option.tikuid);
      //return;
      uni.setNavigationBarTitle({
        title: "拍照识棋"
      });

      if (false) {
        var query = uni.createSelectorQuery(); //选择id

        var that = this;
        query.select('.joygoad').boundingClientRect(function (rect) {
          console.log(rect);

          if (rect != null) {
            that.layout(rect.height);
          } else {
            that.layout(0);
          }
        }).exec();
      } else {
        this.layout(1);
      }

      let scanresult = JSON.parse(this.option.scanresult);
      let sgfpath = scanresult.sgfpath;
      this.setData({
        sgfdownloadpath: sgfpath
      });
      wygolifegame = new ScanLifeGame(this, 0, this.option.scanresult);
      uni.showShareMenu({
        withShareTicket: true,
        success: function (res) {
          // 分享成功
          console.log('shareMenu share success');
          console.log('分享' + res);
        },
        fail: function (res) {
          // 分享失败
          console.log(res);
        }
      });
    },

    openTiku: function () {
      app.globalData.getUserInfo(this.showview);
    },
    openNoUser: function () {},

    showview() {
      this.setData({
        hideclass1: 'hideview'
      });
      this.setData({
        hideclass2: 'showview'
      });
      this.initPage();
    },

    preventTouchMove: function () {},
    showLoading: function () {
      uni.showLoading({
        title: '加载中'
      });
    },
    cancelLoading: function () {
      uni.hideLoading();
    },
    showWinViewFun: function () {
      this.setData({
        showWinView: true
      });
    },
    closeWinView: function () {
      this.setData({
        showWinView: false
      });
    },
    showFailViewFun: function (type) {
      if (type == 0) {
        this.setData({
          showFailViewContent: '不是正确的解法,您再想想,会有办法的',
          showFailView: true
        });
      } else {
        this.setData({
          showFailViewContent: '选择错误超过三次,请重做',
          showFailView: true
        });
      }
    },
    closeFailView: function () {
      this.setData({
        showFailView: false
      });
    },
    onCancelWinDlg: function () {
      this.closeWinView();
    },
    onCancelFailDlg: function () {
      this.closeFailView();

      if (wygolifegame != null) {
        wygolifegame.btn_redo();
      }
    },
    onNextTopic: function () {
      this.closeWinView();

      if (wygolifegame != null) {
        wygolifegame.onNextTopic();
      }
    },
    showToMoveViewFun: function () {
      this.setData({
        showToMoveView: true
      });
    },
    closeToMoveView: function () {
      this.setData({
        showToMoveView: false
      });
    },
    onToMoveCancel: function () {
      this.closeToMoveView();
    },
    onToMoveConfirm: function () {
      if (wygolifegame != null) {
        wygolifegame.onToMoveConfirm(this.toMovePos);
      }
    },
    toMovePosInput: function (e) {
      this.setData({
        toMovePos: e.detail.value
      });
    },
    onShare: function () {
      if (wygolifegame != null) {
        wygolifegame.onShare();
      }
    },
    testDraw: function () {
      var context = uni.createContext();
      context.setStrokeStyle("#FFD700");
      context.setLineWidth(2);
      context.arc(100, 100, 60, -Math.PI / 2, Math.PI, false);
      context.moveTo(100, 40);
      context.arc(65.36, 100, 69.28, -Math.PI / 3, 2 * Math.PI / 3, false);
      context.stroke();
      context.drawImage("/static/images/blackstone.png", 100, 100, 30, 30);
      context.drawImage("/static/images/whitestone.png", 200, 200, 30, 30);
      context.drawImage("/static/images/blackstone.png", 200, 250, 30, 30);
      context.drawImage("/static/images/whitestone.png", 50, 250, 30, 30); //context.draw();  
      //调用uni.drawCanvas，通过canvasId指定在哪张画布上绘制，通过actions指定绘制行为  

      uni.drawCanvas({
        canvasId: 'image-canvas-1',
        actions: context.getActions() //获取绘图动作数组  

      });
    },
    addImg: function () {
      if (wygolifegame != null) {
        wygolifegame.addStone(10, 10, 1);
      }
    },
    removeImg: function () {
      // zr.remove(circle);
      //zr.remove(droplet);
      // zr.remoce(theimage);
      //circle.removeSelfFromZr();
      //zr.flush();
      gameboard.deleteStone(10, 10);
    },
    touchBegin: function (event) {
      console.log(event);

      if (wygolifegame != null) {
        wygolifegame.touchBegin(event);
      }
    },
    touchEnd: function (event) {
      console.log(event);

      if (wygolifegame != null) {
        wygolifegame.touchEnd(event);
      }
    },
    btn_redo: function () {
      if (wygolifegame != null) {
        wygolifegame.btn_redo();
      }
    },
    btn_undo: function () {
      if (wygolifegame != null) {
        wygolifegame.btn_undo();
      }
    },
    btn_share: function () {
      if (wygolifegame != null) {
        wygolifegame.btn_share();
      }
    },
    btn_back: function () {
      if (wygolifegame != null) {
        wygolifegame.btn_back();
      }
    },
    onSendMsg: function () {
      wygolifegame.onSendMsg(this.inputimmsg);
    },
    onSendMsgBack: function () {
      wygolifegame.onSendMsgBack(this.inputimmsg);
    },
    btn_commit: function () {
      wygolifegame.btn_commit();
    },
    btn_ai: function () {
      wygolifegame.btn_ai();
    },
    btn_msg: function () {
      wygolifegame.btn_msg();
    },
    inputimmsgInput: function (e) {
      this.setData({
        inputimmsg: e.detail.value
      });
    },
    btn_commenttext: function () {
      wygolifegame.btn_commenttext();
    },
    bingLongTapToMove: function () {
      this.showToMoveViewFun();
    },
    btn_export: function () {
      this.setData({
        showsgfpathview: true
      });
    },
    topictitleInput: function (e) {
      this.setData({
        topictitleinput: e.detail.value
      });
    },
    reportissueInput: function (e) {
      this.setData({
        reportissueinput: e.detail.value
      });
    },
    btn_real_submit: function (e) {
      wygolifegame.btn_real_submit();
    },
    onInputViewCancel: function (e) {
      this.setData({
        showinputview: false
      });
    },
    bindPickerChangeFirstMoveColor: function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value);
      let temp = parseInt(e.detail.value);
      let firstmovecolor = 2 - temp;
      let coltext = "黑先行";

      if (firstmovecolor == WHITE) {
        coltext = "白先行";
      }

      this.setData({
        firstmovecolor: firstmovecolor,
        firstmovecolortext: coltext
      });
    },
    btn_path_copy: function (e) {
      uni.showToast({
        title: '复制成功'
      });
      uni.setClipboardData({
        data: this.sgfdownloadpath,
        success: function (res) {}
      });
      this.setData({
        showsgfpathview: false
      });
    },
    btn_path_submit: function (e) {
      this.setData({
        showsgfpathview: false
      });
    },
    btn_reporterr: function () {
      this.setData({
        showscanissueview: true
      });
    },
    onScanIssueViewCancel: function () {
      this.setData({
        showscanissueview: false
      });
    },
    btn_scanissue_submit: function () {
      wygolifegame.btn_scanissue_submit(this.reportissueinput);
    }
  }
};
</script>
<style>
@import "./scantopic.css";
</style>