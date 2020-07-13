<template>
<view class="page" xmlns:wx="http://www.w3.org/1999/xhtml">
  <view class="weui-cells__title"></view>
  <view :class="hideclass1">
  <button type="primary" open-type="getUserInfo" style="position: fixed; top:33%; width:100%" @tap="openTiku">开启忘忧围棋</button>
  </view>
  <view :class="hideclass2">
    <view class="weui-tab">
          <view class="weui-navbar">
              <block v-for="(item, index) in tabs" :key="index">
                  <view :id="index" :class="'weui-navbar__item ' + (activeIndex == index ? 'weui-bar__item_on' : '')" @tap="tabClick">
                      <view class="weui-navbar__title">{{item}}</view>
                  </view>
              </block>
              <view class="weui-navbar__slider" :style="'width:50%;left: ' + sliderLeft + 'px; transform: translateX(' + sliderOffset + 'px); -webkit-transform: translateX(' + sliderOffset + 'px);'"></view>
          </view>
          <view class="weui-tab__panel">
              <view class="weui-tab__content" :hidden="activeIndex != 0">
                  <view class="page__hd">
                      <view class="weui-cells__title" style="width:100%;height:61rpx;" v-if="showinvitefriend">由系统自动匹配玩家进行对弈</view>
                      <view class="view_center">
                        <button class="pagebtn" @tap="onStartAutoMatch">{{automatchbtn_text}}{{onlineusersinfo}}</button>
                      </view>
                      <view v-if="showinvitefriend">
                      <view class="weui-cells__title">通过邀请自己的微信或群的好友进行对弈</view>
                      <view class="view_center">
                        <button class="pagebtn" open-type="share" @tap="onStartInviteMatch">邀请好友对弈</button>
                      </view>
                      </view>
                      <view class="weui-cells__title">个人的人机对弈和网络对弈记录</view>
                      <view class="view_center">
                        <button class="pagebtn" @tap="onViewGameRecord">对局记录</button>
                      </view>
                   </view>
                  </view>
              </view>
              <view class="weui-tab__content" :hidden="activeIndex != 1">  
                  <view style="width:100%;height:61rpx;">
                     <view class="cellview" style="flex-direction:row;">
                        <view class="cellitem1">黑方</view>
                        <view class="cellitem2">白方</view>
                        <view class="cellitem3">手数</view>
                        <view class="cellitem4"> </view>
                      </view>
                  </view> 
                  <span style="font-family:'Comic Sans MS';font-size:18px;">
                  <block v-for="(item, index) in desklist" :key="index"> 
                    <view class="cellview" style="flex-direction:row;">
                    <view class="cellitem1">{{item.BNick}}</view>
                    <view class="cellitem2">{{item.WNick}}</view>
                    <view class="cellitem3">{{item.RZ}}</view>
                    <view class="cellitem4">
                         <button class="commonbtn" :data-gamedeskid="item.GameDeskID" :data-blackuserid="item.BID" :data-whiteuserid="item.WID" @tap="viewnetgame">旁观</button>
                    </view>
                  </view>
                  </block>
                </span>
              </view>
          </view>
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
      tabs: ["在线练习", "观战"],
      activeIndex: 0,
      sliderOffset: 0,
      sliderLeft: 0,
      hideclass1: 'hideview',
      hideclass2: 'showview',
      onlineusersinfo: '',
      automatchbtn_text: '自动匹配对弈',
      showinvitefriend: true,
      desklist: [],
      livelist: []
    };
  },

  components: {},
  props: {},
  onShareAppMessage: function () {
    let curroomid = app.globalData.joygoengine.GetCurRoomID();
    let time = base.getTime();
    let svrtime = app.globalData.joygoengine.LocalTimeToSvrTime(time);
    let thepath = "/pages/netgame/netmain?type=100&fromuserid=" + app.globalData.userid + "&roomid=" + curroomid + "&svrtime=" + svrtime;
    let thetitle = "你的好友" + app.globalData.userInfo.nickName + "邀请你进行网络对弈";
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
    this.thedesklist = [];
    this.sorteddesklist = [];
    this.curroomid = 0;
    uni.setNavigationBarTitle({
      title: '网络练习场'
    });
    this.option = option;
    /*this.option.type=100;
    this.option.fromuserid=10137;
    this.option.curroomid=0;
    let time=base.getTime();
    //let svrtime=app.joygoengine.LocalTimeToSvrTime(time);
    this.option.svrtime=time;*/

    this.initPage();
  },
  onShow: function () {
    if (app.globalData.joygoengine != null) {
      if (app.globalData.joygoengine.hasCurrGame()) {
        this.setData({
          automatchbtn_text: '进入进行中对局',
          showinvitefriend: false
        });
      } else {
        this.setData({
          automatchbtn_text: '自动匹配对弈',
          showinvitefriend: true
        });
      }
    }
  },
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

        if (activeindex == 1) {
          this.showLoading();
        }
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

    tabClick: function (e) {
      let index = parseInt(e.currentTarget.id);

      if (index == 1 && this.activeIndex != 1) {
        this.startloadviewgame();
      }

      this.setData({
        sliderOffset: e.currentTarget.offsetLeft,
        activeIndex: index
      });
      uni.setStorage({
        key: 'netmain_activeIndex',
        data: index
      });
      uni.setStorage({
        key: 'netmain_offsetLeft',
        data: e.currentTarget.offsetLeft
      });
    },
    preventTouchMove: function () {},

    startlogin() {
      if (app.globalData.joygoengine != null) {
        app.globalData.joygoengine.setRoomDeskList(this);

        if (this.option.type == 100) {
          if (app.globalData.joygoengine.LocalTimeToSvrTime(base.getTime()) - this.option.svrtime < 12000) {
            app.globalData.joygoengine.setInviteInfo(this.option.fromuserid, this.option.roomid);
          }
        }

        if (app.globalData.joygoengine.IsLogined()) {
          app.globalData.joygoengine.checkCurrentGame();
        } else {
          app.globalData.joygoengine.checkLogin();
        }
      } else {
        app.globalData.joygoengine = new joygoengine(this);

        if (this.option.type == 100) {
          if (app.globalData.joygoengine.LocalTimeToSvrTime(base.getTime()) - this.option.svrtime < 12000) {
            app.globalData.joygoengine.setInviteInfo(this.option.fromuserid, this.option.roomid);
          }
        }

        app.globalData.joygoengine.setRoomDeskList(this);
        app.globalData.joygoengine.init();
      }
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
    onStartAdvAI: function () {
      let theurl = "./renjigame?gamemode=0";
      uni.navigateTo({
        url: theurl
      });
    },
    onStartAdvAIEx: function () {
      let theurl = "./renjigame?gamemode=1";
      uni.navigateTo({
        url: theurl
      });
    },
    onViewGameRecord: function () {
      let theurl = "../viewgame/gamerecords?history=0";
      uni.navigateTo({
        url: theurl
      });
    },
    openTiku: function () {
      this.showLoading();
      app.globalData.getUserInfo(this.showview);
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

      if (this.option.type == 1) //view qipu
        {
          let userid = app.globalData.userid;
          let gamestarttime = this.option.gamestarttime;
          let blackuserid = this.option.blackuserid;
          let whiteuserid = this.option.whiteuserid;
          let history = this.option.history;
          this.startviewgame(gamestarttime, blackuserid, whiteuserid, history);
          return true;
        } else if (this.option.type == 2) //view live game
        {
          let url = this.option.url;
          let date = this.option.date;
          let title = this.option.title;
          let blackplayer = this.option.blackplayer;
          let whiteplayer = this.option.whiteplayer;
          let blackuserid = this.option.blackuserid;
          let whiteuserid = this.option.whiteuserid;
          this.startviewlivegame(url, date, title, blackplayer, whiteplayer, blackuserid, whiteuserid);
        } else if (this.option.type == 3) //view net game
        {
          let roomid = this.option.roomid;
          let gamedeskid = this.option.gamedeskid;
          let blackuserid = this.option.blackuserid;
          let whiteuserid = this.option.whiteuserid;
          let theurl = "../netgame/viewnetgame?roomid=" + roomid + "&gamedeskid=" + gamedeskid + "&blackuserid=" + blackuserid + "&whiteuserid=" + whiteuserid;
          uni.navigateTo({
            url: theurl
          });
        }

      return false;
    },
    startviewgame: function (gamestarttime, blackuserid, whiteuserid, history) {
      let theurl = "../viewgame/viewgame?gamemode=0&gamestarttime=" + gamestarttime + "&blackuserid=" + blackuserid + "&whiteuserid=" + whiteuserid + "&history=" + history;
      uni.navigateTo({
        url: theurl
      });
    },
    startviewlivegame: function (url, date, title, blackplayer, whiteplayer, blackuserid, whiteuserid) {
      let theurl = "../viewgame/viewgame?gamemode=1&title=" + title + "&date=" + date + "&url=" + url + "&blackplayer=" + blackplayer + "&whiteplayer=" + whiteplayer + "&blackuserid=" + blackuserid + "&whiteuserid=" + whiteuserid;
      uni.navigateTo({
        url: theurl
      });
    },
    onStartAutoMatch: function (event) {
      let theurl = "./netgame?gamemode=0&fromtype=0"; //

      uni.navigateTo({
        url: theurl
      });
    },
    onStartInviteMatch: function (event) {
      let theurl = "./netgame?gamemode=0&&fromtype=1";
      uni.navigateTo({
        url: theurl
      });
    },
    onViewGameRecord: function () {
      let theurl = "../viewgame/gamerecords?history=0";
      uni.navigateTo({
        url: theurl
      });
    },
    viewnetgame: function (event) {
      let gamedeskid = parseInt(event.currentTarget.dataset.gamedeskid);
      let blackuserid = parseInt(event.currentTarget.dataset.blackuserid);
      let whiteuserid = parseInt(event.currentTarget.dataset.whiteuserid);
      let theurl = "../netgame/viewnetgame?roomid=" + this.curroomid + "&gamedeskid=" + gamedeskid + "&blackuserid=" + blackuserid + "&whiteuserid=" + whiteuserid;
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

    startloadviewgame() {
      this.showLoading();
      app.globalData.joygoengine.listroom0();
    },

    sortdesklist: function () {
      this.sorteddesklist.length = 0;
      let i = 0,
          j = 0;

      for (i = 0; i < this.thedesklist.length; i++) {
        if (this.thedesklist[i].BID > 0 && this.thedesklist[i].WID > 0) {
          this.sorteddesklist.push(this.thedesklist[i]);
        }
      }

      i = 0;

      for (i = 0; i < this.sorteddesklist.length; i++) for (j = i + 1; j < this.sorteddesklist.length; j++) {
        if (this.sorteddesklist[i].BScore + this.sorteddesklist[i].WScore < this.sorteddesklist[j].BScore + this.sorteddesklist[j].WScore) {
          let a = this.sorteddesklist[i];
          this.sorteddesklist[i] = this.sorteddesklist[j];
          this.sorteddesklist[j] = a;
        }
      }

      i = 0;

      for (i = 0; i < this.sorteddesklist.length; i++) {
        this.sorteddesklist[i].BNick = this.sorteddesklist[i].BNick + " " + base.GetLevelStr(this.sorteddesklist[i].BScore);
        this.sorteddesklist[i].WNick = this.sorteddesklist[i].WNick + " " + base.GetLevelStr(this.sorteddesklist[i].WScore);
      }
    },
    OnUpdateGameDeskList: function (roomID, thedesklist) {
      //需要排序下
      this.thedesklist = thedesklist;
      this.sortdesklist();
      this.setData({
        desklist: this.sorteddesklist
      });
      this.cancelLoading();
    },
    OnUpdateGameDeskInfo: function (gamedeskinfo) {
      //根据排序情况再更新
      if (gamedeskinfo.RoomID == this.curroomid) {
        this.thedesklist[gamedeskinfo.GameDeskID] = gamedeskinfo;
        this.sortdesklist();
        this.setData({
          desklist: this.sorteddesklist
        });
      }
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
@import "./netmain.css";
</style>