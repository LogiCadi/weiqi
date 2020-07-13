<template>
	<view class="container">
		<view :class="hideclass1">
			<!-- <view class="weui-cells__title"></view>
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
  <button type="primary" @tap="openNoUser">不授权进入人机对弈</button> -->
			<view class="form-container position-set">
				<view class="row flex-set">请输入的注册邮箱并登录:</view>
				<view class="row flex-set">
					<view class="label flex-set">邮箱</view>
					<input class="input" type="text" v-model="loginForm.email">
				</view>
				<view class="row flex-set">
					<view class="label flex-set">密码</view>
					<input class="input" type="text" v-model="loginForm.password">
				</view>
				<view class="row flex-set">
					<view class="btn" @click="goPage('https://www.gog361.com/joygo/register.html')">注册</view>
					<view class="btn" @click="login">登录</view>
				</view>
			</view>


		</view>
		<view :class="hideclass2">
			<view class="page-body" style="background: clear;">
				<view class="page-section">
					<view class="leaderboardview" style="flex-direction:row;" v-if="rec_tikuid>=0">
						<view style="font-size:11pt; color:red;">{{rec_info}}</view>
						<button class="enterbtn" :data-tikuname="rec_tikuname" :data-tikuid="rec_tikuid" :data-pos="rec_pos" @tap="entertiku">进入</button>
					</view>


					<view class="tuiguang-dialog" :style="'top: ' + tuiguang_top + 'px; height: ' + tuiguang_height + 'px;'" v-if="showtuiguangview">
						<view class="modal-title">忘忧围棋推广员计划</view>
						<text style="color:blue;">您已经推广了</text><text style="color:red;">{{tuiguangcount}}</text><text style="color:blue;">个新用户</text>
						<view class="modal-content">欢迎成为忘忧围棋推广员，每推广一个玩家赠送一百万忘忧币，推广到50新用户赠送价值36元的三个月会员，推广到100新用户赠送价值100元一年会员</view>
						<view class="modal-footer">
							<button class="weui-btn mini-btn" style="top:16rpx;  width: 40%;" @tap="closetuiguang" type="primary" size="mini">关闭</button>
							<button class="weui-btn mini-btn" style="top:0rpx; width: 40%;" type="primary" open-type="share" size="mini">推荐给好友</button>
						</view>
					</view>


					<span style="font-family:'Comic Sans MS';font-size:18px;">
						<block v-for="(item, index) in array" :key="index">
							<view class="flex-row" style="display: block;">
								<view style="display: flex;">
									<image src="/static/images/life_img.png" style="width:60px;height:60px;"></image>
									<view class="itemtitle">{{item.name}}</view>
								</view>
								<text class="itemcontent">{{item.comment}}</text>
								<view class="leaderboardview" style="flex-direction:row;">
									<view style="font-size:13pt;">完成/总数: {{item.pos}}/{{item.count}}</view>
									<button class="leaderboardbtn" :data-userid="userid" :data-pos="item.pos" :data-tikuid="item.tikuid" @tap="leaderboard">排行榜</button>
								</view>

								<view class="flex-item flex-item-V demo-text-2">
									<button class="pagebtn" :data-tikuname="item.name" :data-pos="item.pos" :data-tikuid="item.tikuid" @tap="entertiku">进入</button>
								</view>
								<image src="/static/images/bg_line.png" style="width:100%;height:1px;"></image>
							</view>
						</block>
					</span>
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
	import { joygo_b64_md5 } from '@/utils/md5'
	import { getLoginAuthStr } from '@/utils/login'
	var app = getApp(); // 微信提供的接口地址：这里必须要把https://api.weixin.qq.com这个网址在微信后台安全域名中添加进去否则你会  
	// 感觉生活是如此的黑暗完全看不到希望
	// 微信提供的接口地址：这里必须要把https://api.weixin.qq.com这个网址在微信后台安全域名中添加进去否则你会  
	// 感觉生活是如此的黑暗完全看不到希望  
	var HTTP_URL =
		"https://api.weixin.qq.com/sns/jscode2session?appid=appid&secret=app_sectet&grant_type=authorization_code&js_code=code";

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
				tuiguang_height: "",

				userInfo: {},

				loginForm: { email: null, password: null }
			};
		},

		components: {},
		props: {},
		onShow: function() {
			uni.setNavigationBarTitle({
				title: '忘忧围棋题库'
			});

			if (app.globalData.needRefreshTiKu) {
				app.globalData.needRefreshTiKu = false;
				this.initPage();
			}

			this.checkCurTopic();
		},
		onLoad: function(option) {
			app.globalData.getProductList();
			this.option = option;
			uni.setNavigationBarTitle({
				title: '忘忧围棋题库'
			});
			this.initPage();
		},
		onPullDownRefresh: function() {
			this.initPage();
		},
		onShareAppMessage: function() {
			let thepath = "/pages/tiku/tiku?type=0&fromuserid=" + app.globalData.userid;
			return {
				title: '围棋棋力提高的最佳途径',
				imageUrl: '/',
				path: thepath
			};
		},
		methods: {
			login() {
				uni.request({
					url: app.globalData.host + '/cgi-bin/login',
					method: 'POST',
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					data: {
						mail: this.loginForm.email,
						authstr: getLoginAuthStr(joygo_b64_md5(this.loginForm.password))
					},
					//请求后台数据成功  
					success: res => {
						app.globalData['sessionkey'] = res.data.sessionkey
						app.globalData['userid'] = res.data.UserID

						uni.setStorageSync('userid', res.data.UserID)
						uni.setStorageSync('sessionkey', res.data.sessionkey)

						this.initPage()

					},
				});
			},
			goPage(url) {
				if (~url.indexOf('http')) {
					location.href = url
				} else {

				}
			},
			Test() {
				/*var kvDataList = new Array();
				kvDataList.push({key:"you_defined_key",value:"you_defined_key_related_value"});
				uni.setUserCloudStorage(kvDataList);*/
				var res = uni.getSystemInfoSync();

				// if (res.platform == 'ios') {
				// 	this.audio = uni.getBackgroundAudioManager();
				// } else {
					this.audio = uni.createInnerAudioContext();
				// }

				this.audio.title = "音乐文件";
				this.audio.src = "../../images/aoe.wav";
				this.audio.play();
			},

			checkCurTopic: function() {
				let tikuname = uni.getStorageSync("cur_tikuname");
				let tikuid = uni.getStorageSync("cur_tikuid");
				let pos = uni.getStorageSync("cur_pos");

				if (tikuname != "" && tikuid >= 0 && pos >= 0) {
					//recheck the pos
					for (let i = 0; i < this.array.length; i++) {
						if (this.array[i].tikuid == tikuid) {
							if (pos > this.array[i].pos) {
								pos = this.array[i].pos;
							}

							break;
						}
					}

					let info = "您正在做" + tikuname + "第" + pos + "题";
					this.setData({
						rec_tikuname: tikuname,
						rec_tikuid: tikuid,
						rec_pos: pos,
						rec_info: info,
						tuiguangcount: app.globalData.mytuiguangcount
					});
				} else {
					this.setData({
						rec_tikuname: '',
						rec_tikuid: -1,
						rec_pos: -1,
						rec_info: ''
					});
				}
			},
			checkOption: function() {
				if (this.option == null) {
					return false;
				}

				var that = this;
				let fromuserid = this.option.fromuserid;

				if (typeof fromuserid != "undefined" && fromuserid != null && fromuserid > 0) {
					let theurl = "https://www.gog361.com/flask/v1/joygo/weixin/tuiguang/" + fromuserid + "/" + app.globalData.userid +
						"/tuiguang";
					uni.request({
						url: theurl,
						header: {
							'content-type': 'application/json'
						},
						data: {
							sessionkey: app.globalData.sessionkey
						},
						//请求后台数据成功  
						success: function(res) {
							if (res.data.code >= 0) {} else if (res.data.code == -100) {
								app.globalData.renewSessionKey();
							}
						},
						fail: function() {}
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
			initPage: function(event) {
				if (app.globalData.userid > 0) {
					let a = Math.floor(Math.random() * 100);

					if (a < 10) {
						// 推广
						// this.setData({
						// 	showtuiguangview: true
						// });
					}

					let winwidth = uni.getSystemInfoSync().windowWidth;
					let winheight = uni.getSystemInfoSync().windowHeight;
					// this.showLoading();
					var that = this;
					// let theurl = "https://www.gog361.com/flask/v1/joygo/weixin/gettuiguang/" + app.globalData.userid;
					// uni.request({
					// 	url: theurl,
					// 	header: {
					// 		'content-type': 'application/json'
					// 	},
					// 	data: {
					// 		sessionkey: app.globalData.sessionkey
					// 	},
					// 	//请求后台数据成功  
					// 	success: function(res) {
					// 		if (res.data.code >= 0) {
					// 			app.globalData.mytuiguangcount = res.data.count;
					// 			that.setData({
					// 				tuiguangcount: app.globalData.mytuiguangcount,
					// 				tuiguang_top: winheight * 0.2,
					// 				tuiguang_height: winheight * 0.5
					// 			});
					// 		}
					// 	},
					// 	fail: function() {}
					// });
					let theurl = "/gog361/flask/v1/joygo/tiku/" + app.globalData.userid;
					uni.request({
						url: theurl,
						header: {
							'content-type': 'application/json'
						},
						data: {
							sessionkey: app.globalData.sessionkey
						},
						//请求后台数据成功  
						success: function(res) {
							that.cancelLoading();

							if (res.data.code >= 0) {
								that.setData({
									array: res.data.datas
								});
								app.globalData.renewSessionKey();

								if (!that.checkOption()) {
									that.checkCurTopic();
								}
							} else if (res.data.code == -100) {
								app.globalData.renewSessionKey(that.showview2);
							} else {
								uni.showModal({
									title: '错误',
									content: '加载失败，err=' + res.data.code
								});
							}
						},
						fail: function() {
							that.cancelLoading();
							app.globalData.renewSessionKey();
						}
					});
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
			showLoading: function() {
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
			cancelLoading: function() {
				uni.hideLoading();
				this.setData({
					hideclass1: 'hideview'
				});
				this.setData({
					hideclass2: 'showview'
				});
			},
			leaderboard: function(event) {
				let tikuid = event.currentTarget.dataset.tikuid;
				let theurl = "./leaderboard?tikuid=" + tikuid;
				uni.navigateTo({
					url: theurl
				});
			},
			entertopic: function(type, tikuname, tikuid, pos) {
				let theurl = "../topic/topic?opentype=" + type + "&tikuname=" + tikuname + "&tikuid=" + tikuid + "&pos=" + pos;
				uni.navigateTo({
					url: theurl
				});
			},
			entertiku: function(event) {
				console.log(event);
				let userid = app.globalData.userid;
				let tikuname = event.currentTarget.dataset.tikuname;
				let tikuid = event.currentTarget.dataset.tikuid;
				let pos = event.currentTarget.dataset.pos;
				this.entertopic(0, tikuname, tikuid, pos);
			},
			openTiku: function() {
				//this.showLoading();
				app.globalData.getUserInfo(this.showview);
			},
			openNoUser: function() {
				let theurl = "../play/renji";
				uni.switchTab({
					url: theurl
				});
			},
			closetuiguang: function() {
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
			}

		}
	};
</script>
<style lang="scss" scoped>
	@import "./tiku.css";

	.mask {
		position: fixed;
		background-color: rgba(#000, .6);
		width: 100vw;
		height: 100vh;

	}

	.form-container {
		background-color: #fff;
		font-size: 16px;
		padding: 20px 10px;

		.row {
			margin: 10px;

			.label {
				width: 80px;
			}

			.input {
				width: 300px;
				height: 40px;
				padding: 10px 20px;
				margin: 10px 20px;
				font-size: 16px;
				line-height: 1.5;
				outline: 1px solid #efefef;
			}

			.btn {

				font-weight: 700;
				cursor: pointer;
				margin: 5px 20px;
				text-decoration: underline;

				&:hover {
					color: #636363;
				}
			}
		}
	}
</style>
