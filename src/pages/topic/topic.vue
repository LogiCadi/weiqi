<template>
	<view>
		<!--index.wxml-->
		<view :class="hideclass1">
			<view class="view_center">
				<view class="page__desc" style="align-items: center; color:black;">忘忧围棋题库需要使用微信账号登录后才可以做题，你也也可以选择不登录进入人机对弈，体验人机对弈初中级功能</view>
			</view>
			<button type="primary" open-type="getUserInfo" @tap="openTiku">使用微信登录进入</button>
			<button type="primary" @tap="openNoUser">不登录进入人机对弈</button>
		</view>
		<view :class="hideclass2">
			<view class="allview" catchtouchmove="preventScroll">
				<ad class="joygoad" v-if="showad" unit-id="adunit-3d98c96fef501b5d"></ad>
				<view class="commentview" :style="'top: ' + commentview_top + 'px; height: ' + commentview_height + 'px;'" @tap="btn_commenttext">
					<text class="commenttext">{{gamecomment}}</text>
				</view>
				<view class="topbtnview" :style="'flex-direction:row;top: ' + topbtnview_top + 'px; height: ' + topbtnview_height + 'px;'">
					<view class="img_prevgame_btn" @tap="prev_game" @longtap="bingLongTapToMove"></view>
					<view class="img_nextgame_btn" @tap="next_game" :style="'display:' + next_game_view"></view>
				</view>

				<view class="gmboard" :style="'top: ' + gmboard_top + 'px; height: ' + gmboard_height + 'px;'" catchtouchmove="preventScroll">
					<canvas :style="'width:' + canvasview.width + 'px;height:' + canvasview.height + 'px;'" canvas-id="image-canvas-1"
					 catchtouchmove="preventScroll" @click="touchEnd"></canvas>
				</view>

				<scroll-view scroll-y="true" class="chatview" v-if="showchatview" :scroll-top="chatscrolltop" :style="'top: ' + chatview_top + 'px; height: ' + chatview_height + 'px;'">
					<block v-for="(item, index) in chatmsg_array" :key="index">
						<view class="cellview" style="flex-direction:row;">
							<view class="cellitem0">
								<image src="/static/images/msgfromother.png" style="width:40rpx;height:40rpx;"></image>
							</view>
							<text class="chatitem">{{item.StrTime}} {{item.Name}}:{{item.Msg}}
							</text>
						</view>
					</block>
				</scroll-view>

				<view class="bottombtnview" v-if="showbottombtnview==1" :style="'flex-direction:row; top: ' + bottombtnview_top + 'px; height: ' + bottombtnview_height + 'px;'">
					<button class="bottombtn" @tap="btn_redo" :disabled="btn_redo_disabled">{{btn_redo_text}}</button>
					<button class="bottombtn" @tap="btn_undo" :disabled="btn_undo_disabled">{{btn_undo_text}}</button>
					<button class="bottombtn" @tap="btn_solution" :disabled="btn_solution_disabled">{{btn_solution_text}}</button>
					<button class="bottombtn" @tap="btn_msg" :disabled="btn_msg_disabled">{{btn_msg_text}}</button>
					<button class="bottombtn" open-type="share" @tap="btn_share" :disabled="btn_share_disabled">{{btn_share_text}}</button>
					<button class="bottombtn" @tap="btn_back" :disabled="btn_back_disabled">{{btn_back_text}}</button>
				</view>
				<view class="bottombtnview" v-if="showbottombtnview==0" :style="'flex-direction:row; top: ' + bottombtnview_top + 'px; height: ' + bottombtnview_height + 'px;'">
					<button class="sendbtn" @tap="onSendMsgBack">返回</button>
					<input class="inputView" placeholder-class="input-holder" type="text" width="100rpx" name="inputimmsg" :value="inputimmsg"
					 @input="inputimmsgInput" placeholder="请输入..." />
					<button class="sendbtn" @tap="onSendMsg">提交</button>
				</view>

				<view class="modal-dialog" v-if="showWinView" :style="'left: ' + winview_left + 'px;top: ' + winview_top + 'px; width:' + winview_width + 'px; height: ' + winview_height + 'px;'">
					<view class="modal-title">恭喜过关,您好厉害哦,感觉又进步了吧</view>
					<view class="modal-content"></view>
					<view class="modal-footer">
						<button class="dialogbtn" @tap="onCancelWinDlg" data-status="cancel">取消</button>
						<button class="dialogbtn" @tap="onNextTopic" data-status="confirm">下一题</button>
						<button class="dialogbtn" open-type="share" @tap="onShare" data-status="confirm">炫耀一下</button>
					</view>
				</view>


				<view class="modal-dialog" v-if="showFailView" :style="'left: ' + winview_left + 'px;top:' + winview_top + 'px; width:' + winview_width + 'px; height: ' + winview_height + 'px;'">
					<view class="modal-title">失败了,再试试,{{showFailViewContent}}</view>
					<view class="modal-content"></view>
					<view class="modal-footer-failed">
						<button class="dialogbtn" @tap="onCancelFailDlg" data-status="confirm">确定</button>
					</view>
				</view>
			</view>

			<view class="modal-dialog2" v-if="showToMoveView">
				<view class="modal-title">你可跳转已经完成的任意题目</view>
				<view class="modal-content">
					<view class="modal-input">
						<input placeholder-class="input-holder" type="number" width="100rpx" name="toMovePos" maxlength="10" @input="toMovePosInput"
						 class="input" placeholder="请输入题目位置" />
					</view>
				</view>
				<view class="modal-footer">
					<view class="btn-confirm" @tap="onToMoveCancel" data-status="cancel">取消</view>
					<view class="btn-confirm" @tap="onToMoveConfirm" data-status="confirm">确定</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	//index.js
	import LifeBoard from '../../utils/lifeboard';
	import WyGo from '../../utils/WyGo';
	import WyGoLifeGame from './lifegogame'; //var wezrender = require('../../lib/wezrender');
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
	var zr;
	var theimage;
	var circle;
	var droplet;
	var wygolifegame = null;

	export default {
		data() {
			return {
				isPC: uni.getSystemInfoSync().windowWidth > uni.getSystemInfoSync().windowHeight,
				showad: false,
				next_game_view: "",
				toMovePos: null,
				option: null,
				hideclass1: 'hideview',
				hideclass2: 'showview',
				showWinView: false,
				showFailView: false,
				showFailViewContent: '',
				showToMoveView: false,
				topbtnview_top: 0,
				commentview_top: 0,
				gmboard_top: 0,
				bottombtnview_top: 0,
				topbtnview_height: 0,
				commentview_height: 0,
				gmboard_height: 0,
				bottombtnview_height: 0,
				winview_left: 0,
				winview_top: 0,
				winview_height: 0,
				winview_width: 0,
				canvasview: {
					width: 320,
					height: 320
				},
				tikuname: null,
				tikuid: 0,
				pos: 0,
				opentype: 0,
				//为0是缺省，为1表示被分享过来的不管怎么样都可以打开
				gamecomment: "Loading",
				btn_redo_text: "重做",
				btn_redo_disabled: false,
				btn_undo_text: "后退",
				btn_undo_disabled: false,
				btn_research_text: "研究",
				btn_research_disabled: false,
				btn_solution_text: "解答",
				btn_solution_disabled: false,
				btn_share_text: "分享",
				btn_share_disabled: false,
				btn_back_text: "返回",
				btn_back_disabled: false,
				btn_exit_text: "退出",
				btn_exit_disabled: false,
				btn_msg_text: "评论",
				btn_msg_disabled: false,
				showbottombtnview: 1,
				inputimmsg: '',
				showchatview: true,
				chatview_top: 0,
				chatview_height: 0,
				chatscrolltop: '',
				chatmsg_array: [],
				gamecomment: "Loading"
			};
		},

		components: {},
		props: {},
		onShareAppMessage: function() {
			let thepath = "/pages/tiku/tiku?type=1&fromuserid=" + app.globalData.userid + "&tikuname=" + this.option.tikuname +
				"&tikuid=" + this.option.tikuid + "&pos=" + this.option.pos;

			if (wygolifegame != null) {
				thepath = "/pages/tiku/tiku?type=1&fromuserid=" + app.globalData.userid + "&tikuname=" + this.option.tikuname +
					"&tikuid=" + this.option.tikuid + "&pos=" + wygolifegame.getCurPos();
			}

			return {
				title: '棋力提高就用忘忧围棋题库',
				path: thepath,
				imageUrl: '/',
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
		onLoad: function(option) {
			this.option = option;

			if (app.globalData.userid > 0) {
				this.setData({
					hideclass1: 'hideview'
				});
				this.setData({
					hideclass2: 'showview'
				});
				this.initPage();
			} else {
				this.setData({
					hideclass1: 'showview'
				});
				this.setData({
					hideclass2: 'hideview'
				});
			}
		},
		onReady: function() {
			/*
						var context = uni.createContext();  
			 
			   			 context.setStrokeStyle("#FFD700")  
						    context.setLineWidth(2);  
						    context.arc(100, 100, 60, -Math.PI/2, Math.PI, false);  
						    context.moveTo(100, 40);  
						    context.arc(65.36, 100, 69.28, -Math.PI/3, 2*Math.PI/3, false)  
						    context.stroke() ; 
    
						    context.drawImage('../../images/blackstone.png', 100, 100, 30, 30);
					      	context.drawImage('../../images/whitestone.png', 200, 200, 30, 30);
					        //context.draw();  
						  
						    //调用uni.drawCanvas，通过canvasId指定在哪张画布上绘制，通过actions指定绘制行为  
						    uni.drawCanvas({  
						      canvasId: 'image-canvas-1',  
						      actions: context.getActions() //获取绘图动作数组  
						    });  
							// console.log('onReady');
							//var that = this;
			       			//var sgf = "(;AW[dq][dr][ep][fp][fq][ko][kq][co][bo][dn][en][gm][el][cl]AB[cp][dp][do][eo][eq][er][fr][fn][iq]LB[gr:甲][fo:乙]C[黑先：把分裂着的黑子连络起来是要花费一番苦心的。黑甲则白乙断，黑如走乙 ，则白走甲，黑不行。怎么走最好?]; B[gp]; W[gq]; B[gr]; W[hp]; B[hq]; W[go]; B[fo]; W[gp]; B[bq]C[白8 = 黑1黑1的碰绝妙。因中间的白三子图逃而定2、4，则被黑3、5打，至黑9，不但显示了黑1“一子两用”把两方的缺陷都补好了的效果，而且使白成为愚形。])";
							//wygogame=new WyGoGame(this,0,sgf,0,10,1000);
							*/
		},
		onUnload: function() {
			if (zr) {
				zr.dispose();
			}
		},
		methods: {
			layout(adheight) {
				/*	if(adheight==0)
					{
						adheight=95;
					}*/
				let ispad = false;
				let winwidth = uni.getSystemInfoSync().windowWidth;
				let winheight = uni.getSystemInfoSync().windowHeight;

				if (winheight / winwidth < 1.5) {
					ispad = true;
				}

				let diff = winheight - winwidth;
				let topbtnviewtop = adheight;
				let commemnt_top = 0;
				let gameboard_top = adheight + diff * 0.33;

				if (ispad) {
					commemnt_top = 0;
					gameboard_top = adheight + diff * 0.25;
				}

				let chatviewtop = gameboard_top + winwidth;
				let charviewheight = (winheight - chatviewtop) * 0.5;
				let bottombtnview_top = chatviewtop + charviewheight;
				let bottombtnview_height = winheight - bottombtnview_top;
				let winviewheight = winheight - chatviewtop;
				let winviewwidth = winwidth;
				let winviewtop = chatviewtop;
				let winviewleft = 0;

				if (ispad) {
					winviewheight = winheight - chatviewtop;
					winviewwidth = winviewheight * 5;

					if (winviewwidth > winwidth) {
						winviewwidth = winwidth;
					}

					winviewleft = (winwidth - winviewwidth) / 2;
					topbtnviewtop = 0;
				} else {
					winviewheight = charviewheight;
				}

				this.setData({
					canvasview: {
						width: winwidth,
						height: winwidth
					},
					topbtnview_top: topbtnviewtop,
					commentview_top: commemnt_top,
					gmboard_top: gameboard_top,
					bottombtnview_top: bottombtnview_top,
					topbtnview_height: 50,
					commentview_height: gameboard_top - adheight,
					gmboard_height: winwidth,
					chatview_top: chatviewtop,
					chatview_height: charviewheight,
					bottombtnview_height: bottombtnview_height,
					winview_left: winviewleft,
					winview_top: winviewtop,
					winview_height: winviewheight,
					winview_width: winviewwidth
				});
			},

			testData(tikuid) {
				for (let pos = 754; pos < 1689; pos++) {
					var that = this;
					let theurl = app.globalData.host + "/flask/v1/joygo/tiku/" + app.globalData.userid + "/" + tikuid + "/" + pos;
					uni.request({
						url: theurl,
						header: {
							'content-type': 'application/json'
						},
						data: {
							opentype: this.opentype,
							sessionkey: app.globalData.sessionkey
						},
						//请求后台数据成功  
						success: function(res) {
							//that.cancelLoading();
							if (res.data.code >= 0) {
								wygolifegame = new WyGoLifeGame(that, 0, res.data);
								wygolifegame.test_Solution();
							}
						},
						fail: function(res) {
							//that.cancelLoading();
							uni.showModal({
								title: '提示',
								content: '加载失败'
							});
							console.log(res);
						}
					});
				}
			},

			initPage() {
				//this.testData(this.option.tikuid);
				//return;
				var that = this;
				this.setData({
					tikuname: this.option.tikuname,
					tikuid: this.option.tikuid,
					pos: this.option.pos,
					opentype: this.option.opentype
				});
				uni.setNavigationBarTitle({
					title: this.option.tikuname
				});

				if (false) {
					var query = uni.createSelectorQuery(); //选择id

					var that = this;
					query.select('.joygoad').boundingClientRect(function(rect) {
						console.log(rect);

						if (rect != null) {
							that.layout(rect.height);
						} else {
							that.layout(0);
						}
					}).exec();
				} else {
					this.layout(1);
				}

				this.showLoading();
				let theurl = app.globalData.host + "/flask/v1/joygo/tiku/" + app.globalData.userid + "/" + this.option.tikuid + "/" +
					this.option.pos;
				uni.request({
					url: theurl,
					header: {
						'content-type': 'application/json'
					},
					data: {
						opentype: this.opentype,
						sessionkey: app.globalData.sessionkey
					},
					//请求后台数据成功  
					success: function(res) {
						that.cancelLoading();

						if (res.data.code >= 0) {
							wygolifegame = new WyGoLifeGame(that, 0, res.data);
						} else {
							if (res.data.code == -400 || res.data.code == -300) {
								var res = uni.getSystemInfoSync();

								if (res.platform == 'ios') {
									uni.showModal({
										title: '提示',
										content: '该题目是VIP会员题目,成为会员可以使用，苹果手机请联系微信wyz785。'
									});
									return;
								}

								uni.showModal({
									title: '会员',
									content: '该题目是VIP会员题目,请购买VIP会员后使用，谢谢。',
									success: function(sm) {
										if (sm.confirm) {
											app.globalData.toShowBuyProduct();
										} else if (sm.cancel) {
											console.log('用户点击取消');
										}
									}
								});
							} else {
								if (res.data.code = -200) {
									if (parseInt(that.option.pos) >= res.data.endid + 1) {
										that.option.pos = res.data.endid;
										that.initPage();
										return;
									}
								} else {
									let info = res.data.msg + "code= " + res.data.code;
									uni.showModal({
										title: '提示',
										content: info
									});
								}
							}
						}
					},
					fail: function(res) {
						that.cancelLoading();
						uni.showModal({
							title: '提示',
							content: '加载失败'
						});
						console.log(res);
					}
				});
				uni.showShareMenu({
					withShareTicket: true,
					success: function(res) {
						// 分享成功
						console.log('shareMenu share success');
						console.log('分享' + res);
					},
					fail: function(res) {
						// 分享失败
						console.log(res);
					}
				});
			},

			openTiku: function() {
				app.globalData.getUserInfo(this.showview);
			},
			openNoUser: function() {},

			showview() {
				this.setData({
					hideclass1: 'hideview'
				});
				this.setData({
					hideclass2: 'showview'
				});
				this.initPage();
			},

			preventTouchMove: function() {},
			showLoading: function() {
				uni.showLoading({
					title: '加载中'
				});
			},
			cancelLoading: function() {
				uni.hideLoading();
			},
			showWinViewFun: function() {
				this.setData({
					showWinView: true
				});
			},
			closeWinView: function() {
				this.setData({
					showWinView: false
				});
			},
			showFailViewFun: function(type) {
				if (type == 0) {
					this.setData({
						showFailViewContent: '不是正确的解法,您再想想,会有办法的',
						showFailView: true
					});
				} else {
					this.setData({
						showFailViewContent: '选择错误超过三次,请重做',
						showFailView: true
					});
				}
			},
			closeFailView: function() {
				this.setData({
					showFailView: false
				});
			},
			onCancelWinDlg: function() {
				this.closeWinView();
			},
			onCancelFailDlg: function() {
				this.closeFailView();

				if (wygolifegame != null) {
					wygolifegame.btn_redo();
				}
			},
			onNextTopic: function() {
				this.closeWinView();

				if (wygolifegame != null) {
					wygolifegame.onNextTopic();
				}
			},
			showToMoveViewFun: function() {
				this.setData({
					showToMoveView: true
				});
			},
			closeToMoveView: function() {
				this.setData({
					showToMoveView: false
				});
			},
			onToMoveCancel: function() {
				this.closeToMoveView();
			},
			onToMoveConfirm: function() {
				if (wygolifegame != null) {
					wygolifegame.onToMoveConfirm(this.toMovePos);
				}
			},
			toMovePosInput: function(e) {
				this.setData({
					toMovePos: e.detail.value
				});
			},
			onShare: function() {
				if (wygolifegame != null) {
					wygolifegame.onShare();
				}
			},
			testDraw: function() {
				var context = uni.createCanvasContext('image-canvas-1');
				context.setStrokeStyle("#FFD700");
				context.setLineWidth(2);
				context.arc(100, 100, 60, -Math.PI / 2, Math.PI, false);
				context.moveTo(100, 40);
				context.arc(65.36, 100, 69.28, -Math.PI / 3, 2 * Math.PI / 3, false);
				context.stroke();
				context.drawImage("/static/images/blackstone.png", 100, 100, 30, 30);
				context.drawImage("/static/images/whitestone.png", 200, 200, 30, 30);
				context.drawImage("/static/images/blackstone.png", 200, 250, 30, 30);
				context.drawImage("/static/images/whitestone.png", 50, 250, 30, 30); //context.draw();  
				//调用uni.drawCanvas，通过canvasId指定在哪张画布上绘制，通过actions指定绘制行为  

				context.draw()
			},
			addImg: function() {
				if (wygolifegame != null) {
					wygolifegame.addStone(10, 10, 1);
				}
			},
			removeImg: function() {
				// zr.remove(circle);
				//zr.remove(droplet);
				// zr.remoce(theimage);
				//circle.removeSelfFromZr();
				//zr.flush();
				gameboard.deleteStone(10, 10);
			},
			touchBegin: function() {
				console.log(event);

				if (wygolifegame != null) {
					wygolifegame.touchBegin(event);
				}
			},
			touchEnd: function() {
				console.log(event);
				// 设置要下子的位置
				let pos = {
					x: event.clientX,
					y: event.clientY,
				}
				if (!this.isPC) {
					pos.y -= this.commentview_height
				} else {
					pos.x -= (uni.getSystemInfoSync().windowWidth - uni.getSystemInfoSync().windowHeight) / 2
				}


				if (wygolifegame != null) {
					wygolifegame.touchEnd(event);
				}
			},
			btn_redo: function() {
				if (wygolifegame != null) {
					wygolifegame.btn_redo();
				}
			},
			btn_undo: function() {
				if (wygolifegame != null) {
					wygolifegame.btn_undo();
				}
			},
			btn_research: function() {
				if (wygolifegame != null) {
					wygolifegame.btn_research();
				}
			},
			btn_solution: function() {
				if (wygolifegame != null) {
					wygolifegame.btn_solution();
				}
			},
			btn_share: function() {
				if (wygolifegame != null) {
					wygolifegame.btn_share();
				}
			},
			btn_back: function() {
				if (wygolifegame != null) {
					wygolifegame.btn_back();
				}
			},
			onSendMsg: function() {
				wygolifegame.onSendMsg(this.inputimmsg);
			},
			onSendMsgBack: function() {
				wygolifegame.onSendMsgBack(this.inputimmsg);
			},
			btn_msg: function() {
				wygolifegame.btn_msg();
			},
			inputimmsgInput: function(e) {
				this.setData({
					inputimmsg: e.detail.value
				});
			},
			btn_commenttext: function() {
				uni.showModal({
					title: '信息',
					content: this.topcommenttext,
					success: function(res) {}
				});
			},
			prev_game: function() {
				if (wygolifegame != null) {
					wygolifegame.prev_game();
				}
			},
			next_game: function() {
				if (wygolifegame != null) {
					wygolifegame.next_game();
				}
			},
			bingLongTapToMove: function() {
				this.showToMoveViewFun();
			}
		}
	};
</script>
<style>
	@import "./topic.css";
</style>
