<template>
<!--index.wxml-->
<view class="allview" catchtouchmove="preventScroll">
  <ad class="joygoad" v-if="showad" unit-id="adunit-3d98c96fef501b5d"></ad>
  <view class="gmboard" :style="'top: ' + gmboard_top + 'px; height: ' + gmboard_height + 'px;'" catchtouchmove="preventScroll">
  <canvas v-if="showcanvas" :style="'width:' + canvasview.width + 'px;height:' + canvasview.height + 'px;'" canvas-id="image-canvas-1" catchtouchmove="preventScroll" @touchstart="touchBegin" @touchend="touchEnd"></canvas>
  </view>
<view class="commentview" v-if="showtopcomment" @tap="btn_commenttext" :style="'top: ' + commentview_top + 'px; height: ' + commentview_height + 'px;'">
   <text class="topcommenttext">{{topcommenttext}}</text>
  </view>
  <view class="title_container_ex" v-if="showgameinfo" :style="'top: ' + commentview_top + 'px; height: ' + commentview_height + 'px;'">
      <view class="title_container_ex" :style="'top: ' + commentview_top + 'px;height: ' + commentview_height_2 + 'px;'">
       <view class="title_item_left_1"> 
          <view class="title_text_left">黑:{{black_nick}}</view> 
       </view>
       <view class="title_item_center_1">
         <view class="title_text_center">{{gameinfo.deskinfo}}</view>
       </view>
        <view class="title_item_right_1"> 
          <view class="title_text_right">白:{{white_nick}}</view> 
       </view>
      </view>
      <view class="title_container_ex" :style="'top: ' + commentview_top_2 + 'px; height: ' + commentview_height_2 + 'px;'">
        <view class="title_item_tizi">  
            <view class="title_text_left">提{{gameinfo.black_killstones}}子</view>
         </view>
        <view class="title_item_time">  
            <view class="title_text_left">{{gameinfo.black_time}}</view> 
         </view>

          <view class="title_item_step">  
            <view class="title_text_center">第{{gameinfo.curstep}}手</view>
         </view>

         <view class="title_item_time">  
            <view class="title_text_left">{{gameinfo.white_time}}</view> 
         </view>
          <view class="title_item_tizi_right">  
            <view class="title_text_left">提{{gameinfo.white_killstones}}子</view>
         </view>
      </view>
  </view>
  <view class="commentview" :style="'top: ' + bottomcomment_top + 'px; height: ' + bottomcomment_height + 'px;'">
   <text class="commenttext">{{bottomcomment}}</text>
  </view>
   <view class="functionbtnview" :style="'flex-direction:row; top: ' + functionbtnview_top + 'px;height:' + functionbtnview_height + 'px;'">
    <button class="functionbtn" @tap="btn_reporterr" :disabled="btn_reporterr_disabled">{{btn_reporterr_text}}</button>
     <button class="functionbtn" @tap="btn_judgestatus" :disabled="btn_judgestatus_disabled">{{btn_judgestatus_text}}</button>
    <button class="functionbtn" @tap="btn_kata" :disabled="btn_kata_disabled">{{btn_kata_text}}</button>
    <button class="functionbtn" @tap="btn_aiwinrate" :disabled="btn_aiwinrate_disabled">{{btn_aiwinrate_text}}</button>  
  </view>
   <view class="linechartview" v-if="showlinecanvas" :style="'top:' + linechart_top + 'px; height: ' + linechart_height + 'px;'" catchtouchmove="preventScroll" catchtouchstart="touchLineChartBegin">
   <canvas :style="'width:' + canvasview.width + 'px; top:0px; height: 100%;'" canvas-id="mylinechart" catchtouchmove="preventScroll" @touchmove="touchLineChartBegin" @touchstart="touchBegin" @touchend="touchEnd"></canvas>
   </view>
  <scroll-view scroll-y="true" class="chatview" v-if="showchatview" :scroll-top="chatscrolltop" :style="'top: ' + chatview_top + 'px; height: ' + chatview_height + 'px;'">
   <block v-for="(item, index) in chatmsg_array" :key="index"> 
           <view class="cellview" style="flex-direction:row;">
             <view class="cellitem0" v-if="item.fromme==0">
              <image src="/static/images/msgfromother.png" style="width:40rpx;height:40rpx;"></image>
              </view>
              <text class="chatitem" v-if="item.fromme==0">{{item.StrTime}}->{{item.Name}}:({{item.Step}}){{item.Msg}}
              </text>
              <text class="chatitemfromme" v-if="item.fromme==1">{{item.StrTime}}->{{item.Name}}:({{item.Step}}){{item.Msg}}
              </text>
              <view class="cellitem1" v-if="item.fromme==1">
               <image src="/static/images/msgfromme.png" style="width:40rpx;height:40rpx;"></image>
              </view>
            </view>
      </block>
  </scroll-view>
  <view class="bottombtnview" v-if="showbottombtnview==1" :style="'flex-direction:row; top: ' + bottombtnview_top + 'px; height: ' + bottombtnview_height + 'px;'">
     <button class="bottombtn" @tap="btn_undo" :disabled="btn_undo_disabled">{{btn_undo_text}}</button>
    <button class="bottombtn" @tap="btn_pass" :disabled="btn_pass_disabled">{{btn_pass_text}}</button>
    <button class="bottombtn" @tap="btn_count" :disabled="btn_count_disabled">{{btn_count_text}}</button>
    <button class="bottombtn" @tap="btn_export" :disabled="btn_export_disabled">{{btn_export_text}}</button>
  </view>
  <icon type="success" :size="movebtn_width" class="movebtn" :style="'width: ' + movebtn_width + 'px; height: ' + movebtn_width + 'px; top: ' + movebtn_top + 'px; left: ' + movebtn_left + 'px;'" @tap="onClickMove" v-if="showmovebutton"></icon>
  <view class="bottombtnview" v-if="showbottombtnview==0" :style="'flex-direction:row; top: ' + bottombtnview_top + 'px; height: ' + bottombtnview_height + 'px;'">
        <button class="sendbtn" @tap="onSendMsgBack">返回</button>
        <input class="inputView" placeholder-class="input-holder" type="text" width="100rpx" name="inputimmsg" :value="inputimmsg" @input="inputimmsgInput" placeholder="请输入..."></input>
        <button class="sendbtn" @tap="onSendMsg">提交</button>
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
      <view class="btn-confirm" style="color: black;" @tap="btn_scanissue_submit" data-status="confirm">确定</view>
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

</view>
</template>

<script>
//index.js
import Board from '../../utils/board';
import WyGo from '../../utils/WyGo';
import ScanViewGoGame from './scanviewgogame';
const base = require("../../utils/Base.js"); //var wezrender = require('../../lib/wezrender');
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
var wygogame = null;

export default {
  data() {
    return {
      showad: false,
      option: null,
      gamemode: 0,
      ad_top: 0,
      ad_height: 0,
      commentview_top: 0,
      commentview_height: 0,
      bottomcomment_top: 0,
      bottomcomment_height: 0,
      gmboard_top: 0,
      bottombtnview_top: 0,
      gmboard_height: 0,
      bottombtnview_height: 0,
      winview_top: 0,
      winview_height: 0,
      movebtn_width: 50,
      movebtn_left: 100,
      movebtn_top: 200,
      canvasview: {
        width: 320,
        height: 320
      },
      black_nick: '黑方',
      white_nick: '白方',
      gameinfo: {
        black_killstones: 0,
        white_killstones: 0,
        black_time: '',
        white_time: '',
        curstep: 0
      },
      showbottombtnview: 1,
      inputimmsg: '',
      chatscrolltop: '',
      chatmsg_array: [],
      gamecomment: "Loading",
      bottomcomment: "请下棋",
      showcanvas: false,
      showstartview: false,
      showmovebutton: false,
      mycolor: BLACK,
      btn_fastprev_text: "<<",
      btn_fastprev_disabled: false,
      btn_prev_text: "<",
      btn_prev_disabled: false,
      btn_next_text: ">",
      btn_next_disabled: false,
      btn_fastnext_text: ">>",
      btn_fastnext_disabled: false,
      btn_count_text: "数子",
      btn_count_disabled: false,
      btn_ai_text: "AI",
      btn_ai_disabled: false,
      btn_more_text: "更多",
      btn_more_disabled: false,
      btn_exit_text: "退出",
      btn_exit_disabled: false,
      btn_pass_text: "PASS",
      btn_pass_disabled: false,
      btn_undo_text: "回退一手",
      btn_undo_disabled: false,
      btn_undo_text: "回退一手",
      btn_undo_disabled: false,
      btn_judgestatus_text: "形势判断",
      btn_judgestatus_disabled: false,
      btn_aifupan_text: "AI复盘",
      btn_aifupan_disabled: false,
      btn_aigomap_text: "AI变化图",
      btn_aigomap_disabled: false,
      btn_aiwinrate_text: "AI推荐",
      btn_aiwinrate_disabled: false,
      btn_kata_text: "Kata分析",
      btn_kata_disabled: false,
      btn_reporterr_text: "报告问题",
      btn_reporterr_disabled: false,
      btn_share_text: "分享",
      btn_share_disabled: false,
      showtopcomment: false,
      topcommenttext: "",
      showgameinfo: true,
      showchatview: true,
      inputview_top: 0,
      inputview_height: 0,
      showsgfpathview: false,
      sgfdownloadpath: "https://",
      btn_export_text: "导出SGF",
      btn_export_disabled: false,
      showscanissueview: false,
      reportissueinput: "",
      chatview_top: "",
      chatview_height: "",
      functionbtnview_top: "",
      functionbtnview_height: "",
      startview_top: "",
      startview_height: "",
      linechart_top: "",
      linechart_height: "",
      commentview_top_2: "",
      commentview_height_2: ""
    };
  },

  components: {},
  props: {},
  onShareAppMessage: function () {
    let thepath = "/pages/scan/scan";
    let thetitle = '拍照识棋,识别棋谱和死活题';
    return {
      title: thetitle,
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
    this.initPage();
  },
  onReady: function () {},
  onUnload: function () {
    if (wygogame != null) {
      wygogame = null;
    }
  },
  methods: {
    layout(adheight) {
      adheight = 0;
      let winwidth = uni.getSystemInfoSync().windowWidth;
      let winheight = uni.getSystemInfoSync().windowHeight;
      let diff = winheight - winwidth;
      let comment_top = adheight;
      let comment_height = diff * 0.15;
      let gameboardtop = comment_top + comment_height;
      let bottomcommenttop = winwidth + gameboardtop;
      let bottomcommentheight = (winheight - bottomcommenttop) * 0.1;
      let functionbtnviewtop = bottomcommenttop + bottomcommentheight;
      let functionbtnviewheight = (winheight - bottomcommenttop) * 0.15;
      let chatviewtop = functionbtnviewtop + functionbtnviewheight;
      let charviewheight = (winheight - bottomcommenttop) * 0.4;
      let bottombtnviewtop = chatviewtop + charviewheight;
      let bottombtnviewheight = winheight - bottombtnviewtop;
      let movebtnwidth = 50;

      if (movebtnwidth > bottombtnviewheight) {
        movebtnwidth = bottomcommentheight;
      }

      this.setData({
        canvasview: {
          width: winwidth,
          height: winwidth
        },
        commentview_top: comment_top,
        commentview_height: comment_height,
        gmboard_top: gameboardtop,
        gmboard_height: winwidth,
        chatview_top: chatviewtop,
        chatview_height: charviewheight,
        bottomcomment_top: bottomcommenttop,
        bottomcomment_height: bottomcommentheight,
        functionbtnview_top: functionbtnviewtop,
        functionbtnview_height: functionbtnviewheight,
        bottombtnview_top: bottombtnviewtop,
        bottombtnview_height: bottombtnviewheight,
        winview_top: bottombtnviewtop,
        winview_height: bottombtnviewheight - 20,
        movebtn_width: movebtnwidth,
        movebtn_top: functionbtnviewtop + functionbtnviewheight + movebtnwidth / 2,
        movebtn_left: winwidth / 2 - movebtnwidth / 2,
        startview_top: winheight * 0.33,
        startview_height: winheight * 0.33,
        linechart_top: chatviewtop,
        linechart_height: charviewheight,
        inputview_top: functionbtnviewtop,
        inputview_height: charviewheight + bottombtnviewheight,
        commentview_top_2: comment_top + comment_height / 2,
        commentview_height_2: comment_height / 2
      });
    },

    /*
    layout(adheight)
    {
    	adheight=0;
    	let winwidth=uni.getSystemInfoSync().windowWidth;
       		let winheight=uni.getSystemInfoSync().windowHeight;
       		let diff=winheight-winwidth;
       		let comment_top=adheight;
       		let comment_height=diff*0.33;
       		let gameboardtop=comment_top+comment_height;
       		let bottomcommenttop=winwidth+gameboardtop;
       		let bottomcommentheight=(winheight-bottomcommenttop)*0.5;
       		let bottombtnviewtop=winwidth+gameboardtop+bottomcommentheight;
       		let bottombtnviewheight=winheight-bottombtnviewtop;
       		let movebtnwidth=50;
       		if(movebtnwidth>bottombtnviewheight)
       		{
       			movebtnwidth=bottomcommentheight;
       		}
        		this.setData({
        			   	canvasview: {width:winwidth, height:winwidth},
        			   	commentview_top: comment_top,
        			   	commentview_height: comment_height,
        			   	gmboard_top: gameboardtop,
    		gmboard_height: winwidth,
    		bottomcomment_top: bottomcommenttop,
    		bottomcomment_height: bottomcommentheight,
    		bottombtnview_top: bottombtnviewtop,
    		bottombtnview_height: bottombtnviewheight,
    		winview_top: bottombtnviewtop,
    		winview_height: bottombtnviewheight-20,
    		movebtn_width: movebtnwidth,
    		movebtn_top: bottomcommenttop+(bottomcommentheight-movebtnwidth)/2,
    		movebtn_left: winwidth/2-movebtnwidth/2,
    		startview_top: winheight*0.33,
    		startview_height: winheight*0.33
         			});
    	},*/
    initPage() {
      var that = this;
      uni.setNavigationBarTitle({
        title: '拍照识棋'
      });
      this.layout(30);
      this.setData({
        showcanvas: true
      });
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
      this.startGame();
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
    addImg: function () {
      wygogame.addStone(10, 10, 1);
    },
    removeImg: function () {
      gameboard.deleteStone(10, 10);
    },
    touchBegin: function (event) {
      console.log(event);

      if (wygogame != null) {
        wygogame.touchBegin(event);
      }
    },
    touchEnd: function (event) {
      console.log(event);

      if (wygogame != null) {
        wygogame.touchEnd(event);
      }
    },
    btn_fastprev: function () {
      wygogame.btn_fastprev();
    },
    btn_prev: function () {
      wygogame.btn_prev();
    },
    btn_next: function () {
      wygogame.btn_next();
    },
    btn_fastnext: function () {
      wygogame.btn_fastnext();
    },
    btn_undo: function () {
      wygogame.btn_undo();
    },
    btn_pass: function () {
      wygogame.btn_pass();
    },
    btn_count: function () {
      wygogame.btn_count();
    },
    btn_AI: function () {
      wygogame.btn_AI();
    },
    btn_kata: function () {
      wygogame.btn_kata();
    },
    btn_more: function () {
      wygogame.btn_more();
    },
    btn_commenttext: function () {
      uni.showModal({
        title: '信息',
        content: this.topcommenttext,
        success: function (res) {}
      });
    },
    btn_judgestatus: function () {
      wygogame.btn_judgestatus();
    },
    btn_aifupan: function () {
      wygogame.btn_aifupan();
    },
    btn_aigomap: function () {
      wygogame.btn_aigomap();
    },
    btn_aiwinrate: function () {
      wygogame.btn_aiwinrate();
    },
    onClickMove: function () {
      wygogame.onClickMove();
    },

    showMoveButton(bshow) {
      this.setData({
        showmovebutton: bshow
      });
    },

    onSendMsg: function () {
      wygogame.onSendMsg(this.inputimmsg);
    },
    onSendMsgBack: function () {
      wygogame.onSendMsgBack(this.inputimmsg);
    },
    inputimmsgInput: function (e) {
      this.setData({
        inputimmsg: e.detail.value
      });
    },
    startGame: function () {
      let scanresult = JSON.parse(this.option.scanresult);
      let sgfpath = scanresult.sgfpath;
      this.setData({
        sgfdownloadpath: sgfpath
      });
      wygogame = new ScanViewGoGame(this, this.option.scanresult);
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
    btn_export: function () {
      this.setData({
        showsgfpathview: true
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
    reportissueInput: function (e) {
      this.setData({
        reportissueinput: e.detail.value
      });
    },
    btn_scanissue_submit: function () {
      wygogame.btn_scanissue_submit(this.reportissueinput);
    }
  }
};
</script>
<style>
@import "./scanviewgame.css";
</style>