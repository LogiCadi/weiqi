<template>
  <view class="page" xmlns:wx="http://www.w3.org/1999/xhtml">
    <view class="title">忘忧围棋</view>
    <view :class="hideclass1">
      <button
        type="primary"
        open-type="getUserInfo"
        style="position: fixed; top:33%; width:100%"
        @tap="openTiku"
      >开启忘忧围棋</button>
    </view>
    <view :class="hideclass2">
      <view class="page__hd" style="padding-top: 0px;">
        <view class="view_center">
          <button class="pagebtn" @tap="onStartWeakAI">人机对弈入门级</button>
        </view>
        <view class="weui-cells__title"></view>
        <view class="view_center">
          <button class="pagebtn" @tap="onStartNormalAI">人机对弈普通级</button>
        </view>
        <view class="weui-cells__title">人机对弈职业级配备高级GPU卡和LeelaZero,体验80手后需要成为会员才可以无限制对弈</view>
        <view class="view_center">
          <button class="pagebtn" @tap="onStartAdvAI">人机对弈职业级</button>
        </view>
        <view class="weui-cells__title">人机对弈职业级配备高级GPU卡和KataGo,体验80手后需要成为会员才可以无限制对弈</view>
        <view class="view_center">
          <button class="pagebtn_hot" @tap="onStartAdvAI_Kata">人机对弈KataGo</button>
        </view>

        
        <view class="weui-cells__title"></view>
        <view class="view_center">
          <button class="pagebtn" @tap="onStartAdvAIEx">残局挑战</button>
        </view>
        <view class="weui-cells__title">个人的人机对弈和网络对弈记录，人机对弈认输或者数子结束棋谱会自动存储到服务器(限60手以上)</view>
        <view class="view_center">
          <button class="pagebtn" @tap="onRecordYourGame">录入棋谱</button>
        </view>
        <view class="weui-cells__title"></view>
        <view class="view_center">
          <button class="pagebtn" @tap="onViewGameRecord">对局记录</button>
        </view>

        <view class="view_center">
          <button class="pagebtn" @tap="onTiku">题库</button>
        </view>
<!--         
        <view class="weui-cells__title"></view>
        <view class="view_center">
          <button class="pagebtn" @tap="onViewLiveGame">围棋赛事</button>
        </view>
        <view class="weui-cells__title"></view>
        <view class="view_center">
          <button class="pagebtn" @tap="onStartFriendGame">好友对弈</button>
        </view> -->
      </view>
    </view>
  </view>
</template>

<script>
//index.js
import Board from "../../utils/board";
import WyGo from "../../utils/WyGo";
import WyGoGame from "./gogame"; //var wezrender = require('../../lib/wezrender');
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
      hideclass1: "hideview",
      hideclass2: "showview"
    };
  },

  components: {},
  props: {},
  onShareAppMessage: function() {
    let thepath =
      "/pages/play/renji?type=0&fromuserid=" + app.globalData.userid;
    return {
      title: "强如职业棋手的Leela Zero，不眠不休陪伴你",
      path: thepath,
      imageUrl: "/",
      success: function(res) {
        /*  console.log(res.shareTickets[0])
          // console.log
          uni.getShareInfo({
            shareTicket: res.shareTickets[0],
            success: function (res) { console.log(res) },
            fail: function (res) { console.log(res) },
            complete: function (res) { console.log(res) }
          })*/
      },
      fail: function(res) {
        // 分享失败
        console.log(res);
      }
    };
  },
  onShow: function() {
    uni.setNavigationBarTitle({
      title: "人机练习场"
    });
  },
  onLoad: function(option) {
    uni.setNavigationBarTitle({
      title: "人机练习场"
    });
    this.option = option;
    this.initPage();
  },
  onReady: function() {},
  onUnload: function() {},
  methods: {
    initPage() {
      var that = this;
      this.setData({
        hideclass1: "hideview"
      });
      this.setData({
        hideclass2: "showview"
      });
      this.checkOption();
      /*
      
      			
      			if(app.userid>0)
      			{
      				 this.setData({
      		       		 hideclass1:'hideview'
      		    	  })
      		  		this.setData({
      		        	hideclass2:'showview'
      		      	})
      		      	this.checkOption();
      			}
      			else
      			{
      				 this.setData({
      		       		 hideclass1:'showview'
      		    	  })
      		  		this.setData({
      		        	hideclass2:'hideview'
      		      	})
      			}
           */

      uni.showShareMenu({
        withShareTicket: true,
        success: function(res) {
          // 分享成功
          console.log("shareMenu share success");
          console.log("分享" + res);
        },
        fail: function(res) {
          // 分享失败
          console.log(res);
        }
      });
    },
    
    preventTouchMove: function() {},
    showLoading: function() {
      uni.showLoading({
        title: "加载中"
      });
    },
    cancelLoading: function() {
      uni.hideLoading();
    },
    onTiku: function() {
      let theurl = "/pages/tiku/tiku";
      uni.navigateTo({
        url: theurl
      });
    },
    onStartWeakAI: function() {
      let theurl = "./renjigame?gamemode=3";
      uni.navigateTo({
        url: theurl
      });
    },
    onStartNormalAI: function() {
      let theurl = "./renjigame?gamemode=4";
      uni.navigateTo({
        url: theurl
      });
    },
    showToBindUser: function() {
      uni.showModal({
        title: "信息",
        content: "您还没有使用微信授权登录，不能使用此功能，点击确定前往授权",
        success: function(sm) {
          if (sm.confirm) {
            let theurl = "../tiku/tiku";
            uni.switchTab({
              url: theurl
            });
          } else if (sm.cancel) {
            console.log("用户点击取消");
          }
        }
      });
    },
    onStartAdvAI: function() {
      let theurl = "./renjigame?gamemode=0";
      uni.navigateTo({
        url: theurl
      });

      // if (app.globalData.isLegalUser()) {
      //   let theurl = "./renjigame?gamemode=0";
      //   uni.navigateTo({
      //     url: theurl
      //   });
      // } else {
      //   this.showToBindUser();
      // }
    },
    onStartAdvAI_Kata: function() {
      let theurl = "./renjigame?gamemode=5";
      uni.navigateTo({
        url: theurl
      });
      // if (app.globalData.isLegalUser()) {
      //   let theurl = "./renjigame?gamemode=5";
      //   uni.navigateTo({
      //     url: theurl
      //   });
      // } else {
      //   this.showToBindUser();
      // }
    },
    onStartAdvAIEx: function() {
      let theurl = "./renjigame?gamemode=1";
      uni.navigateTo({
        url: theurl
      });
      // if (app.globalData.isLegalUser()) {
      //   let theurl = "./renjigame?gamemode=1";
      //   uni.navigateTo({
      //     url: theurl
      //   });
      // } else {
      //   this.showToBindUser();
      // }
    },
    onRecordYourGame: function() {
      if (app.globalData.isLegalUser()) {
        let theurl = "./recordgame?gamemode=2";
        uni.navigateTo({
          url: theurl
        });
      } else {
        this.showToBindUser();
      }
    },
    onStartFriendGame: function() {
      if (app.globalData.isLegalUser()) {
        let theurl = "../netgame/netmain";
        uni.navigateTo({
          url: theurl
        });
      } else {
        this.showToBindUser();
      }
    },
    onViewLiveGame: function() {
      if (app.globalData.isLegalUser()) {
        let theurl = "../netgame/live";
        uni.navigateTo({
          url: theurl
        });
      } else {
        this.showToBindUser();
      }
    },
    onViewGameRecord: function() {
      let theurl = "../viewgame/gamerecords?history=0";
      uni.navigateTo({
        url: theurl
      });
      // if (app.globalData.isLegalUser()) {
      //   let theurl = "../viewgame/gamerecords?history=0";
      //   uni.navigateTo({
      //     url: theurl
      //   });
      // } else {
      //   this.showToBindUser();
      // }
    },
    openTiku: function() {
      this.showLoading();
      app.globalData.getUserInfo(this.showview);
    },

    showview() {
      this.cancelLoading();
      this.initPage();
      uni.showModal({
        title: "提示",
        content: "如果您已经有忘忧围棋账号,可以进入我的页面绑定已有账号。"
      });
    },

    checkOption: function() {
      if (this.option == null) {
        return false;
      }

      var that = this;
      let fromuserid = this.option.fromuserid;

      if (
        typeof fromuserid != "undefined" &&
        fromuserid != null &&
        fromuserid > 0
      ) {
        let theurl =
          "https://www.gog361.com/flask/v1/joygo/weixin/tuiguang/" +
          fromuserid +
          "/" +
          app.globalData.userid +
          "/tuiguang";
        uni.request({
          url: theurl,
          header: {
            "content-type": "application/json"
          },
          data: {
            sessionkey: app.globalData.sessionkey
          },
          //请求后台数据成功
          success: function(res) {
            if (res.data.code >= 0) {
            } else if (res.data.code == -100) {
              app.globalData.renewSessionKey();
            }
          },
          fail: function() {}
        });
      }

      if (this.option.type == 1) {
        let userid = app.globalData.userid;
        let gamestarttime = this.option.gamestarttime;
        let blackuserid = this.option.blackuserid;
        let whiteuserid = this.option.whiteuserid;
        let history = this.option.history;
        this.startviewgame(gamestarttime, blackuserid, whiteuserid, history);
        return true;
      }

      return false;
    },
    startviewgame: function(gamestarttime, blackuserid, whiteuserid, history) {
      let theurl =
        "../viewgame/viewgame?gamemode=0&gamestarttime=" +
        gamestarttime +
        "&blackuserid=" +
        blackuserid +
        "&whiteuserid=" +
        whiteuserid +
        "&history=" +
        history;
      uni.navigateTo({
        url: theurl
      });
    }
  }
};
</script>
<style lang="scss">
@import "./renji.scss";
</style>