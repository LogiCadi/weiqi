<template>
<view class="page" xmlns:wx="http://www.w3.org/1999/xhtml">
      <view style="width:100%;height:61rpx;">
           <view class="cellview" style="flex-direction:row;">
              <view class="cellitem0"></view>
              <view class="cellitem1">昵称</view>
              <view class="cellitem2">完成数</view>
              <view class="cellitem3">用时(天)</view>
            </view>
        </view> 
      <block v-for="(item, index) in array" :key="index"> 
           <view class="cellview" style="flex-direction:row;">
             <view class="cellitem0" v-if="item.gender==1">
              <image src="/static/images/female.png" style="width:55rpx;height:55rpx;"></image>
              </view>
              <view class="cellitem0" v-else-if="item.gender==0" style="width:60rpx;height:60rpx;">
                  <image src="/static/images/male.png" style="width:55rpx;height:55rpx;"></image>
              </view>
              <view class="cellitem1">{{item.usernick}}</view>
              <view class="cellitem2">{{item.pos}}</view>
              <view class="cellitem3">{{item.costtime}}</view>
            </view>
      </block>
</view>
</template>

<script>
var app = getApp();
const base = require("../../utils/Base.js"); // 微信提供的接口地址：这里必须要把https://api.weixin.qq.com这个网址在微信后台安全域名中添加进去否则你会  
// 感觉生活是如此的黑暗完全看不到希望

export default {
  data() {
    return {
      tikuid: 0,
      array: [{
        name: '小李'
      }, {
        name: '小高'
      }]
    };
  },

  components: {},
  props: {},
  onLoad: function (option) {
    let a = parseInt(option.tikuid) + 1;
    let title = '排行榜-' + a;
    uni.setNavigationBarTitle({
      title: title
    });
    var that = this;
    this.setData({
      tikuid: option.tikuid
    });
    this.initPage();
  },
  onShareAppMessage: function () {
    return {
      title: '忘忧围棋练习题目，您最佳的棋力练习场',
      imageUrl: '/'
    };
  },
  methods: {
    initPage: function (event) {
      if (app.globalData.userid > 0) {
        this.showLoading();
        var that = this;
        let theurl = "https://www.gog361.com/flask/v1/joygo/tiku/leaderboard/" + this.tikuid;
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
              for (let i = 0; i < res.data.datas.length; i++) {
                res.data.datas[i].costtime = base.changeTwoDecimal(res.data.datas[i].costtime / 3600 / 24);
              }

              that.setData({
                array: res.data.datas
              });
            } else if (res.data.code == -100) {}
          },
          fail: function () {
            that.cancelLoading();
            app.globalData.renewSessionKey();
          }
        });
      }
    },
    showLoading: function () {
      uni.showLoading({
        title: '加载中'
      });
    },
    cancelLoading: function () {
      uni.hideLoading();
    }
  }
};
</script>
<style>
@import "./leaderboard.css";
</style>