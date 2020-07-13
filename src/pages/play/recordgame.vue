<template>
<!--index.wxml-->
<view class="allview" catchtouchmove="preventScroll">
  <ad class="joygoad" v-if="showad" unit-id="adunit-3d98c96fef501b5d"></ad>
  <view class="gmboard" :style="'top: ' + gmboard_top + 'px; height: ' + gmboard_height + 'px;'" catchtouchmove="preventScroll">
  <canvas v-if="showcanvas" :style="'width:' + canvasview.width + 'px;height:' + canvasview.height + 'px;'" canvas-id="image-canvas-1" catchtouchmove="preventScroll" @touchstart="touchBegin" @touchend="touchEnd"></canvas>
  </view>
  <view class="commentview" v-if="showtopcomment" :style="'top: ' + commentview_top + 'px; height: ' + commentview_height + 'px;'">
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
    <button class="functionbtn" @tap="btn_judgestatus" :disabled="btn_judgestatus_disabled">{{btn_judgestatus_text}}</button>
    <button class="functionbtn" @tap="btn_aifupan" :disabled="btn_aifupan_disabled">{{btn_aifupan_text}}</button>
    <button class="functionbtn" @tap="btn_aigomap" :disabled="btn_aigomap_disabled">{{btn_aigomap_text}}</button>
    <button class="functionbtn" @tap="btn_aiwinrate" :disabled="btn_aiwinrate_disabled">{{btn_aiwinrate_text}}</button>
    <button class="functionbtn" @tap="btn_kata" :disabled="btn_kata_disabled">{{btn_kata_text}}</button>
    <button class="functionbtn" @tap="btn_share" open-type="share" :disabled="btn_share_disabled">{{btn_share_text}}</button>
  </view>
   <view class="linechartview" v-if="showlinecanvas" :style="'top:' + linechart_top + 'px; height: ' + linechart_height + 'px;'" catchtouchmove="preventScroll" catchtouchstart="touchLineChartBegin">
   <canvas :style="'width:' + canvasview.width + 'px; top:0px; height: 100%;'" canvas-id="mylinechart" catchtouchmove="preventScroll" @touchmove="touchLineChartBegin" @touchstart="touchBegin" @touchend="touchEnd"></canvas>
   </view>
  <view class="bottombtnview" :style="'flex-direction:row; top: ' + bottombtnview_top + 'px; height: ' + bottombtnview_height + 'px;'">
    <button class="bottombtn" @tap="btn_undo" :disabled="btn_undo_disabled">{{btn_undo_text}}</button>
    <button class="bottombtn" @tap="btn_pass" :disabled="btn_pass_disabled">{{btn_pass_text}}</button>
    <button class="bottombtn" @tap="btn_count" :disabled="btn_count_disabled">{{btn_count_text}}</button>
    <button class="bottombtn" @tap="btn_resign" :disabled="btn_resign_disabled">{{btn_resign_text}}</button>
    <button class="bottombtn" @tap="btn_back" :disabled="btn_back_disabled">{{btn_back_text}}</button>
  </view>
  <icon type="success" :size="movebtn_width" class="movebtn" :style="'width: ' + movebtn_width + 'px; height: ' + movebtn_width + 'px; top: ' + movebtn_top + 'px; left: ' + movebtn_left + 'px;'" @tap="onClickMove" v-if="showmovebutton"></icon>

   <view class="startgame-dialog" :style="'top: ' + startview_top + 'px; height: ' + startview_height + 'px;'" v-if="showstartview">
    <view class="modal-title">设置人机对弈</view>
    <view class="modal-content">  
         <view class="title_container" style="width: 50%;">
            <view>{{rangzitext}}</view>
            <picker @change="bindPickerChangeRangZi" :value="rangziindex" :range="rangziarray">
                <button class="weui-btn mini-btn" type="primary" size="mini">让子</button>
            </picker>
        </view>
        <view class="title_container" style="width: 50%;">
              <view>{{mycolortext}}</view>
              <picker @change="bindPickerChangeMyColor" :value="mycolorindex" :range="mycolorarray">
                <button class="weui-btn mini-btn" type="primary" size="mini">选择</button>
              </picker>
          </view>
    </view>
    <view class="modal-footer">
      <view class="btn-confirm" style="color: black;" @tap="onStartCancel" data-status="cancel">取消</view>
      <view class="btn-confirm" style="color: black;" @tap="onStartConfirm" data-status="confirm">确定</view>
    </view>
  </view>

</view>
</template>

<script>
//index.js
import Board from '../../utils/board';
import WyGo from '../../utils/WyGo';
import WyGoGame from './gogame';
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
      gameinfo: {
        black_killstones: 0,
        white_killstones: 0,
        black_time: '',
        white_time: '',
        curstep: 0
      },
      mycolorarray: ['黑棋', '白棋'],
      rangziarray: ['让2子', '让3子', '让4子', '让5子', '让6子', '让7子', '让8子', '让9子', '不让子'],
      gamecomment: "Loading",
      bottomcomment: "",
      showcanvas: false,
      showstartview: false,
      showmovebutton: false,
      mycolortext: "您执黑",
      rangzitext: "分先",
      mycolor: BLACK,
      rangzinumber: 0,
      rangziindex: 0,
      btn_undo_text: "悔棋",
      btn_undo_disabled: false,
      btn_pass_text: "PASS",
      btn_pass_disabled: false,
      btn_resign_text: "认输",
      btn_resign_disabled: false,
      btn_count_text: "数子",
      btn_count_disabled: false,
      btn_ai_text: "AI",
      btn_ai_disabled: false,
      btn_back_text: "返回",
      btn_back_disabled: false,
      btn_judgestatus_text: "形势判断",
      btn_judgestatus_disabled: false,
      btn_aifupan_text: "AI复盘",
      btn_aifupan_disabled: false,
      btn_aigomap_text: "AI变化图",
      btn_aigomap_disabled: false,
      btn_aiwinrate_text: "AI建议",
      btn_aiwinrate_disabled: false,
      btn_kata_text: "Kata分析",
      btn_kata_disabled: false,
      btn_share_text: "分享",
      btn_share_disabled: false,
      showtopcomment: false,
      topcommenttext: "",
      showgameinfo: true,
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
    let thepath = "/pages/play/renji?type=0&fromuserid=" + app.globalData.userid;
    return {
      title: '强如职业棋手的Leela Zero，不眠不休陪伴你',
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
        commentview_top_2: comment_top + comment_height / 2,
        commentview_height_2: comment_height / 2
      });
    },

    initPage() {
      var that = this;
      this.setData({
        gamemode: parseInt(this.option.gamemode)
      });
      uni.setNavigationBarTitle({
        title: '录入棋谱'
      });

      if (false) {
        var query = uni.createSelectorQuery(); //选择id

        var that = this;
        query.select('.joygoad').boundingClientRect(function (rect) {
          if (rect != null) {
            that.layout(rect.height);
          } else {
            that.layout(0);
          }
        }).exec();
      } else {
        this.layout(30);
      }

      let gamesavedkey = "renji" + this.gamemode;
      let moves = uni.getStorageSync(gamesavedkey);

      if (typeof moves != "undefined" && moves != null && base.isArray(moves) && moves.length > 0) {
        this.setData({
          showstartview: false,
          showcanvas: true
        });
        wygogame = new WyGoGame(this, this.gamemode, this.mycolor, this.rangzinumber, moves);
      } else {
        if (this.gamemode == 1) {
          this.setData({
            showstartview: false,
            showcanvas: true
          });
          wygogame = new WyGoGame(this, this.gamemode, BLACK, 0, null);
        } else {
          this.setData({
            showstartview: true,
            showcanvas: false
          });
        }
      }

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
      wygogame.touchBegin(event);
    },
    touchEnd: function (event) {
      console.log(event);
      wygogame.touchEnd(event);
    },
    btn_undo: function () {
      wygogame.btn_undo();
    },
    btn_pass: function () {
      wygogame.btn_pass();
    },
    btn_resign: function () {
      wygogame.btn_resign();
    },
    btn_count: function () {
      wygogame.btn_count();
    },
    btn_AI: function () {
      wygogame.btn_AI();
    },
    btn_back: function () {
      if (wygogame != null) {
        wygogame.btn_back();
      } else {
        uni.navigateBack();
      }
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
    btn_kata: function () {
      wygogame.btn_kata();
    },
    onClickMove: function () {
      wygogame.onClickMove();
    },
    onStartCancel: function () {
      uni.navigateBack();
    },
    onStartConfirm: function () {
      this.setData({
        showstartview: false,
        showcanvas: true
      });
      wygogame = new WyGoGame(this, this.gamemode, this.mycolor, this.rangzinumber, null);
    },

    showMoveButton(bshow) {
      this.setData({
        showmovebutton: bshow
      });
    },

    bindPickerChangeRangZi: function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value);
      let temp = parseInt(e.detail.value);
      let text = '分先对局';

      if (temp < 8) {
        temp = temp + 2;
        text = '让' + temp + "子对局";
      }

      this.setData({
        rangzinumber: parseInt(e.detail.value) + 2,
        rangzitext: text
      });
    },
    bindPickerChangeMyColor: function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value);
      let temp = parseInt(e.detail.value);
      let mycol = 2 - temp;
      let mycoltext = "您执黑";

      if (mycol == WHITE) {
        mycoltext = "您执白";
      }

      this.setData({
        mycolor: mycol,
        mycolortext: mycoltext
      });
    }
  }
};
</script>
<style>
@import "./recordgame.css";
</style>