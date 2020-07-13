<template>
<view class="page" xmlns:wx="http://www.w3.org/1999/xhtml">
  <view class="weui-cells__title"></view>
  <view :class="hideclass1">
  <button type="primary" open-type="getUserInfo" style="position: fixed; top:33%; width:100%" @tap="openTiku">开启忘忧围棋</button>
  </view>
  <view :class="hideclass2">
      <view style="width:100%;height:61rpx;">
         <view class="cellview" style="flex-direction:row;">
            <view class="livecellitem1">比赛</view>
            <view class="livecellitem2">黑方</view>
            <view class="livecellitem3">白方</view>
            <view class="livecellitem4">状态</view>
            <view class="livecellitem5"> </view>
          </view>
      </view> 
      <span style="font-family:'Comic Sans MS';font-size:18px;">
      <block v-for="(item, index) in livelist" :key="index"> 
        <view class="livecellview" style="flex-direction:row;">
        <view class="livecellitem1">{{item.title}}</view>
        <view class="livecellitem2">{{item.blackplayer}}</view>
        <view class="livecellitem3">{{item.whiteplayer}}</view>
        <view class="livecellitem4">{{item.statusinfo}}</view>
        <view class="livecellitem5">
             <button class="commonbtn" :data-date="item.date" :data-url="item.url" :data-title="item.title" :data-blackplayer="item.blackplayer" :data-whiteplayer="item.whiteplayer" :data-blackuserid="item.blackuserid" :data-whiteuserid="item.whiteuserid" @tap="viewlivegame">进入</button>
        </view>
      </view>
      </block>
    </span>
      </view>
</view>
</template>

<script>
//index.js
import Board from '../../utils/board';
import WyGo from '../../utils/WyGo';
import joygoengine from './joygoengine';
const base = require("../../utils/Base.js");
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
      hideclass1: 'hideview',
      hideclass2: 'showview',
      showinvitefriend: true,
      livelist: [],
      sliderOffset: "",
      activeIndex: ""
    };
  },

  components: {},
  props: {},
  onShareAppMessage: function () {
    let thepath = "/pages/netgame/live?type=0&fromuserid=" + app.globalData.userid;
    return {
      title: '最近职业对局',
      imageUrl: '/',
      path: thepath
    };
  },
  onPullDownRefresh: function () {
    this.initPage();
    uni.stopPullDownRefresh();
  },
  onLoad: function (option) {
    uni.setNavigationBarTitle({
      title: '最近职业对局'
    });
    this.option = option;
    this.initPage();
  },
  onShow: function () {},
  onReady: function () {},
  onUnload: function () {},
  methods: {
    initPage() {
      var that = this;

      if (app.globalData.userid > 0) {
        this.setData({
          hideclass1: 'hideview'
        });
        this.setData({
          hideclass2: 'showview'
        });
        this.startlogin();
        this.checkOption();
        let offsetLeft = uni.getStorageSync("netmain_offsetLeft");
        let activeindex = uni.getStorageSync("netmain_activeIndex");
        this.setData({
          sliderOffset: offsetLeft,
          activeIndex: activeindex
        });
        this.loadLiveList();
      } else {
        this.setData({
          hideclass1: 'showview'
        });
        this.setData({
          hideclass2: 'hideview'
        });
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

    startlogin() {
      if (app.globalData.joygoengine != null) {
        if (app.globalData.joygoengine.IsLogined()) {} else {
          app.globalData.joygoengine.checkLogin();
        }
      } else {}
    },

    OnLogin_Ret(msg) {},

    showLoading: function () {
      uni.showLoading({
        title: '加载中'
      });
    },
    cancelLoading: function () {
      uni.hideLoading();
    },

    showview() {
      this.cancelLoading();
      this.initPage();
      uni.showModal({
        title: '提示',
        content: '如果您已经有忘忧围棋账号,可以进入我的页面绑定已有账号。'
      });
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

      if (this.option.type == 2) //view live game
        {
          let url = this.option.url;
          let date = this.option.date;
          let title = this.option.title;
          let blackplayer = this.option.blackplayer;
          let whiteplayer = this.option.whiteplayer;
          let blackuserid = this.option.blackuserid;
          let whiteuserid = this.option.whiteuserid;
          this.startviewlivegame(url, date, title, blackplayer, whiteplayer, blackuserid, whiteuserid);
        }

      return false;
    },
    startviewlivegame: function (url, date, title, blackplayer, whiteplayer, blackuserid, whiteuserid) {
      let theurl = "../viewgame/viewgame?gamemode=1&title=" + title + "&date=" + date + "&url=" + url + "&blackplayer=" + blackplayer + "&whiteplayer=" + whiteplayer + "&blackuserid=" + blackuserid + "&whiteuserid=" + whiteuserid;
      uni.navigateTo({
        url: theurl
      });
    },
    viewlivegame: function (event) {
      let url = event.currentTarget.dataset.url;
      let date = event.currentTarget.dataset.date;
      let title = event.currentTarget.dataset.title;
      let blackplayer = event.currentTarget.dataset.blackplayer;
      let whiteplayer = event.currentTarget.dataset.whiteplayer;
      let blackuserid = event.currentTarget.dataset.blackuserid;
      let whiteuserid = event.currentTarget.dataset.whiteuserid;
      let theurl = "../viewgame/viewgame?gamemode=1&title=" + title + "&date=" + date + "&url=" + url + "&blackplayer=" + blackplayer + "&whiteplayer=" + whiteplayer + "&blackuserid=" + blackuserid + "&whiteuserid=" + whiteuserid;
      uni.navigateTo({
        url: theurl
      });
    },

    loadLiveList() {
      if (app.globalData.userid > 0) {
        this.showLoading();
        var that = this;
        let theurl = "https://www.gog361.com/livegames.json";
        uni.request({
          url: theurl,
          header: {
            'content-type': 'application/json'
          },
          //请求后台数据成功  
          success: function (res) {
            that.cancelLoading();
            let array = res.data;

            for (let i = 0; i < array.length; i++) {
              array[i].statusinfo = "";

              if (array[i].status == 1) {
                array[i].statusinfo = "未开始";
              } else if (array[i].status == 2) {
                array[i].statusinfo = "直播中";
              } else if (array[i].status == 3) {
                array[i].statusinfo = array[i].result;
              }
            }

            that.setData({
              livelist: array
            });
          },
          fail: function () {
            that.cancelLoading();
          }
        });
      }
    }

  }
};
</script>
<style>
@import "./live.css";
</style>