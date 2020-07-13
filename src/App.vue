<script>
export default {
  globalData: {
    userInfo: null,
    openid: null,
    unionid: null,
    userid: uni.getStorageSync("userid") || 0,
    sessionkey: uni.getStorageSync("sessionkey") || null,
    userstar: 0,
    needRefreshTiKu: false,
    mytuiguangcount: 0,
    productlist: null,

    host:
      process.env.NODE_ENV === "development"
        ? "/gog361"
        : "https://www.gog361.com",
    getUserInfo: function(callback) {
      var that = this;
      uni.login({
        // login流程
        success: function(res) {
          //登录成功
          if (res.code) {
            // 这里是用户的授权信息每次都不一样
            var code = res.code;
            uni.getUserInfo({
              // getUserInfo流程
              success: function(res2) {
                // console.log(res2)
                that.userInfo = res2.userInfo;
                let username = res2.userInfo.nickName;
                let img = res2.userInfo.avatarUrl;
                let gender = res2.userInfo.gender;
                let encryptedData = res2.encryptedData;
                let iv = res2.iv;
                uni.setStorage({
                  key: "userInfo",
                  data: res2.userInfo
                }); // 请求自己的服务器

                that.process_WXAccount(
                  code,
                  encryptedData,
                  iv,
                  username,
                  img,
                  gender,
                  callback
                );
              },
              fail: function() {
                uni.showModal({
                  title: "警告",
                  content: "您点击了拒绝授权,只能使用有限的功能。",
                  success: function(res) {
                    let theurl = "../play/renji";
                    uni.switchTab({
                      url: theurl
                    });

                    if (res.confirm) {
                      /* uni.openSetting({
                         success: (res) => {
                           if (res.authSetting["scope.userInfo"]) {////如果用户重新同意了授权登录
                             uni.getUserInfo({
                               success: function (res) {
                                 uni.setStorage({  
                                   key: 'userInfo',  
                                   data: res.userInfo  
                                 });
                               }
                             })
                           }
                         }, fail: function (res) {
                                     }
                       })*/
                    }
                  }
                });
              },
              complete: function(res) {}
            });
          } else {
            uni.showModal({
              title: "提示",
              content: "获取用户登录态失败！" + res.errMsg
            });
          }
        },
        fail: function(res) {
          uni.showModal({
            title: "提示",
            content: "获取用户登录态失败222！" + res.errMsg
          });
        }
      });
    },
    setData(key, value) {
      this.globalData[key] = value;
    },
    process_WXAccount(
      code,
      encryptedData,
      iv,
      username,
      img,
      gender,
      callback
    ) {
      let url =
        "https://www.gog361.com/flask/v1/joygo/weixin/code2session3/" + gender;
      var that = this;
      uni.request({
        url: url,
        data: {
          img: img,
          encryptedData: encryptedData,
          iv: iv,
          code: code,
          username: username
        },
        method: "POST",
        header: {
          "content-type": "application/json"
        },
        success: function(a) {
          if (a.data.code >= 0) {
            var openid = a.data.openid;
            uni.setStorage({
              key: "openid",
              data: openid
            });
            var unionid = a.data.unionid;
            uni.setStorage({
              key: "unionid",
              data: unionid
            });
            var userid = a.data.userid;
            uni.setStorage({
              key: "userid",
              data: userid
            });
            var sessionkey = a.data.sessionkey;
            uni.setStorage({
              key: "sessionkey",
              data: sessionkey
            });
            var userstar = a.data.userstar;
            uni.setStorage({
              key: "userstar",
              data: userstar
            });
            that.openid = a.data.openid;
            that.userid = a.data.userid;
            that.unionid = a.data.unionid;
            that.sessionkey = a.data.sessionkey;
            that.userstar = a.data.userstar;

            if (typeof callback != "undefined" && callback != null) {
              callback();
              that.getProductList();
            }
          } else {
            uni.showModal({
              title: "提示",
              content: "账号绑定错误,请联系管理员解决"
            });
          }
        },
        fail: function() {
          // 在这里你要考虑到用户登录失败的情况
          uni.showToast({
            title: "网站正在维护中...",
            icon: "loading",
            duration: 10000
          });
        }
      });
    },

    isLegalUser: function() {
      if (
        this.userid > 0 &&
        this.userInfo != null &&
        this.sessionkey != "" &&
        this.sessionkey.length > 0
      ) {
        return true;
      }

      return false;
    },

    getProductList() {
      if (
        this.userInfo == null ||
        this.sessionkey == null ||
        this.sessionkey == ""
      ) {
        return;
      }

      var that = this;
      let theurl =
        "https://www.gog361.com/flask/v1/joygo/products/" + this.userid;
      uni.request({
        url: theurl,
        data: {
          sessionkey: this.sessionkey
        },
        success: function(res) {
          if (res.data.code >= 0) {
            that.productlist = res.data.productlist;
          } else {
          }
        },
        fail: function() {}
      });
    },

    toShowBuyProduct() {
      var that = this;

      if (this.productlist != null) {
        let items = [];

        for (let i = 0; i < 5; i++) {
          let text =
            this.productlist[i].name +
            ": 价格" +
            this.productlist[i].price / 10 +
            "RMB";
          items.push(text);
        }

        uni.showActionSheet({
          itemList: items,
          itemColor: "#007aff",

          success(res) {
            that.toBuyProduct(res.tapIndex + 1);
          }
        });
      }
    },

    renewSessionKey: function(callback) {
      var that = this;
      let sesskey = this.sessionkey;
      sesskey = encodeURIComponent(sesskey);
      let theurl =
         this.host + "/flask/v1/joygo/weixin/renew/" + this.userid;
      uni.request({
        url: theurl,
        header: {
          "content-type": "application/json"
        },
        data: {
          sessionkey: this.sessionkey
        },
        //请求后台数据成功
        success: function(res) {
          if (res.data.code >= 0) {
            var sessionkey = res.data.sessionkey;
            that.sessionkey = sessionkey;
            uni.setStorage({
              key: "sessionkey",
              data: sessionkey
            });
            var userstar = res.data.userstar;
            that.userstar = userstar;
            uni.setStorage({
              key: "userstar",
              data: userstar
            });

            if (typeof callback != "undefined" && callback != null) {
              callback();
            }
          }
        }
      });
    },

    toBuyProduct(productid) {
      var res = uni.getSystemInfoSync();

      if (res.platform == "ios") {
        uni.showModal({
          title: "提示",
          content:
            "由于政策限制，苹果手机不可以购买，请使用安卓手机或者其他途径购买,也可联系微信wyz785购买。"
        });
        return;
      }

      var that = this;
      let theurl =
        "https://www.gog361.com/flask/v1/joygo/order/xiaochengxu/" +
        this.userid +
        "/" +
        productid +
        "/0";
      uni.request({
        url: theurl,
        data: {
          sessionkey: this.sessionkey,
          openid: this.openid
        },
        success: function(res) {
          if (res.data.code >= 0) {
            uni.requestPayment({
              timeStamp: res.data.paysign.timeStamp,
              nonceStr: res.data.paysign.nonceStr,
              package: res.data.paysign.package,
              signType: res.data.paysign.signType,
              paySign: res.data.paysign.paySign,
              success: function(res) {
                that.renewSessionKey();
                uni.showModal({
                  title: "提示",
                  content: "支付成功,请稍后重新进入页面"
                });
                console.log(res);
              },
              fail: function(res) {
                uni.showModal({
                  title: "提示",
                  content: "购买失败"
                });
              }
            });
          } else {
            uni.showModal({
              title: "提示",
              content: "购买失败，请联系管理员"
            });
          }
        },
        fail: function() {
          uni.showModal({
            title: "提示",
            content: "创建订单失败请重试！" + res.errMsg
          });
        }
      });
    }
  },
  onLaunch: function() {
    let userInfo = uni.getStorageSync("userInfo");

    if (userInfo != null && userInfo != "") {
      this.globalData.userInfo = userInfo;
    }

    this.globalData.openid = uni.getStorageSync("openid");
    this.globalData.unionid = uni.getStorageSync("unionid");
    this.globalData.userid = uni.getStorageSync("userid");
    this.globalData.sessionkey = uni.getStorageSync("sessionkey");
    this.globalData.userstar = uni.getStorageSync("userstar");
    uni.getSetting({
      success: res => {
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          uni.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;
              this.globalData.getProductList(); // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况

              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            }
          });
        }
      }
    }); // 展示本地存储能力

    /*  var logs = uni.getStorageSync('logs') || []
      logs.unshift(Date.now())
      uni.setStorageSync('logs', logs)
       // 登录
      uni.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
        }
      })
      // 获取用户信息
      uni.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            uni.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                this.globalData.userInfo = res.userInfo
                 // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
              }
            })
          }
        }
      })*/
  },
  methods: {}
};
</script>
<style lang="scss">
@import "./app.css";

.flex-set {
  display: flex;
  justify-content: center;
  align-items: center;
}

.position-set {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>