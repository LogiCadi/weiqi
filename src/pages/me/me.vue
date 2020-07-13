<template>
<view class="page" xmlns:wx="http://www.w3.org/1999/xhtml">
    <view class="page__hd">
    <view class="weui-cells__title"></view>
        <view class="view_center">
        <image :src="avatarUrl" style="width:60px;height:60px;"></image>
        </view>
        <view class="view_center">
          <view class="page__desc" style="align-items: center;">{{nickName}}</view>
        </view>
        <view class="view_center">
            <view class="page__desc" :style="'align-items: center; color: ' + viptextcolor">{{accountdesc}}: {{userid}}</view>
        </view>
        <view class="view_center">
             <view class="page__desc" v-if="notvipinfo==false" style="align-items: center; color:red;">{{vipvaliddate_txt}}</view>
        </view>
         <view class="view_center">
            <view class="page__desc" v-if="notvipinfo==false" style="align-items: center; color:red;">VIP会员请加微信:wyz785</view>
        </view>
        <view class="view_center">
          <button class="weui-btn mini-btn" style="width:75%;" type="primary" size="mini" @tap="OnBindJoygoAcct">绑定其他忘忧围棋账号</button>
        </view>
        <view class="view_center" v-if="notvip">
          <button class="weui-btn mini-btn" style="width:75%;" type="primary" size="mini" @tap="OnBuyVIP">开通忘忧围棋VIP会员</button>
        </view>
    </view>

    <view class="modal-dialog" v-if="showModal">
    <view class="modal-title">请输入忘忧围棋账号密码</view>
    <view class="modal-content">
      <view class="modal-input">
        <input placeholder-class="input-holder" name="useremail" maxlength="20" @input="useremailInput" class="input" placeholder="请输入账号"></input>
      </view>
      <view class="modal-input">
        <input placeholder-class="input-holder" password="true" name="userpass" maxlength="20" @input="userpassInput" class="input" placeholder="请输入密码"></input>
      </view>
    </view>
    <view class="modal-footer">
      <view class="btn-cancel" @tap="onCancel" data-status="cancel">取消</view>
      <view class="btn-confirm" @tap="onConfirm" data-status="confirm">确定</view>
    </view>
  </view>

   <view class="weui-cells__title">每推广一个玩家赠送一百万忘忧币，到50个赠送三个月会员，到100个赠送一年会员</view>
    <view class="weui-cells weui-cells_after-title">
        <view class="weui-cell weui-cell_switch">
            <view class="weui-cell__bd">您推广了{{tuiguangcount}}个玩家</view>
            <view class="weui-cell__ft">
                <button class="weui-btn mini-btn" type="primary" open-type="share" size="mini">推荐给好友</button>
            </view>
        </view>
    </view>

    <view class="page__bd">
      <view class="weui-cells__title">声音</view>
      <view class="weui-cells weui-cells_after-title">
          <view class="weui-cell weui-cell_switch">
              <view class="weui-cell__bd">开启/关闭声音</view>
              <view class="weui-cell__ft">
                  <switch :checked="havesound" @change="onCheckSwitch"></switch>
              </view>
          </view>
      </view>

      <view class="weui-cell">
      <view class="weui-cells__title">你的网络对弈积分</view>
      </view>
      <view class="weui-cells weui-cells_after-title"> 
          <view class="flex-row" style="display: block;">
            <view class="weui-cell">
                <view class="weui-cell__bd">积分</view>
                <view class="weui-cell__ft">{{joygouserinfo.Score}}</view>
            </view>
          </view>
           <view class="flex-row" style="display: block;">
            <view class="weui-cell">
                <view class="weui-cell__bd">忘忧币</view>
                <view class="weui-cell__ft">{{joygouserinfo.User_Money}}</view>
            </view>
          </view>
          <view class="flex-row" style="display: block;">
            <view class="weui-cell">
                <view class="weui-cell__bd">忘忧钻石</view>
                <view class="weui-cell__ft">{{joygouserinfo.User_Diamond}}</view>
            </view>
          </view>

          <view class="flex-row" style="display: block;">
            <view class="weui-cell">
                <view class="weui-cell__bd">对局数</view>
                <view class="weui-cell__ft">{{joygouserinfo.PlayCount}}</view>
            </view>
          </view>
           <view class="flex-row" style="display: block;">
            <view class="weui-cell">
                <view class="weui-cell__bd">胜局数</view>
                <view class="weui-cell__ft">{{joygouserinfo.WinCount}}</view>
            </view>
          </view>
          <view class="flex-row" style="display: block;">
            <view class="weui-cell">
                <view class="weui-cell__bd">负局数</view>
                <view class="weui-cell__ft">{{joygouserinfo.LoseCount}}</view>
            </view>
          </view>
           <view class="flex-row" style="display: block;">
            <view class="weui-cell">
                <view class="weui-cell__bd">和局数</view>
                <view class="weui-cell__ft">{{joygouserinfo.DrawCount}}</view>
            </view>
          </view>
      </view>

      <view class="weui-cell">
      <view class="weui-cells__title">你的题库积分</view>
      <button class="weui-btn mini-btn" type="primary" size="mini" @tap="onLeaderBoard">排行榜</button>
      </view>
      <view class="weui-cells weui-cells_after-title"> 
        <block v-for="(item, index) in jifen_array" :key="index">
          <view class="flex-row" style="display: block;">
            <view class="weui-cell">
                <view class="weui-cell__bd">{{item.name}}</view>
                <view class="weui-cell__ft">{{item.data}}</view>
            </view>
          </view>
        </block>
      </view>
     <view class="weui-cells__title">客服邮箱:joygo_judge@hotmail.com</view>
    </view>
</view>
</template>

<script>
var app = getApp();
var g_userid = 0;
var API_URL = "自己服务器的地址";
var loginStatus = true; // 微信提供的接口地址：这里必须要把https://api.weixin.qq.com这个网址在微信后台安全域名中添加进去否则你会  
// 感觉生活是如此的黑暗完全看不到希望
// 微信提供的接口地址：这里必须要把https://api.weixin.qq.com这个网址在微信后台安全域名中添加进去否则你会  
// 感觉生活是如此的黑暗完全看不到希望  
var HTTP_URL = "https://api.weixin.qq.com/sns/jscode2session?appid=appid&secret=app_sectet&grant_type=authorization_code&js_code=code";

export default {
  data() {
    return {
      havesound: true,
      useremail: null,
      userpass: null,
      showModal: false,
      nickName: null,
      avatarUrl: null,
      userid: 0,
      sessionkey: null,
      openid: null,
      notvip: true,
      notvipinfo: true,
      viptextcolor: 'black',
      vipvaliddate_txt: '',
      accountdesc: '忘忧围棋账号ID',
      tuiguangcount: app.globalData.mytuiguangcount,
      jifen_array: [],
      joygouserinfo: null
    };
  },

  components: {},
  props: {},
  onShow: function () {
    uni.setNavigationBarTitle({
      title: '我的'
    });
    this.initPage();
  },
  onLoad: function () {
    uni.setNavigationBarTitle({
      title: '我的'
    });
    this.initPage();
  },
  onShareAppMessage: function () {
    let thepath = "/pages/tiku/tiku?type=0&fromuserid=" + app.globalData.userid;
    return {
      title: '练习爆爽的死活题库小程序-忘忧围棋题库，围棋棋力提高的最佳工具',
      imageUrl: "/static/images/life_img.png",
      path: thepath
    };
  },
  methods: {
    useremailInput: function (e) {
      this.setData({
        useremail: e.detail.value
      });
    },
    userpassInput: function (e) {
      this.setData({
        userpass: e.detail.value
      });
    },

    calcJifenData(array) {
      if (typeof array == "undefined" || array == null) {
        return;
      }

      let total = 0;
      let jf_array = new Array();
      jf_array.push({
        name: '总积分',
        data: 0
      });

      for (let i = 0; i < array.length; i++) {
        jf_array.push({
          name: array[i].name,
          data: array[i].pos
        });
        total += array[i].pos;
      }

      jf_array[0].name = "总积分";
      jf_array[0].data = total;
      this.setData({
        jifen_array: jf_array
      });
    },

    initPage: function (event) {
      uni.setNavigationBarTitle({
        title: '我'
      });
      let hsound = uni.getStorageSync("havesound");

      if (typeof hsound == "string" && hsound == "") {
        hsound = true;
      }

      this.setData({
        havesound: hsound
      });

      if (app.globalData.userInfo != null) {
        this.setData({
          nickName: app.globalData.userInfo.nickName,
          avatarUrl: app.globalData.userInfo.avatarUrl,
          userid: app.globalData.userid,
          tuiguangcount: app.globalData.mytuiguangcount
        });
      } else {
        this.setData({
          nickName: app.globalData.userid,
          userid: app.globalData.userid,
          tuiguangcount: app.globalData.mytuiguangcount
        });
      }

      var res = uni.getSystemInfoSync();

      if (app.globalData.userstar > 0) {
        this.setData({
          notvip: false,
          notvipinfo: false,
          viptextcolor: 'red',
          accountdesc: '忘忧围棋VIP账号ID'
        });
      } else {
        this.setData({
          notvip: true,
          notvipinfo: true,
          viptextcolor: 'black',
          accountdesc: '忘忧围棋账号ID'
        });
      }

      var res = uni.getSystemInfoSync();

      if (res.platform == 'ios') {
        this.setData({
          notvip: false
        });
      }

      if (app.globalData.userid > 0) {
        this.showLoading();
        var that = this;
        let theurl = "https://www.gog361.com/flask/v1/joygo/tiku/" + app.globalData.userid;
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
              that.calcJifenData(res.data.datas);
              that.cancelLoading();
            }
          },
          fail: function () {
            that.cancelLoading();
          }
        });
        theurl = "https://www.gog361.com/flask/v1/joygo/weixin/gettuiguang/" + app.globalData.userid;
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
                tuiguangcount: app.globalData.mytuiguangcount
              });
            }
          },
          fail: function () {}
        });
      }

      this.getUserinfo();
    },
    showLoading: function () {
      uni.showLoading({
        title: '加载中'
      });
    },
    cancelLoading: function () {
      uni.hideLoading();
    },
    showModalDialog: function () {
      this.setData({
        showModal: true
      });
    },
    hideModalDialog: function () {
      this.setData({
        showModal: false
      });
    },
    OnBindJoygoAcct: function () {
      this.showModalDialog();
    },
    OnBuyVIP: function () {
      app.globalData.toShowBuyProduct();
    },
    onCancel: function () {
      this.hideModalDialog();
    },

    /**
     * 对话框确认按钮点击事件
     */
    onConfirm: function () {
      if (this.useremail.length == 0) {
        uni.showModal({
          title: '提示',
          content: '请输入您的忘忧围棋账号'
        });
      }

      if (this.userpass.length == 0) {
        uni.showModal({
          title: '提示',
          content: '请输入您的账号密码'
        });
      }

      this.toBind(this.useremail, this.userpass);
    },
    onCheckSwitch: function (e) {
      console.log('switch类型开关当前状态-----', e.detail.value);
      this.setData({
        havesound: e.detail.value
      });
      uni.setStorage({
        key: 'havesound',
        data: e.detail.value
      });
    },

    updateuserinfo() {
      if (this.joygouserinfo != null) {
        if (this.joygouserinfo.User_Star > 0) {
          let vipvaliddatetxt = 'VIP剩余 ' + this.joygouserinfo.VIPRemainDay + ' 天';

          if (this.joygouserinfo.VIPRemainDay > 10000) {
            vipvaliddatetxt = "您是尊贵的永久会员";
          }

          this.setData({
            notvip: false,
            notvipinfo: false,
            viptextcolor: 'red',
            accountdesc: '忘忧围棋VIP账号ID',
            vipvaliddate_txt: vipvaliddatetxt
          });
        }
      }
    },

    getUserinfo() {
      let theurl = "https://www.gog361.com/cgi-bin/getuserinfo?userid=" + app.globalData.userid;
      var that = this;
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
          if (res.data.retobj.retcode >= 0) {
            that.setData({
              joygouserinfo: res.data.userinfo
            });
            that.updateuserinfo();
            app.globalData.getProductList();
          } else if (res.data.code == -100) {
            app.globalData.renewSessionKey();
          }
        },
        fail: function () {
          app.globalData.renewSessionKey();
        }
      });
    },

    onLeaderBoard: function () {
      let tikuid = 100;
      let theurl = "../tiku/leaderboard?tikuid=" + tikuid;
      uni.navigateTo({
        url: theurl
      });
    },
    toBind: function (usermail, userpass) {
      this.showLoading();
      var that = this;
      let theurl = "";

      if (app.globalData.unionid != null && app.globalData.unionid != "") {
        theurl = "https://www.gog361.com/flask//v1/joygo/weixin/bindnew2/" + app.globalData.openid + "/" + app.globalData.unionid + "/" + usermail;
      } else {
        theurl = "https://www.gog361.com/flask//v1/joygo/weixin/bindnew/" + app.globalData.openid + "/" + usermail;
      }

      uni.request({
        url: theurl,
        header: {
          'content-type': 'application/json'
        },
        data: {
          username: app.globalData.userInfo.nickName,
          password: userpass
        },
        //请求后台数据成功  
        success: function (res) {
          that.cancelLoading();

          if (res.data.code >= 0) {
            app.globalData.sessionkey = res.data.sessionkey;
            uni.setStorage({
              key: 'sessionkey',
              data: res.data.sessionkey
            });
            var userstar = res.data.userstar;
            app.globalData.userstar = userstar;
            uni.setStorage({
              key: 'userstar',
              data: userstar
            });
            var userid = res.data.userid;
            uni.setStorage({
              key: 'userid',
              data: userid
            });
            app.globalData.userid = userid;
            app.globalData.needRefreshTiKu = true;
            that.hideModalDialog();
            uni.showModal({
              title: '提示',
              content: '绑定忘忧围棋账号成功'
            });
            that.initPage();
            uni.setStorage({
              key: 'cur_tikuname',
              data: ''
            });
            uni.setStorage({
              key: 'cur_tikuid',
              data: -1
            });
            uni.setStorage({
              key: 'cur_pos',
              data: -1
            });
          } else {
            uni.showModal({
              title: '提示',
              content: '账号或密码错误，绑定忘忧围棋账号失败，请重试'
            });
          }
        },
        fail: function () {
          that.cancelLoading();
          uni.showModal({
            title: '提示',
            content: '账号或密码错误，绑定忘忧围棋账号失败，请重试'
          });
        }
      });
    }
  }
};
</script>
<style>
@import "./me.css";
</style>