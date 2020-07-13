const util = require("../../utils/util.js");

const base = require("../../utils/Base.js");

import Board from '../../utils/board';
import WyGo from '../../utils/WyGo';
import SgfParser from '../../utils/SgfParser';
var gap = 336 / (15 - 1);
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
var LIFE_SGF_TYPE_PHASE = 0;
var LIFE_SGF_TYPE_SPECIAL = 1;
var LIFE_SGF_TYPE_SHOUJIN = 2;
var LIFE_SGF_TYPE_GUANZI = 3;

const lineChart = require("../../utils/myline.js");

let mylinechart = null;
var app = getApp().globalData; //赢法的统计数组

export default class WyGoGame {
  constructor(page, gamemode, mycolor, rangzimunber, moves) {
    this.init(page, gamemode, mycolor, rangzimunber, moves);
  }

  init(page, gamemode, mycolor, rangzimunber, moves) {
    this.setInterval = -1;
    this.m_nCallCountBeginTime = 0;
    this.m_nCallAIBeginTime = 0;
    this.m_nBlackCostTime = 0;
    this.m_nWhiteCostTime = 0;
    this.m_nCurStepMoveTime = 0;
    this.m_nTimerTimes = 0;
    this.wincolor = BLANK;
    this.gamecountresult = 0;
    this.page = page;
    this.m_nMyColor = mycolor;
    this.rangzimunber = rangzimunber;
    this.gamemode = gamemode;
    this.initBoardParam();
    this.m_bInResearchMode = false;
    this.count_set_health = null;
    this.count_controls = null;
    this.firstcallcount = true;
    this.sgf_root = null;
    this.sgf_current = null;
    this.sgf_begin = null;
    this.gameisend = false;
    this.isInAIGoMap = false;
    this.isInKata = false;
    this.savedGameStep = 0;
    this.all_coords = new Set();
    {
      this.wygo = new WyGo();
      this.wygo.StartGame(BLACK);
      this.gameboard = new Board(this.wygo);

      if (this.gamemode == 2) {
        this.gameboard.setViewGame(true);
      }

      if (moves != null) {
        for (let i = 0; i < moves.length; i++) {
          this.wygo.Move(moves[i], this.wygo.GetNextMoveColor());
        }
      } else if (this.rangzimunber > 0) {
        this.setRangzi();
      }

      this.updateBoard();
      this.m_nCurStepMoveTime = base.getCurTime();
      this.checkButtons();
    }
    this.startInterval();
  }

  restartgame() {
    this.clearInterval();
    this.wygo = null;
    this.gameboard.SetWyGo(this.wygo);
    this.updateBoard();
    let winwidth = uni.getSystemInfoSync().windowWidth;
    let winheight = uni.getSystemInfoSync().windowHeight;
    this.page.setData({
      startview_top: winheight * 0.66,
      startview_height: winheight * 0.33,
      showstartview: true
    }); //this.init(this.page,this.gamemode,this.m_nMyColor,this.rangzimunber,null);
  }

  clearInterval() {
    var that = this; //清除计时器  即清除setInter

    clearInterval(that.setInterval);
  }

  startInterval() {
    var that = this; //将计时器赋值给setInter

    that.setInterval = setInterval(function () {
      that.onTimer();
    }, 100);
  }

  exitView() {
    this.clearInterval();
    uni.navigateBack();
  }

  setRangzi() {
    let arr = [];

    if (this.rangzimunber == 2) {
      arr = [88, 0, 352];
    } else if (this.rangzimunber == 3) {
      arr = [88, 0, 352, 0, 340];
    } else if (this.rangzimunber == 4) {
      arr = [88, 0, 352, 0, 340, 0, 100];
    } else if (this.rangzimunber == 5) {
      arr = [88, 0, 352, 0, 340, 0, 100, 0, 220];
    } else if (this.rangzimunber == 6) {
      arr = [88, 0, 352, 0, 340, 0, 100, 0, 214, 0, 226];
    } else if (this.rangzimunber == 7) {
      arr = [88, 0, 352, 0, 340, 0, 100, 0, 214, 0, 226, 0, 220];
    } else if (this.rangzimunber == 8) {
      arr = [88, 0, 352, 0, 340, 0, 100, 0, 214, 0, 226, 0, 94, 0, 346];
    } else if (this.rangzimunber == 9) {
      arr = [88, 0, 352, 0, 340, 0, 100, 0, 214, 0, 226, 0, 94, 0, 346, 0, 220];
    }

    for (let i = 0; i < arr.length; i++) {
      this.wygo.PlaceMove(arr[i]);
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

  PlaceMove(coord) {
    if (coord == 0) {
      this.wygo.PlaceMove(0); //this.gameboard.showPassMove(this.wygo.GetNextMoveColor());

      return true;
    } else if (this.wygo.CanMove(coord, this.wygo.GetNextMoveColor())) {
      this.wygo.PlaceMove(coord); //this.updateBoard(false);

      return true;
    } else {
      this.wygo.PlaceMove(0); //this.gameboard.showPassMove(this.wygo.GetNextMoveColor());

      return true;
    }

    return false;
  }

  Move(coord, color) {
    if (this.wygo.GetNextMoveColor() != color) {
      return false;
    }

    if (coord == 0) {
      this.wygo.Move(0); //this.gameboard.showPassMove(color);

      this.playpass(color);
    } else if (this.wygo.CanMove(coord, color)) {
      this.wygo.Move(coord);
      this.playmove();
      this.updateBoard(true);
    } else {
      return false;
    }

    if (this.wygo.GetCurMoveColor() == BLACK) {
      this.m_nBlackCostTime += base.getCurTime() - this.m_nCurStepMoveTime;
      this.m_nCurStepMoveTime = base.getCurTime();
    } else {
      this.m_nWhiteCostTime += base.getCurTime() - this.m_nCurStepMoveTime;
      this.m_nCurStepMoveTime = base.getCurTime();
    }

    let gamesavedkey = "lurutopic_2020";
    uni.setStorage({
      key: gamesavedkey,
      data: this.wygo.GetStepInfo()
    });
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

  startRandSgf(sgf) {
    var sgfparser = new SgfParser(sgf);
    this.sgf_root = sgfparser.getSGFResult();
    this.sgf_current = this.sgf_root;
    this.showplacedStones();
    this.sgf_current = this.sgf_GetFirstMove();
    this.showRandSgfStones();
    this.updateBoard();
  }

  sgf_GetFirstMove() {
    if (this.sgf_root != null) {
      var temp = this.sgf_root;

      while (typeof temp.B == "undefined" && typeof temp.W == "undefined" || temp.B == null && temp.W == null) {
        if (temp._children != null && temp._children.length > 0) {
          temp = temp._children[0];
        } else {
          break;
        }
      }

      return temp;
    }

    return null;
  }

  getNodeCoord(sgfnode) {
    if (sgfnode != null && typeof sgfnode.B != "undefined") {
      var label = sgfnode.B;
      var coord = this.sgf_getCoord(label);

      if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
        return coord;
      }
    } else if (sgfnode != null && typeof sgfnode.W != "undefined") {
      var label = sgfnode.W;
      var coord = this.sgf_getCoord(label);

      if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
        return coord;
      }
    }

    return 0;
  }

  getNodeColor(sgfnode) {
    if (sgfnode != null && typeof sgfnode.B != "undefined") {
      var label = sgfnode.B;
      var coord = this.sgf_getCoord(label);

      if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
        return BLACK;
      }
    } else if (sgfnode != null && typeof sgfnode.W != "undefined") {
      var label = sgfnode.W;
      var coord = this.sgf_getCoord(label);

      if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
        return WHITE;
      }
    }

    return BLANK;
  }

  showRandSgfStones() {
    let stepcount = 0;
    let sgfnode = this.sgf_current;
    let coord = 0;
    let color = BLANK;

    while (sgfnode._children != null && sgfnode._children.length > 0) {
      stepcount++;
      coord = this.getNodeCoord(sgfnode);
      color = this.getNodeColor(sgfnode);
      sgfnode = sgfnode._children[0];
    }

    let showSteps = parseInt(stepcount * 0.75);
    sgfnode = this.sgf_current;
    stepcount = 0;

    while (sgfnode._children != null && sgfnode._children.length > 0) {
      stepcount++;

      if (stepcount > showSteps) {
        break;
      }

      coord = this.getNodeCoord(sgfnode);
      color = this.getNodeColor(sgfnode);

      if (color == this.wygo.GetNextMoveColor()) {
        this.wygo.Move(coord);
      } else {
        this.wygo.PassMove();
        this.wygo.Move(coord);
      }

      sgfnode = sgfnode._children[0];
    }

    this.m_nMyColor = this.wygo.GetNextMoveColor();
  }

  getsgfstr(x, y) {
    let sgfstr = "abcdefghijklmnopqrstuvwxyz";
    let str = "[";
    str += sgfstr[x];
    str += sgfstr[y];
    str += "]";
    return str;
  }

  sgf_getCoord(movelabel) {
    if (movelabel == null || movelabel == "") {
      return 0;
    } else if (movelabel.length == 2) {
      var nX = Math.floor(movelabel.charCodeAt(0) - 'a'.charCodeAt(0) + 1);
      var nY = Math.floor(movelabel.charCodeAt(1) - 'a'.charCodeAt(0) + 1);
      var coord = base.CoordToWord(nX, nY, this.wygo.getBoardSize());
      return coord;
    }

    return 0;
  }

  showplacedStones() {
    if (this.sgf_current != null) {
      if (typeof this.sgf_current.AB != "undefined" && this.sgf_current.AB.length > 0) {
        if (base.isArray(this.sgf_current.AB)) {
          for (var i = 0; i < this.sgf_current.AB.length; i++) {
            var label = this.sgf_current.AB[i];
            var coord = this.sgf_getCoord(label);

            if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
              this.place_Move(coord, BLACK);
            }
          }
        } else if (typeof this.sgf_current.AB == "string") //just one stone
          {
            var label = this.sgf_current.AB;
            var coord = this.sgf_getCoord(label);

            if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
              this.place_Move(coord, BLACK);
            }
          }
      }

      if (typeof this.sgf_current.AW != "undefined" && this.sgf_current.AW.length > 0) {
        if (base.isArray(this.sgf_current.AW)) {
          for (var i = 0; i < this.sgf_current.AW.length; i++) {
            var label = this.sgf_current.AW[i];
            var coord = this.sgf_getCoord(label);

            if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
              this.place_Move(coord, WHITE);
            }
          }
        } else if (typeof this.sgf_current.AW == "string") //just one stone
          {
            var label = this.sgf_current.AW;
            var coord = this.sgf_getCoord(label);

            if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
              this.place_Move(coord, WHITE);
            }
          }
      } //this.sgf_current=this.sgf_current._children[0];


      this.sgf_begin = this.sgf_current;
      let sgf_begin_color = this.sgf_begin._children[0];
      this.m_nMyColor = this.getNodeColor(sgf_begin_color);

      if (this.wygo.GetNextMoveColor() != this.m_nMyColor) {
        this.wygo.PlaceMove(0);
      }
    }
  }

  onTimer() {
    /*	this.m_nTimerTimes++;
    	if(this.gamemode!=2 &&
    		!this.gameisend && this.m_nTimerTimes%10==0 )
    	{
    		let timecost=base.getCurTime()-this.m_nCallAIBeginTime;
    		if(this.wygo.GetNextMoveColor()!=this.m_nMyColor && timecost>30) 
    		{
    			this.getAINextMove();
    		}
    	}
    	*/
    this.updateTitleInfo();
  }

  getTimeString(time) {
    let str = "";

    if (time < 60) {
      str = time;
    } else if (time < 3600) {
      let a = Math.floor(time / 60);

      if (a > 0) {
        if (a < 10) {
          str += "0" + a;
        } else {
          str += a;
        }

        str += ":";
      }

      str += time % 60;
    } else {
      let a = Math.floor(time / 3600);
      let b = Math.floor((time - a * 3600) / 60);
      let c = time % 60;

      if (a > 0) {
        if (a < 10) {
          str += "0" + a;
        } else {
          str += a;
        }

        str += ":";
      }

      if (b > 0) {
        if (b < 10) {
          str += "0" + b;
        } else {
          str += b;
        }

        str += ":";
      }

      str += c;
    }

    return str;
  }

  updateTitleInfo() {
    if (this.wygo != null) {
      let blacktime = "";
      let whitetime = "";
      let btime = 0;
      let wtime = 0;

      if (this.wygo.GetNextMoveColor() == BLACK) {
        btime = this.m_nBlackCostTime + base.getCurTime() - this.m_nCurStepMoveTime;
        wtime = this.m_nWhiteCostTime;
      } else {
        btime = this.m_nBlackCostTime;
        wtime = this.m_nWhiteCostTime + base.getCurTime() - this.m_nCurStepMoveTime;
      }

      blacktime = this.getTimeString(btime);
      whitetime = this.getTimeString(wtime);
      let blackplayer = "黑方";
      let whiteplayer = "白方";

      if (this.m_nMyColor == BLACK) {
        blackplayer = "黑方";
        whiteplayer = "白方";
      }

      this.page.setData({
        gameinfo: {
          black_killstones: this.wygo.GetWhiteKilledCount(),
          white_killstones: this.wygo.GetBlackKilledCount(),
          black_time: blacktime,
          white_time: whitetime,
          curstep: this.wygo.GetRealStepCount()
        },
        black_nick: blackplayer,
        white_nick: whiteplayer
      });
    }
  }

  isInCountProcess() {
    return this.count_controls != null;
  }

  clickedCoord(wMoveCoord) {
    if (this.wygo.GetNextMoveColor() == this.m_nMyColor || this.gamemode == 2) {
      if (this.wygo.CanMove(wMoveCoord, this.wygo.GetNextMoveColor())) {
        this.Move(wMoveCoord, this.wygo.GetNextMoveColor());
      }

      this.checkButtons();
    }
  }

  checkButtons() {
    if (this.wygo == null) {
      return;
    }

    if (this.wygo != null && this.wygo.GetNextMoveColor() != this.m_nMyColor || this.m_nCallCountBeginTime > 0) {
      this.page.setData({
        btn_undo_disabled: true,
        btn_pass_disabled: true,
        btn_resign_disabled: false,
        btn_count_disabled: false
      }); //  [m_pPrevGameButton setEnabled:NO];
      //  [m_pNextGameButton setEnabled:NO];
    } else {
      if (this.isInCountProcess()) {
        this.page.setData({
          btn_undo_disabled: true,
          btn_pass_disabled: true,
          btn_resign_disabled: false,
          btn_count_disabled: false
        });
      } else {
        this.page.setData({
          btn_undo_disabled: false,
          btn_pass_disabled: false,
          btn_resign_disabled: false,
          btn_count_disabled: false
        });
      }
    }

    if (this.gamemode == 2) {
      this.page.setData({
        btn_undo_disabled: false,
        btn_pass_disabled: false,
        btn_resign_disabled: false,
        btn_count_disabled: false
      });
    }

    let movecursor = this.gameboard.getMoveCursorCoord();

    if (!this.isInCountProcess()) {
      if (this.wygo != null && this.m_nMyColor == this.wygo.GetNextMoveColor() || this.gamemode == 2) {
        if (this.wygo != null && this.wygo.CanMove(movecursor, this.wygo.GetNextMoveColor())) {
          this.page.showMoveButton(true);
          let txt = '请落子...';
          this.page.setData({
            bottomcomment: txt
          });
        } else {
          this.page.showMoveButton(false);
          this.page.setData({
            bottomcomment: '请点击棋盘落子'
          });
        }
      }
    }

    this.page.showMoveButton(true);
  }

  updateBoard(addmuber = false) {
    this.gameboard.clearAISuggest();
    this.gameboard.drawAll();
  }

  Test2() {
    uni.playVoice({
      filePath: 'https://www.gog361.com/images/aou.wav',
      complete: function () {}
    });
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
    if (this.gamemode == 2) {
      if (this.wygo != null && this.wygo.GetRealStepCount() >= 1) {
        this.wygo.Repend();
        this.updateBoard();
        this.checkButtons();
      }
    } else {
      if (this.wygo != null && this.m_nMyColor == this.wygo.GetNextMoveColor() && this.wygo.GetRealStepCount() >= 2) {
        this.wygo.Repend();
        this.wygo.Repend();
        this.updateBoard();
        this.checkButtons();
      }
    }
  }

  btn_AI() {
    this.start_ai_pinggu();
  }

  btn_share() {}

  btn_pass() {
    if (this.wygo != null) {
      this.wygo.PassMove();
      this.updateBoard();
      this.checkButtons();
    }
  }

  getGameSgfStr() {
    let blackstones = "AB";
    let whitestones = "AW";

    for (let i = 0; i < 19; i++) for (let j = 0; j < 19; j++) {
      let coord = base.CoordToWord(i + 1, j + 1, this.wygo.getBoardSize());
      let color = this.wygo.GetStoneColor(coord);

      if (color == BLACK) {
        let temp = this.getsgfstr(i, j);
        blackstones += temp;
      } else if (color == WHITE) {
        let temp = this.getsgfstr(i, j);
        whitestones += temp;
      }
    }

    let sgfstr = "(;GM[1]AP[WangYouWeiQi]SZ[19]";
    sgfstr += blackstones;
    sgfstr += whitestones;
    sgfstr += ")";
    return sgfstr;
  }

  submit_Topic(inputtitle, firstmovecolor) {
    if (inputtitle == "") {
      inputtitle = app.globalData.userInfo.nickName + "提交的题目";
    }

    var that = this;
    let theurl = "https://www.gog361.com/flask/v1/joygo/addtopic/" + app.globalData.userid;
    let nick = app.globalData.userInfo.nickName;

    if (app.globalData.joygoengine != null) {
      nick = app.globalData.joygoengine.GetMyNickName();
    }

    let sgfstr = this.getGameSgfStr();
    uni.request({
      url: theurl,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: {
        title: inputtitle,
        sgf: sgfstr,
        fromuserid: app.globalData.userid,
        fromusernick: app.globalData.userInfo.nickName,
        firstmovecolor: firstmovecolor,
        userid: app.globalData.userid,
        sessionkey: app.globalData.sessionkey
      },
      //请求后台数据成功  
      success: function (res) {
        if (res.data.code >= 0) {
          let gamesavedkey = "lurutopic_2020";
          uni.setStorage({
            key: gamesavedkey,
            data: null
          });
          that.page.setData({
            showinputview: false
          });
          that.showSmpMsg("提交成功");
        } else {
          that.showSmpMsg("提交失败:" + res.data.msg);
        }
      },
      fail: function () {
        that.showSmpMsg("提交失败，请重试");
      },
      complete: function () {}
    });
  }

  btn_real_submit() {
    this.submit_Topic(this.page.data.topictitleinput, this.page.data.firstmovecolor);
  }

  btn_submit() {
    this.page.setData({
      showinputview: true
    });
  }

  resignexit() {
    let wincolor = BLACK;

    if (this.m_nMyColor == BLACK) {
      wincolor = WHITE;
    }

    this.save_game_record(wincolor, -99999999);
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

  btn_count() {
    this.launch_count();
  }

  btn_share() {}

  btn_back() {
    this.exitView();
  }

  getRandSgf() {
    var that = this;
    let theurl = "https://www.gog361.com/flask/v1/joygo/randsgf/" + app.globalData.userid;
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
          let sgf = res.data.sgf;
          that.startRandSgf(sgf);
        }
      },
      fail: function () {},
      complete: function () {}
    });
  }

  showAIResign() {
    var that = this;
    uni.showModal({
      title: '祝贺您获胜',
      content: '电脑认输，祝贺你获得胜利',
      success: function (res) {
        let gamesavedkey = "renji" + that.gamemode;
        uni.setStorage({
          key: gamesavedkey,
          data: null
        });
        that.save_game_record(that.m_nMyColor, 99999999);
      }
    });
  }

  getAINextMove() {
    this.m_nCallAIBeginTime = base.getCurTime();
    let allsteps = this.wygo.GetStepInfo();
    let stepsdata = {
      stepcount: allsteps.length,
      steps: allsteps
    };
    let operation = "joygoai";
    let theurl = "https://www.gog361.com/flask/v1/app/aiapp2";

    if (this.gamemode == 3) {
      operation = "aiweak";
    } else if (this.gamemode == 4) {
      operation = "ainetwork";
    } else if (this.gamemode == 5) {
      operation = "kjoygoai";
      theurl = "https://www.gog361.com/flask/v1/app/kaiapp";
    }

    var that = this;
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
        that.m_nCallAIBeginTime = 0;

        if (res.data.retcode >= 0) {
          if (that.gamemode == 3) {
            if (typeof res.data.nextmove != "undefined") {
              if (that.wygo != null) {
                let nextmove = res.data.nextmove;
                that.Move(nextmove, that.wygo.GetNextMoveColor());
                that.checkButtons();

                if (app.globalData.userstar > 0) {
                  let txt = "请下棋....";
                  that.page.setData({
                    bottomcomment: txt
                  });
                }
              }
            }
          } else if (typeof res.data.moves != "undefined" && res.data.moves != null && base.isArray(res.data.moves) && res.data.moves.length > 0) {
            if (res.data.suggestedmove == -2) {
              that.gameisend = true;
              that.showAIResign();
            } else {
              let nextmove = res.data.moves[0].coord; //let winrate=res.data.moves[0].winrate;

              if (that.wygo != null && that.wygo.CanMove(nextmove, that.wygo.GetNextMoveColor())) {
                that.Move(nextmove, that.wygo.GetNextMoveColor());
                that.checkButtons();

                if (app.globalData.userstar > 0) {
                  let txt = "请下棋....";
                  that.page.setData({
                    bottomcomment: txt
                  });
                }
              }
            }
          }
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

  launch_count() {
    if (this.count_controls == null) {
      this.page.setData({
        btn_count_text: "结束"
      });
      this.firstcallcount = true;
      this.count_set_health = new Array();
      this.count_controls = new Array();
      this.get_shuzi_count();
    } else {
      if (this.wincolor > BLANK) {
        this.gameisend = true;
        this.save_game_record(this.wincolor, this.gamecountresult);
        let gamesavedkey = "renji" + this.gamemode;
        uni.setStorage({
          key: gamesavedkey,
          data: null
        });
      }

      this.wincolor = BLANK;
      this.page.setData({
        btn_count_text: "数子",
        bottomcomment: ''
      });
      this.count_set_health = null;
      this.count_controls = null;
      this.gameboard.setCountContorl(null);
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

  getAiUserID() {
    let aiuserid = 100100;

    if (this.gamemode == 0) {
      aiuserid = 1297767;
    } else if (this.gamemode == 1) {} else if (this.gamemode == 3) {
      aiuserid = 1297763;
    } else if (this.gamemode == 4) {
      aiuserid = 1297765;
    } else if (this.gamemode == 5) {
      aiuserid = 1297768;
    } else if (this.gamemode == 6) {
      aiuserid = 1297770;
    }

    return aiuserid;
  }

  save_game_record(wincolor, gameendresult) {
    var that = this;

    if (this.wygo != null && this.wygo.GetRealStepCount() < 20) {
      uni.showModal({
        title: '保存',
        content: '20手以内的棋谱不会保存到服务器,你确认要退出吗？',
        success: function (res) {
          if (res.confirm) {
            let gamesavedkey = "renji" + that.gamemode;
            uni.setStorage({
              key: gamesavedkey,
              data: null
            });
            that.restartgame();
            return;
          } else {
            return;
          }
        }
      });
    } else {
      let allsteps = this.wygo.GetStepInfo();
      let stepsdata = {
        stepcount: allsteps.length,
        steps: allsteps
      };
      let blackuserid = 0;
      let whiteuserid = 0;

      if (this.gamemode == 2) {
        blackuserid = app.globalData.userid;
        whiteuserid = app.globalData.userid;
      } else if (this.m_nMyColor == BLACK) {
        blackuserid = app.globalData.userid;
        whiteuserid = this.getAiUserID();
      } else {
        blackuserid = this.getAiUserID();
        ;
        whiteuserid = app.globalData.userid;
      }

      let theurl = "https://www.gog361.com/cgi-bin/listgamerecord?op=savegame&userid=" + app.globalData.userid;
      +"sessionkey=" + app.globalData.sessionkey;
      uni.request({
        url: theurl,
        method: "POST",
        header: {
          'content-type': 'application/json'
        },
        data: {
          wincolor: wincolor,
          gameendresult: gameendresult,
          rangzimunber: this.rangzimunber,
          blackuserid: blackuserid,
          whiteuserid: whiteuserid,
          data: stepsdata
        },
        //请求后台数据成功  
        success: function (res) {
          uni.showModal({
            title: '提示',
            content: '你的棋谱已经保存到服务器，你可以进入我的查看您的对局记录',
            success: function (res) {
              let gamesavedkey = "renji" + that.gamemode;
              uni.setStorage({
                key: gamesavedkey,
                data: null
              });
              that.restartgame();
            }
          });
        },
        fail: function () {
          uni.showModal({
            title: '提示',
            content: '存储棋谱失败,请退出重试',
            success: function (res) {}
          });
        },
        complete: function () {}
      });
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
    let theurl = "https://www.gog361.com/flask/v1/app/aiapp";
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

    resulttext += "(点击棋子可改变死活判定)";
    this.page.setData({
      bottomcomment: resulttext
    });
  }

  setCountControls(msg) {
    this.count_controls = null;
    this.count_controls = new Array();
    let controls = msg.Controls;
    let blackcount = 0;
    let whitecount = 0;
    let blankcount = 0;

    for (let i = BEGINCOORD; i <= MAX_COORD; i++) {
      if (this.wygo != null && this.wygo.GetStoneColor(i) >= BLANK) {
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

  onClickMove() {
    let movecoord = this.gameboard.getMoveCursorCoord();
    this.clickedCoord(movecoord);
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
        content: 'AI评估功能每天只可以免费使用五次，购买会员可以无限次的使用该功能',
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

  showAIResult(data) {
    if (data.moves.length == 0) {
      return;
    }

    let nextmove = data.moves[0].coord;
    let winrate = data.moves[0].winrate * 100;
    winrate = winrate.toFixed(2);
    let nextMoveColor = data.moves[0].color;
    let strInfo = "";

    if (nextMoveColor == BLACK) {
      strInfo = "当前黑方胜率：";
    } else {
      strInfo = "当前白方胜率：";
    }

    strInfo += winrate + "%"; //strInfo+=",nodes数:"+data.nodes;
    //strInfo+=",playout数:"+data.playouts;
    //strInfo+=",每秒playout数:"+data.po1second;

    let arrayaisuggest = new Array();

    for (let i = 0; i < data.moves.length; i++) {
      if (i >= 6) {
        break;
      }

      data.moves[i].winrate = parseFloat(data.moves[i].winrate) * 100;
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
    let operation = "kjoygoai";
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

  showSmpMsg(textmsg) {
    uni.showModal({
      title: '信息',
      content: textmsg,
      success: function (res) {}
    });
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
        showmovebutton: true
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
        showmovebutton: false
      });
    }
  }

  start_ai_gomap() {
    this.aiGoMapRunStep = 0;
    this.savedGameStep = this.wygo.GetCurrentStep();
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

  syncGame() {
    let rependtimes = this.wygo.GetCurrentStep() - this.savedGameStep;

    for (let i = 0; i < rependtimes; i++) {
      if (this.wygo != null && this.wygo.GetRealStepCount() >= 1) {
        this.wygo.Repend();
      }
    }

    this.updateBoard();
    this.checkButtons();
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
      this.syncGame();
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
        btn_aiwinrate_text: "AI建议"
      });
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