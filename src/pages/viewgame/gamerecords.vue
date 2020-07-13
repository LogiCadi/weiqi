<template>
<view class="page" xmlns:wx="http://www.w3.org/1999/xhtml">
      <view class="view_center">
          <view class="page__desc" style="align-items: center; color:black;">{{gamerecords_count}}</view>
      </view>
      <view style="width:100%;height:61rpx;">
           <view class="cellview" style="flex-direction:row;">
              <view class="cellitem1">时间</view>
              <view class="cellitem2">黑方</view>
              <view class="cellitem3">白方</view>
              <view class="cellitem4">结果</view>
              <view class="cellitem5">查看</view>
            </view>
        </view> 
      <block v-for="(item, index) in games_array" :key="index"> 
           <view class="cellview" style="flex-direction:row;">
              <view class="cellitem1">{{item.GameEndTime}}</view>
              <view class="cellitem2">{{item.BlackUserNick}}</view>
              <view class="cellitem3">{{item.WhiteUserNick}}</view>
              <view class="cellitem4">{{item.WinText}}</view>
              <view class="cellitem5">
                   <button class="commonbtn" :data-gamestarttime="item.GameStartTime" :data-blackuserid="item.BlackUserID" :data-whiteuserid="item.WhiteUserID" :data-blackplayer="item.BlackUserNick" :data-whiteplayer="item.WhiteUserNick" @tap="viewgamerecord">查看</button>
              </view>
            </view>
      </block>
      <button v-if="history==0" class="weui-btn mini-btn" style="width:100%;" type="primary" size="mini" @tap="onViewHisGameRecord">历史对局记录</button>
</view>
</template>

<script>
var app = getApp();
const base = require("../../utils/Base.js"); // 微信提供的接口地址：这里必须要把https://api.weixin.qq.com这个网址在微信后台安全域名中添加进去否则你会  
// 感觉生活是如此的黑暗完全看不到希望
// 微信提供的接口地址：这里必须要把https://api.weixin.qq.com这个网址在微信后台安全域名中添加进去否则你会  
// 感觉生活是如此的黑暗完全看不到希望  
var BLANK = 0; //空格的颜色
//空格的颜色
var WHITE = 1; //白色
//白色
var BLACK = 2;

export default {
  data() {
    return {
      history: false,
      gamerecords_count: '',
      games_array: []
    };
  },

  components: {},
  props: {},
  onLoad: function (option) {
    uni.setNavigationBarTitle({
      title: '对局记录'
    });
    var that = this;
    this.setData({
      history: option.history
    });
    this.initPage();
  },
  methods: {
    getGameRecords: function (ishistory) {
      if (app.globalData.userid > 0) {
        this.showLoading();
        var that = this;
        let count = 1000;

        if (ishistory) {
          count = -1;
        }

        let getuserid = 1211408;
        getuserid = app.globalData.userid;
        let theurl = "https://www.gog361.com/cgi-bin/listgamerecord?getuserid=" + getuserid + "&count=" + count;
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
            that.cancelLoading();

            if (res.data.retobj.retcode >= 0) {
              let gamerecords = res.data.gamerecords;
              that.setData({
                gamerecords_count: '对局记录数: ' + gamerecords.length
              });

              for (let i = 0; i < gamerecords.length; i++) {
                if (gamerecords[i].WinColor == BLACK) {
                  gamerecords[i].WinText = "黑方胜";
                } else if (gamerecords[i].WinColor == WHITE) {
                  gamerecords[i].WinText = "白方胜";
                } else {
                  gamerecords[i].WinText = "无胜负";
                }
              }

              that.setData({
                games_array: gamerecords
              });
            } else if (res.data.code == -100) {
              uni.showModal({
                title: '提示',
                content: '你没有没有权限'
              });
            }
          },
          fail: function (res) {
            uni.showModal({
              title: '提示',
              content: '下载棋谱失败'
            });
            that.cancelLoading();
            app.globalData.renewSessionKey();
          }
        });
      }
    },
    initPage: function (event) {
      let his = parseInt(this.history);
      this.setData({
        history: his
      });
      this.getGameRecords(his);
    },
    showLoading: function () {
      uni.showLoading({
        title: '加载中'
      });
    },
    cancelLoading: function () {
      uni.hideLoading();
    },
    startviewgame: function (gamestarttime, blackplayer, whiteplayer, blackuserid, whiteuserid) {
      let theurl = "./viewgame?gamemode=0&gamestarttime=" + gamestarttime + "&blackuserid=" + blackuserid + "&whiteuserid=" + whiteuserid + "&blackplayer=" + blackplayer + "&whiteplayer=" + whiteplayer + "&history=" + this.history;
      uni.navigateTo({
        url: theurl
      });
    },
    viewgamerecord: function (event) {
      let gamestarttime = event.currentTarget.dataset.gamestarttime;
      let blackuserid = event.currentTarget.dataset.blackuserid;
      let whiteuserid = event.currentTarget.dataset.whiteuserid;
      let blackplayer = event.currentTarget.dataset.blackplayer;
      let whiteplayer = event.currentTarget.dataset.whiteplayer;
      this.startviewgame(gamestarttime, blackplayer, whiteplayer, blackuserid, whiteuserid);
    },
    onViewHisGameRecord: function (event) {
      this.setData({
        history: 1
      });
      this.getGameRecords(1);
    }
  }
};
</script>
<style>
@import "./gamerecords.css";
</style>