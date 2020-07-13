const util = require("./util.js");

const base = require("./Base.js");

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
var VIEW_HEAD_HEIGHT = 0;
var LINE_VALX;
var LINE_VALY;
var STONE_WIDTH;
var FLAG_OFFSET;
var BOARD_BEGINX;
var BOARD_BEGINY;
var BOARD_MARGIN_X;
var BOARD_MARGIN_Y;
var BOARD_WY_SIZE;
var g_bIsIPAD = false;
var g_nScreenWidth = uni.getSystemInfoSync().windowWidth;
var g_nScreenHeight = uni.getSystemInfoSync().windowHeight;
var g_bIsIPAD = false;
var AMPLIFICATION_RATIO = 1.0;
var STONERATIO1 = 1.04;
var STONERATIO2 = 0.95;
var BEGINCOORD = 1;
var x_coord_label = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

function GetX(nCoordX) {
  var x = (nCoordX - BOARD_BEGINX + LINE_VALX / 2.0 + 1.0) / LINE_VALX + BEGINCOORD;
  return Math.floor(x);
}

function GetY(nCoordY) {
  nCoordY = Math.round(nCoordY);
  var y = (nCoordY - BOARD_BEGINY + LINE_VALY / 2.0 + 1.0) / LINE_VALY + BEGINCOORD;
  return Math.floor(y);
}

function GetCoordCenterX(nX) {
  return BOARD_BEGINX + (nX - 1) * LINE_VALX;
}

function GetCoordCenterY(nY) {
  return BOARD_BEGINY + (nY - 1) * LINE_VALY;
}

function initBoardParam() {
  let nStoneType = 0;

  if (!g_bIsIPAD) {
    AMPLIFICATION_RATIO = 2.6;
  }

  var nScreenWidth = g_nScreenWidth;
  BOARD_WY_SIZE = nScreenWidth;
  LINE_VALX = BOARD_WY_SIZE / 19.5;
  LINE_VALY = LINE_VALX;
  BOARD_BEGINX = (BOARD_WY_SIZE - LINE_VALX * 18) / 2;

  if (nStoneType == 0) {
    STONE_WIDTH = LINE_VALX * STONERATIO1;
  } else {
    STONE_WIDTH = LINE_VALX * STONERATIO2;
  }

  FLAG_OFFSET = STONE_WIDTH * 0.13;
  BOARD_MARGIN_X = BOARD_BEGINX;
  BOARD_MARGIN_Y = BOARD_BEGINX;
  BOARD_BEGINY = BOARD_MARGIN_Y;
} //赢法的统计数组


export default class Board {
  constructor(wygo = null, x = 0, y = 0, fratio) {
    this.init(wygo, x, y, fratio);
  }

  init(wygo, x, y, fratio) {
    this.boardLabels = [];
    this.fAmplificationRatio = fratio;
    initBoardParam();
    this.ai_suggestmove = null;
    this.wygo = wygo;
    this.board_left = x;
    this.board_top = y;
    this.pass_move = null;
    this.board_x = x;
    this.board_y = y;
    this.board_width = this.fAmplificationRatio * BOARD_WY_SIZE;
    let ispad = false;
    let winwidth = uni.getSystemInfoSync().windowWidth;
    let winheight = uni.getSystemInfoSync().windowHeight;

    if (winheight / winwidth < 1.5) {
      ispad = true;
    }

    this.ispad = ispad;
  }

  drawBoard(ctx) {
    ctx.rect(this.board_x, this.board_y, this.board_width, this.board_width);
    ctx.setFillStyle('rgb(219, 180, 124)');
    ctx.fill();
    let lineval = this.board_width / 19.5;
    let margin = (this.board_width - lineval * 18) / 2;

    for (let i = 0; i < 19; i++) {
      //横线
      let x1 = this.board_x + margin;
      let y1 = this.board_y + margin + i * lineval;
      let x2 = this.board_x + margin + 18 * lineval;
      let y2 = y1;
      ctx.beginPath();
      ctx.setLineWidth(0.8);
      ctx.setStrokeStyle('black');
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      x1 = this.board_x + margin + i * lineval;
      y1 = this.board_y + margin;
      x2 = x1;
      y2 = this.board_y + margin + 18 * lineval;
      ctx.beginPath();
      ctx.setLineWidth(0.8);
      ctx.setStrokeStyle('black');
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    for (let i = 0; i < 3; i++) {
      let cx = this.board_x + margin + lineval * 3 + 6 * i * lineval;

      for (let j = 0; j < 3; j++) {
        let cy = this.board_y + margin + lineval * 3 + 6 * j * lineval;
        ctx.beginPath(); //开始一个新的路径  

        ctx.arc(cx, cy, 3, 0, 2 * Math.PI, true); //设置一个原点(100,50)，半径为为50的圆的路径到当前路径  

        ctx.stroke(); //对当前路径进行描边  

        ctx.closePath(); //关闭当前路径 

        ctx.setFillStyle('black');
        ctx.fill();
      }
    }

    if (this.fAmplificationRatio < 1.2) {
      ctx.setFontSize(8);
    } else if (this.fAmplificationRatio < 2.0) {
      ctx.setFontSize(11);
    } else {
      ctx.setFontSize(13);
    }

    ctx.setTextAlign('center');
    ctx.setTextBaseline('middle');
    ctx.setFillStyle('black');

    for (let n = 1; n <= 19; n++) {
      let sLabel = this.Life_GetStrCoordX(n);
      let fY = BOARD_MARGIN_Y * 0.33 * this.fAmplificationRatio;
      let fX = ((n - 1) * LINE_VALX + BOARD_BEGINX) * this.fAmplificationRatio;
      let coord_x = fX + this.board_left; //positon in canvas

      let coord_y = fY + this.board_top; //postion in canvas

      ctx.fillText(sLabel, coord_x, coord_y);
      fY = BOARD_WY_SIZE * this.fAmplificationRatio - BOARD_MARGIN_Y * 0.33 * this.fAmplificationRatio;
      fX = ((n - 1) * LINE_VALX + BOARD_BEGINX) * this.fAmplificationRatio;
      coord_x = fX + this.board_left; //positon in canvas

      coord_y = fY + this.board_top; //postion in canvas

      ctx.fillText(sLabel, coord_x, coord_y);
      sLabel = this.Life_GetStrCoordY(n);
      fX = BOARD_BEGINX * 0.33 * this.fAmplificationRatio;
      fY = ((n - 1) * LINE_VALY + BOARD_MARGIN_Y) * this.fAmplificationRatio;
      coord_x = fX + this.board_left; //positon in canvas

      coord_y = fY + this.board_top; //postion in canvas

      ctx.fillText(sLabel, coord_x, coord_y);
      fX = BOARD_WY_SIZE * this.fAmplificationRatio - BOARD_BEGINX * 0.33 * this.fAmplificationRatio;
      fY = ((n - 1) * LINE_VALY + BOARD_MARGIN_Y) * this.fAmplificationRatio;
      coord_x = fX + this.board_left; //positon in canvas

      coord_y = fY + this.board_top; //postion in canvas

      ctx.fillText(sLabel, coord_x, coord_y);
    }
  }

  Life_GetStrCoordX(nX) {
    return x_coord_label[nX - 1];
  }

  Life_GetStrCoordY(nY) {
    return 20 - nY + "";
  }

  showPassMove(ctx) {
    let curcoord = this.wygo.GetCurMoveCoord();
    let color = this.wygo.GetCurMoveColor();

    if (curcoord == 0 && this.wygo != null && this.wygo.GetRealStepCount() > 0) {
      let stonewidth = STONE_WIDTH;
      let winwidth = uni.getSystemInfoSync().windowWidth;
      let coord_x = winwidth / 2;
      let coord_y = winwidth / 2;
      var imagepath = "/images/blackpass.png";

      if (color == WHITE) {
        imagepath = "/images/whitepass.png";
      }

      ctx.drawImage(imagepath, coord_x, coord_y, stonewidth, stonewidth);
    }
  }

  drawAllLabel(ctx) {
    for (let x = BEGINCOORD; x <= this.wygo.getBoardSize(); x++) for (let y = BEGINCOORD; y <= this.wygo.getBoardSize(); y++) {
      let coord = base.CoordToWord(x, y, this.wygo.getBoardSize());

      if (this.boardLabels[coord] != null) {
        let coord_x = GetCoordCenterX(x);
        let coord_y = GetCoordCenterX(y);
        coord_x = coord_x * this.fAmplificationRatio; //position in board

        coord_y = coord_y * this.fAmplificationRatio; //position in board

        coord_x = coord_x + this.board_left; //positon in canvas

        coord_y = coord_y + this.board_top; //postion in canvas

        let stonewidth = STONE_WIDTH * this.fAmplificationRatio;

        if (this.fAmplificationRatio < 1.1) {
          ctx.setFontSize(12);
        } else if (this.fAmplificationRatio < 1.2) {
          ctx.setFontSize(14);
        } else if (this.fAmplificationRatio < 1.5) {
          ctx.setFontSize(16);
        } else if (this.fAmplificationRatio < 2.0) {
          ctx.setFontSize(20);
        } else {
          ctx.setFontSize(25);
        }

        ctx.setTextAlign('center');
        ctx.setTextBaseline('middle');
        ctx.setFillStyle('blue');
        ctx.fillText(this.boardLabels[coord], coord_x, coord_y);
      }
    }
  }

  drawAll() {
    var context = uni.createCanvasContext('image-canvas-1');
    this.drawBoard(context);

    for (let nX = BEGINCOORD; nX <= this.wygo.getBoardSize(); nX++) {
      for (let nY = BEGINCOORD; nY <= this.wygo.getBoardSize(); nY++) {
        let coord = base.CoordToWord(nX, nY, this.wygo.getBoardSize());
        let color = this.wygo.GetColor(coord);

        if (color == BLANK) {
          continue;
        }

        let coord_x = GetCoordCenterX(nX) - STONE_WIDTH / 2.0;
        let coord_y = GetCoordCenterX(nY) - STONE_WIDTH / 2.0;
        coord_x = coord_x * this.fAmplificationRatio + this.board_left; //position in board

        coord_y = coord_y * this.fAmplificationRatio + this.board_top; //position in board

        let stonewidth = STONE_WIDTH * this.fAmplificationRatio;
        let imagepath = "/static/images/blackstone.png";

        if (color == WHITE) {
          imagepath = "/static/images/whitestone.png";
        }

        context.drawImage(imagepath, coord_x, coord_y, stonewidth, stonewidth);
      }
    }

    let allsteps = this.wygo.GetStepInfo();
    let nPlaceStep = this.wygo.GetPlaceMoveStep();
    let nCurrentStep = this.wygo.GetCurrentStep();

    for (let step = nCurrentStep; step >= nPlaceStep; step--) {
      let coord = allsteps[step];
      let havesamepos = false;

      for (let oldstep = nCurrentStep; oldstep > step; oldstep--) {
        if (allsteps[oldstep] == coord) {
          havesamepos = true;
        }
      }

      if (havesamepos) {
        continue;
      }

      let movenumber = step - nPlaceStep + 1;

      if (movenumber > 0 && this.wygo.GetColor(coord) > BLANK) {
        let nX = base.GetCoordX(coord, this.wygo.getBoardSize());
        let nY = base.GetCoordY(coord, this.wygo.getBoardSize());
        let c_x = GetCoordCenterX(nX) * this.fAmplificationRatio + this.board_left;
        let c_y = GetCoordCenterX(nY) * this.fAmplificationRatio + this.board_top;

        if (this.ispad) {
          context.setFontSize(40);
        } else if (this.fAmplificationRatio < 1.1) {
          context.setFontSize(12);
        } else if (this.fAmplificationRatio < 1.2) {
          context.setFontSize(14);
        } else if (this.fAmplificationRatio < 1.5) {
          context.setFontSize(16);
        } else if (this.fAmplificationRatio < 2.0) {
          context.setFontSize(20);
        } else {
          context.setFontSize(25);
        }

        context.setTextAlign('center');
        context.setTextBaseline('middle');

        if (step % 2 == 0) {
          context.setFillStyle('white');
        } else {
          context.setFillStyle('black');
        }

        context.fillText(movenumber, c_x, c_y);
      }
    }

    this.drawAllLabel(context);
    this.showPassMove(context);
    this.drawAISuggestMoves(context);
    context.draw()
  }

  SetWyGo(thewygo) {
    this.wygo = thewygo;
  }

  RealPointToBoardPoint(realPoint) {
    let p = [realPoint[0], realPoint[1] - VIEW_HEAD_HEIGHT];
    return p;
  }

  BoardPointToRealPoint(boardPoint) {
    let p = [boardPoint[0], boardPoint[1] + VIEW_HEAD_HEIGHT];
    return p;
  }

  CoordToPointInAmpImage(wClickCoord) {
    let fRatio = this.fAmplificationRatio;
    let nX = base.GetCoordX(wClickCoord, this.wygo.getBoardSize());
    let nY = base.GetCoordY(wClickCoord, this.wygo.getBoardSize());
    let fXInImage = ((nX - 1) * LINE_VALX + BOARD_MARGIN_Y) * fRatio; // in big board xcoord

    let fYInImage = ((nY - 1) * LINE_VALY + BOARD_MARGIN_Y) * fRatio; //in big board y coor;

    let p = [fXInImage, fYInImage];
    return p;
  }

  RectContainsPoint(rect, point) {
    if (point[0] >= rect[0] && point[1] >= rect[1] && point[0] <= rect[0] + rect[2] && point[1] <= rect[1] + rect[3]) {
      return true;
    }

    return false;
  }

  ampBoardPointInView(point) {
    let pointInViewBoard = [point[0] + this.board_left, point[1] + this.board_top];
    let rect = [STONE_WIDTH / 2.0, STONE_WIDTH / 2.0, GetCoordCenterX(this.wygo.getBoardSize()), GetCoordCenterY(this.wygo.getBoardSize()) - VIEW_HEAD_HEIGHT];

    if (this.RectContainsPoint(rect, pointInViewBoard)) {
      return true;
    }

    return false;
  }

  getCoordFromPoint(pt) {
    let nX = 0;
    let nY = 0;
    let fMinDist = 888888888.8888;
    let fRatio = this.fAmplificationRatio;
    let pointInBoard = this.RealPointToBoardPoint(pt);
    let pointInAmp = [pointInBoard[0] - this.board_left, pointInBoard[1] - this.board_top];
    let nMinX = (pointInAmp[0] - BOARD_MARGIN_X * fRatio + LINE_VALX * fRatio / 2.0 - fRatio) / (LINE_VALX * fRatio) + BEGINCOORD;
    let nMinY = (pointInAmp[1] - BOARD_MARGIN_Y * fRatio + LINE_VALY * fRatio / 2.0 - fRatio) / (LINE_VALY * fRatio) + BEGINCOORD;
    nMinX = Math.floor(nMinX);
    nMinY = Math.floor(nMinY);
    let nTX = nMinX;
    let nTY = nMinY;
    let fXInImage = ((nTX - 1) * LINE_VALX + BOARD_MARGIN_X) * fRatio; // in big board xcoord

    let fYInImage = ((nTY - 1) * LINE_VALY + BOARD_MARGIN_Y) * fRatio; //in big board y coord;

    let fDist = (pointInAmp[0] - fXInImage) * (pointInAmp[0] - fXInImage) + (pointInAmp[1] - fYInImage) * (pointInAmp[1] - fYInImage);

    if (fMinDist > fDist && base.IsValidCoord2(nTX, nTY, this.wygo.getBoardSize())) {
      fMinDist = fDist;
      nX = nTX;
      nY = nTY;
    }

    nTX = nMinX + 1;
    nTY = nMinY;
    fXInImage = ((nTX - 1) * LINE_VALX + BOARD_MARGIN_X) * fRatio; // in big board xcoord

    fYInImage = ((nTY - 1) * LINE_VALY + BOARD_MARGIN_Y) * fRatio; //in big board y coord;

    fDist = (pointInAmp[0] - fXInImage) * (pointInAmp[0] - fXInImage) + (pointInAmp[1] - fYInImage) * (pointInAmp[1] - fYInImage);

    if (fMinDist > fDist && base.IsValidCoord2(nTX, nTY, this.wygo.getBoardSize())) {
      fMinDist = fDist;
      nX = nTX;
      nY = nTY;
    }

    nTX = nMinX;
    nTY = nMinY + 1;
    fXInImage = ((nTX - 1) * LINE_VALX + BOARD_MARGIN_X) * fRatio; // in big board xcoord

    fYInImage = ((nTY - 1) * LINE_VALY + BOARD_MARGIN_Y) * fRatio; //in big board y coord;

    fDist = (pointInAmp[0] - fXInImage) * (pointInAmp[0] - fXInImage) + (pointInAmp[1] - fYInImage) * (pointInAmp[1] - fYInImage);

    if (fMinDist > fDist && base.IsValidCoord2(nTX, nTY, this.wygo.getBoardSize())) {
      fMinDist = fDist;
      nX = nTX;
      nY = nTY;
    }

    nTX = nMinX + 1;
    nTY = nMinY + 1;
    fXInImage = ((nTX - 1) * LINE_VALX + BOARD_MARGIN_X) * fRatio; // in big board xcoord

    fYInImage = ((nTY - 1) * LINE_VALY + BOARD_MARGIN_Y) * fRatio; //in big board y coord;

    fDist = (pointInAmp[0] - fXInImage) * (pointInAmp[0] - fXInImage) + (pointInAmp[1] - fYInImage) * (pointInAmp[1] - fYInImage);

    if (fMinDist > fDist && base.IsValidCoord2(nTX, nTY, this.wygo.getBoardSize())) {
      fMinDist = fDist;
      nX = nTX;
      nY = nTY;
    }

    let wCoord = base.CoordToWord(nX, nY, this.wygo.getBoardSize());
    let point = this.CoordToPointInAmpImage(wCoord);

    if (!this.ampBoardPointInView(point)) {
      wCoord = 0;
    }

    return wCoord;
  }

  drawChessBoard() {}

  touchend(e) {
    console.log(e);
  }

  AddLabel(coord, color, t) {
    this.drawLabel(coord, color, t);
  }

  drawLabel(coord, color, t) {
    this.boardLabels[coord] = t;
  }

  drawFlag(i, j, me) {
    //画旗子
    this.context.beginPath();
    this.context.arc(12 + i * gap, 12 + j * gap, 10, 0, 2 * Math.PI); //画圆

    this.context.closePath(); //渐变

    var gradient = this.context.createCircularGradient(12 + i * gap + 2, 12 + j * gap - 2, 12);

    if (me) {
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(1, '#636766');
    } else {
      gradient.addColorStop(0, '#d1d1d1');
      gradient.addColorStop(1, '#f9f9f9');
    }

    this.context.setFillStyle(gradient);
    this.context.fill();
    this.context.beginPath(0);
    this.context.setFillStyle('#EE8262');
    this.context.arc(12 + i * gap, 12 + j * gap, 5, 0, 2 * Math.PI); //画圆

    this.context.fill(); //填充

    this.context.draw(true);
  }

  touchBegin(event) {}

  touchEnd(event) {
    var x = event.x;
    var y = event.y;
    //var nY = GetY(y);
    //this.clickCoord(nX,nY);

    let wTempMoveCoord = this.getCoordFromPoint([x, y]);

    if (base.IsValidWordCoord(wTempMoveCoord) && this.wygo.CanMove(wTempMoveCoord, this.wygo.GetNextMoveColor())) {
      //m_wRecMoveCoord=wTempMoveCoord;
      //[self setCurMoveFlag:wTempMoveCoord];
      //[self drawPromptStone:wTempMoveCoord withColor:m_pUIWyGo->GetNextMoveColor() setfRatio:m_fCurrPromptStoneRatio];
      this.clickCoord(wTempMoveCoord);
    }
  }

  clickCoord(coord) {
    var nextmovecolor = this.wygo.GetNextMoveColor();

    if (this.wygo.CanMove(coord, nextmovecolor)) {
      this.wygo.Move(coord, nextmovecolor);
    }

    this.drawAll();
  }

  clearLabels() {
    for (var i = BEGINCOORD; i <= this.wygo.getBoardSize(); i++) for (var j = BEGINCOORD; j <= this.wygo.getBoardSize(); j++) {
      this.boardLabels[(base.CoordToWord(i, j), this.wygo.getBoardSize())] = null;
    }
  }

  showAISuggest(moves) {
    this.ai_suggestmove = moves;
    this.drawAll();
  }

  clearAISuggest() {
    this.kata_analysis = null;
    this.ai_suggestmove = null;
    this.drawAll();
  }

  drawAISuggestMoves(ctx) {
    if (this.ai_suggestmove != null) {
      for (let i = 0; i < this.ai_suggestmove.length; i++) {
        let thecoord = this.ai_suggestmove[i].coord;
        let nX = base.GetCoordX(thecoord, this.wygo.getBoardSize());
        let nY = base.GetCoordY(thecoord, this.wygo.getBoardSize());
        let coord_x = GetCoordCenterX(nX) * this.fAmplificationRatio + this.board_left;
        let coord_y = GetCoordCenterX(nY) * this.fAmplificationRatio + this.board_top;
        let stonewidth = STONE_WIDTH * this.fAmplificationRatio;
        let imagepath = "/static/images/aihelp.png";
        ctx.drawImage(imagepath, coord_x - stonewidth / 2.0, coord_y - stonewidth / 2.0, stonewidth, stonewidth);
        let winrate = parseFloat(this.ai_suggestmove[i].winrate);

        if (winrate.length == 1) {
          ctx.setFontSize(20);
        } else if (winrate == 2) {
          ctx.setFontSize(16);
        } else {
          ctx.setFontSize(12);
        }

        ctx.setTextAlign('center');
        ctx.setTextBaseline('middle');

        if (i == 0) {
          ctx.setFillStyle('red');
        } else {
          ctx.setFillStyle('black');
        }

        ctx.fillText(winrate, coord_x, coord_y);
      }
    }
  }

}