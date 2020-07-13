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

<scroll-view scroll-y="true" class="chatview" v-if="showchatview" :scroll-top="chatscrolltop" :style="'top: ' + chatview_top + 'px; height: ' + chatview_height + 'px;'">
   <block v-for="(item, index) in chatmsg_array" :key="index"> 
           <view class="cellview" style="flex-direction:row;">
             <view class="cellitem0" v-if="item.fromme==0">
              <image src="/static/images/msgfromother.png" style="width:40rpx;height:40rpx;" :data-id="item.id" :data-fromuserid="item.fromuserid" @longtap="bindlong_comment"></image>
              </view>
              <view class="cellitem0" v-if="item.fromme==1">
               <image src="/static/images/msgfromme.png" style="width:40rpx;height:40rpx;" :data-id="item.id" :data-fromuserid="item.fromuserid" @longtap="bindlong_comment"></image>
              </view>
               <text class="chatitem_time">{{item.strtime}}</text>

              <view class="cellitem2">
              <text class="chatitem" v-if="item.issolution==0"> {{item.fromusernick}}:{{item.comment}}
              </text>

              <view class="chatitem" v-if="item.issolution==1"> {{item.fromusernick}}:
               <button class="solutionbtn" :data-id="item.id" :data-solution="item.solution" @tap="btn_jieda">解答>>> </button>
              </view>
              </view>

              <view class="cellitem3">
               <image class="HandImage" plain="true" :data-id="item.id" @tap="btn_agree" src="/static/images/agree.png" mode="widthFix"></image>
                <view class="HandCountView">{{item.agreecount}}</view>
                <image class="HandImage" src="/static/images/disagree.png" mode="widthFix" :data-id="item.id" @tap="btn_disagree"></image>
                <view class="HandCountView">{{item.disagreecount}}</view>
              </view>
            </view>
      </block>
  </scroll-view>

<view class="bottombtnview" v-if="showbottombtnview==1" :style="'flex-direction:row; top: ' + bottombtnview_top + 'px; height: ' + bottombtnview_height + 'px;'">
  <button class="bottombtn" @tap="btn_undo" :disabled="btn_undo_disabled">{{btn_undo_text}}</button>
  <button class="bottombtn" @tap="btn_ai" :disabled="btn_ai_disabled">{{btn_ai_text}}</button>
  <button class="bottombtn" @tap="btn_msg" :disabled="btn_msg_disabled">{{btn_msg_text}}</button>
   <button class="bottombtn" @tap="btn_commit" :disabled="btn_commit_disabled">{{btn_commit_text}}</button>
  <button class="bottombtn" open-type="share" @tap="btn_share" :disabled="btn_share_disabled">{{btn_share_text}}</button>
</view>
<view class="bottombtnview" v-if="showbottombtnview==0" :style="'flex-direction:row; top: ' + bottombtnview_top + 'px; height: ' + bottombtnview_height + 'px;'">
        <button class="sendbtn" @tap="onSendMsgBack">返回</button>
        <input class="inputView" placeholder-class="input-holder" type="text" width="100rpx" name="inputimmsg" :value="inputimmsg" @input="inputimmsgInput" placeholder="请输入..."></input>
        <button class="sendbtn" @tap="onSendMsg">提交</button>
</view>
</view>
</view>
</view>
</template>

<script>
//index.js
import LifeBoard from '../../utils/lifeboard';
import WyGo from '../../utils/WyGo';
import TopicGoGame from './ctopicgogame'; //var wezrender = require('../../lib/wezrender');
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
var topicgogame = null;

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
      tikuname: null,
      tikuid: 0,
      pos: 0,
      opentype: 0,
      //为0是缺省，为1表示被分享过来的不管怎么样都可以打开
      gamecomment: "Loading",
      btn_undo_text: "后退",
      btn_undo_disabled: false,
      btn_ai_text: "AI求解",
      btn_ai_disabled: false,
      btn_msg_text: "评论",
      btn_msg_disabled: false,
      btn_commit_text: "提交正解",
      btn_commit_disabled: true,
      btn_share_text: "分享求助",
      btn_share_disabled: false,
      showbottombtnview: 1,
      inputimmsg: '',
      showchatview: true,
      chatview_top: 0,
      chatview_height: 0,
      chatscrolltop: '',
      chatmsg_array: [],
      gamecomment: "Loading"
    };
  },

  components: {},
  props: {},
  onShareAppMessage: function () {
    let thepath = "/pages/community/ctopic?type=1&fromuserid=" + app.globalData.userid + "&qipuid=" + this.option.qipuid;
    return {
      title: '高手请帮忙解解这道题目吧',
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
      let commemnt_top = adheight + diff * 0.0;
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
        winview_height: bottombtnview_height - 20
      });
    },

    loadtopicdata(qipuid) {
      if (topicgogame != null) {
        topicgogame = null;
      }

      topicgogame = new TopicGoGame(this, qipuid);
      topicgogame.loadtopicdata();
    },

    initPage() {
      //this.testData(this.option.tikuid);
      //return;
      var that = this;
      this.setData({
        tikuname: this.option.tikuname,
        tikuid: this.option.tikuid,
        pos: this.option.pos,
        opentype: this.option.opentype
      });
      uni.setNavigationBarTitle({
        title: "题目交流"
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

      this.loadtopicdata(this.option.qipuid);
      this.checkOption();
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

      if (topicgogame != null) {
        topicgogame.btn_redo();
      }
    },
    onNextTopic: function () {
      this.closeWinView();

      if (topicgogame != null) {
        topicgogame.onNextTopic();
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
      if (topicgogame != null) {
        topicgogame.onToMoveConfirm(this.toMovePos);
      }
    },
    toMovePosInput: function (e) {
      this.setData({
        toMovePos: e.detail.value
      });
    },
    onShare: function () {
      if (topicgogame != null) {
        topicgogame.onShare();
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
      if (topicgogame != null) {
        topicgogame.addStone(10, 10, 1);
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

      if (topicgogame != null) {
        topicgogame.touchBegin(event);
      }
    },
    touchEnd: function (event) {
      console.log(event);

      if (topicgogame != null) {
        topicgogame.touchEnd(event);
      }
    },
    btn_redo: function () {
      if (topicgogame != null) {
        topicgogame.btn_redo();
      }
    },
    btn_undo: function () {
      if (topicgogame != null) {
        topicgogame.btn_undo();
      }
    },
    btn_share: function () {
      if (topicgogame != null) {
        topicgogame.btn_share();
      }
    },
    btn_back: function () {
      if (topicgogame != null) {
        topicgogame.btn_back();
      }
    },
    onSendMsg: function () {
      topicgogame.onSendMsg(this.inputimmsg);
    },
    onSendMsgBack: function () {
      topicgogame.onSendMsgBack(this.inputimmsg);
    },
    btn_commit: function () {
      topicgogame.btn_commit();
    },
    btn_ai: function () {
      topicgogame.btn_ai();
    },
    btn_msg: function () {
      topicgogame.btn_msg();
    },
    inputimmsgInput: function (e) {
      this.setData({
        inputimmsg: e.detail.value
      });
    },
    btn_commenttext: function () {
      uni.showModal({
        title: '信息',
        content: this.topcommenttext,
        success: function (res) {}
      });
    },
    btn_agree: function (event) {
      let commentid = event.currentTarget.dataset.id;
      topicgogame.btn_agree(commentid);
    },
    btn_disagree: function (event) {
      let commentid = event.currentTarget.dataset.id;
      topicgogame.btn_disagree(commentid);
    },
    bindlong_comment: function (event) {
      let commentid = event.currentTarget.dataset.id;
      let fromuserid = event.currentTarget.dataset.fromuserid;

      if (app.globalData.userid == 10137 || fromuserid == app.globalData.userid) {
        var that = this;
        uni.showModal({
          title: '删除',
          content: '您确定要删除这条评论吗？',
          success: function (res) {
            if (res.confirm) {
              topicgogame.bindlong_comment(commentid);
            }
          }
        });
      }
    },
    btn_jieda: function (event) {
      let commentid = event.currentTarget.dataset.id;
      let solution = event.currentTarget.dataset.solution;
      topicgogame.showSolution(commentid, solution);
    },
    bingLongTapToMove: function () {
      this.showToMoveViewFun();
    },
    checkOption: function () {
      if (this.option == null) {
        return false;
      }

      var that = this;
      let fromuserid = this.option.fromuserid;

      if (typeof fromuserid != "undefined" && fromuserid != null && fromuserid > 0) {
        let theurl = "https://www.gog361.com/flask/v1/joygo/weixin/tuiguang/" + fromuserid + "/" + app.globalData.userid + "/tuiguang";
        uni.request({
          url: theurl,
          header: {
            'content-type': 'application/json'
          },
          data: {
            sessionkey: app.globalData.sessionkey
          },
          //请求后台数据成功  
          success: function (res) {
            if (res.data.code >= 0) {} else if (res.data.code == -100) {
              app.globalData.renewSessionKey();
            }
          },
          fail: function () {}
        });
      }

      if (this.option.type == 1) {
        //增加一次
        var that = this;
        let theurl = "https://www.gog361.com/flask/v1/joygo/sharedtopic/" + app.globalData.userid + "/" + this.option.qipuid;
        uni.request({
          url: theurl,
          header: {
            'content-type': 'application/json'
          },
          data: {
            sessionkey: app.globalData.sessionkey
          },
          //请求后台数据成功  
          success: function (res) {},
          fail: function () {},
          complete: function () {}
        });
        return true;
      }

      return false;
    }
  }
};
</script>
<style>
@import "./ctopic.css";
</style>