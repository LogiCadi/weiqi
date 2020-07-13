<template>
<view class="container">
 <view :class="hideclass1">
 <view class="weui-cells__title"></view>
  <view class="view_center">
     <view class="weui-cells__title"></view>
     <view class="weui-cells__title"></view>
     <view class="weui-cells__title"></view>
      <view class="page__desc" style="align-items: center; color:black;">忘忧围棋题库需要使用微信账号授权后才可以做题，您也可以选择不授权进入人机对弈，体验人机对弈初中级功能</view>
  </view>
  <view class="weui-cells__title"></view>
  <view class="weui-cells__title"></view>
  <button type="primary" open-type="getUserInfo" @tap="openTiku">使用微信账号授权登录</button>
  <view class="weui-cells__title"></view>
 <view class="weui-cells__title"></view>
  <button type="primary" @tap="openNoUser">不授权进入人机对弈</button>
</view>
  <view @tap="adddetial">
      <image class="add_icon" src="/static/images/adding.png"></image>
  </view>
  <view :class="hideclass2">
  <view class="page-body" style="background: clear;">
    <view class="page-section">
 

    <span style="font-family:'Comic Sans MS';font-size:18px;">
      <block v-for="(item, index) in array" :key="index"> 
       <view class="flex-row" style="display: block;">

        <view class="topictitleview" style="flex-direction:row;">  
        <image :src="item.titleimage" style="width:30px;height:30px;" mode="widthFix" :data-qipuid="item.qipuid" @tap="btn_entertopic"> </image>
        <view class="topictitleview" :data-qipuid="item.qipuid" @tap="btn_entertopic">{{item.topictitle}}</view>
        </view>  
        <view class="topicimagetview">
        <image :src="item.image" style="width:66%;" mode="widthFix" :data-qipuid="item.qipuid" :data-fromuserid="item.fromuserid" @tap="btn_entertopic" @longtap="bindlong_topic"></image>
        </view>
        <view class="topicbottomtextview" :data-qipuid="item.qipuid" @tap="btn_entertopic">发布者: {{item.fromusernick}}</view>
        <view class="topicbottomtextview" :data-qipuid="item.qipuid" @tap="btn_entertopic">最后评论:{{item.strdate}}</view>

        <view class="topicbottomview" style="flex-direction:row;"> 
         <button class="clickBottomBtn" plain="true" :data-qipuid="item.qipuid" @tap="btn_entertopic"><image src="/static/images/share.png" style="width:60rpx;height:60rpx;" mode="widthFix"></image>
         </button>
        <view class="itembottomview">{{item.sharecount}}</view>

        <button class="clickBottomBtn" plain="true" :data-qipuid="item.qipuid" @tap="btn_entertopic">
        <image src="/static/images/comment.png" style="width:60rpx;height:60rpx;" mode="widthFix"></image>
        </button>
        <view class="itembottomview">{{item.commentcount}}</view>

        <button class="clickBottomBtn" plain="true" :data-qipuid="item.qipuid" @tap="btn_addzan">
         <image :src="item.zanimgpath" style="width:60rpx;height:60rpx;" mode="widthFix"></image>
        </button>
        <view class="itembottomview">{{item.zancount}}</view>
        </view> 
         <view class="divLine"></view>
        </view> 
      </block></span>
      <view class="flex-wrp" style="flex-direction:column;">
        <view class="flex-item flex-item-V demo-text-1">
          <view @tap="bindViewTap" class="userinfo">
            <image class="userinfo-avatar" :src="userInfo.avatarUrl" background-size="cover"></image>
            <text class="userinfo-nickname">{{userInfo.nickName}}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
  </view>
</view>
</template>

<script>
const base = require("../../utils/Base.js");
var app = getApp();
var BLANK = 0; //空格的颜色
//空格的颜色
var WHITE = 1; //白色
//白色
var BLACK = 2; // 微信提供的接口地址：这里必须要把https://api.weixin.qq.com这个网址在微信后台安全域名中添加进去否则你会  
// 感觉生活是如此的黑暗完全看不到希望
// 微信提供的接口地址：这里必须要把https://api.weixin.qq.com这个网址在微信后台安全域名中添加进去否则你会  
// 感觉生活是如此的黑暗完全看不到希望  
var HTTP_URL = "https://api.weixin.qq.com/sns/jscode2session?appid=appid&secret=app_sectet&grant_type=authorization_code&js_code=code";

export default {
  data() {
    return {
      hideclass1: 'hideview',
      hideclass2: 'showview',
      array: [],
      rec_tikuname: '',
      rec_tikuid: -1,
      rec_pos: -1,
      rec_info: '',
      tuiguangcount: app.globalData.mytuiguangcount,
      showtuiguangview: false,
      tuiguang_top: "",
      tuiguang_height: ""
    };
  },

  components: {},
  props: {},
  onShow: function () {
    uni.setNavigationBarTitle({
      title: '题目交流区'
    });

    if (app.globalData.needRefreshTopicList) {
      app.globalData.needRefreshTopicList = false;
      this.initPage();
    }
  },
  onLoad: function (option) {
    app.globalData.getProductList();
    this.option = option;
    uni.setNavigationBarTitle({
      title: '死活交流区'
    });
    this.initPage();
  },
  onPullDownRefresh: function () {
    this.initPage();
  },
  onShareAppMessage: function () {
    let thepath = "/pages/community/topiclist?type=0&fromuserid=" + app.globalData.userid;
    return {
      title: '围棋棋力提高的最佳途径',
      imageUrl: '/',
      path: thepath
    };
  },
  methods: {
    Test() {
      /*var kvDataList = new Array();
      kvDataList.push({key:"you_defined_key",value:"you_defined_key_related_value"});
      uni.setUserCloudStorage(kvDataList);*/
      var res = uni.getSystemInfoSync();

      if (res.platform == 'ios') {
        this.audio = uni.getBackgroundAudioManager();
      } else {
        this.audio = uni.createInnerAudioContext();
      }

      this.audio.title = "音乐文件";
      this.audio.src = "../../images/aoe.wav";
      this.audio.play();
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
        let userid = app.globalData.userid;
        let tikuname = this.option.tikuname;
        let tikuid = this.option.tikuid;
        let pos = this.option.pos;
        this.entertopic(1, tikuname, tikuid, pos);
        return true;
      }

      return false;
    },
    initPage: function (event) {
      if (app.globalData.userid > 0) {
        let a = Math.floor(Math.random() * 100);

        if (a < 10) {
          this.setData({
            showtuiguangview: true
          });
        }

        let winwidth = uni.getSystemInfoSync().windowWidth;
        let winheight = uni.getSystemInfoSync().windowHeight;
        this.showLoading();
        var that = this;
        let theurl = "https://www.gog361.com/flask/v1/joygo/weixin/gettuiguang/" + app.globalData.userid;
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
            if (res.data.code >= 0) {
              app.globalData.mytuiguangcount = res.data.count;
              that.setData({
                tuiguangcount: app.globalData.mytuiguangcount,
                tuiguang_top: winheight * 0.2,
                tuiguang_height: winheight * 0.5
              });
            }
          },
          fail: function () {}
        });
        this.load_Topics();
      } else {
        this.setData({
          hideclass1: 'showview'
        });
        this.setData({
          hideclass2: 'hideview'
        });
      }

      uni.stopPullDownRefresh();
    },

    load_Topics() {
      var that = this;
      let theurl = "https://www.gog361.com/flask/v1/joygo/topics/" + app.globalData.userid;
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

          if (res.data.code >= 0) {
            for (let i = 0; i < res.data.topics.length; i++) {
              if (res.data.topics[i].firstmovecolor == BLACK) {
                res.data.topics[i].titleimage = "/static/images/blackstone.png";
              } else {
                res.data.topics[i].titleimage = "/static/images/whitestone.png";
              }

              if (res.data.topics[i].zaned == 1) {
                res.data.topics[i].zanimgpath = "/static/images/zan-hover.png";
              } else {
                res.data.topics[i].zanimgpath = "/static/images/zan.png";
              }

              res.data.topics[i].strdate = base.FormatMilliSecondDate(res.data.topics[i].lastupdatetime);
            }

            that.setData({
              array: res.data.topics
            });
          } else {}
        },
        fail: function () {
          that.cancelLoading();
        },
        complete: function () {
          that.cancelLoading();
        }
      });
    },

    showLoading: function () {
      uni.showLoading({
        title: '加载中'
      });
      this.setData({
        hideclass1: 'hideview'
      });
      this.setData({
        hideclass2: 'hideview'
      });
    },
    cancelLoading: function () {
      uni.hideLoading();
      this.setData({
        hideclass1: 'hideview'
      });
      this.setData({
        hideclass2: 'showview'
      });
    },
    leaderboard: function (event) {
      let tikuid = event.currentTarget.dataset.tikuid;
      let theurl = "./leaderboard?tikuid=" + tikuid;
      uni.navigateTo({
        url: theurl
      });
    },
    entertopic: function (type, tikuname, tikuid, pos) {
      let theurl = "../topic/topic?opentype=" + type + "&tikuname=" + tikuname + "&tikuid=" + tikuid + "&pos=" + pos;
      uni.navigateTo({
        url: theurl
      });
    },
    entertiku: function (event) {
      console.log(event);
      let userid = app.globalData.userid;
      let tikuname = event.currentTarget.dataset.tikuname;
      let tikuid = event.currentTarget.dataset.tikuid;
      let pos = event.currentTarget.dataset.pos;
      this.entertopic(0, tikuname, tikuid, pos);
    },
    openTiku: function () {
      //this.showLoading();
      app.globalData.getUserInfo(this.showview);
    },
    openNoUser: function () {
      let theurl = "../play/renji";
      uni.switchTab({
        url: theurl
      });
    },
    closetuiguang: function () {
      this.setData({
        showtuiguangview: false
      });
    },

    showview2() {
      this.cancelLoading();
      this.initPage();
    },

    showview() {
      this.cancelLoading();
      this.initPage();
      uni.showModal({
        title: '提示',
        content: '如果您已经有忘忧围棋账号,可以进入我的页面绑定已有账号。'
      });
    },

    adddetial: function () {
      uni.navigateTo({
        url: './lurutopic',
        success: function (res) {},
        fail: function (res) {},
        complete: function (res) {}
      });
    },
    submit_zan: function (qipuid, zaned) {
      var that = this;
      let theurl = "https://www.gog361.com/flask/v1/joygo/zantopic/" + app.globalData.userid;
      let nick = app.globalData.userInfo.nickName;

      if (app.globalData.joygoengine != null) {
        nick = app.globalData.joygoengine.GetMyNickName();
      }

      uni.request({
        url: theurl,
        method: "POST",
        header: {
          'content-type': 'application/json'
        },
        data: {
          fromuserid: app.globalData.userid,
          fromusernick: app.globalData.userInfo.nickName,
          qipuid: qipuid,
          zantype: zaned,
          userid: app.globalData.userid,
          sessionkey: app.globalData.sessionkey
        },
        //请求后台数据成功  
        success: function (res) {
          if (res.data.code >= 0) {
            if (res.data.changenumber != 0) {
              let thearray = that.array;

              for (let i = 0; i < thearray.length; i++) {
                if (thearray[i].qipuid == qipuid) {
                  thearray[i].zancount += res.data.changenumber;

                  if (thearray[i].zaned == 0) {
                    thearray[i].zaned = 1;
                  } else {
                    thearray[i].zaned = 0;
                  }

                  if (thearray[i].zaned == 1) {
                    thearray[i].zanimgpath = "/static/images/zan-hover.png";
                  } else {
                    thearray[i].zanimgpath = "/static/images/zan.png";
                  }

                  break;
                }
              }

              that.setData({
                array: thearray
              });
            }
          }
        },
        fail: function () {},
        complete: function () {}
      });
    },
    btn_addzan: function (event) {
      let qipuid = event.currentTarget.dataset.qipuid;

      for (let i = 0; i < this.array.length; i++) {
        if (this.array[i].qipuid == qipuid) {
          let zaned = 0;

          if (this.array[i].zaned == 0) {
            zaned = 1;
          } else {
            zaned = 0;
          }

          this.submit_zan(qipuid, zaned);
          break;
        }
      }
    },
    btn_entertopic: function (event) {
      let qipuid = event.currentTarget.dataset.qipuid;
      let theurl = "./ctopic?qipuid=" + qipuid;
      uni.navigateTo({
        url: theurl
      });
    },
    showSmpMsg: function (textmsg) {
      uni.showModal({
        title: '信息',
        content: textmsg,
        success: function (res) {}
      });
    },
    to_delete_topic: function (qipuid) {
      var that = this;
      let theurl = "https://www.gog361.com/flask/v1/joygo/deletetopic/" + app.globalData.userid + "/" + qipuid;
      let nick = app.globalData.userInfo.nickName;

      if (app.globalData.joygoengine != null) {
        nick = app.globalData.joygoengine.GetMyNickName();
      }

      uni.request({
        url: theurl,
        header: {
          'content-type': 'application/json'
        },
        data: {
          userid: app.globalData.userid,
          sessionkey: app.globalData.sessionkey
        },
        //请求后台数据成功  
        success: function (res) {
          if (res.data.code >= 0) {
            that.load_Topics();
          } else {
            that.showSmpMsg("删除失败" + res.data.msg);
          }
        },
        fail: function () {
          that.showSmpMsg("删除失败");
        },
        complete: function () {}
      });
    },
    bindlong_topic: function (event) {
      let fromuserid = event.currentTarget.dataset.fromuserid;
      let qipuid = event.currentTarget.dataset.qipuid;

      if (app.globalData.userid == 10137 || fromuserid == app.globalData.userid) {
        var that = this;
        uni.showModal({
          title: '删除',
          content: '您确定要删除这个题目吗？',
          success: function (res) {
            if (res.confirm) {
              that.to_delete_topic(qipuid);
            }
          }
        });
      }
    }
  }
};
</script>
<style>
@import "./topiclist.css";
</style>