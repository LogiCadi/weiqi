const util = require("../../utils/util.js");

const base = require("../../utils/Base.js");

import Board from '../../utils/lifeboard';
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
var app = getApp().globalData; //赢法的统计数组

export default class WyGoLifeGame {
  constructor(page, mode, data) {
    this.init(page, mode, data);
  }

  init(page, mode, data) {
    this.initBoardParam();
    this.m_bInLoadGameProcess = false;
    this.page = page;
    this.sgf = data.sgf;
    this.nSGFType = data.sgftype;
    this.nTiKuID = data.tikuid;
    this.nQiPuID = data.qipuid;
    this.commentkey = "tiku-" + this.nTiKuID + "-" + this.nQiPuID;
    this.freetoid = data.freetoid;
    this.pos = data.qipuid - data.startid;
    this.maxpos = data.movedqipuid - data.startid;
    this.endid = data.endid;
    this.startid = data.startid;
    this.m_nMyColor = BLACK;
    var width = uni.getSystemInfoSync().windowWidth;
    this.initBoardParam();
    this.m_bInResearchMode = false;
    this.all_coords = new Set();
    this.sgf_root = null;
    this.sgf_current = null;
    this.sgf_begin = null;

    if (this.sgf != null) {
      this.LoadSGF(this.sgf);
    } else {
      this.wygo = new WyGo();
      this.wygo.StartGame(BLACK);
      this.gameboard = new Board(this.wygo, 0, 0, width, width);
    }

    this.loadcomments();
    this.page.cancelLoading();
    uni.setStorage({
      key: 'cur_tikuname',
      data: this.page.data.tikuname
    });
    uni.setStorage({
      key: 'cur_tikuid',
      data: this.nTiKuID
    });
    uni.setStorage({
      key: 'cur_pos',
      data: this.pos
    });
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

    return;
  }

  getCurPos() {
    return this.pos;
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

  passtimu() {
    if (this.pos >= this.maxpos) {
      var that = this;
      let theurl = "https://www.gog361.com/flask/v1/joygo/passtimu/" + app.globalData.userid + "/" + this.nTiKuID + "/" + this.pos;
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
            that.maxpos++;
            app.globalData.needRefreshTiKu = true;
            that.checkButtons();
          } else {}
        },
        fail: function () {}
      });
    }
  }

  loadTopic(newpos) {
    this.page.showLoading();
    var that = this;
    this.pos = newpos;
    let theurl = "https://www.gog361.com/flask/v1/joygo/tiku/" + app.globalData.userid + "/" + this.nTiKuID + "/" + newpos;
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
        that.page.cancelLoading();

        if (res.data.code >= 0) {
          that.init(that.page, that.mode, res.data);
        } else if (res.data.code == -400 || res.data.code == -300) {
          var res = uni.getSystemInfoSync();

          if (res.platform == 'ios') {
            uni.showModal({
              title: '提示',
              content: '该题目是VIP会员题目,成为会员可以使用,苹果手机请联系微信wyz785。'
            });
            return;
          }

          uni.showModal({
            title: '会员',
            content: '该题目是VIP会员题目,请购买VIP会员后使用，谢谢。',
            success: function (sm) {
              if (sm.confirm) {
                app.globalData.toShowBuyProduct();
              } else if (sm.cancel) {
                console.log('用户点击取消');
              }
            }
          });
        } else {
          let info = res.data.msg + "code= " + res.data.code;
          uni.showModal({
            title: '提示',
            content: info
          });
        }
      },
      fail: function () {
        that.page.cancelLoading();
        uni.showModal({
          title: '提示',
          content: '加载失败'
        });
        console.log('getdatafailed');
      }
    });
  }

  loadNewTopic(next) {
    var that = this;
    let newpos = this.pos;

    if (next) {
      newpos = this.pos + 1;
    } else {
      newpos = this.pos - 1;
    }

    if (newpos > this.endid - this.startid || newpos < 0) {
      uni.showModal({
        title: '提示',
        content: '恭喜您已经完成了该组题目。'
      });
      return;
    }

    let newtimuid = this.startid + newpos;

    if (newtimuid > this.endid) {
      uni.showModal({
        title: '提示',
        content: '恭喜您已经完成了该组题目。'
      });
      return;
    }

    if (newtimuid > this.freetoid) {
      var res = uni.getSystemInfoSync();

      if (res.platform == 'ios') {
        uni.showModal({
          title: '提示',
          content: '该题目不是免费题目,苹果手机请联系微信wyz785。'
        });
        return;
      }

      uni.showModal({
        title: '提示',
        content: '该题目不是免费题目,点击确定购买会员即可使用所有的题目',
        success: function (res) {
          if (res.confirm) {
            app.globalData.toShowBuyProduct();
            console.log('用户点击确定');
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });
      return;
    }

    this.loadTopic(newpos);
  }

  prev_game() {
    if (this.pos > 0) {
      this.loadNewTopic(false);
    }
  }

  next_game() {
    this.loadNewTopic(true);
  }

  onToMoveConfirm(posorg) {
    let pos = parseInt(posorg);

    if (pos >= this.maxpos) {
      uni.showModal({
        title: '提示',
        content: '不能访问该题目'
      });
    } else {
      this.page.closeToMoveView();
      this.loadTopic(pos);
    }
  }

  touchBegin(event) {
    this.gameboard.touchBegin(event);
  }

  touchEnd(event) {
    var x = event.changedTouches[0].x;
    var y = event.changedTouches[0].y;
    let wTempMoveCoord = this.gameboard.getCoordFromPoint([x, y]);
    this.clickedCoord(wTempMoveCoord);
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

      return temp._parent;
    }

    return null;
  }

  LoadSGF(orgsgf) {
    this.wygo = null;
    this.wygo = new WyGo();
    this.wygo.StartGame(BLACK);
    this.m_bInResearchMode = false;
    this.m_nSGFType = 0;
    this.m_bSGFHaveComments = false;
    this.m_bSGFHaveBranch = false;
    this.m_bSGFHaveNodeName = false;
    this.m_bSGFCommentsJustFirst = false;
    this.m_bWaitComputer = false;
    this.m_nHumanClickToMoveTime = 0;
    this.m_nFailedMoveCount = 0;
    this.m_nMinX = this.wygo.getBoardSize();
    this.m_nMaxX = BEGINCOORD;
    this.m_nMinY = this.wygo.getBoardSize();
    this.m_nMaxY = BEGINCOORD;
    var sgfparser = new SgfParser(orgsgf);
    this.sgf_root = sgfparser.getSGFResult();
    this.sgf_current = this.sgf_GetFirstMove();
    this.getTopicArea();
    this.topicRect = this.getWYGoStonesRect(1.0, false);
    this.fRatio = BOARD_WY_SIZE / this.topicRect[3];

    if (this.fRatio < 1.1) {
      this.fRatio = 1;
    }

    this.fixedBoardRect = this.getWYGoStonesRect(this.fRatio, true);
    let x = -this.fixedBoardRect[0];
    let y = -this.fixedBoardRect[1];

    if (this.gameboard == null) {
      this.gameboard = new Board(this.wygo, x, y, this.fRatio);
    } else {
      this.gameboard = null;
      this.gameboard = new Board(this.wygo, x, y, this.fRatio);
    }

    this.gameboard.SetWyGo(this.wygo);
    this.ShowPlacedStones();
    this.InitCommentText();
    this.ShowLabels();
    this.updateBoard();
    this.checkButtons();
    this.startInterval();
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

  InitCommentText() {
    this.showSGFLifeInfo();
  }

  sgf_getCoord(movelabel) {
    if (movelabel == "") {
      return 0;
    } else if (movelabel.length == 2) {
      var nX = Math.floor(movelabel.charCodeAt(0) - 'a'.charCodeAt(0) + 1);
      var nY = Math.floor(movelabel.charCodeAt(1) - 'a'.charCodeAt(0) + 1);
      var coord = base.CoordToWord(nX, nY, this.wygo.getBoardSize());
      return coord;
    }

    return 0;
  }

  Move(coord, color) {
    if (this.wygo.GetNextMoveColor() != color) {
      return false;
    }

    if (coord == 0) {
      this.wygo.Move(0);
      this.gameboard.showPassMove(color);
      this.playpass(color);
    } else if (this.wygo.CanMove(coord, color)) {
      this.wygo.Move(coord);
      this.playmove();
      this.updateBoard(true);
    } else {
      return false;
    }

    return true;
  }

  getTopicArea() {
    this.m_nMinX = this.wygo.getBoardSize();
    this.m_nMaxX = BEGINCOORD;
    this.m_nMinY = this.wygo.getBoardSize();
    this.m_nMaxY = BEGINCOORD;
    this.all_coords.clear();
    this.sgf_travel_all();

    for (let wTempCoord of this.all_coords.keys()) {
      if (wTempCoord > 0 && base.IsValidWordCoord(wTempCoord, this.wygo.getBoardSize())) {
        var nX = base.GetCoordX(wTempCoord, this.wygo.getBoardSize());
        var nY = base.GetCoordY(wTempCoord, this.wygo.getBoardSize());

        if (this.m_nMinX > nX) {
          this.m_nMinX = nX;
        }

        if (this.m_nMaxX < nX) {
          this.m_nMaxX = nX;
        }

        if (this.m_nMinY > nY) {
          this.m_nMinY = nY;
        }

        if (this.m_nMaxY < nY) {
          this.m_nMaxY = nY;
        }
      }
    }

    return;
  }

  CoordToImagePoint(wClickCoord, fRatio) {
    let nX = base.GetCoordX(wClickCoord, this.wygo.getBoardSize());
    let nY = base.GetCoordY(wClickCoord, this.wygo.getBoardSize());
    let fXInImage = ((nX - 1) * LINE_VALX + BOARD_BEGINX) * fRatio; // in big board xcoord

    let fYInImage = ((nY - 1) * LINE_VALY + BOARD_MARGIN_Y) * fRatio; //in big board y coor;

    let point = [fXInImage, fYInImage];
    return point;
  }

  getWYGoStonesRect(fRatio, bAdjust) {
    let nMinX = this.m_nMinX;
    let nMaxX = this.m_nMaxX;
    let nMinY = this.m_nMinY;
    let nMaxY = this.m_nMaxY;
    let fBoardSize = BOARD_WY_SIZE * fRatio;
    let rectOutputImage = [0, 0, fBoardSize, fBoardSize];
    let fleft = 0.0;
    let ftop = 0.0;
    let fright = 0.0;
    let fbottom = 0.0;
    let fwidth = 0.0;
    let point = [0, 0];

    if (base.GetSquareDistance(BEGINCOORD, BEGINCOORD, nMinX, nMinY) < 25) //from lefttop
      {
        fleft = 0.0;
        ftop = 0.0;
        let nTempX = nMaxX + 1;

        if (nTempX > this.wygo.getBoardSize()) {
          nTempX = this.wygo.getBoardSize();
        }

        let nTempY = nMaxY + 1;

        if (nTempY > this.wygo.getBoardSize()) {
          nTempY = this.wygo.getBoardSize();
        }

        let wRightBottom = base.CoordToWord(nTempX, nTempY, this.wygo.getBoardSize());
        point = this.CoordToImagePoint(wRightBottom, fRatio);
        fright = point[0];
        fbottom = point[1];
        fwidth = 0.0;
        let fw = fright - fleft;
        let fh = fbottom - ftop;

        if (fw > fh) {
          fwidth = fw; //move down            
        } else {
          fwidth = fh; // move right;
        }

        if (bAdjust && fwidth < BOARD_WY_SIZE) {
          fwidth = BOARD_WY_SIZE;
        }

        rectOutputImage = [fleft, ftop, fwidth, fwidth];
      } else if (base.GetSquareDistance(this.wygo.getBoardSize(), BEGINCOORD, nMaxX, nMinY) < 25) //from righttop
      {
        ftop = 0.0;
        let nTempX = nMinX - 1;

        if (nTempX <= BEGINCOORD) {
          nTempX = BEGINCOORD;
        }

        let wLeftTop = base.CoordToWord(nTempX, BEGINCOORD, this.wygo.getBoardSize());
        point = this.CoordToImagePoint(wLeftTop, fRatio);
        fleft = point[0];
        fright = fBoardSize;
        let nTempY = nMaxY + 1;

        if (nTempY > this.wygo.getBoardSize()) {
          nTempY = this.wygo.getBoardSize();
        }

        let wRightBottom = base.CoordToWord(this.wygo.getBoardSize(), nTempY, this.wygo.getBoardSize());
        point = this.CoordToImagePoint(wRightBottom, fRatio);
        fbottom = point[1];
        fwidth = 0.0;
        let fw = fright - fleft;
        let fh = fbottom - ftop;

        if (fw > fh) {
          fwidth = fw; //move down            
        } else {
          fleft -= fh - fw;
          fwidth = fh; // move left;
        }

        if (bAdjust && fwidth < BOARD_WY_SIZE) {
          fleft = fleft - (BOARD_WY_SIZE - fwidth); //向左移动

          fwidth = BOARD_WY_SIZE;
        }

        rectOutputImage = [fleft, ftop, fwidth, fwidth];
      } else if (base.GetSquareDistance(this.wygo.getBoardSize(), this.wygo.getBoardSize(), nMaxX, nMaxY) < 25) //from rightbottom
      {
        let nTempX = nMinX - 1;

        if (nTempX <= BEGINCOORD) {
          nTempX = BEGINCOORD;
        }

        let nTempY = nMinY - 1;

        if (nTempY <= BEGINCOORD) {
          nTempY = BEGINCOORD;
        }

        let wLeftTop = base.CoordToWord(nTempX, nTempY, this.wygo.getBoardSize());
        point = this.CoordToImagePoint(wLeftTop, fRatio);
        fleft = point[0];
        ftop = point[1];
        fright = fBoardSize;
        fbottom = fBoardSize;
        fwidth = 0.0;
        let fw = fright - fleft;
        let fh = fbottom - ftop;

        if (fw > fh) {
          ftop -= fw - fh;
          fwidth = fw; //move up            
        } else {
          fleft -= fh - fw;
          fwidth = fh; // move left;
        }

        if (bAdjust && fwidth < BOARD_WY_SIZE) {
          ftop = ftop - (BOARD_WY_SIZE - fwidth); //向上移动

          fleft = fleft - (BOARD_WY_SIZE - fwidth); //向上移动

          fwidth = BOARD_WY_SIZE;
        }

        rectOutputImage = [fleft, ftop, fwidth, fwidth];
      } else if (base.GetSquareDistance(BEGINCOORD, this.wygo.getBoardSize(), nMinX, nMaxY) < 25) //from leftbottom
      {
        let nTempX = nMaxX + 1;

        if (nTempX > this.wygo.getBoardSize()) {
          nTempX = this.wygo.getBoardSize();
        }

        let nTempY = nMinY - 1;

        if (nTempY <= BEGINCOORD) {
          nTempY = BEGINCOORD;
        }

        let wRightTop = base.CoordToWord(nTempX, nTempY, this.wygo.getBoardSize());
        point = this.CoordToImagePoint(wRightTop, fRatio);
        fleft = 0.0;
        ftop = point[1];
        fright = point[0];
        fbottom = fBoardSize;
        fwidth = 0.0;
        let fw = fright - fleft;
        let fh = fbottom - ftop;

        if (fw > fh) {
          ftop -= fw - fh;
          fwidth = fw; //move up            
        } else {
          fwidth = fh; // move right;
        }

        if (bAdjust && fwidth < BOARD_WY_SIZE) {
          ftop = ftop - (BOARD_WY_SIZE - fwidth); //向上移动

          fwidth = BOARD_WY_SIZE;
        }

        rectOutputImage = [fleft, ftop, fwidth, fwidth];
      }

    return rectOutputImage;
  }

  sgf_travel_all() {
    this.m_bSGFHaveComments = false;
    this.m_bSGFHaveBranch = false;
    this.m_bSGFHaveNodeName = false;
    this.m_bSGFCommentsJustFirst = false;
    this.sgf_travel_node(this.sgf_root);
  }

  sgf_travel_node(sgfnode) {
    if (sgfnode != null) {
      let comment = this.getNodeComment(sgfnode);

      if (comment.length > 0) {
        this.m_bSGFHaveComments = true;

        if (sgfnode == this.sgf_root) {
          this.m_bSGFCommentsJustFirst = true;
        } else {
          this.m_bSGFCommentsJustFirst = false;
        }
      }

      let nodename = this.getNodeName(sgfnode);

      if (nodename.length > 0) {
        this.m_bSGFHaveNodeName = true;
      }

      if (sgfnode._children != null && sgfnode._children.length > 1) {
        this.m_bSGFHaveBranch = true;
      }

      if (typeof sgfnode.AB != "undefined" && sgfnode.AB.length > 0) {
        if (base.isArray(sgfnode.AB)) {
          for (var i = 0; i < sgfnode.AB.length; i++) {
            var label = sgfnode.AB[i];
            var coord = this.sgf_getCoord(label);
            this.all_coords.add(coord);
          }
        }
      }

      if (typeof sgfnode.AW != "undefined" && sgfnode.AW.length > 0) {
        if (base.isArray(sgfnode.AW)) {
          for (var i = 0; i < sgfnode.AW.length; i++) {
            var label = sgfnode.AW[i];
            var coord = this.sgf_getCoord(label);

            if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
              this.all_coords.add(coord);
            }
          }
        }
      }

      if (typeof sgfnode.B != "undefined") {
        var label = sgfnode.B;
        var coord = this.sgf_getCoord(label);

        if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
          this.all_coords.add(coord);
        }
      }

      if (typeof sgfnode.W != "undefined") {
        var label = sgfnode.W;
        var coord = this.sgf_getCoord(label);

        if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
          this.all_coords.add(coord);
        }
      }

      if (sgfnode._children != null && sgfnode._children.length > 0) {
        for (var i = 0; i < sgfnode._children.length; i++) {
          this.sgf_travel_node(sgfnode._children[i]);
        }
      }
    }
  }

  ShowPlacedStones() {
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

  ShowLabels() {
    this.gameboard.clearLabels();

    if (this.sgf_current != null) {
      if (typeof this.sgf_current.LB != "undefined" && this.sgf_current.LB.length > 0) {
        if (base.isArray(this.sgf_current.LB)) {
          for (var i = 0; i < this.sgf_current.LB.length; i++) {
            var label = this.sgf_current.LB[i];
            var pos = label.indexOf(":");
            var c = label.substr(0, pos);
            var t = label.substr(pos + 1, label.length - pos - 1);
            var coord = this.sgf_getCoord(c);

            if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
              this.gameboard.AddLabel(coord, this.wygo.GetNextMoveColor(), t);
            }
          }
        } else {
          var label = this.sgf_current.LB;
          var pos = label.indexOf(":");
          var c = label.substr(0, pos);
          var t = label.substr(pos + 1, label.length - pos - 1);
          var coord = this.sgf_getCoord(c);

          if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
            this.gameboard.AddLabel(coord, this.wygo.GetNextMoveColor(), t);
          }
        }
      }

      if (typeof this.sgf_current.CR != "undefined" && this.sgf_current.CR.length > 0) {
        if (base.isArray(this.sgf_current.CR)) {
          for (var i = 0; i < this.sgf_current.CR.length; i++) {
            var coord = this.sgf_getCoord(this.sgf_current.CR[i]);

            if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
              this.gameboard.AddLabel(coord, this.wygo.GetNextMoveColor(), "●");
            }
          }
        } else {
          var coord = this.sgf_getCoord(this.sgf_current.CR);

          if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
            this.gameboard.AddLabel(coord, this.wygo.GetNextMoveColor(), "●");
          }
        }
      }

      if (typeof this.sgf_current.MA != "undefined" && this.sgf_current.MA.length > 0) {
        if (base.isArray(this.sgf_current.MA)) {
          for (var i = 0; i < this.sgf_current.MA.length; i++) {
            var coord = this.sgf_getCoord(this.sgf_current.MA[i]);

            if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
              this.gameboard.AddLabel(coord, this.wygo.GetNextMoveColor(), "□");
            }
          }
        } else {
          var coord = this.sgf_getCoord(this.sgf_current.MA);

          if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
            this.gameboard.AddLabel(coord, this.wygo.GetNextMoveColor(), "□");
          }
        }
      }

      if (typeof this.sgf_current.SQ != "undefined" && this.sgf_current.SQ.length > 0) {
        if (base.isArray(this.sgf_current.SQ)) {
          for (var i = 0; i < this.sgf_current.SQ.length; i++) {
            var coord = this.sgf_getCoord(this.sgf_current.SQ[i]);

            if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
              this.gameboard.AddLabel(coord, this.wygo.GetNextMoveColor(), "■");
            }
          }
        } else {
          var coord = sgf_getCoord(this.sgf_current.SQ);

          if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
            this.gameboard.AddLabel(coord, this.wygo.GetNextMoveColor(), "■");
          }
        }
      }

      if (typeof this.sgf_current.TR != "undefined" && this.sgf_current.TR.length > 0) {
        if (base.isArray(this.sgf_current.TR)) {
          for (var i = 0; i < this.sgf_current.TR.length; i++) {
            var coord = this.sgf_getCoord(this.sgf_current.TR[i]);

            if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
              this.gameboard.AddLabel(coord, this.wygo.GetNextMoveColor(), "▲");
            }
          }
        } else {
          var coord = this.sgf_getCoord(this.sgf_current.TR);

          if (base.IsValidWordCoord(coord, this.wygo.getBoardSize())) {
            this.gameboard.AddLabel(coord, this.wygo.GetNextMoveColor(), "▲");
          }
        }
      }
    }
  }

  sgfnodeIsCoord(sgfnode, movecoord) {
    if (typeof sgfnode.B != "undefined") {
      var label = sgfnode.B;
      var coord = this.sgf_getCoord(label);

      if (base.IsValidWordCoord(coord, this.wygo.getBoardSize()) && movecoord == coord) {
        return true;
      }
    }

    if (typeof sgfnode.W != "undefined") {
      var label = sgfnode.W;
      var coord = this.sgf_getCoord(label);

      if (base.IsValidWordCoord(coord, this.wygo.getBoardSize()) && movecoord == coord) {
        return true;
      }
    }

    return false;
  }

  MoveIsInSGF(wMoveCoord) {
    if (this.sgf_current && this.sgf_current._children != null && this.sgf_current._children.length > 0) {
      for (var i = 0; i < this.sgf_current._children.length; i++) {
        if (this.sgfnodeIsCoord(this.sgf_current._children[i], wMoveCoord)) {
          return true;
        }
      }
    }

    return false;
  }

  confirmLifeMove(wMoveCoord) {
    if (this.sgf_current && this.sgf_current._children != null && this.sgf_current._children.length > 0) {
      // sometimes have multi node is corrent
      let samechildcount = 0;

      for (let i = 0; i < this.sgf_current._children.length; i++) {
        if (this.sgfnodeIsCoord(this.sgf_current._children[i], wMoveCoord)) {
          samechildcount++;
        }
      }

      if (samechildcount > 1) {
        if (this.isComplexSgf(this.nSGFType, this.nTiKuID)) {
          let bGetMachineMove = false;

          if (this.m_bWaitComputer) {
            bGetMachineMove = true;
          }

          let pRetStepInfo = this.getSpecNextStepInfo(bGetMachineMove);

          if (pRetStepInfo != null) {
            this.sgf_current = pRetStepInfo;
            return;
          }
        } else {
          let pRetStepInfo = this.getCommonNextStepInfo();

          if (pRetStepInfo != null) {
            this.sgf_current = pRetStepInfo;
            return;
          }
        }
      } else {
        for (let i = 0; i < this.sgf_current._children.length; i++) {
          if (this.sgfnodeIsCoord(this.sgf_current._children[i], wMoveCoord)) {
            this.sgf_current = this.sgf_current._children[i];
            return;
          }
        }
      }
    }

    return;
  }

  showFailView(type) {
    this.page.showFailView(type);
  }

  addFailureView(type) {
    this.showFailView(type);
  }

  showWinView() {
    this.page.showWinView();
  }

  addWinView() {
    this.playwin();
    this.passtimu();
    this.showWinView();
  }

  onNextTopic() {
    this.next_game();
  }

  onShare() {
    uni.showShareMenu({
      withShareTicket: false
    });
  }

  ShowFailedNotMove(wMoveCoord) {
    uni.showToast({
      title: '不是正确的位置，请选择其他的位置再试一试',
      icon: 'failure',
      duration: 2000
    });
  }

  showCommentsView(comment) {
    this.page.setData({
      gamecomment: comment
    });
  }

  showSGFCommentsView(bInitShow) {
    if (this.sgf_current == null) {
      return;
    }

    let sTheComments = this.getNodeComment(this.sgf_current);

    if (sTheComments == "") {
      sTheComments = "请走棋...";
    }

    if (bInitShow) {
      let sColor = "";

      if (this.m_nMyColor == BLACK) {
        sColor = "(黑先行)";
      } else {
        sColor = "(白先行)";
      }

      sColor = "第" + this.pos + "题" + sColor;
      let sInfo = sColor + sTheComments;
      this.showCommentsView(sInfo);
    } else {
      this.showCommentsView(sTheComments);
    }

    this.addSGFLabel();
  }

  addSGFLabel() {}

  showSGFLifeInfo() {
    if (this.sgf_current == this.sgf_begin) {
      this.showSGFCommentsView(true);
    } else {
      this.showSGFCommentsView(false);
    }

    this.ShowLabels();
    this.updateBoard();
  }

  getNodeComment(sgfnode) {
    if (sgfnode.C != null && typeof sgfnode.C != "undefined") {
      return sgfnode.C;
    }

    return "";
  }

  getNodeName(sgfnode) {
    if (sgfnode.N != null && typeof sgfnode.N != "undefined") {
      //console.log("sgfnode.N="+sgfnode.N); 
      return sgfnode.N;
    }

    return "";
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

  isComplexSgf(sgftype, tikuid) {
    return sgftype == LIFE_SGF_TYPE_SPECIAL || sgftype == 100 || sgftype == 101 || sgftype == 103 || sgftype == 104 || tikuid == 11 || tikuid == 12;
  }

  hasWinFlag(sinfo) {
    return this.hasWinFlag_0(this.nQiPuID, this.nTiKuID, this.nSGFType, this.m_nMyColor, sinfo);
  }

  hasFailedFlag(sinfo) {
    return this.hasFailedFlag_0(this.nQiPuID, this.nTiKuID, this.nSGFType, this.m_nMyColor, sinfo);
  }

  hasNodeNameWin(sinfo) {
    return this.hasNodeNameWin_0(this.nQiPuID, this.nTiKuID, this.nSGFType, this.m_nMyColor, sinfo);
  }

  specSGFNodeNameIsCorrect(sinfo) {
    return this.specSGFNodeNameIsCorrect_0(this.nQiPuID, this.nTiKuID, this.nSGFType, this.m_nMyColor, sinfo);
  }

  specSGFCommentIsBad(sinfo) {
    return this.specSGFCommentIsBad_0(this.nQiPuID, this.nTiKuID, this.nSGFType, this.m_nMyColor, sinfo);
  }

  hasWinFlag_0(qipuid, tikuid, sgftype, mycolor, sinfo) {
    if (sinfo == null || sinfo == "") {
      return false;
    }

    if (sinfo.indexOf("正解") >= 0) {
      return true;
    }

    if (sinfo.indexOf("变化图") >= 0) {
      return true;
    }

    if (sinfo.indexOf("RIGHT") >= 0) {
      return true;
    }

    if (sinfo.indexOf("恭喜答对") >= 0) {
      return true;
    }

    if (sgftype == 101 || sgftype == 103) {
      var arr = new Array("成功", "答对", "正确", "佩服", "恭喜", "高手", "您的实力好强", "厉害", "答对了", "回答正确", "好棋啊", "有水平", "绝妙手筋", "实力很强", "大功告成");

      for (var index = 0; index < arr.length; index++) {
        if (sinfo.indexOf(arr[index]) >= 0) {
          return true;
        }
      }

      if (mycolor == WHITE) {
        if (sinfo.indexOf("白胜") >= 0 || sinfo.indexOf("白成功") >= 0) {
          return true;
        }
      } else if (mycolor == BLACK) {
        if (sinfo.indexOf("黑胜") >= 0 || sinfo.indexOf("黑成功") >= 0) {
          return true;
        }
      }
    }

    if (mycolor == WHITE) {
      let pos1 = sinfo.indexOf("白");
      let pos2 = sinfo.indexOf("活");

      if (pos1 > 0 && pos2 > 0 && pos1 < pos2 && pos2 - pos1 < 4) {
        return true;
      }
    } else if (mycolor == BLACK) {
      let pos1 = sinfo.indexOf("黑");
      let pos2 = sinfo.indexOf("活");

      if (pos1 > 0 && pos2 > 0 && pos1 < pos2 && pos2 - pos1 < 4) {
        return true;
      }
    }

    if (this.isComplexSgf(sgftype)) {
      if (mycolor == BLACK) {
        if (sinfo.indexOf("黑活") >= 0) {
          return true;
        }

        if (sinfo.indexOf("黑胜") >= 0) {
          return true;
        }

        if (sinfo.indexOf("白死") >= 0) {
          return true;
        }

        if (sinfo.indexOf("黑杀白") >= 0) {
          return true;
        }
      } else {
        if (sinfo.indexOf("白活") >= 0) {
          return true;
        }

        if (sinfo.indexOf("白胜") >= 0) {
          return true;
        }

        if (sinfo.indexOf("黑死") >= 0) {
          return true;
        }

        if (sinfo.indexOf("白杀黑") >= 0) {
          return true;
        }
      }
    }

    return false;
  }

  hasFailedFlag_0(qipuid, tikuid, sgftype, mycolor, sinfo) {
    if (sinfo == null || sinfo == "") {
      return false;
    }

    if (sinfo.indexOf("失败图") >= 0) {
      return true;
    }

    if (sinfo.indexOf("失败，重来吧") >= 0) {
      return true;
    }

    if (sinfo.indexOf("失败了，") >= 0) {
      return true;
    }

    if (sinfo.indexOf("不成功") >= 0) {
      return true;
    }

    if (sinfo.indexOf("不算成功") >= 0) {
      return true;
    }

    if (sinfo.indexOf(",失败") >= 0) {
      return true;
    }

    if (sinfo.indexOf("，失败") >= 0) {
      return true;
    }
    /*
    if(sinfo.indexOf("失败")>=0)
    {
    	return true;
    }*/


    if (this.isComplexSgf(sgftype)) {
      if (mycolor == BLACK) {
        if (sinfo.indexOf("白活") >= 0) {
          return true;
        }

        let pos1 = sinfo.indexOf("白");
        let pos2 = sinfo.indexOf("活");

        if (pos1 > 0 && pos2 > 0 && pos1 < pos2 && pos2 - pos1 < 4) {
          return true;
        }

        if (sinfo.indexOf("黑死") >= 0) {
          return true;
        }

        pos1 = sinfo.indexOf("黑");
        pos2 = sinfo.indexOf("死");

        if (pos1 > 0 && pos2 > 0 && pos1 < pos2 && pos2 - pos1 < 4) {
          return true;
        }

        if (sinfo.indexOf("白杀黑") >= 0) {
          return true;
        }

        if (sinfo.indexOf("黑棋失败") >= 0) {
          return true;
        }
      } else {
        if (sinfo.indexOf("黑活") >= 0) {
          return true;
        }

        let pos1 = sinfo.indexOf("黑");
        let pos2 = sinfo.indexOf("活");

        if (pos1 > 0 && pos2 > 0 && pos1 < pos2 && pos2 - pos1 < 4) {
          return true;
        }

        if (sinfo.indexOf("白死") >= 0) {
          return true;
        }

        pos1 = sinfo.indexOf("白");
        pos2 = sinfo.indexOf("死");

        if (pos1 > 0 && pos2 > 0 && pos1 < pos2 && pos2 - pos1 < 4) {
          return true;
        }

        if (sinfo.indexOf("黑杀白") >= 0) {
          return true;
        }

        if (sinfo.indexOf("白棋失败") >= 0) {
          return true;
        }
      }
    }

    return false;
  }

  hasNodeNameWin_0(qipuid, tikuid, sgftype, mycolor, sinfo) {
    if (sinfo == null || sinfo == "") {
      return false;
    }

    if (sinfo.indexOf("正解") >= 0) {
      return true;
    }

    if (sinfo.indexOf("解答") >= 0) {
      return true;
    }

    if (sinfo.indexOf("RIGHT") >= 0) {
      return true;
    }

    return false;
  }

  specSGFNodeNameIsCorrect_0(qipuid, tikuid, sgftype, mycolor, sinfo) {
    if (sinfo == null || sinfo == "") {
      return false;
    }

    if (sinfo.indexOf("正解") >= 0) {
      return true;
    }

    if (sinfo.indexOf("解答") >= 0) {
      return true;
    }

    if (sinfo.indexOf("RIGHT") >= 0) {
      return true;
    }

    if (sinfo.indexOf("0") >= 0) {
      return true;
    }

    return false;
  }

  specSGFCommentIsBad_0(qipuid, tikuid, sgftype, mycolor, sinfo) {
    if (sinfo == null || sinfo == "") {
      return false;
    }

    if (sinfo.indexOf("恶手") >= 0) {
      return true;
    }

    if (sinfo.indexOf("不好") >= 0) {
      return true;
    }

    if (sinfo.indexOf("错误") >= 0) {
      return true;
    }

    if (sinfo.indexOf("无理") >= 0) {
      return true;
    }

    return false;
  }

  lastcheckwinmove() {
    let sgf_current_bk = this.sgf_current;

    while (typeof this.sgf_current != "undefined" && this.sgf_current != null) {
      let old_sgf_current = this.sgf_current;
      this.sgf_current = this.sgf_current._parent;

      if (this.sgf_current == null || typeof this.sgf_current == "undefined") {
        return true;
      }

      let pRetStepInfo = null;

      if (this.isComplexSgf(this.nSGFType, this.nTiKuID)) {
        pRetStepInfo = this.getSpecNextStepInfo(false);
      } else {
        pRetStepInfo = this.getCommonNextStepInfo();
      }

      if (pRetStepInfo == old_sgf_current) {
        continue;
      } else {
        this.sgf_current = sgf_current_bk;
        return false;
      }
    }

    this.sgf_current = sgf_current_bk;
    return true;
  }

  judgeCurrStatus() {
    let nResult = 0;

    if (this.sgf_current._children != null && this.sgf_current._children.length > 0) {
      return nResult;
    }

    if (this.hasFailedFlag(this.getNodeComment(this.sgf_current))) {
      nResult = -1;
      return nResult;
    }

    if (this.hasWinFlag(this.getNodeComment(this.sgf_current))) {
      nResult = 1;
      return nResult;
    }

    if (!this.m_bSGFHaveBranch) //没有找到明显标志，但是没有分支的情况下也是正解
      {
        nResult = 1;
        return nResult;
      }

    if (!this.isComplexSgf(this.nSGFType, this.nTiKuID)) //非发阳论可以使用这种方式
      {
        //向上去找N(正解或者解答的）
        var pTempStepInfo = this.sgf_current;

        while (pTempStepInfo != null) {
          if (this.hasNodeNameWin(this.getNodeName(pTempStepInfo))) {
            nResult = 1;
            return nResult;
          }

          pTempStepInfo = pTempStepInfo._parent;
        } //这样还没有得出result.
        //找到开始的点，如果开始的点自由一个子节点，也认为成功了


        if (this.sgf_current._children.length == 1 && !this.m_bSGFHaveComments && !this.m_bSGFHaveNodeName) {
          nResult = 1;
          return nResult;
        }

        if (!this.m_bSGFHaveComments && !this.m_bSGFHaveNodeName) //这种情况，既没有任何的标记，也没有任何的NODENAME 就认为这个是成功的了。
          {
            nResult = 1;
            return nResult;
          }

        if (nResult == 0 && this.sgf_current._children.length == 0) {
          if (this.lastcheckwinmove()) //此时还不是正解的话，但是事解答选择的
            {
              return 1;
            } else if (this.nTiKuID == 7 || this.nTiKuID == 6) {
            nResult = 1;
          } else {
            nResult = -1;
          }

          return nResult;
        }
      } else {
      if (nResult == 0 && this.sgf_current._children.length == 0) //单链并且到头了没有正解就算失败
        {
          var pTempStepInfo = this.sgf_current;

          while (pTempStepInfo != null) {
            if (this.hasNodeNameWin(this.getNodeName(pTempStepInfo))) {
              nResult = 1;
              return nResult;
            }

            pTempStepInfo = pTempStepInfo._parent;

            if (pTempStepInfo._children.length > 1) {
              break;
            }
          }

          if (this.lastcheckwinmove()) //此时还不是正解的话，但是事解答选择的
            {
              nResult = 1;
            } else {
            nResult = -1;
          }

          return nResult;
        }
    }

    return nResult;
  }

  judgeWinOrFailed() {
    let nResult = this.judgeCurrStatus();

    if (nResult == -1) {
      this.addFailureView(0);
      this.m_bWaitComputer = false;
      return;
    } else if (nResult == 1) {
      this.addWinView();
      this.m_bWaitComputer = false;
      return;
    }
  }

  IsWinBranch(pTheBranch) {
    let pTempBranch = pTheBranch;

    while (pTempBranch) {
      if (this.hasWinFlag(this.getNodeName(pTempBranch)) || this.hasWinFlag(this.getNodeComment(pTempBranch))) {
        return true;
      }

      pTempBranch = pTempBranch._children[0];
    }

    return false;
  }

  getCommonNextStepInfo() {
    let pRetStepInfo = null; //在第一层的时候选择标记为正解棋，在其他步骤时候选择下一步

    if (this.sgf_current._children.length == 1) {
      if (this.sgf_current._children != null) {
        pRetStepInfo = this.sgf_current._children[0];
      }
    } else {
      let bHaveWinNode = false;

      for (var i = 0; i < this.sgf_current._children.length; i++) {
        if (this.IsWinBranch(this.sgf_current._children[i])) {
          pRetStepInfo = this.sgf_current._children[i];
          bHaveWinNode = true;
          break;
        }
      }

      if (!bHaveWinNode) {
        if (this.sgf_current._children[i] != null) {
          pRetStepInfo = this.sgf_current._children[0];
        }
      }
    }

    if (pRetStepInfo == null && this.sgf_current._children.length > 0 && this.sgf_current._children[0] != null) {
      pRetStepInfo = this.sgf_current._children[0];
    }

    return pRetStepInfo;
  }

  childTreeHasWinFlag(sgfnode) {
    if (sgfnode == null) {
      return false;
    }

    if (this.hasWinFlag(this.getNodeComment(sgfnode))) {
      return true;
    }

    for (var i = 0; i < sgfnode._children.length; i++) {
      if (this.childTreeHasWinFlag(sgfnode._children[i])) {
        return true;
      }
    }

    return false;
  }

  getSpecNextStepInfo(bGetMachineMove) {
    let pRetStepInfo = null; //在第一层的时候选择标记为正解棋，在其他步骤时候选择下一步

    if (this.sgf_current == this.sgf_begin) {
      if (this.sgf_current._children != null && this.sgf_current._children.length == 1) {
        pRetStepInfo = this.sgf_current._children[0];
      } else {
        let bHaveWinNode = false;

        for (var i = 0; i < this.sgf_current._children.length; i++) {
          if (this.sgf_current._children[i] && this.specSGFNodeNameIsCorrect(this.getNodeName(this.sgf_current._children[i]))) {
            pRetStepInfo = this.sgf_current._children[i];
            bHaveWinNode = true;
            break;
          }
        }

        if (pRetStepInfo == null) {
          for (var i = 0; i < this.sgf_current._children.length; i++) {
            if (this.sgf_current._children[i] && this.childTreeHasWinFlag(this.sgf_current._children[i])) {
              pRetStepInfo = this.sgf_current._children[i];
              bHaveWinNode = true;
              break;
            }
          }
        }
      }
    } else //叶子节点的时候
      {
        if (this.sgf_current._children != null && this.sgf_current._children.length == 1) {
          pRetStepInfo = this.sgf_current._children[0];
        } else if (this.m_nMyColor == this.getNodeColor(this.sgf_current)) //此时的选择是电脑的应对
          {
            //先去查找是否有0或者正解标识的分支，如果有则选择。如果没有则直接悬着child.
            let bHaveWinNode = false;

            for (var i = 0; i < this.sgf_current._children.length; i++) {
              if (this.sgf_current._children[i] && this.specSGFNodeNameIsCorrect(this.getNodeName(this.sgf_current._children[i]))) {
                pRetStepInfo = this.sgf_current._children[i];
                bHaveWinNode = true;
                break;
              }
            }

            if (pRetStepInfo == null) {
              for (var i = 0; i < this.sgf_current._children.length; i++) {
                if (this.sgf_current._children[i] && this.childTreeHasWinFlag(this.sgf_current._children[i])) {
                  pRetStepInfo = this.sgf_current._children[i];
                  bHaveWinNode = true;
                  break;
                }
              }
            }

            if (!bHaveWinNode) //如果没有找到明显的标志就选择CHILD。
              {
                if (this.sgf_current._children != null) {
                  pRetStepInfo = this.sgf_current._children[0];
                }
              }
          } else if (this.m_nMyColor != this.getNodeColor(this.sgf_current)) //此时是人类的选择
          {
            let bHaveWinNode = false;

            for (var i = 0; i < this.sgf_current._children.length; i++) {
              if (this.sgf_current._children[i] && this.specSGFNodeNameIsCorrect(this.getNodeName(this.sgf_current._children[i]))) {
                pRetStepInfo = this.sgf_current._children[i];
                bHaveWinNode = true;
                break;
              }
            }

            if (pRetStepInfo == null) {
              for (var i = 0; i < this.sgf_current._children.length; i++) {
                if (this.sgf_current._children[i] && this.childTreeHasWinFlag(this.sgf_current._children[i])) {
                  pRetStepInfo = this.sgf_current._children[i];
                  bHaveWinNode = true;
                  break;
                }
              }
            }

            if (!bHaveWinNode) //如果还是没找到，着哪些COMMENT没有负面信息的路径。
              {
                bHaveWinNode = false;

                for (var i = 0; i < this.sgf_current._children.length; i++) {
                  if (this.sgf_current._children[i] && !this.specSGFCommentIsBad(this.getNodeComment(this.sgf_current._children[i]))) {
                    pRetStepInfo = this.sgf_current._children[i];
                    bHaveWinNode = true;
                    break;
                  }
                }
              }

            if (!bHaveWinNode) //如果没有找到明显的标志就选择CHILD。
              {
                if (this.sgf_current._children != null) {
                  pRetStepInfo = this.sgf_current._children[0];
                }
              }
          }
      }

    if (pRetStepInfo == null && this.sgf_current._children != null) {//NSLog(@"Failed SGF");
    }

    return pRetStepInfo;
  }

  test_Solution() {
    let wMove = this.sgfLifeMoveNext_CorrectSelect(true, false);

    if (wMove == 0) {
      let msg = "error solution tikuid=" + this.nTiKuID + ":pos=" + this.pos;
      console.log(msg);
    } else {
      let msg = "pass solution tikuid=" + this.nTiKuID + ":pos=" + this.pos;
      console.log(msg);
    }
  }

  sgfLifeMoveNext_CorrectSelect(forTest, bGetMachineMove) {
    let wNextMove = 0;

    if (this.isComplexSgf(this.nSGFType, this.nTiKuID)) {
      let pRetStepInfo = this.getSpecNextStepInfo(bGetMachineMove);

      if (pRetStepInfo != null) {
        this.sgf_current = pRetStepInfo;
        wNextMove = this.getNodeCoord(pRetStepInfo);
      }
    } else {
      let pRetStepInfo = this.getCommonNextStepInfo();

      if (pRetStepInfo != null) {
        this.sgf_current = pRetStepInfo;
        wNextMove = this.getNodeCoord(pRetStepInfo);
      }
    }

    if (!forTest) {
      if (wNextMove > 0) {
        this.Move(wNextMove, this.wygo.GetNextMoveColor());
      }

      this.showSGFLifeInfo();
    }

    return wNextMove > 0;
  }

  checkButtons() {
    if (this.m_bWaitComputer || this.m_bInLoadGameProcess) {
      this.page.setData({
        btn_redo_disabled: true,
        btn_undo_disabled: true,
        btn_research_disabled: true,
        btn_solution_disabled: true,
        btn_share_disabled: true,
        btn_back_diasble: true
      }); //  [m_pPrevGameButton setEnabled:NO];
      //  [m_pNextGameButton setEnabled:NO];
    } else {
      this.page.setData({
        btn_redo_disabled: false,
        btn_undo_disabled: false,
        btn_research_disabled: false,
        btn_solution_disabled: false,
        btn_share_disabled: false,
        btn_back_diasble: false
      });
    }

    if (this.m_bInResearchMode) {
      this.page.setData({
        btn_redo_disabled: true,
        btn_solution_disabled: true
      });

      if (this.wygo != null && this.wygo.GetRealStepCount() >= 1) {
        this.page.setData({
          btn_undo_disabled: false
        });
      } else {
        this.page.setData({
          btn_undo_disabled: true
        });
      }
    } else {
      this.page.setData({
        btn_redo_disabled: false,
        btn_solution_disabled: false
      });

      if (this.wygo != null && this.wygo.GetRealStepCount() >= 2) {
        this.page.setData({
          btn_undo_disabled: false
        });
      } else {
        this.page.setData({
          btn_undo_disabled: true
        });
      }
    }

    if (this.pos >= this.maxpos || this.pos + this.startid >= this.endid) {
      this.page.setData({
        next_game_view: 'none'
      });
    } else {
      this.page.setData({
        next_game_view: 'block'
      });
    }
  }

  onTimer() {
    if (this.m_bWaitComputer) {
      if (base.getTickCount() - this.m_nHumanClickToMoveTime > 800) // 思考1秒钟再走棋
        {
          this.sgfLifeMoveNext_CorrectSelect(false, true);
          this.m_bWaitComputer = false;
          this.checkButtons();
          this.judgeWinOrFailed();
        }
    }

    if (this.m_bShowSolution) {
      if (base.getTickCount() - this.m_nShowSolutionTime > 1000) {
        if (this.sgfLifeMoveNext_CorrectSelect(false, false)) {
          this.m_nShowSolutionTime = base.getTickCount();
        } else {
          this.m_bShowSolution = false; //[m_pShowSolutionButton setEnabled:YES];
        }
      }
    }

    if (this.m_bShowFailedNotMoveFlag) {
      if (base.getTickCount() - m_nShowFailedNotMoveFlagTime > 100) {
        this.m_nShowFailedNotMoveFlagTime = base.getTickCount();

        if (this.m_nShowNotMoveFlagTimes > 3) {
          this.m_bShowFailedNotMoveFlag = false;
          this.DeleteFailedNotMoveFlag();
        } else {
          if (this.m_nShowNotMoveFlagTimes == 1) {
            this.drawFailedNotMoveFlag(m_wTheFailedNotMoveCoord, 0.8);
          } else if (m_nShowNotMoveFlagTimes == 2) {
            this.drawFailedNotMoveFlag(m_wTheFailedNotMoveCoord, 1.0);
          } else if (m_nShowNotMoveFlagTimes == 3) {
            this.drawFailedNotMoveFlag(m_wTheFailedNotMoveCoord, 1.2);
          }

          this.m_nShowNotMoveFlagTimes++;
        }
      }
    }
  }

  clickedCoord(wMoveCoord) {
    if (this.wygo.CanMove(wMoveCoord, this.wygo.GetNextMoveColor())) {
      if (this.m_bInResearchMode) {
        this.Move(wMoveCoord, this.wygo.GetNextMoveColor());
      } else {
        if (!this.MoveIsInSGF(wMoveCoord)) {
          this.playaou();
          this.m_nFailedMoveCount++;

          if (this.m_nFailedMoveCount > 3) {
            this.addFailureView(1);
          } else {//this.ShowFailedNotMove(wMoveCoord);
          }
        } else {
          this.m_nFailedMoveCount = 0;
          this.Move(wMoveCoord, this.wygo.GetNextMoveColor());
          this.m_nHumanClickToMoveTime = base.getTickCount();
          this.confirmLifeMove(wMoveCoord);
          this.m_bWaitComputer = true;
          this.showSGFLifeInfo();
          this.judgeWinOrFailed();
        }
      }
    }

    this.checkButtons();
  }

  btn_redo() {
    this.stopShowSolution();
    this.LoadSGF(this.sgf);
    this.checkButtons();
  }

  updateBoard(addmuber = false) {
    this.gameboard.drawAll();
  }

  sgfMovePrev() {
    if (this.sgf_current != null && this.sgf_current._parent != null) {
      this.sgf_current = this.sgf_current._parent;
    }
  }

  sgfMoveNext() {
    if (this.sgf_current != null) {
      if (this.sgf_current._children != null && this.sgf_current._children.length > 0) {
        this.sgf_current = this.sgf_current._children[0];
      }
    }
  }

  btn_undo() {
    this.stopShowSolution();

    if (this.m_bInResearchMode) {
      if (this.wygo != null && this.wygo.GetRealStepCount() > 0) {
        this.wygo.Repend();
        this.updateBoard(true);
      }
    } else if (!this.m_bWaitComputer) {
      if (this.wygo != null && this.wygo.GetRealStepCount() > 0) {
        this.sgfMovePrev();
        this.wygo.Repend();
        this.updateBoard(true);
      }

      if (this.wygo != null && this.wygo.GetRealStepCount() > 0) {
        if (this.wygo.GetCurMoveColor() == this.m_nMyColor) {
          this.sgfMovePrev();
          this.wygo.Repend();
          this.updateBoard(true);
        }
      }
    }

    this.checkButtons();
  }

  setReseachBtnTitle(title) {
    this.page.setData({
      btn_research_text: title
    });
  }

  setResBtnEnable(enable) {
    let disable = !enable;
    this.page.setData({
      btn_research_disabled: disable
    });
  }

  setSolutionBtnEnable(enable) {
    let disable = !enable;
    this.page.setData({
      btn_solution_disabled: disable
    });
  }

  btn_research() {
    this.stopShowSolution();
    this.btn_redo();

    if (this.m_bInResearchMode) {
      this.m_bInResearchMode = false;
      this.setReseachBtnTitle("研究");
      this.setResBtnEnable(true);
      this.setSolutionBtnEnable(true);
    } else {
      this.setReseachBtnTitle("结束研究");
      this.showCommentsView("正在进行研究");
      this.m_bInResearchMode = true;
      this.setResBtnEnable(false);
      this.setSolutionBtnEnable(false);
    }

    this.checkButtons();
  }

  btn_solution() {
    if (this.canUseSolution()) {
      this.addUserSolution();
      this.btn_redo();
      this.m_bShowSolution = true;
      this.m_nShowSolutionTime = base.getTickCount();
      this.setSolutionBtnEnable(false);

      if (this.sgfLifeMoveNext_CorrectSelect(false, false)) {
        this.m_nShowSolutionTime = base.getTickCount();
      } else {
        this.m_bShowSolution = false;
        this.setSolutionBtnEnable(true);
      }

      this.checkButtons();
    } else {
      var res = uni.getSystemInfoSync();

      if (res.platform == 'ios') {
        uni.showModal({
          title: '提示',
          content: '解答功能每天只可以免费使用五次，成为会员可以无限次的使用该功能，苹果手机请联系微信wyz785。'
        });
        return;
      }

      var that = this;
      uni.showModal({
        title: '提示',
        content: '解答功能每天只可以免费使用五次，购买会员可以无限次的使用该功能',
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

  btn_share() {}

  btn_back() {
    this.exitView();
  }

  stopShowSolution() {
    if (this.m_bShowSolution) {
      this.m_bShowSolution = false;
      this.btn_redo();
    }
  }

  addUserSolution() {
    var today = base.getToday();
    let savedday = uni.getStorageSync("savedday");
    let solutiontimes = uni.getStorageSync("solutiontimes");

    if (savedday == today) {
      uni.setStorage({
        key: 'solutiontimes',
        data: solutiontimes + 1
      });
    } else {
      uni.setStorage({
        key: 'savedday',
        data: today
      });
      uni.setStorage({
        key: 'solutiontimes',
        data: 1
      });
    }
  }

  canUseSolution() {
    if (app.globalData.userstar > 0) {
      return true;
    }

    if (this.maxpos > this.pos) {
      return true;
    }

    var today = base.getToday();
    let savedday = uni.getStorageSync("savedday");
    let solutiontimes = uni.getStorageSync("solutiontimes");

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

  loadcomments() {
    var that = this;
    let theurl = "https://www.gog361.com/cgi-bin/comment?mode=1&key=" + this.commentkey + "&userid=" + app.globalData.userid;
    uni.request({
      url: theurl,
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      data: {
        sessionkey: app.globalData.sessionkey
      },
      //请求后台数据成功  
      success: function (res) {
        if (res.data.retcode >= 0) {
          let list = res.data.comments;

          for (let i = 0; i < list.length; i++) {
            list[i].fromme = 0;

            if (list[i].UserID == app.globalData.userid) {
              list[i].fromme = 1;
            }
          }

          that.page.setData({
            chatmsg_array: list,
            chatscrolltop: 1000 * list.length
          });
        }
      },
      fail: function () {},
      complete: function () {}
    });
  }

  submitcommet(themsg) {
    var that = this;
    let theurl = "https://www.gog361.com/cgi-bin/comment";
    let nick = app.globalData.userInfo.nickName;

    if (app.globalData.joygoengine != null) {
      nick = app.globalData.joygoengine.GetMyNickName();
    }

    uni.request({
      url: theurl,
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      data: {
        mode: 0,
        key: this.commentkey,
        userid: app.globalData.userid,
        name: app.globalData.userInfo.nickName,
        msg: themsg,
        history: 0,
        gamestarttime: 0,
        blackuserid: 0,
        whiteuserid: 0,
        step: 0,
        sessionkey: app.globalData.sessionkey
      },
      //请求后台数据成功  
      success: function (res) {
        that.page.setData({
          inputimmsg: ""
        });
        that.loadcomments();
      },
      fail: function () {
        that.showSmpMsg("提交失败，请重试");
      },
      complete: function () {}
    });
  }

  showSmpMsg(textmsg) {
    uni.showModal({
      title: '信息',
      content: textmsg,
      success: function (res) {}
    });
  }

  btn_msg() {
    this.page.setData({
      showbottombtnview: 0
    });
  }

  onSendMsgBack() {
    this.page.setData({
      showbottombtnview: 1
    });
  }

  onSendMsg(msg) {
    if (msg.length > 0) {
      this.submitcommet(msg);
    }
  }

}