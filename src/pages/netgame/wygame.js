import processcmd from './processcmd';

const util = require("../../utils/util.js");

const base = require("../../utils/Base.js");

import Board from '../../utils/board';
import WyGo from '../../utils/WyGo';
import SgfParser from '../../utils/SgfParser';
var app = getApp().globalData;

const lineChart = require("../../utils/myline.js");

let mylinechart = null;
var BEGINCOORD = 1; //X，Y坐标开始的下标

var WYWIDTH = 20; //为了能够装下1-19的数字所需要的数组的宽度

var WYMATRIXWIDTH = 21; //增加了0和20线的虚拟棋盘的宽度，方便用来比较

var MAX_WORDCOORD = 448; //WORD的坐标数组的范围

var MAX_COORD = 418; //最大坐标

var MIN_COORD = 22; //最小坐标

var PASSMOVE_COORD = 0; //PASS的位置值

var MAX_VALID_COORD_COUNT = 361; //空位的个数

var BLANK = 0; //空格的颜色

var WHITE = 1; //白色

var BLACK = 2; //黑色

var OUTBOARD = -1; //棋盘外部的颜色

var LANGUAGE = 0;
var LANGUAGE_CHN = 0;
var LANGUAGE_ENG = 1;
var game_room_type_30M = 0;
var game_room_type_45M = 1;
var game_room_type_60M = 2;
var game_room_type_120M = 3;
var game_room_type_6H = 4;
var game_room_type_24H = 5;
var game_room_type_dumiao_30S_10M = 6;
var game_room_type_dumiao_60S_15M = 7;
var game_room_type_dumiao_15S_10M = 8;
var game_room_type_dumiao_15S_5M = 9;
var game_room_type_15M_60S = 10;
var game_room_type_10M_30S = 11;
var LINE_VALX;
var LINE_VALY;
var STONE_WIDTH;
var FLAG_OFFSET;
var BOARD_BEGINX;
var BOARD_BEGINY;
var BOARD_MARGIN_X;
var BOARD_MARGIN_Y;
var BOARD_WY_SIZE = uni.getSystemInfoSync().windowWidth;
var g_bIsIPAD = false;
var g_nScreenWidth = uni.getSystemInfoSync().windowWidth;
var g_nScreenHeight = uni.getSystemInfoSync().windowHeight;
var g_bIsIPAD = false;
var AMPLIFICATION_RATIO = 1.0;
var STONERATIO1 = 1.04;
var STONERATIO2 = 0.95;
var BEGINCOORD = 1;
var AGREE_RESULT_OK = 0;
var AGREE_RESULT_CONTINUE_COUNT = 1;
var AGREE_RESULT_CONTINUE_MOVE = 2;
var AGREE_RESULT_BEGIN_FORCE_COUNT = 3;
var DISAGREE_BEGIN_COUNT = 4;
var count_result = 0;
var count_win_color = 0;
var count_black_value = 0;
var count_white_value = 0;
var count_blank_value = 0;
var GAMEEND_VALUE_FORCE_DISCONN = -100000002;
var GAMEEND_VALUE_DISCONN_RESIGN = -100000001;
var GAMEEND_VALUE_TIMEOUT_RESIGN = -100000000;
var GAMEEND_VALUE_RESIGN = -99999999;
var GAMEEND_VALUE_PEACE = 0;
var GAMEEND_VALUE_RESIGN_WIN = 99999999;
var GAMEEND_VALUE_TIMEOUT_WIN = 100000000;
var GAMEEND_VALUE_DISCONN_WIN = 100000001;
var GAMEEND_VALUE_FORCE_DISCONN_WIN = 100000002;
var gameend_reason_peace = 0;
var gameend_reason_count = 1;
var gameend_reason_resign = 2;
var gameend_reason_black_timeout = 3;
var gameend_reason_white_timeout = 4;
var gameend_reason_black_disconn = 5;
var gameend_reason_white_disconn = 6;
var gameend_reason_game_not_start = 7;
var gameend_reason_black_forceexit = 8;
var gameend_reason_white_forceexit = 9;
export default class WYNetGame {
  constructor(page, gamemode, fromtype) {
    this.init(page, gamemode, fromtype);
  }

  init(page, gamemode, fromtype) {
    this.initBoardParam();
    this.mylanguage = 0;
    this.page = page;
    this.joygoengine = app.globalData.joygoengine;
    this.processcmd = this.joygoengine.getProcessCmd();
    this.gamemode = gamemode; //0 网络对弈,1 旁观

    this.fromtype = fromtype;
    this.joygoengine.setWyGame(this);
    this.processcmd.DeleteAllIM();
    this.timer_count = 0;
    this.gameboard = null;
    this.wygo = null;
    this.roomid = 0;
    this.gamedeskid = 0, this.cur_game_info = null;
    this.the_send_msg = null;
    this.m_nCallAIBeginTime = 0;
    this.isInAIFuPan = false;
    this.isInAIGoMap = false;
    this.isInAIWinrate = false;
    this.aiGoMapRunStep = 0; //for the time cout 

    this.m_bViewGameInResearch = false;
    this.m_bInResBranch = false;
    this.m_nInResBranchStep = 0;
    this.arResBranchStepInfo = null;
    this.m_nCurRoomType = this.joygoengine.GetCurRoomType();
    this.m_nMaxGameCostTime = this.joygoengine.GetCurRoomMaxGameCostTime();
    this.m_nBlackShowTime = 0;
    this.m_nWhiteShowTime = 0;
    this.m_nTimeSyncMoveTime = 0;
    this.count_set_health = null;
    this.count_controls = null;
    this.countresult_win = null;
    this.judge_status_msg = null;
    this.judge_status_win = null;
    this.counttimeoutProcess = null;
    this.judge_status_timeoutProcess = null;
    this.game_update_time = 0;
    this.m_nMyColor = BLACK;
    this.m_nEnemyColor = WHITE;
    this.enemy_userid = 0;
    this.enemy_nick = "";
    this.m_bInCountProcess = false;
    this.count_set_health = null;
    this.count_controls = null;
    this.firstcallcount = true;
    this.old_playsoundno = -1;
    this.second_count = 0;
    this.disconn_begin_time = 0;
    this.isInJudgeStatus = false;
    this.wygo = new WyGo();
    this.wygo.StartGame(BLACK);
    this.gameboard = new Board(this.wygo);
    this.gameboard.setViewGame(this.IsViewMode());
    this.updateBoard();
    this.page.showMoveButton(true);
    this.m_nCurStepMoveTime = base.getCurTime();
    this.checkButtons();
    this.waitGameTimer = null;

    if (this.gamemode == 0) {
      this.stargame();
    }
  }

  clear() {
    this.joygoengine.setWyGame(null);
    this.processcmd.DeleteAllIM();
    clearTimeout(this.waitGameTimer);
  }

  waitGameTimeout() {
    if (this.cur_game_info == null) {
      uni.showModal({
        title: '信息',
        content: '超时，没有匹配到合适的对手，请返回重试',
        success: function (res) {
          uni.navigateBack();
        }
      });
    }
  }

  stargame() {
    this.page.setData({
      bottomcomment: '等待其他玩家加入对局...'
    });
    let timeoutset = 30000;

    if (this.fromtype == 1) {
      timeoutset = 60000;
    }

    this.waitGameTimer = setTimeout(this.waitGameTimeout.bind(this), timeoutset);

    if (this.fromtype == 0) {
      this.processcmd.cmd_GetCurrentGame();
    } else if (this.fromtype == 1) {} else if (this.fromtype == 2) {
      let existGameRoomID = this.joygoengine.getExistGameRoomID();

      if (existGameRoomID >= 0) {
        this.processcmd.cmd_UserEnterRoom(existGameRoomID, 0, 0);
      }
    }
  }

  OnUserEnterRoom_Ret(msg) {
    this.m_nCurRoomType = this.joygoengine.GetCurRoomType();
    this.m_nMaxGameCostTime = this.joygoengine.GetCurRoomMaxGameCostTime();

    if (msg.Result >= 0) {
      if (msg.ExistGameDeskID > 0) {
        this.gamedeskid = msg.ExistGameDeskID;
        this.processcmd.cmd_GetGameInfo(msg.RoomID, msg.ExistGameDeskID);
      } else {
        //this.processcmd.cmd_InviteOtherPlayer(10137);
        if (!this.IsViewMode()) {
          this.processcmd.cmd_SitDownDesk(true, 0, 0);
        } else {
          this.processcmd.cmd_GetGameInfo(this.roomid, this.gamedeskid);
        }
      }
    }
  }

  initBoardParam() {
    var nStoneType = 0;

    if (!g_bIsIPAD) {
      AMPLIFICATION_RATIO = 2.6;
    }

    var nScreenWidth = uni.getSystemInfoSync().windowWidth;
    BOARD_WY_SIZE = nScreenWidth;

    if (g_bIsIPAD) {
      BOARD_BEGINX = 34.62 * nScreenWidth / 768.0;
      LINE_VALX = 38.82 * nScreenWidth / 768.0;
      LINE_VALY = 38.82 * nScreenWidth / 768.0;

      if (nStoneType == 0) {
        STONE_WIDTH = LINE_VALX * STONERATIO1;
      } else {
        STONE_WIDTH = LINE_VALX * STONERATIO2;
      }

      FLAG_OFFSET = STONE_WIDTH * 0.13;
      BOARD_MARGIN_X = BOARD_BEGINX;
      BOARD_MARGIN_Y = BOARD_BEGINX;
      BOARD_BEGINY = BOARD_MARGIN_Y;
    } else {
      BOARD_BEGINX = 14.42 * nScreenWidth / 320.0; //这里的数字是不拉伸的时候的数组

      LINE_VALX = 16.175 * nScreenWidth / 320.0;
      LINE_VALY = 16.175 * nScreenWidth / 320.0;

      if (nStoneType == 0) {
        STONE_WIDTH = LINE_VALX * STONERATIO1;
      } else {
        STONE_WIDTH = LINE_VALX * STONERATIO2;
      }

      FLAG_OFFSET = STONE_WIDTH * 0.13;
      BOARD_MARGIN_X = BOARD_BEGINX;
      BOARD_MARGIN_Y = BOARD_BEGINX; //这里的数字是不拉伸的时候的数组

      BOARD_BEGINY = BOARD_MARGIN_Y;
    }
  }

  touchBegin(event) {
    this.gameboard.touchBegin(event);
  }

  touchEnd(event) {
    this.gameboard.touchEnd(event);
    let movecoord = this.gameboard.getMoveCursorCoord();
    this.checkButtons();
    let clickedcoord = this.gameboard.getClickedCoord();

    if (this.count_controls != null && clickedcoord > 0) {
      this.click_continue_count(clickedcoord);
    }
  }

  onClickMove() {
    let movecoord = this.gameboard.getMoveCursorCoord();
    this.clickedCoord(movecoord);
  }

  clickedCoord(wMoveCoord) {
    if (this.IsViewMode()) {
      var nextMoveColor = this.wygo.GetNextMoveColor();

      if (this.wygo.CanMove(wMoveCoord, nextMoveColor)) {
        if (!this.m_bInResBranch) {
          this.m_bInResBranch = true;
          this.m_nInResBranchStep = this.wygo.GetCurrentStep();
          this.arResBranchStepInfo = new Array();
          var stepinfo = this.wygo.GetStepInfo();

          for (var i = 0; i < stepinfo.length; i++) {
            this.arResBranchStepInfo[i] = stepinfo[i];
          }
        }

        this.arResBranchStepInfo[this.wygo.GetCurrentStep()] = wMoveCoord;
        let number = this.wygo.GetCurrentStep() - this.m_nInResBranchStep + 1;
        this.gameboard.drawStoneNumber(wMoveCoord, number);
        this.Move(wMoveCoord, this.wygo.GetNextMoveColor());
      }
    } else {
      if (this.wygo.GetNextMoveColor() == this.m_nMyColor) {
        if (this.wygo.CanMove(wMoveCoord, this.wygo.GetNextMoveColor())) {
          this.processcmd.cmd_GoMove(this.cur_game_info.GameDeskID, this.enemy_userid, wMoveCoord, this.wygo.GetNextMoveColor(), this.wygo.GetCurrentStep());
          this.Move(wMoveCoord, this.wygo.GetNextMoveColor());
        } else if (wMoveCoord == 0) {
          this.processcmd.cmd_GoMove(this.cur_game_info.GameDeskID, this.enemy_userid, wMoveCoord, this.wygo.GetNextMoveColor(), this.wygo.GetCurrentStep());
          this.Move(wMoveCoord, this.wygo.GetNextMoveColor());
        }

        this.checkButtons();
      }
    }
  }

  PlaceMove(coord) {
    if (coord == 0) {
      this.wygo.PlaceMove(0);
      return true;
    } else if (this.wygo.CanMove(coord, this.wygo.GetNextMoveColor())) {
      this.wygo.PlaceMove(coord); //this.updateBoard(false);

      return true;
    } else {
      this.wygo.PlaceMove(0);
      return true;
    }

    return false;
  }

  MoveEx(coord) {
    if (coord == 0) {
      this.wygo.Move(0);
      return true;
    } else if (this.wygo.CanMove(coord, this.wygo.GetNextMoveColor())) {
      this.wygo.Move(coord);
      this.updateBoard(false);
      return true;
    } else {
      this.wygo.Move(0);
      return true;
    }

    return false;
  }

  MoveNoSound(coord) {
    let color = this.wygo.GetNextMoveColor();

    if (coord == 0) {
      this.wygo.Move(0);
      this.playpass(color);
      this.updateBoard(true);
    } else if (this.wygo.CanMove(coord, color)) {
      this.wygo.Move(coord);
      this.playmove();
      this.updateBoard(true);
    } else {
      return false;
    }

    return true;
  }

  Move(coord, color) {
    if (this.wygo.GetNextMoveColor() != color) {
      return false;
    }

    if (coord == 0) {
      this.wygo.Move(0);
      this.playpass(color);
      this.updateBoard(true);
    } else if (this.wygo.CanMove(coord, color)) {
      this.wygo.Move(coord);
      this.playmove();
      this.updateBoard(true);
    } else {
      return false;
    }

    return true;
  }

  place_Move(coord, color) {
    if (this.wygo.GetNextMoveColor() != color) {
      this.PlaceMove(0);
      this.PlaceMove(coord);
    } else {
      if (this.wygo.CanMove(coord, color)) {
        this.PlaceMove(coord);
      } else {
        this.PlaceMove(0);
        this.PlaceMove(coord, color);
      }
    }

    let gamesavedkey = "renji" + this.gamemode;
    uni.setStorage({
      key: gamesavedkey,
      data: this.wygo.GetStepInfo()
    });
    return;
  }

  checkButtons() {
    if (this.IsViewMode()) {
      if (this.IsInCountProcess()) {
        this.page.setData({
          btn_fastprev_disabled: true,
          btn_prev_disabled: true,
          btn_next_disabled: true,
          btn_fastnext_disabled: true,
          btn_count_disabled: false
        });
        this.page.setData({
          btn_count_disabled: false,
          btn_count_text: '数子'
        });

        if (this.count_controls != null) {
          this.page.setData({
            btn_resign_disabled: true,
            btn_count_text: '确认'
          });
        } else {
          this.page.setData({
            btn_resign_disabled: true,
            btn_count_text: '数子'
          });
        }
      } else {
        this.page.setData({
          btn_fastprev_disabled: false,
          btn_prev_disabled: false,
          btn_next_disabled: false,
          btn_fastnext_disabled: false,
          btn_count_disabled: false
        });
      }

      let movecursor = this.gameboard.getMoveCursorCoord();

      if (!this.IsInCountProcess()) {
        this.page.showMoveButton(true);
      } else {
        this.page.showMoveButton(false);
      }

      if (this.m_bViewGameInResearch) {
        this.page.setData({
          bottomcomment: '正在研究模式下'
        });
      } else {
        this.page.setData({
          bottomcomment: '点击棋盘下棋可进入研究'
        });
      }
    } else {
      if (this.IsInCountProcess()) {
        this.page.setData({
          btn_undo_disabled: true,
          btn_pass_disabled: true,
          btn_resign_disabled: false,
          btn_count_disabled: false,
          btn_count_text: '数子'
        });

        if (this.count_controls != null) {
          this.page.setData({
            btn_resign_disabled: true,
            btn_count_text: '确认'
          });
        } else {
          this.page.setData({
            btn_resign_disabled: true,
            btn_count_text: '数子'
          });
        }
      } else if (this.wygo.GetNextMoveColor() != this.m_nMyColor || this.m_nCallCountBeginTime > 0) {
        this.page.setData({
          btn_undo_disabled: true,
          btn_pass_disabled: true,
          btn_resign_disabled: false,
          btn_count_disabled: false,
          btn_count_text: '数子'
        }); //  [m_pPrevGameButton setEnabled:NO];
        //  [m_pNextGameButton setEnabled:NO];
      } else {
        this.page.setData({
          btn_undo_disabled: false,
          btn_pass_disabled: false,
          btn_resign_disabled: false,
          btn_count_disabled: false,
          btn_count_text: '数子'
        });
      }

      let movecursor = this.gameboard.getMoveCursorCoord();

      if (!this.IsInCountProcess()) {
        if (this.IsAvaiable()) {
          if (this.m_nMyColor == this.wygo.GetNextMoveColor()) {
            if (this.wygo.CanMove(movecursor, this.m_nMyColor)) {
              this.page.showMoveButton(true);
              this.page.setData({
                bottomcomment: '请下棋'
              });
            } else {
              this.page.showMoveButton(false);
              this.page.setData({
                bottomcomment: '请点击棋盘下棋'
              });
            }
          } else {
            this.page.showMoveButton(false);
            let info = "等待" + this.enemy_nick + "下棋";
            this.page.setData({
              bottomcomment: info
            });
          }
        } else {
          this.page.showMoveButton(false);
          this.page.setData({
            bottomcomment: '数据加载中...'
          });
        }
      } else {
        this.page.showMoveButton(false);
      }
    }
  }

  updateBoard(addmuber = false) {
    this.gameboard.clearAISuggest();
    this.gameboard.drawAll();
  }

  playaou() {
    let hsound = uni.getStorageSync("havesound");

    if (typeof hsound == "string" && hsound == "") {
      hsound = true;
    }

    if (!hsound) {
      return;
    }

    let audio = null;
    var res = uni.getSystemInfoSync();

    if (res.platform == 'ios') {
      audio = uni.getBackgroundAudioManager();
    } else {
      audio = uni.createInnerAudioContext();
    }

    audio.title = "音乐文件";
    audio.src = "https://www.gog361.com/images/aou.wav";
    audio.play();
    audio = null;
  }

  playmove() {
    let hsound = uni.getStorageSync("havesound");

    if (typeof hsound == "string" && hsound == "") {
      hsound = true;
    }

    if (!hsound) {
      return;
    }

    let audio = null;
    var res = uni.getSystemInfoSync();

    if (res.platform == 'ios') {
      audio = uni.getBackgroundAudioManager();
    } else {
      audio = uni.createInnerAudioContext();
    }

    audio.title = "音乐文件";
    audio.src = "https://www.gog361.com/images/move.wav";
    audio.play();
    audio = null;
  }

  playpass(color) {
    let hsound = uni.getStorageSync("havesound");

    if (typeof hsound == "string" && hsound == "") {
      hsound = true;
    }

    if (!hsound) {
      return;
    }

    let audio = null;
    var res = uni.getSystemInfoSync();

    if (res.platform == 'ios') {
      audio = uni.getBackgroundAudioManager();
    } else {
      audio = uni.createInnerAudioContext();
    }

    audio.title = "音乐文件";

    if (color == BLACK) {
      audio.src = "https://www.gog361.com/images/pass_black.mp3";
    } else {
      audio.src = "https://www.gog361.com/images/pass_white.mp3";
    }

    audio.play();
    audio = null;
  }

  playwin() {
    let hsound = uni.getStorageSync("havesound");

    if (typeof hsound == "string" && hsound == "") {
      hsound = true;
    }

    if (!hsound) {
      return;
    }

    let audio = null;
    var res = uni.getSystemInfoSync();

    if (res.platform == 'ios') {
      audio = uni.getBackgroundAudioManager();
    } else {
      audio = uni.createInnerAudioContext();
    }

    audio.title = "音乐文件";
    audio.src = "https://www.gog361.com/images/win.mp3";
    audio.play();
    audio = null;
  }

  btn_undo() {
    if (this.wygo != null && this.m_nMyColor == this.wygo.GetNextMoveColor() && this.wygo.GetRealStepCount() > 2) {
      this.processcmd.cmd_AskRepend(this.cur_game_info.GameDeskID, app.globalData.userid, this.enemy_userid, this.wygo.GetCurrentStep());
    }
  }

  btn_share() {}

  btn_pass() {
    if (this.wygo != null) {
      if (this.m_nMyColor == this.wygo.GetNextMoveColor()) {
        var that = this;
        uni.showModal({
          title: '信息',
          content: '您确定要PASS一手吗？',
          success: function (res) {
            if (res.confirm) {
              that.clickedCoord(0);
            }
          }
        });
      }
    }
  }

  resignexit() {
    let wincolor = BLACK;

    if (this.m_nMyColor == BLACK) {
      wincolor = WHITE;
    }

    this.processcmd.cmd_Resign(this.cur_game_info.GameDeskID, this.joygoengine.GetMyUserID(), this.enemy_userid, 0, wincolor, this.cur_game_info.GameStartTime);
  }

  btn_resign() {
    var that = this;
    uni.showModal({
      title: '认输',
      content: '您确定要投子认输吗？',
      success: function (res) {
        if (res.confirm) {
          that.resignexit();
        }
      }
    });
  }

  btn_calljudge() {
    this.ask_judge();
  }

  btn_count() {
    this.launch_count();
  }

  btn_share() {
    this.onShare();
  }

  btn_msg() {
    this.page.setData({
      showbottombtnview: 0
    });
  }

  btn_exit() {
    if (this.IsViewMode()) {
      uni.navigateBack();
    } else {
      let items = ['完全退出游戏', '暂时退出游戏'];
      var that = this;
      uni.showActionSheet({
        itemList: items,
        itemColor: '#007aff',

        success(res) {
          if (res.tapIndex == 0) {
            that.complete_exit();
          } else if (res.tapIndex == 1) {
            uni.navigateBack();
          }
        }

      });
    }
  }

  btn_more() {
    if (this.IsViewMode()) {
      let items = ['退出游戏', 'AI胜率评估'];
      var that = this;
      uni.showActionSheet({
        itemList: items,
        itemColor: '#007aff',

        success(res) {
          if (res.tapIndex == 0) {
            uni.navigateBack();
          } else if (res.tapIndex == 1) {
            that.start_ai_pinggu();
          }
        }

      });
    } else {
      let items = ['完全退出游戏', '暂时退出游戏'];
      var that = this;
      uni.showActionSheet({
        itemList: items,
        itemColor: '#007aff',

        success(res) {
          if (res.tapIndex == 0) {
            that.complete_exit();
          } else if (res.tapIndex == 1) {
            uni.navigateBack();
          }
        }

      });
    }
  }

  canuseaipingu() {
    if (app.globalData.userstar > 0) {
      return true;
    }

    var today = base.getToday();
    let savedday = uni.getStorageSync("useaipinggusavedday");
    let solutiontimes = uni.getStorageSync("useaipinggutimes");

    if (savedday == today) {
      if (solutiontimes < 5) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  btn_fastprev() {
    for (let i = 0; i < 15; i++) {
      if (this.wygo != null && this.wygo.GetRealStepCount() > 0) {
        this.wygo.Repend();

        if (this.m_bInResBranch) {
          this.m_bViewGameInResearch = true;

          if (this.wygo.GetCurrentStep() <= this.m_nInResBranchStep) {
            this.m_bInResBranch = false;
            this.m_nInResBranchStep = 0;
            this.arResBranchStepInfo = null;
            this.gameboard.clearStoneNumbers();
          } else {
            var number = this.wygo.GetCurrentStep() - this.m_nInResBranchStep;
            var movecoord = this.wygo.GetCurMoveCoord();
            this.gameboard.drawStoneNumber(movecoord, number);
          }
        } else {
          this.m_bViewGameInResearch = false;

          if (this.sgf_current != null) {
            this.sgf_current = this.sgf_current._parent;
            this.showComment();
            this.showVary();
            this.showLabels();
          }
        }
      }
    }

    this.updateBoard();
    this.checkButtons();
  }

  btn_prev() {
    if (this.wygo != null && this.wygo.GetRealStepCount() > 0) {
      this.wygo.Repend();

      if (this.m_bInResBranch) {
        this.m_bViewGameInResearch = true;

        if (this.wygo.GetCurrentStep() <= this.m_nInResBranchStep) {
          this.m_bInResBranch = false;
          this.m_nInResBranchStep = 0;
          this.arResBranchStepInfo = null;
          this.gameboard.clearStoneNumbers();
        } else {
          var number = this.wygo.GetCurrentStep() - this.m_nInResBranchStep;
          var movecoord = this.wygo.GetCurMoveCoord();
          this.gameboard.drawStoneNumber(movecoord, number);
        }
      } else {
        this.m_bViewGameInResearch = false;

        if (this.sgf_current != null) {
          this.sgf_current = this.sgf_current._parent;
          this.showComment();
          this.showVary();
          this.showLabels();
        }
      }

      this.updateBoard();
      this.checkButtons();
    }
  }

  btn_next() {
    if (this.m_bInResBranch) {
      if (this.wygo.GetCurrentStep() < this.arResBranchStepInfo.length) {
        let nextmove = this.arResBranchStepInfo[this.wygo.GetCurrentStep()];
        this.MoveEx(nextmove);
        let number = this.wygo.GetCurrentStep() - this.m_nInResBranchStep;
        this.gameboard.drawStoneNumber(nextmove, number);
      }
    } else if (this.wygo.GetCurrentStep() < this.cur_game_info.CurrentStep) {
      let nextmove = this.cur_game_info.AllStepInfo[this.wygo.GetCurrentStep()];
      this.MoveEx(nextmove);
    } else {
      this.gamedeskid = this.cur_game_info.GameDeskID;
      this.processcmd.cmd_GetGameInfo(this.cur_game_info.RoomID, this.cur_game_info.GameDeskID);
    }

    this.updateBoard();
    this.checkButtons();
  }

  btn_fastnext() {
    if (this.m_bInResBranch) {
      for (let i = 0; i < 15; i++) {
        if (this.wygo.GetCurrentStep() < this.arResBranchStepInfo.length) {
          var nextmove = this.arResBranchStepInfo[this.wygo.GetCurrentStep()];
          this.MoveEx(nextmove);
          var number = this.wygo.GetCurrentStep() - this.m_nInResBranchStep;
          this.gameboard.drawStoneNumber(nextmove, number);
        }
      }
    } else if (this.m_bViewGameInResearch) {
      if (this.wygo.GetCurrentStep() < this.cur_game_info.CurrentStep) {
        for (let i = 0; i < 15; i++) {
          let nextmove = this.cur_game_info.AllStepInfo[this.wygo.GetCurrentStep()];
          this.MoveEx(nextmove);
        }
      }
    } else {
      this.gamedeskid = this.cur_game_info.GameDeskID;
      this.processcmd.cmd_GetGameInfo(this.cur_game_info.RoomID, this.cur_game_info.GameDeskID);
    }

    this.updateBoard();
    this.checkButtons();
  }

  adduseaipingu() {
    var today = base.getToday();
    let savedday = uni.getStorageSync("useaipinggusavedday");
    let useaipinggutimes = uni.getStorageSync("useaipinggutimes");

    if (savedday == today) {
      uni.setStorage({
        key: 'useaipinggutimes',
        data: useaipinggutimes + 1
      });
    } else {
      uni.setStorage({
        key: 'useaipinggusavedday',
        data: today
      });
      uni.setStorage({
        key: 'useaipinggutimes',
        data: 1
      });
    }
  }

  start_ai_pinggu() {
    if (this.canuseaipingu()) {
      this.getAI_PingGu();
    } else {
      var res = uni.getSystemInfoSync();

      if (res.platform == 'ios') {
        uni.showModal({
          title: '提示',
          content: 'AI评估功能每天只可以免费使用五次，成为会员可以无限次的使用该功能，苹果手机请联系微信wyz785。'
        });
        return;
      }

      var that = this;
      uni.showModal({
        title: '提示',
        content: 'AI评估功能每天只可以免费使用五次，成为会员可以无限次的使用该功能',
        success: function (res) {
          if (res.confirm) {
            app.globalData.toShowBuyProduct();
            console.log('用户点击确定');
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });
    }
  }

  showKataNNResult(data) {
    let strInfo = "";
    let nextMoveColor = data.nextmovecolor;
    let whitelead = parseFloat(data.whiteLead);
    let whitecontrols = 0;
    let blackcontrols = 0;

    for (let i = BEGINCOORD; i <= MAX_COORD; i++) {
      let stonecolor = this.wygo.GetStoneColor(i);

      if (stonecolor >= BLANK) {
        let thecolor = BLANK;
        let ownership = parseFloat(data.whiteOwnership[i]);

        if (ownership > 0.5) {
          whitecontrols++;
        } else if (ownership < -0.5) {
          blackcontrols++;
        }
      }
    }

    strInfo = "黑方控制区域:" + blackcontrols;
    strInfo += ",白方控制区域:" + whitecontrols;
    whitelead = whitelead.toFixed(2);

    if (nextMoveColor == BLACK) {
      let winrate = parseFloat(data.whiteLoss) * 100.0;
      winrate = winrate.toFixed(2);
      strInfo += ",当前黑方胜率:";
      strInfo += winrate + "%";

      if (whitelead < 0) {
        strInfo += ",黑方领先: " + -whitelead;
      } else {
        strInfo += ",黑方落后: " + whitelead;
      }
    } else {
      let winrate = parseFloat(data.whiteWin) * 100.0;
      winrate = winrate.toFixed(2);
      strInfo += ",当前白方胜率:";
      strInfo += winrate + "%";

      if (whitelead < 0) {
        strInfo += ",白方落后: " + -whitelead;
      } else {
        strInfo += ",白方领先: " + whitelead;
      }
    }

    this.showTopComment(strInfo);
    this.gameboard.showKataAnalysis(data);
  }

  btn_kata() {
    if (this.isInKata) {
      this.isInKata = false;
      this.gameboard.clearAISuggest();
      this.gameboard.drawAll();
      this.page.setData({
        btn_kata_text: "Kata分析"
      });
    } else {
      this.isInKata = true;
      this.get_Kata_NN_Result();
      this.page.setData({
        btn_kata_text: "同步"
      });
    }
  }

  get_Kata_NN_Result() {
    this.m_nCallAIBeginTime = base.getCurTime();
    let allsteps = this.wygo.GetStepInfo();
    let stepsdata = {
      stepcount: allsteps.length,
      steps: allsteps
    };
    let operation = "kjoygoainn";
    let theurl = "https://www.gog361.com/flask/v1/app/kaiapp";
    var that = this;
    uni.request({
      url: theurl,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: {
        op: operation,
        symmetry: 0,
        nextmovecolor: this.wygo.GetNextMoveColor(),
        userid: app.globalData.userid,
        data: stepsdata
      },
      //请求后台数据成功  
      success: function (res) {
        that.m_nCallAIBeginTime = 0;

        if (res.data.retcode >= 0) {
          that.showKataNNResult(res.data);
        }
      },
      fail: function () {
        that.m_nCallAIBeginTime = 0;
      },
      complete: function () {
        that.m_nCallAIBeginTime = 0;
      }
    });
  }

  showAIResult(data) {
    if (data.moves.length == 0) {
      return;
    }

    let nextmove = data.moves[0].coord;
    let winrate = data.moves[0].winrate;
    let nextMoveColor = data.moves[0].color;
    let strInfo = "";

    if (nextMoveColor == BLACK) {
      strInfo = "当前黑方胜率：";
    } else {
      strInfo = "当前白方胜率：";
    }

    strInfo += winrate + "%";
    let arrayaisuggest = new Array();

    for (let i = 0; i < data.moves.length; i++) {
      if (i >= 6) {
        break;
      }

      arrayaisuggest.push(data.moves[i]);
    }

    this.gameboard.showAISuggest(arrayaisuggest);
    this.showTopComment(strInfo);
  }

  getAI_PingGu() {
    uni.showLoading({
      title: '数据处理中'
    });
    this.m_nCallAIBeginTime = base.getCurTime();
    let allsteps = this.wygo.GetStepInfo();
    let stepsdata = {
      stepcount: allsteps.length,
      steps: allsteps
    };
    let operation = "joygoai";
    var that = this;
    let theurl = "https://www.gog361.com/flask/v1/app/kaiapp";
    uni.request({
      url: theurl,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: {
        op: operation,
        nextmovecolor: this.wygo.GetNextMoveColor(),
        userid: app.globalData.userid,
        data: stepsdata
      },
      //请求后台数据成功  
      success: function (res) {
        uni.hideLoading();
        that.m_nCallAIBeginTime = 0;

        if (res.data.retcode >= 0) {
          if (typeof res.data.moves != "undefined" && res.data.moves != null && base.isArray(res.data.moves) && res.data.moves.length > 0) {
            if (res.data.suggestedmove == -2 || res.data.suggestedmove == -1) {} else {
              that.adduseaipingu();
              that.showAIResult(res.data);
            }
          }
        }
      },
      fail: function () {
        uni.hideLoading();
        that.m_nCallAIBeginTime = 0;
      },
      complete: function () {
        uni.hideLoading();
        that.m_nCallAIBeginTime = 0;
      }
    });
  }

  ask_judge() {
    if (this.wygo == null || this.wygo.GetRealStepCount() < 240) {
      uni.showModal({
        title: '呼叫裁判',
        content: '棋局超过240手才可以呼叫裁判',
        success: function (res) {}
      });
    } else {
      this.processcmd.cmd_ApplyJudgeHelp(this.cur_game_info.GameDeskID, '呼叫裁判', 0);
      uni.showModal({
        title: '呼叫裁判',
        content: '呼叫裁判后请继续下棋，忘忧围棋人工智能裁判会根据对局的情况进行判决，如果没能判决的话，请等会再试',
        success: function (res) {}
      });
    }
  }

  complete_exit() {
    if (this.wygo != null && this.wygo.GetRealStepCount() >= 20) {
      var that = this;
      uni.showModal({
        title: '退出',
        content: '您确定要完全提出游戏吗，完全退出游戏，你将会被判负？',
        success: function (res) {
          if (res.confirm) {
            let forceexit = 0;

            if (that.m_nMyColor == BLACK) {
              forceexit = 8;
            } else {
              forceexit = 9;
            }

            that.processcmd.cmd_ExitMatch(that.cur_game_info.GameDeskID, that.enemy_userid, forceexit, that.m_nEnemyColor, that.cur_game_info.GameStartTime);
            that.joygoengine.setNoCurrGame();
            uni.navigateBack();
          }
        }
      });
    } else {
      let forceexit = 0;

      if (this.m_nMyColor == BLACK) {
        forceexit = 8;
      } else {
        forceexit = 9;
      }

      if (this.cur_game_info != null) {
        this.processcmd.cmd_ExitMatch(this.cur_game_info.GameDeskID, this.enemy_userid, forceexit, this.m_nEnemyColor, this.cur_game_info.GameStartTime);
        this.joygoengine.setNoCurrGame();
      }

      uni.navigateBack();
    }
  }

  onSendMsgBack() {
    this.page.setData({
      showbottombtnview: 1
    });
  }

  onSendMsg(msg) {
    if (msg.length > 0) {
      var sessionid = (this.cur_game_info.RoomID + 1) * 256 + this.cur_game_info.GameDeskID;
      var immsg = {
        fromme: 1,
        MsgType: 0,
        FromUserID: app.globalData.userid,
        ToUserID: this.enemy_userid,
        SessionID: sessionid,
        Msg: msg,
        FromUserNick: this.joygoengine.GetMyNickName()
      };
      this.the_send_msg = immsg;
      this.processcmd.cmd_SendIMMsg(immsg);
    }
  }

  OnIMMessage_Ret(msg) {
    if (msg.Result >= 0) {
      this.page.setData({
        inputimmsg: ""
      });
      var msglist = this.page.data.chatmsg_array;
      msglist.push(this.the_send_msg);
      this.page.setData({
        chatmsg_array: msglist,
        chatscrolltop: 1000 * msglist.length
      });
      this.the_send_msg = null;
    }
  }

  OnIMMessage(msg) {
    if (msg.SessionID < 100000 && msg.SessionID > 256) {
      var msglist = this.page.data.chatmsg_array;

      if (msg.FromUserID == app.globalData.userid) {
        msg.fromme = 1;
      } else {
        msg.fromme = 0;
      }

      msglist.push(msg);
      this.page.setData({
        chatmsg_array: msglist,
        chatscrolltop: 1000 * msglist.length
      });
    }
  }

  launch_count() {
    if (this.IsViewMode()) {
      if (this.IsInCountProcess()) {
        this.stopCountProcess();
      } else if (this.counttimeoutProcess == null) {
        this.count_set_health = null;
        this.count_set_health = new Array();
        this.processcmd.cmd_WebCmdCount(true, this.wygo.GetStepInfo(), this.count_set_health);
        this.counttimeoutProcess = setTimeout(this.CountTimeOut.bind(this), 10000);
        this.ShowInProgress();
      }
    } else {
      if (this.IsInCountProcess() && this.count_controls != null) {
        let blackcount = 0;
        let whitecount = 0;
        let blankcount = 0;

        for (let i = BEGINCOORD; i <= MAX_COORD; i++) {
          if (this.wygo.GetStoneColor(i) >= BLANK) {
            var thecolor = this.count_controls[i];

            if (thecolor == BLACK) {
              blackcount++;
            } else if (thecolor == WHITE) {
              whitecount++;
            } else {
              blankcount++;
            }
          }
        }

        let count_black_value = blackcount * 100;
        let count_white_value = whitecount * 100;
        let count_blank_value = blankcount * 100;
        let count_result = (count_black_value - count_white_value - 750) / 2;
        let count_win_color = BLACK;

        if (count_result < 0) {
          count_win_color = WHITE;
        }

        this.showAskAgreeCountResult(count_win_color, count_result, count_black_value, count_white_value, true);
      } else {
        this.processcmd.cmd_AskStartCount(this.cur_game_info.GameDeskID, this.joygoengine.GetMyUserID(), this.enemy_userid); //this.DisableButton(count_button);
      }
    }

    this.checkButtons();
  }

  click_continue_count(coord) {
    let stoneColor = this.wygo.GetStoneColor(coord);
    let controlColor = this.count_controls[coord];
    let WYHEALTH_OK = 100;
    let WYHEALTH_DEAD = 0;
    let setH = 0;

    if (stoneColor == controlColor) {
      setH = WYHEALTH_DEAD;
    } else {
      setH = WYHEALTH_OK;
    }

    var health = {
      SetCoord: coord,
      SetHealth: setH
    };

    if (this.count_set_health != null) {
      this.count_set_health[this.count_set_health.length] = health;
      this.get_shuzi_count();
    }
  }

  get_shuzi_count() {
    this.m_nCallCountBeginTime = base.getCurTime();
    this.checkButtons();
    let countdata = {
      FirstCall: this.firstcallcount,
      ShuZiSetHealth: this.count_set_health,
      StepInfos: this.wygo.GetStepInfo()
    };
    var that = this;
    let theurl = "https://www.gog361.com/flask/v1/app/aiapp2";
    uni.request({
      url: theurl,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: {
        op: "shuzicount",
        nextmovecolor: this.wygo.GetNextMoveColor(),
        userid: app.globalData.userid,
        data: countdata
      },
      //请求后台数据成功  
      success: function (res) {
        that.firstcallcount = false;

        if (res.data.Result >= 0) {
          that.setCountControls(res.data);
        }

        that.m_nCallCountBeginTime = 0;
        that.checkButtons();
      },
      fail: function () {
        that.m_nCallCountBeginTime = 0;
        that.checkButtons();
      },
      complete: function () {
        that.m_nCallCountBeginTime = 0;
        that.checkButtons();
      }
    });
  }

  showCountResultEx(WinColor, GameResult, blackcount, whitecount, blankcount) {
    let resulttext = "";
    resulttext += "黑方子数:" + blackcount;
    resulttext += " 白方子数:" + whitecount;
    resulttext += " 未定区域:" + blankcount;
    resulttext += ",";

    if (WinColor == BLACK) {
      resulttext += "黑方胜" + base.FormatFloat(GameResult / 100, 2) + "子";
    } else {
      resulttext += "白方胜" + base.FormatFloat(-GameResult / 100, 2) + "子";
    }

    resulttext += "(点击棋子可改变死活判定)";
    this.page.setData({
      bottomcomment: resulttext
    });
  }

  IsMyTurn() {
    if (this.gamemode == 1) {
      return true;
    } else {
      if (this.m_nMyColor == this.wygo.GetNextMoveColor()) {
        return true;
      }
    }

    return false;
  }

  IsAvaiable() {
    return this.cur_game_info != null;
  }

  IsViewMode() {
    if (this.gamemode == 1) {
      return true;
    }

    return false;
  }

  IsInCountProcess() {
    return this.m_bInCountProcess;
  }

  OnLogin_Ret(msg) {
    if (msg.Result >= 0) {
      if (this.wygo != null && this.wygo.GetCurrentStep() > 0) {
        if (this.cur_game_info != null) {
          this.gamedeskid = this.cur_game_info.GameDeskID;
          this.processcmd.cmd_GetGameInfo(this.cur_game_info.RoomID, this.cur_game_info.GameDeskID);
        }
      } else if (IsViewMode()) {
        this.processcmd.cmd_UserEnterRoom(this.roomid, 0, 0);
      } else {}
    }
  }

  InitNetGame(msg) {
    this.DeleteInProgress();
    this.Init();
    this.Update(msg);
    this.InitIMView();
    this.UpdateTime();
  }

  UpdateGame(msg) {
    this.DeleteInProgress();
    this.Init();
    this.Update(msg);
    this.UpdateTime();
  }

  Update(msg) {
    clearTimeout(this.waitGameTimer);
    this.page.setData({
      bottomcomment: '对局已开始...'
    });
    this.game_update_time = base.getTime();

    if (this.cur_game_info != null) {
      if (this.cur_game_info.BUserID != msg.BUserID || this.cur_game_info.WUserID != msg.WUserID) {// 这个是一个新游戏，把黑白的信息删除。
      }
    }

    this.m_bViewGameInResearch = false;
    this.cur_game_info = msg;
    this.page.setData({
      black_nick: this.cur_game_info.BNick,
      white_nick: this.cur_game_info.WNick
    });

    if (this.gamemode == 0) {
      if (this.cur_game_info.BUserID == this.joygoengine.GetMyUserID() || this.cur_game_info.WUserID == this.joygoengine.GetMyUserID()) {
        if (this.cur_game_info.BUserID == this.joygoengine.GetMyUserID()) {
          this.m_nMyColor = BLACK;
          this.m_nEnemyColor = WHITE;
          this.enemy_userid = this.cur_game_info.WUserID;
          this.enemy_nick = this.cur_game_info.WNick + " " + base.GetLevelStr(this.cur_game_info.WScore);
        } else {
          this.m_nMyColor = WHITE;
          this.m_nEnemyColor = BLACK;
          this.enemy_userid = this.cur_game_info.BUserID;
          this.enemy_nick = this.cur_game_info.BNick + " " + base.GetLevelStr(this.cur_game_info.BScore);
          ;
        }
      }
    } else {}

    this.joygoengine.setHasCurrGame();
    this.wygo = null;
    this.wygo = new WyGo();
    this.wygo.StartGame(BLACK);
    this.gameboard.SetWyGo(this.wygo);

    for (var i = 0; i < this.cur_game_info.CurrentStep; i++) {
      let movecoord = this.cur_game_info.AllStepInfo[i];
      let color = this.wygo.GetNextMoveColor();

      if (movecoord == 0) {
        this.wygo.Move(0);
      } else if (this.wygo.CanMove(movecoord, color)) {
        this.wygo.Move(movecoord);
      }
    }

    this.updateBoard();
    this.m_nTimeSyncMoveTime = base.getTime();
    this.InitPlayerInfo();
    this.initExitButton();
    this.InitRoomDeskText();
    this.UpdateStatus();
    this.checkPlayWithBlack();
    this.checkButtons();
  }

  checkPlayWithBlack() {
    if (this.processcmd.IsMyBlack(this.enemy_userid) && this.wygo.GetCurrentStep() < 2) {
      this.showSmpMsg("你正在与黑名单中的玩家进行对弈，请注意");
    }
  }

  GetPlayerTime(nDumiaoRemainTime) {
    var nBlackShowTime = 0;
    var nWhiteShowTime = 0;

    if (this.m_nCurRoomType == game_room_type_dumiao_30S_10M || this.m_nCurRoomType == game_room_type_dumiao_60S_15M || this.m_nCurRoomType == game_room_type_dumiao_15S_10M || this.m_nCurRoomType == game_room_type_dumiao_15S_5M) {
      nBlackShowTime = this.m_nMaxGameCostTime - this.cur_game_info.BlackCostTime;
      nWhiteShowTime = this.m_nMaxGameCostTime - this.cur_game_info.WhiteCostTime;

      if (nDumiaoRemainTime < 0 && this.m_nTimeSyncMoveTime > 0) {
        var nDiff = base.getTime() - this.m_nTimeSyncMoveTime;

        if (Math.abs(nDiff) < Math.abs(-nDumiaoRemainTime)) //这个说明这个diff比读秒准确，此时已经同步过黑方或者白方的耗时了，否则是读秒的数更准确。
          {
            nDumiaoRemainTime = -nDiff;
          } else {}

        if (this.wygo) {
          if (this.wygo.GetNextMoveColor() == BLACK) {
            nBlackShowTime += nDumiaoRemainTime;
          } else {
            nWhiteShowTime += nDumiaoRemainTime;
          }
        }
      }
    } else if (this.m_nCurRoomType == game_room_type_15M_60S || this.m_nCurRoomType == game_room_type_10M_30S) {
      nBlackShowTime = this.m_nMaxGameCostTime - this.cur_game_info.BlackCostTime;
      nWhiteShowTime = this.m_nMaxGameCostTime - this.cur_game_info.WhiteCostTime;

      if (this.wygo.GetNextMoveColor() == BLACK) {
        nBlackShowTime -= nDiff;
      } else {
        nWhiteShowTime -= nDiff;
      }

      if (nBlackShowTime < 0) {
        nBlackShowTime = 0;
      }

      if (nWhiteShowTime < 0) {
        nWhiteShowTime = 0;
      }
    } else {
      nBlackShowTime = this.m_nMaxGameCostTime - this.cur_game_info.BlackCostTime;
      nWhiteShowTime = this.m_nMaxGameCostTime - this.cur_game_info.WhiteCostTime;
      var nDiff = base.getTime() - this.m_nTimeSyncMoveTime;

      if (this.wygo.GetNextMoveColor() == BLACK) {
        nBlackShowTime -= nDiff;
      } else {
        nWhiteShowTime -= nDiff;
      }
    }

    this.m_nBlackShowTime = nBlackShowTime;
    this.m_nWhiteShowTime = nWhiteShowTime;
  }

  GetDuMiaoRemainTime() {
    var nBlackCostTime = this.cur_game_info.BlackCostTime;
    var nWhiteCostTime = this.cur_game_info.WhiteCostTime;
    var nSetTimeOutTime = 0;

    if (this.m_nCurRoomType == game_room_type_dumiao_30S_10M || this.m_nCurRoomType == game_room_type_dumiao_60S_15M || this.m_nCurRoomType == game_room_type_dumiao_15S_10M || this.m_nCurRoomType == game_room_type_dumiao_15S_5M) {
      if (this.m_nCurRoomType == game_room_type_dumiao_30S_10M) {
        nSetTimeOutTime = 30;
      } else if (this.m_nCurRoomType == game_room_type_dumiao_60S_15M) {
        nSetTimeOutTime = 60;
      } else if (this.m_nCurRoomType == game_room_type_dumiao_15S_10M || this.m_nCurRoomType == game_room_type_dumiao_15S_5M) {
        nSetTimeOutTime = 15;
      }

      var nCurTime = base.getTime();
      var nCurSvrTime = this.joygoengine.LocalTimeToSvrTime(nCurTime);

      if (this.cur_game_info.CurStepBeginTime > 0 && nSetTimeOutTime > 0) {
        var nTimeDiff = nCurSvrTime - this.cur_game_info.CurStepBeginTime;

        if (nTimeDiff > 0) {
          var nRemianTime = nSetTimeOutTime - nTimeDiff; //   console.log("nTimeDiff="+nTimeDiff+"nCurTime="+ nCurTime+"nCurSvrTime="+nCurSvrTime+"StepBeginTime+"+this.cur_game_info.CurStepBeginTime);

          return nRemianTime;
        }
      }
    } else if (this.m_nCurRoomType == game_room_type_15M_60S || this.m_nCurRoomType == game_room_type_10M_30S) {
      if (this.cur_game_info.CurStepBeginTime > 0) {
        if (this.m_nCurRoomType == game_room_type_15M_60S) {
          nSetTimeOutTime = 60;
        } else if (this.m_nCurRoomType == game_room_type_10M_30S) {
          nSetTimeOutTime = 30;
        }

        var nTimeNow = time(NULL);
        var nStepCostTime = this.joygoengine.LocalTimeToSvrTime(nTimeNow) - this.cur_game_info.CurStepBeginTime;

        if (nStepCostTime < 0) {
          nStepCostTime = 0;
        }

        var nDiffOfTimeOut = 0;

        if (this.m_nEnemyColor == BLACK) {
          nDiffOfTimeOut = nWhiteCostTime + nStepCostTime - this.m_nMaxGameCostTime;
        } else {
          nDiffOfTimeOut = BlackCostTime + nStepCostTime - this.m_nMaxGameCostTime;
        }

        if (nDiffOfTimeOut <= 0) {
          nSetTimeOutTime = 0;
        } else if (nStepCostTime > nDiffOfTimeOut) //说明第一次读秒
          {
            var nRemianTime = nSetTimeOutTime - nDiffOfTimeOut;
            return nRemianTime;
          } else //说明是后续的读秒
          {
            var nCurTime = time(NULL);
            var nCurSvrTime = this.joygoengine.LocalTimeToSvrTime(nCurTime);
            var nTimeDiff = nCurSvrTime - this.cur_game_info.CurStepBeginTime;

            if (nTimeDiff > 0) {
              var nRemianTime = nSetTimeOutTime - nTimeDiff;
              return nRemianTime;
            }
          }
      }
    }

    return 0;
  }

  UpdateTime() {
    var nDumiaoRemainTime = this.GetDuMiaoRemainTime();
    this.GetPlayerTime(nDumiaoRemainTime);
    var nextMoveColor = this.wygo.GetNextMoveColor();
    var isMe = false;

    if (!this.IsViewMode() && nextMoveColor == this.m_nMyColor) {
      isMe = true;
    }

    var blacktime = base.GetTimeStr(this.m_nBlackShowTime);
    var whitetime = base.GetTimeStr(this.m_nWhiteShowTime);
    var remain = nDumiaoRemainTime;

    if (remain < 0) {
      remain = 0;
    }

    if (nextMoveColor == BLACK) {
      blacktime += " " + remain;
    } else {
      whitetime += " " + remain;
    }

    let dinfo = "[" + (this.roomid + 1);
    dinfo += "-" + this.gamedeskid + "]";
    this.page.setData({
      gameinfo: {
        black_killstones: this.wygo.GetWhiteKilledCount(),
        white_killstones: this.wygo.GetBlackKilledCount(),
        black_time: blacktime,
        white_time: whitetime,
        curstep: this.wygo.GetRealStepCount(),
        deskinfo: dinfo
      }
    });

    if (this.IsViewMode()) {
      uni.setNavigationBarTitle({
        title: '旁观对局'
      });
    } else if (this.joygoengine.IsLogined()) {
      uni.setNavigationBarTitle({
        title: this.joygoengine.GetMyNickName()
      }); //connect_status.color = "#00FF00";
      //connect_status.text = "已连接";
    } else if (this.joygoengine.IsConnected()) {
      uni.setNavigationBarTitle({
        title: '登录中...'
      }); //connect_status.color = "#FF0000";
      //connect_status.text = "已断开";	
    } else {
      uni.setNavigationBarTitle({
        title: '网络断开，重新连接中...'
      });
    }
  }

  updateStatusText(text) {}

  UpdateStatus() {
    if (this.IsInCountProcess()) {
      this.updateStatusText("可通过点击死子改变死活判定修正结果");
    } else {
      if (!this.IsViewMode()) {
        if (this.wygo != null) {
          var nextMoveColor = this.wygo.GetNextMoveColor();

          if (nextMoveColor == this.m_nMyColor) {
            var status = "请下棋...";

            if (this.cur_game_info.InForce) {
              status += "(强制数子状态)";
            }

            this.updateStatusText(status);
          } else {
            var status = "对手" + this.enemy_nick + " 正在思考中";
            this.updateStatusText(status);
          }
        }
      } else {
        if (this.wygo != null) {
          var nextMoveColor = this.wygo.GetNextMoveColor();
          var thetext;

          if (nextMoveColor == BLACK) {
            thetext = "黑方 " + this.cur_game_info.BNick + " 正在思考中...";
          } else {
            thetext = "白方 " + this.cur_game_info.WNick + " 正在思考中...";
          }

          this.updateStatusText(thetext);
        }
      }
    }
  }

  InitStatusText() {}

  setBottomComment() {}

  InitRoomDeskText() {
    var room = this.cur_game_info.RoomID + 1;
    var strTitle = "房间：" + room + " 座位：" + this.cur_game_info.GameDeskID;
    this.page.setData({
      bottomcomment: strTitle
    });
  }

  ShowInProgress() {
    uni.showLoading({
      title: '处理中'
    });
  }

  DeleteInProgress() {
    uni.hideLoading();
  }

  initExitButton() {}

  initPlayerIcon(female, star, x, y) {}

  InitBlackInfo() {
    var strTime = base.GetTimeStr(this.cur_game_info.BlackCostTime);
  }

  InitWhiteInfo() {
    var strTime = base.GetTimeStr(this.cur_game_info.WhiteCostTime);
  }

  InitPlayerInfo() {
    this.InitBlackInfo();
    this.InitWhiteInfo();
  }

  launchJudgeStatus() {
    if (this.judge_status_timeoutProcess == null) {
      this.count_set_health = null;
      this.count_set_health = new Array();
      this.processcmd.cmd_WebCmdJudgeStatus(this.wygo.GetStepInfo(), this.count_set_health);
      this.judge_status_timeoutProcess = setTimeout(this.judge_status_winTimeOut.bind(this), 10000);
      this.ShowInProgress();
    }
  }

  CountTimeOut() {
    uni.showModal({
      title: '信息',
      content: '数子超时',
      success: function (res) {}
    });
    this.counttimeoutProcess = null;
  }

  judge_status_winTimeOut() {
    this.DeleteInProgress();
    this.showSmpMsg("形势判断超时");
    this.judge_status_timeoutProcess = null;
  }

  InitIMView() {}

  OnTimer() {
    this.timer_count++;

    if (this.timer_count % 5 == 0) {
      this.OnSecond();
    }
  }

  OnSecond() {
    this.second_count++;

    if (!this.IsAvaiable()) {
      return;
    }

    this.UpdateTime();

    if (this.IsViewMode()) {
      if (this.game_update_time > 0 && base.getTime() - this.game_update_time > 300 && !this.m_bViewGameInResearch) {
        this.game_update_time = 0;

        if (this.cur_game_info != null) {
          this.gamedeskid = this.cur_game_info.GameDeskID;
          this.processcmd.cmd_GetGameInfo(this.cur_game_info.RoomID, this.cur_game_info.GameDeskID);
        }
      }
    }

    if (this.second_count % 20 == 0) {
      if (!this.IsViewMode()) {
        if (this.cur_game_info != null) {
          this.processcmd.cmd_GetGameSimpleInfo(this.cur_game_info.RoomID, this.cur_game_info.GameDeskID);
        }
      }
    }

    if (!this.IsViewMode()) {
      if (this.joygoengine.IsLogined()) {
        this.disconn_begin_time = 0;
      } else {
        if (this.disconn_begin_time == 0) {
          this.disconn_begin_time = base.getTime();
        } else {
          var diff = base.getTime() - this.disconn_begin_time;

          if (diff % 60 == 0 && diff > 0) {
            var msg = "您的网络断线已经达到" + diff + "秒，请尽快处理，以避免超时告负";
            this.showSmpMsg(msg);
          }
        }
      }
    }
  }

  startToLoadNetGame() {
    if (this.cur_game_info != null) {
      this.roomid = this.cur_game_info.RoomID;
      this.gamedeskid = this.cur_game_info.GameDeskID;
      this.gameboard.clearStoneNumbers();
      this.processcmd.cmd_GetGameInfo(this.cur_game_info.RoomID, this.cur_game_info.GameDeskID);
    }
  }

  OnLogin_Ret() {
    if (this.cur_game_info != null) {
      this.gamedeskid = this.cur_game_info.GameDeskID;
      this.processcmd.cmd_GetGameInfo(this.cur_game_info.RoomID, this.cur_game_info.GameDeskID);
    }
  }

  OnViewGoMove(msg) {
    if (!this.IsViewMode()) {
      return;
    }

    if (!this.IsAvaiable()) {
      return;
    }

    if (this.m_bViewGameInResearch || this.m_bInResBranch || this.isInAIGoMap || this.isInAIWinrate) {
      return;
    } else if (!base.IsValidWordCoord(msg.NextMoveCoord) && msg.NextMoveCoord != 0) {
      return;
    }

    if (this.wygo != null) {
      var bPut = false;

      if (this.wygo.GetCurrentStep() == this.cur_game_info.AllStepInfo.length) {
        if (msg.CurrentStep > this.cur_game_info.CurrentStep + 1) {
          //   alert("OnGoGame need to syncGame because step error");
          this.startToLoadNetGame();
        } else if (msg.NextMoveCoord != 0 && base.IsValidWordCoord(msg.NextMoveCoord, this.wygo.getBoardSize()) && !this.wygo.CanMove(msg.NextMoveCoord, msg.NextMoveColor)) {
          var pStep = this.wygo.GetStepInfo();
          var nCurStep = this.wygo.GetCurrentStep();

          if (nCurStep >= 1 && pStep[nCurStep - 1] == msg.NextMoveCoord || nCurStep >= 2 && pStep[nCurStep - 2] == msg.NextMoveCoord) {
            //it is a repeat move
            return;
          } else {
            //    alert("OnGoGame need to syncGame");
            this.startToLoadNetGame();
          }
        } else {
          this.Move(msg.NextMoveCoord, msg.NextMoveColor);
        }
      } else {}
    }

    this.m_nTimeSyncMoveTime = base.getTime();
    this.cur_game_info.BlackCostTime = msg.BlackCostTime;
    this.cur_game_info.WhiteCostTime = msg.WhiteCostTime;
    this.cur_game_info.CurrentStep = msg.CurrentStep;
    this.cur_game_info.CurStepBeginTime = msg.CurStepBeginTime;
    this.cur_game_info.NextMoveColor = msg.NextMoveColor;
    this.cur_game_info.AllStepInfo[msg.CurrentStep] = msg.NextMoveCoord;
    this.cur_game_info.InForce = msg.InForce;
    this.UpdateTime();
  }

  OnGoMove(msg) {
    if (this.IsViewMode()) {
      return;
    }

    if (!this.IsAvaiable()) {
      return;
    }

    if (!base.IsValidWordCoord(msg.NextMoveCoord, this.wygo.getBoardSize()) && msg.NextMoveCoord != 0) {
      return;
    }

    if (this.wygo != null) {
      if (msg.NextMoveCoord != 0 && base.IsValidWordCoord(msg.NextMoveCoord, this.wygo.getBoardSize()) && !this.wygo.CanMove(msg.NextMoveCoord, msg.NextMoveColor)) {
        var pStep = this.wygo.GetStepInfo();
        var nCurStep = this.wygo.GetCurrentStep();

        if (nCurStep >= 1 && pStep[nCurStep - 1] == msg.NextMoveCoord || nCurStep >= 2 && pStep[nCurStep - 2] == msg.NextMoveCoord) {
          //it is a repeat move
          return;
        } else {
          //    alert("OnGoGame need to syncGame");
          this.startToLoadNetGame();
        }
      } else {
        this.Move(msg.NextMoveCoord, msg.NextMoveColor);
        this.checkButtons();
      }
    }

    this.m_nTimeSyncMoveTime = base.getTime();
    this.cur_game_info.BlackCostTime = msg.BlackCostTime;
    this.cur_game_info.WhiteCostTime = msg.WhiteCostTime;
    this.cur_game_info.CurrentStep = msg.CurrentStep;
    this.cur_game_info.CurStepBeginTime = msg.CurStepBeginTime;
    this.cur_game_info.NextMoveColor = msg.NextMoveColor;
    this.cur_game_info.AllStepInfo[msg.CurrentStep] = msg.NextMoveCoord;
    this.cur_game_info.InForce = msg.InForce;
    this.UpdateTime();
  }

  OnGoMove_Ret(msg) {
    if (msg.Result < 0) {
      this.startToLoadNetGame();
    }

    this.m_nTimeSyncMoveTime = base.getTime();
    this.cur_game_info.BlackCostTime = msg.BlackCostTime;
    this.cur_game_info.WhiteCostTime = msg.WhiteCostTime;
    this.cur_game_info.CurStepBeginTime = msg.CurStepBeginTime;
  }

  OnGetGameSimpleInfo_Ret(msg) {
    if (msg.GameStartTime == this.cur_game_info.GameStartTime) {
      this.m_nTimeSyncMoveTime = base.getTime();
      this.cur_game_info.BlackCostTime = msg.BlackCostTime;
      this.cur_game_info.WhiteCostTime = msg.WhiteCostTime;
      this.cur_game_info.CurStepBeginTime = msg.CurStepBeginTime;

      if (this.wygo.GetCurrentStep() != msg.CurrentStep) {
        this.gamedeskid = this.cur_game_info.GameDeskID;
        this.processcmd.cmd_GetGameInfo(this.cur_game_info.RoomID, this.cur_game_info.GameDeskID);
      }
    }
  }

  OnWebCmdCount_Ret(msg) {
    this.DeleteInProgress();
    clearTimeout(this.counttimeoutProcess);
    this.counttimeoutProcess = null;

    if (msg.Result >= 0) {
      if (!this.IsViewMode()) {
        this.processcmd.cmd_CountWithResult(this.cur_game_info.GameDeskID, this.joygoengine.GetMyUserID(), this.enemy_userid, msg.GameResult, msg.WinColor, msg.Controls);
      } else {
        this.m_bInCountProcess = true;
      }

      this.setCountControls(msg);
      this.updateCountBtnState(true);
      this.checkButtons();
    }
  }

  updateCountBtnState(enable) {
    this.page.setData({
      btn_count_disabled: !enable
    });
  }

  OnCountWithResult(msg) {
    this.m_bInCountProcess = true;

    if (msg.Result >= 0) {
      this.setCountControls(msg);
      this.updateCountBtnState(true);
      this.checkButtons();
    }
  }

  setCountControls(msg) {
    this.count_controls = null;
    this.count_controls = new Array();
    let controls = msg.Controls;
    let blackcount = 0;
    let whitecount = 0;
    let blankcount = 0;

    for (let i = BEGINCOORD; i <= MAX_COORD; i++) {
      if (this.wygo.GetStoneColor(i) >= BLANK) {
        var thecolor = controls.charAt(i);
        this.count_controls[i] = thecolor;

        if (thecolor == BLACK) {
          blackcount++;
        } else if (thecolor == WHITE) {
          whitecount++;
        } else {
          blankcount++;
        }
      }
    }

    this.gameboard.setCountContorl(this.count_controls);
    let count_result = msg.GameResult;
    let count_win_color = msg.WinColor;
    let count_black_value = blackcount;
    let count_white_value = whitecount;
    let count_blank_value = blankcount;
    this.wincolor = msg.WinColor;
    this.gamecountresult = msg.GameResult;
    this.showCountResult(msg.WinColor, msg.GameResult, blackcount, whitecount, blankcount);
  }

  showCountResult(WinColor, GameResult, blackcount, whitecount, blankcount) {
    let resulttext = "";
    resulttext += "黑方子数:" + blackcount;
    resulttext += " 白方子数:" + whitecount;
    resulttext += " 未定区域:" + blankcount;
    resulttext += ",";

    if (WinColor == BLACK) {
      resulttext += "黑方胜" + base.FormatFloat(GameResult / 100, 2) + "子";
    } else {
      resulttext += "白方胜" + base.FormatFloat(-GameResult / 100, 2) + "子";
    }

    this.page.setData({
      bottomcomment: resulttext
    });
  }

  showAskAgreeCountResult(WinColor, GameResult, blackTotalCount, whiteTotalCount, fromme) {
    var resulttext = "对手 " + this.enemy_nick + "要求同意数子结果:";

    if (fromme) {
      resulttext = "";
    }

    resulttext += "黑方子数:";
    resulttext += blackTotalCount / 100;
    resulttext += "白方子数:";
    resulttext += whiteTotalCount / 100;

    if (WinColor == BLACK) {
      resulttext += "黑方胜" + base.FormatFloat(GameResult / 100, 2) + "子";
    } else {
      resulttext += "白方胜" + base.FormatFloat(-GameResult / 100, 2) + "子";
    }

    var that = this;

    if (!this.IsViewMode()) {
      let cancelText = '不同意';
      let confirmText = '同意';

      if (fromme) {
        cancelText = '继续下棋';
        confirmText = '发送结果';
      }

      uni.showModal({
        title: '数子',
        cancelText: cancelText,
        confirmText: confirmText,
        content: resulttext,
        success: function (res) {
          if (fromme) {
            if (res.confirm) {
              that.processcmd.cmd_AskAgreeCountResult(that.cur_game_info.GameDeskID, that.joygoengine.GetMyUserID(), that.enemy_userid, GameResult, WinColor, blackTotalCount, whiteTotalCount);
            } else {
              that.processcmd.cmd_AgreeCountResult(that.cur_game_info.GameDeskID, that.joygoengine.GetMyUserID(), that.enemy_userid, AGREE_RESULT_CONTINUE_MOVE, GameResult, WinColor, blackTotalCount, whiteTotalCount, that.cur_game_info.GameStartTime);
              that.stopCountProcess();
            }
          } else {
            if (res.confirm) {
              that.processcmd.cmd_AgreeCountResult(that.cur_game_info.GameDeskID, that.joygoengine.GetMyUserID(), that.enemy_userid, AGREE_RESULT_OK, GameResult, WinColor, blackTotalCount, whiteTotalCount, that.cur_game_info.GameStartTime);
              that.stopCountProcess();
            } else {
              that.processcmd.cmd_AgreeCountResult(that.cur_game_info.GameDeskID, that.joygoengine.GetMyUserID(), that.enemy_userid, AGREE_RESULT_CONTINUE_MOVE, GameResult, WinColor, blackTotalCount, whiteTotalCount, that.cur_game_info.GameStartTime);
              that.stopCountProcess();
            }
          }
        }
      });
    }
  }

  OnAskAgreeCountResult(msg) {
    this.showAskAgreeCountResult(msg.WinColor, msg.GameResult, msg.BlackValueCount, msg.WhiteValueCount, false);
  }

  showSmpMsg(textmsg) {
    uni.showModal({
      title: '信息',
      content: textmsg,
      success: function (res) {}
    });
  }

  OnAgreeCountResult(msg) {
    if (msg.AgreeResult != AGREE_RESULT_OK) {
      if (msg.AgreeResult == AGREE_RESULT_CONTINUE_COUNT) {
        this.showSmpMsg("对方不同意数子结果，请点击改变死子情况继续数子");
      } else if (msg.AgreeResult == AGREE_RESULT_CONTINUE_MOVE) {
        this.showSmpMsg("对方不同意数子结果，请继续下棋");
        this.stopCountProcess();
      } else if (msg.AgreeResult == AGREE_RESULT_BEGIN_FORCE_COUNT) {
        this.processcmd.cmd_NotifyForceCount();
        this.showSmpMsg("对方不同意数子结果，双方已经进入强制数子状态，当双方同一回合都PASS的时候棋局将自动结束，由系统判断胜负，请在PASS前提光对方的死子。");
        this.stopCountProcess();
      }
    } else {
      this.showSmpMsg("对方同意数子结果，棋局结束。");
      this.stopCountProcess();
    }
  }

  OnNotifyForceCount(msg) {}

  OnWebCmdJudgeStatus_Ret(msg) {}

  OnSvrNotifyGameEnd_ForView(msg) {
    if (this.IsViewMode()) {
      this.showSmpMsg(this.getGameEndInfo_ForView(msg.GameEndResult));
    }
  }

  OnSvrNotifyGameEnd(msg) {
    if (this.IsViewMode()) {
      return;
    }

    var nGameEndReason = msg.GameEndReason;
    var nGameEndResult = msg.GameEndResult;
    var nTheGameEndResult = 0;
    var nMyGotScore = 0;
    var nMyColor = this.m_nMyColor;
    var nWinColor = msg.WinColor;

    if (nGameEndReason == gameend_reason_peace) {
      nTheGameEndResult = GAMEEND_VALUE_PEACE;
      nMyGotScore = 0;
    } else {
      if (nGameEndReason == gameend_reason_black_forceexit) {
        if (this.m_nEnemyColor == BLACK) {
          nTheGameEndResult = GAMEEND_VALUE_FORCE_DISCONN_WIN;
        } else {
          nTheGameEndResult = GAMEEND_VALUE_FORCE_DISCONN;
        }
      } else if (nGameEndReason == gameend_reason_white_forceexit) {
        if (this.m_nEnemyColor == BLACK) {
          nTheGameEndResult = GAMEEND_VALUE_FORCE_DISCONN;
        } else {
          nTheGameEndResult = GAMEEND_VALUE_FORCE_DISCONN_WIN;
        }
      } else if (nGameEndReason == gameend_reason_count) {
        nTheGameEndResult = nGameEndResult;
      } else if (nGameEndReason == gameend_reason_resign) {
        if (nWinColor == nMyColor) {
          nTheGameEndResult = GAMEEND_VALUE_RESIGN_WIN;
        } else {
          nTheGameEndResult = GAMEEND_VALUE_RESIGN;
        }
      } else if (nGameEndReason == gameend_reason_black_timeout) {
        if (nWinColor != WHITE) {
          nWinColor = WHITE;
        }

        if (nMyColor == BLACK) {
          nTheGameEndResult = GAMEEND_VALUE_TIMEOUT_RESIGN;
        } else {
          nTheGameEndResult = GAMEEND_VALUE_TIMEOUT_WIN;
        }
      } else if (nGameEndReason == gameend_reason_white_timeout) {
        if (nWinColor != BLACK) {
          nWinColor = BLACK;
        }

        if (nMyColor == BLACK) {
          nTheGameEndResult = GAMEEND_VALUE_TIMEOUT_WIN;
        } else {
          nTheGameEndResult = GAMEEND_VALUE_TIMEOUT_RESIGN;
        }
      } else if (nGameEndReason == gameend_reason_black_disconn) {
        if (nWinColor != WHITE) {
          nWinColor = WHITE;
        }

        if (nMyColor == BLACK) {
          nTheGameEndResult = GAMEEND_VALUE_DISCONN_RESIGN;
        } else {
          nTheGameEndResult = GAMEEND_VALUE_DISCONN_WIN;
        }
      } else if (nGameEndReason == gameend_reason_white_disconn) {
        if (nWinColor != BLACK) {
          nWinColor = BLACK;
        }

        if (nMyColor == BLACK) {
          nTheGameEndResult = GAMEEND_VALUE_DISCONN_WIN;
        } else {
          nTheGameEndResult = GAMEEND_VALUE_DISCONN_RESIGN;
        }
      } else {
        alert("error");
      }

      if (nMyColor == BLACK) {
        nMyGotScore = msg.BlackGotScore;
      } else {
        nMyGotScore = msg.WhiteGotScore;
      }

      this.wygo = null;
      this.wygo = new WyGo();
      this.wygo.StartGame(BLACK);
      this.gameboard.SetWyGo(this.wygo);
      this.updateBoard();
      this.showSmpMsg(this.getGameEndInfo(nTheGameEndResult, nMyGotScore));
    }
  }

  getGameEndInfo(nResult, nGotScore) {
    var textMsg = "";

    if (this.mylanguage == 0) {
      if (nResult == GAMEEND_VALUE_PEACE) {
        textMsg = "游戏结束,双方和棋。积分 " + nGotScore;
      } else if (nResult == GAMEEND_VALUE_TIMEOUT_WIN) {
        textMsg = "对方超时,游戏结束,恭喜您中盘胜。积分 " + nGotScore;
      } else if (nResult == GAMEEND_VALUE_FORCE_DISCONN || nResult == GAMEEND_VALUE_DISCONN_RESIGN) {
        textMsg = "游戏结束,中盘负。积分 " + nGotScore;
      } else if (nResult == GAMEEND_VALUE_TIMEOUT_RESIGN) {
        textMsg = "您已经超时,游戏结束,中盘负。积分 " + nGotScore;
      } else if (nResult == GAMEEND_VALUE_DISCONN_WIN) {
        textMsg = "对方断线,游戏结束,恭喜您中盘胜。积分" + nGotScore;
      } else if (nResult == GAMEEND_VALUE_FORCE_DISCONN_WIN) {
        if (nGotScore != 0) {
          textMsg = "对方强退出告负,恭喜您中盘胜。积分" + nGotScore;
        } else {
          textMsg = "对方已经退出游戏，游戏结束";
        }
      } else if (nResult == GAMEEND_VALUE_RESIGN_WIN) {
        if (this.m_nEnemyColor == BLACK) {
          textMsg = "游戏结束,恭喜您执白中盘胜。积分 " + nGotScore;
        } else {
          textMsg = "游戏结束,恭喜您执黑中盘胜。积分 " + nGotScore;
        }
      } else if (nResult == GAMEEND_VALUE_RESIGN) {
        if (this.m_nEnemyColor == BLACK) {
          textMsg = "游戏结束,您执白中盘负,加油。积分 " + nGotScore;
        } else {
          textMsg = "游戏结束,您执黑中盘负，加油。积分 " + nGotScore;
        }
      } else if (nResult > 0 && nResult < GAMEEND_VALUE_RESIGN_WIN) {
        if (this.m_nEnemyColor == BLACK) {
          textMsg = "游戏结束,您执白负" + base.FormatFloat(nResult / 100.0, 2) + "子。积分 " + nGotScore;
        } else {
          textMsg = "游戏结束,恭喜您执黑胜" + base.FormatFloat(nResult / 100.0, 2) + "子。积分 " + nGotScore;
        }
      } else if (nResult < 0 && nResult > GAMEEND_VALUE_RESIGN) {
        if (this.m_nEnemyColor == BLACK) {
          textMsg = "游戏结束,恭喜您执白胜" + base.FormatFloat(-nResult / 100.0, 2) + "子。积分 " + nGotScore;
        } else {
          textMsg = "游戏结束,您执黑负" + base.FormatFloat(-nResult / 100.0, 2) + "子。积分" + nGotScore;
        }
      }
    } else if (this.mylanguage == LANGUAGE_ENG) {
      if (nResult == GAMEEND_VALUE_PEACE) {
        textMsg = "Game end, a draw in the game. Score " + nGotScore;
      } else if (nResult == GAMEEND_VALUE_TIMEOUT_WIN) {
        textMsg = "The another player timeout, you win. Score " + nGotScore;
      } else if (nResult == GAMEEND_VALUE_TIMEOUT_RESIGN) {
        textMsg = "You timeout, you lose the game. Score " + nGotScore;
      } else if (nResult == GAMEEND_VALUE_DISCONN_WIN) {
        textMsg = "The another player disconnect, you win. Score " + nGotScore;
      } else if (nResult == GAMEEND_VALUE_FORCE_DISCONN_WIN) {
        textMsg = "The another player force exit, you win. Score " + nGotScore;
      } else if (nResult == GAMEEND_VALUE_RESIGN_WIN) {
        textMsg = "Game end, Congratulation, You win. Score " + nGotScore;
      } else if (nResult == GAMEEND_VALUE_RESIGN || nResult == GAMEEND_VALUE_FORCE_DISCONN || nResult == GAMEEND_VALUE_DISCONN_RESIGN) {
        textMsg = "Game end, Unfortunately, You lose. Score" + nGotScore;
      } else if (nResult > 0 && nResult < GAMEEND_VALUE_RESIGN_WIN) {
        if (this.m_nEnemyColor == BLACK) {
          textMsg = "Game end,Unfortunately, You lose " + base.FormatFloat(nResult / 100.0, 2) + "stones. Score " + nGotScore;
        } else {
          textMsg = "Game end, Congratulation, You win" + base.FormatFloat(nResult / 100.0, 2) + "stones. Score " + nGotScore;
        }
      } else if (nResult < 0 && nResult > GAMEEND_VALUE_RESIGN) {
        if (this.m_nEnemyColor == BLACK) {
          textMsg = "Game end, Congratulation, You win" + base.FormatFloat(-nResult / 100.0, 2) + "stones. Score" + nGotScore;
        } else {
          textMsg = "Game end,Unfortunately, You lose" + base.FormatFloat(-nResult / 100.0, 2) + "stones. Score " + nGotScore;
        }
      }
    }

    return textMsg;
  }

  getGameEndInfo_ForView(nResult) {
    var strInfo = "";

    if (nResult == 0) {
      if (this.mylanguage == LANGUAGE_CHN) {
        strInfo = "你所观战的棋局已经结束,双方和棋.";
      } else {
        strInfo = "The game is end by draw.";
      }
    } else if (nResult > 0) {
      if (Math.abs(nResult) > 360000) {
        if (this.mylanguage == LANGUAGE_CHN) {
          strInfo = "你所观战的棋局已经结束,黑中盘胜。";
        } else {
          strInfo = "The game is end, black side win.";
        }
      } else {
        if (this.mylanguage == LANGUAGE_CHN) {
          strInfo = "你所观战的棋局已经结束,黑方胜" + base.FormatFloat(nResult / 100.0, 2) + "子。";
        } else {
          strInfo = "The game is end, black side win" + base.FormatFloat(nResult / 100.0, 2) + " stones.";
        }
      }
    } else {
      if (Math.abs(nResult) > 360000) {
        if (this.mylanguage == LANGUAGE_CHN) {
          strInfo = "你所观战的棋局已经结束,白中盘胜。";
        } else {
          strInfo = "The game is end, white side win.";
        }
      } else {
        if (this.mylanguage == LANGUAGE_CHN) {
          strInfo = "你所观战的棋局已经结束,白方胜 " + base.FormatFloat(-nResult / 100.0, 2) + "子。";
        } else {
          strInfo = "The game is end, white side win " + base.FormatFloat(-nResult / 100.0, 2) + "stones.";
        }
      }
    }

    return strInfo;
  }

  OnAskRepend(msg) {
    var rependtxt = "对手" + this.enemy_nick + "请求悔棋";
    var that = this;
    uni.showModal({
      title: '悔棋',
      cancelText: '不同意',
      confirmText: '同意',
      content: rependtxt,
      success: function (res) {
        if (res.confirm) {
          that.processcmd.cmd_AllowRepend(that.cur_game_info.GameDeskID, that.joygoengine.GetMyUserID(), that.enemy_userid, that.wygo.GetCurrentStep() - 2, true);
        } else {
          that.processcmd.cmd_AllowRepend(that.cur_game_info.GameDeskID, that.joygoengine.GetMyUserID(), that.enemy_userid, that.wygo.GetCurrentStep(), false);
        }
      }
    });
  }

  toRepend(nRependToColor, stepAfterRepend) {
    if (this.wygo.GetCurrentStep() <= stepAfterRepend) {
      return;
    }

    var nCurMoveColor = this.wygo.GetCurMoveColor();

    if (nCurMoveColor == nRependToColor) {
      this.wygo.Repend();
    } else {
      this.wygo.Repend();
      this.wygo.Repend();
    }

    this.updateBoard();
    this.checkButtons();
  }

  OnAllowRepend(msg) {
    if (msg.Allow == 1) {
      this.toRepend(this.m_nMyColor, msg.StepAfterRepend);
    } else {
      var rependtxt = "对手" + this.enemy_nick + "不同意您的悔棋请求";
      this.showSmpMsg(rependtxt);
    }
  }

  OnAllowRepend_Ret(msg) {
    if (msg.Allow == 1) {
      this.toRepend(this.m_nEnemyColor, msg.StepAfterRepend);
    }
  }

  OnAskStartCount(msg) {
    var counttext = "对手" + this.enemy_nick + "请求开始数子";
    var that = this;
    uni.showModal({
      title: '数子',
      cancelText: '不同意',
      confirmText: '同意',
      content: counttext,
      success: function (res) {
        if (res.confirm) {
          that.m_bInCountProcess = true;
          that.processcmd.cmd_AgreeStartCount(that.cur_game_info.GameDeskID, that.joygoengine.GetMyUserID(), that.enemy_userid, true, that.cur_game_info.GameStartTime);
        } else {
          that.processcmd.cmd_AgreeStartCount(that.cur_game_info.GameDeskID, that.joygoengine.GetMyUserID(), that.enemy_userid, false, that.cur_game_info.GameStartTime);
        }
      }
    });
  }

  getCountResultMsg() {
    return "";
  }

  stopCountProcess() {
    this.judge_status_msg = null;
    this.count_controls = null;
    this.count_set_health = null;
    this.m_bInCountProcess = false;
    this.updateCountBtnState(false);
    this.checkButtons();
    this.gameboard.clearCountControl();
  }

  toLaunchCount() {
    this.m_bInCountProcess = true;
    this.count_set_health = null;
    this.count_set_health = new Array();
    this.processcmd.cmd_WebCmdCount(true, this.wygo.GetStepInfo(), this.count_set_health);
    this.counttimeoutProcess = setTimeout(this.CountTimeOut.bind(this), 10000);
    this.updateCountBtnState(true);
  }

  OnAgreeStartCount(msg) {
    if (msg.Agree == 1) {
      this.toLaunchCount();
    } else {
      let counttxt = "对手" + this.enemy_nick + "不同意开始数子";
      this.showSmpMsg(counttxt);
    }
  }

  OnEnemyResgin(msg) {}

  OnAskPeace(msg) {
    var thetxt = "对手" + this.enemy_nick + "请求和棋";
    var that = this;
    uni.showModal({
      title: '和棋',
      cancelText: '不同意',
      confirmText: '同意',
      content: thetxt,
      success: function (res) {
        if (res.confirm) {
          that.processcmd.cmd_AgreePeace(that.cur_game_info.GameDeskID, that.joygoengine.GetMyUserID(), that.enemy_userid, true, that.cur_game_info.GameStartTime);
        } else {
          that.processcmd.cmd_AgreePeace(that.cur_game_info.GameDeskID, that.joygoengine.GetMyUserID(), that.enemy_userid, false, that.cur_game_info.GameStartTime);
        }
      }
    });
  }

  OnAgreePeace(msg) {
    if (msg.Agree == 1) {} else {
      var counttxt = "对手" + this.enemy_nick + "不同意和棋";
      this.showSmpMsg(counttxt);
    }
  }

  OnApplyJudgeHelp_Ret(msg) {
    this.showSmpMsg("您的申请已经提交成功,忘忧围棋裁判会尽快的响应你的请求，如无法响应你的请求，请事后发送邮件到joygo_judge@hotmail.com,可以进行事后裁决。");
  }

  OnGetCurrentGame_Ret(msg) {
    if (msg.Result >= 0 && msg.HaveGame == 1) {
      this.processcmd.cmd_UserEnterRoom(msg.ExistGameRoomID, 0, 0);
    }
  }

  OnGetOnlineUsers_Ret(msg) {}

  startviewgame(roomid, deskid, blackuserid, whiteuserid) {
    this.roomid = roomid;
    this.gamedeskid = deskid;

    if (!this.joygoengine.IsLogined()) {
      this.joygoengine.checkLogin();
    } else {
      if (this.joygoengine.GetCurRoomID() != roomid) {
        this.processcmd.cmd_UserEnterRoom(roomid, 0, 0);
      } else {
        this.processcmd.cmd_GetGameInfo(roomid, deskid);
      }
    }
  }

  showJudgeStatusResult_Text(judgeResult) {
    let nextMoveColor = this.wygo.GetNextMoveColor();
    let nBlackTotalMu = judgeResult.BlackMu.length + judgeResult.WhiteKilledCount + 2 * judgeResult.WhiteDeadStones.length;
    let nWhoteTotalMu = judgeResult.WhiteMu.length + judgeResult.BlackKilledCount + 2 * judgeResult.BlackDeadStones.length;
    let summary = "黑方实地" + nBlackTotalMu + "目," + "白方实地" + nWhoteTotalMu + "目,";
    let mudiff = nBlackTotalMu - nWhoteTotalMu - 8;

    if (mudiff >= 0) {
      summary += "黑方实地优势 " + mudiff + " 目,";
    } else {
      summary += "白方实地领先 " + -mudiff + " 目,";
    } // add but


    if (mudiff > 0 && nextMoveColor == BLACK && judgeResult.Winrate < 0.4 || mudiff > 0 && nextMoveColor == WHITE && judgeResult.Winrate > 0.6 || mudiff < 0 && nextMoveColor == WHITE && judgeResult.Winrate < 0.4 || mudiff < 0 && nextMoveColor == BLACK && judgeResult.Winrate > 0.6) {
      summary += "但是,";
    }

    if (nextMoveColor == BLACK) {
      summary += "黑棋胜率:" + base.changeTwoDecimal(judgeResult.Winrate * 100.0) + "%";

      if (judgeResult.Winrate > 0.9) {
        if (this.cwygo != null && this.wygo.GetCurrentStep() > 80) {
          summary += "黑棋胜势";
        } else {
          summary += "黑棋明显优势";
        }
      } else if (judgeResult.Winrate > 0.8) {
        summary += "黑棋有较大优势";
      } else if (judgeResult.Winrate > 0.6) {
        summary += "黑棋有优势";
      } else if (judgeResult.Winrate < 0.1) {
        if (this.cwygo != null && this.wygo.GetCurrentStep() > 80) {
          summary += "白棋胜势";
        } else {
          summary += "白棋明显优势";
        }
      } else if (judgeResult.Winrate < 0.2) {
        summary += "白棋有较大优势";
      } else if (judgeResult.Winrate < 0.4) {
        summary += "白棋有优势";
      } else {
        summary += "双方形势接近";
      }
    } else {
      summary += "白棋胜率:" + base.changeTwoDecimal(judgeResult.Winrate * 100.0) + "%,";

      if (judgeResult.Winrate > 0.9) {
        if (this.cwygo != null && this.wygo.GetCurrentStep() > 80) {
          summary += "白棋胜势";
        } else {
          summary += "白棋明显优势";
        }
      } else if (judgeResult.Winrate > 0.8) {
        summary += "白棋有较大优势";
      } else if (judgeResult.Winrate > 0.6) {
        summary += "白棋有优势";
      } else if (judgeResult.Winrate < 0.1) {
        if (this.cwygo != null && this.cwygo != null && this.wygo.GetCurrentStep() > 80) {
          summary += "黑棋胜势";
        } else {
          summary += "黑棋明显优势";
        }
      } else if (judgeResult.Winrate < 0.2) {
        summary += "黑棋有较大优势";
      } else if (judgeResult.Winrate < 0.4) {
        summary += "黑棋有优势";
      } else {
        summary += "双方形势接近";
      }
    }

    if (this.cwygo != null && this.wygo.GetCurrentStep() < 80) {
      summary += ",棋盘还大,还有机会";
    }

    this.showTopComment(summary);
  }

  showTopComment(text) {
    this.page.setData({
      "showgameinfo": false,
      "showtopcomment": true,
      "topcommenttext": text
    });
  }

  closeTopComment() {
    this.page.setData({
      "showtopcomment": false,
      "showgameinfo": true
    });
  }

  showJudgeStatusResult(judgeResult) {
    this.showJudgeStatusResult_Text(judgeResult);
    this.gameboard.setJudgeStatus(judgeResult);
  }

  clearJudgeStatusResult(judgestatus) {
    this.gameboard.clearJudgeStatus();
    this.closeTopComment();
  }

  getAI_JudgeStatus() {
    uni.showLoading({
      title: '数据处理中'
    });
    this.m_nCallAIBeginTime = base.getCurTime();
    let allsteps = this.wygo.GetStepInfo();
    let stepsdata = {
      stepcount: allsteps.length,
      steps: allsteps
    };
    let operation = "judgestatus";
    var that = this;
    let theurl = "https://www.gog361.com/flask/v1/app/aiapp2";
    uni.request({
      url: theurl,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: {
        op: operation,
        nextmovecolor: this.wygo.GetNextMoveColor(),
        userid: app.globalData.userid,
        data: stepsdata
      },
      //请求后台数据成功  
      success: function (res) {
        uni.hideLoading();
        that.m_nCallAIBeginTime = 0;

        if (res.data.retcode >= 0) {
          that.showJudgeStatusResult(res.data);
        }
      },
      fail: function () {
        uni.hideLoading();
        that.m_nCallAIBeginTime = 0;
      },
      complete: function () {
        uni.hideLoading();
        that.m_nCallAIBeginTime = 0;
      }
    });
  }

  btn_judgestatus() {
    if (this.isInJudgeStatus) {
      this.clearJudgeStatusResult();
      this.isInJudgeStatus = false;
      this.page.setData({
        btn_judgestatus_text: "形势判断"
      });
    } else {
      this.getAI_JudgeStatus();
      this.isInJudgeStatus = true;
      this.page.setData({
        btn_judgestatus_text: "结束判断"
      });
    }
  }

  btn_aifupan() {
    if (this.isInAIFuPan) {
      this.isInAIFuPan = false;
      this.page.setData({
        showlinecanvas: false
      });
      this.page.setData({
        btn_aifupan_text: "AI复盘"
      });
      this.page.setData({
        showmovebutton: true,
        showchatview: true
      });
    } else {
      this.isInAIFuPan = true;
      this.page.setData({
        showlinecanvas: true
      });
      this.getAIFuPanData();
      this.page.setData({
        btn_aifupan_text: "结束复盘"
      });
      this.page.setData({
        showmovebutton: false,
        showchatview: false
      });
    }
  }

  start_ai_gomap() {
    this.aiGoMapRunStep = 0;
    this.ai_gomap_call_next();
  }

  show_ai_gomap_next_move(wMoveCoord) {
    var nextMoveColor = this.wygo.GetNextMoveColor();

    if (this.wygo.CanMove(wMoveCoord, nextMoveColor)) {
      if (!this.m_bInResBranch) {
        this.m_bInResBranch = true;
        this.m_nInResBranchStep = this.wygo.GetCurrentStep();
        this.arResBranchStepInfo = new Array();
        var stepinfo = this.wygo.GetStepInfo();

        for (var i = 0; i < stepinfo.length; i++) {
          this.arResBranchStepInfo[i] = stepinfo[i];
        }
      }

      this.arResBranchStepInfo[this.wygo.GetCurrentStep()] = wMoveCoord;
      let number = this.wygo.GetCurrentStep() - this.m_nInResBranchStep + 1;
      this.gameboard.drawStoneNumber(wMoveCoord, number);
      this.Move(wMoveCoord, this.wygo.GetNextMoveColor());
    }

    this.aiGoMapRunStep++;

    if (this.aiGoMapRunStep < 10) {
      this.ai_gomap_call_next();
    }
  }

  ai_gomap_call_next() {
    if (this.isInAIGoMap) {
      this.m_nCallAIBeginTime = base.getCurTime();
      let allsteps = this.wygo.GetStepInfo();
      let stepsdata = {
        stepcount: allsteps.length,
        steps: allsteps
      };
      let operation = "joygoai";
      var that = this;
      let theurl = "https://www.gog361.com/flask/v1/app/aiapp2";
      uni.request({
        url: theurl,
        method: "POST",
        header: {
          'content-type': 'application/json'
        },
        data: {
          op: operation,
          nextmovecolor: this.wygo.GetNextMoveColor(),
          userid: app.globalData.userid,
          data: stepsdata
        },
        //请求后台数据成功  
        success: function (res) {
          uni.hideLoading();
          that.m_nCallAIBeginTime = 0;

          if (res.data.retcode >= 0) {
            if (typeof res.data.moves != "undefined" && res.data.moves != null && base.isArray(res.data.moves) && res.data.moves.length > 0) {
              if (res.data.suggestedmove == -2 || res.data.suggestedmove == -1) {} else {
                let nextmove = res.data.suggestedmove;
                that.show_ai_gomap_next_move(nextmove);
              }
            }
          }
        },
        fail: function () {},
        complete: function () {}
      });
    }
  }

  btn_aigomap() {
    if (this.isInAIGoMap) {
      this.isInAIGoMap = false;
      this.page.setData({
        btn_aigomap_text: "AI变化图"
      });
      this.page.setData({
        showmovebutton: true
      });
      this.startToLoadNetGame();
    } else {
      this.isInAIGoMap = true;
      this.page.setData({
        btn_aigomap_text: "结束变化图"
      });
      this.page.setData({
        showmovebutton: true
      });
      this.start_ai_gomap();
    }
  }

  btn_aiwinrate() {
    if (this.isInAIWinrate) {
      this.isInAIWinrate = false;
      this.gameboard.clearAISuggest();
      this.gameboard.drawAll();
      this.closeTopComment();
      this.page.setData({
        btn_aiwinrate_text: "AI推荐"
      });
      this.startToLoadNetGame();
    } else {
      this.isInAIWinrate = true;
      this.start_ai_pinggu();
      this.page.setData({
        btn_aiwinrate_text: "同步"
      });
    }
  }

  showAIFuPanChart(winrates) {
    let steps = winrates.length;
    let blackwinrates = new Array();
    let whitewinrates = new Array();
    let xdata = new Array();

    for (let i = 0; i < steps; i++) {
      if (i % 2 == 0) {
        blackwinrates.push(parseFloat(winrates[i]) * 100);
        whitewinrates.push(-1); //skip step;
      } else {
        whitewinrates.push(parseFloat(winrates[i]) * 100);
        blackwinrates.push(-1); //skip step;
      }

      xdata.push(i);
    }

    mylinechart = lineChart.init('mylinechart', {
      tipsCtx: 'chart-tips',
      width: uni.getSystemInfoSync().windowWidth,
      height: this.page.data.linechart_height,
      margin: 10,
      yUnit: '',
      xAxis: xdata,
      lines: [{
        color: 'blue',
        points: blackwinrates
      }, {
        color: 'green',
        points: whitewinrates
      }]
    });
    mylinechart.draw();
  }

  touchLineChartBegin(event) {
    if (mylinechart != null) {
      mylinechart.touchBegin(event);
    }
  }

  touchLineChartEnd(event) {
    if (mylinechart != null) {
      let step = mylinechart.touchEnd(event);
    }
  }

  getAIFuPanData() {
    uni.showLoading({
      title: '数据加载中'
    });
    let allsteps = this.wygo.GetStepInfo();
    let stepsdata = {
      stepcount: allsteps.length,
      steps: allsteps
    };
    let operation = "aifupan";
    var that = this;
    let theurl = "https://www.gog361.com/flask/v1/app/aiapp2";
    uni.request({
      url: theurl,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: {
        op: operation,
        nextmovecolor: this.wygo.GetNextMoveColor(),
        userid: app.globalData.userid,
        data: stepsdata
      },
      //请求后台数据成功  
      success: function (res) {
        uni.hideLoading();
        that.m_nCallAIBeginTime = 0;

        if (res.data.retcode >= 0) {
          if (typeof res.data.winrates != "undefined" && res.data.winrates != null && base.isArray(res.data.winrates) && res.data.winrates.length > 0) {
            that.showAIFuPanChart(res.data.winrates);
          }
        }
      },
      fail: function () {
        uni.hideLoading();
      },
      complete: function () {
        uni.hideLoading();
      }
    });
  }

}