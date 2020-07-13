// JavaScript Document
const base = require("./Base.js");

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
export default class WyGo {
	constructor(boardsize = 19) {
		this.boardsize = boardsize;
		this.WSobj = null;
		this.game_stones = null;
		this.game_stepinfos = null;
		this.move_addstones = null;
		this.move_deletestones = null;
		this.m_nCurrentStep = 0;
		this.m_wKoPos = 0;
		this.m_nMyColor = BLACK; //我方落子类型 2-黑棋 1-白棋

		this.m_CurMoveColor = WHITE;
		this.m_CurMoveCoord = 0;
		this.m_BKilledCount = 0;
		this.m_WKilledCount = 0;
	}

	getBoardSize() {
		return this.boardsize;
	} //设置 玩家棋子类型


	setMyColor(color) {
		if (color >= 1 && color <= 2) {
			this.m_MyColor = color;
		}
	}

	GetCurMoveCoord() {
		return this.game_stepinfos[this.m_nCurrentStep];
	}

	GetCurMoveColor() {
		return this.m_CurMoveColor;
	}

	GetNextMoveColor() {
		return 3 - this.m_CurMoveColor;
	}

	StartGame(nMyColor) {
		this.game_stones = null;
		this.game_stepinfos = null;

		if (this.game_stones == null) {
			this.game_stones = new Array();
		}

		if (this.game_stepinfos == null) {
			this.game_stepinfos = new Array();
		}

		this.m_WKilledCount = 0;
		this.m_BKilledCount = 0;
		this.m_nMyColor = nMyColor;
		this.m_CurMoveColor = WHITE;
		this.m_nCurrentStep = 0;
		this.m_nPlaceMoveStep = 0;

		for (var i = 0; i < MAX_WORDCOORD; i++) {
			this.game_stones[i] = OUTBOARD;
			var nX = base.GetCoordX(i, this.boardsize);
			var nY = base.GetCoordY(i, this.boardsize);

			if (nX >= BEGINCOORD && nX <= this.boardsize && nY >= BEGINCOORD && nY <= this.boardsize) {
				this.game_stones[i] = BLANK;
			} else {
				this.game_stones[i] = OUTBOARD;
			}
		}
	}

	GetCurrentStep() {
		return this.m_nCurrentStep;
	}

	GetRealStepCount() {
		return this.m_nCurrentStep - this.m_nPlaceMoveStep;
	}

	GetPlaceMoveStep() {
		return this.m_nPlaceMoveStep;
	}

	GetColor(coord) {
		return this.game_stones[coord];
	}

	GetStoneColor(coord) {
		return this.game_stones[coord];
	}

	GetStepInfo() {
		return this.game_stepinfos;
	}

	_GetStoneLiberty(stones, libertys, coord, thecolor) {
		if (!stones.contain(coord)) {
			stones.push(coord);
			var temp = base.GetLeft(coord, this.boardsize);
			var color = this.GetStoneColor(temp, this.boardsize);

			if (color == BLANK) {
				if (!libertys.contain(temp)) {
					libertys.push(temp);
				}
			} else if (color == thecolor) {
				this._GetStoneLiberty(stones, libertys, temp, thecolor);
			}

			temp = base.GetTop(coord, this.boardsize);
			color = this.GetStoneColor(temp);

			if (color == BLANK) {
				if (!libertys.contain(temp)) {
					libertys.push(temp);
				}
			} else if (color == thecolor) {
				this._GetStoneLiberty(stones, libertys, temp, thecolor);
			}

			temp = base.GetRight(coord, this.boardsize);
			color = this.GetStoneColor(temp);

			if (color == BLANK) {
				if (!libertys.contain(temp)) {
					libertys.push(temp);
				}
			} else if (color == thecolor) {
				this._GetStoneLiberty(stones, libertys, temp, thecolor);
			}

			temp = base.GetBottom(coord, this.boardsize);
			color = this.GetStoneColor(temp);

			if (color == BLANK) {
				if (!libertys.contain(temp)) {
					libertys.push(temp);
				}
			} else if (color == thecolor) {
				this._GetStoneLiberty(stones, libertys, temp, thecolor);
			}
		}
	}

	CanMoveFirst(coord) {
		if (this.GetColor(coord) != BLANK || this.m_wKoPos == coord) {
			return false;
		}

		if (this.GetColor(base.GetLeft(coord, this.boardsize)) == BLANK) {
			return true;
		}

		if (this.GetColor(base.GetTop(coord, this.boardsize)) == BLANK) {
			return true;
		}

		if (this.GetColor(base.GetRight(coord, this.boardsize)) == BLANK) {
			return true;
		}

		if (this.GetColor(base.GetBottom(coord, this.boardsize)) == BLANK) {
			return true;
		}

		return -1;
	}

	CanMoveSecond(coord, movecolor) {
		var wLeft = base.GetLeft(coord, this.boardsize);
		var nEnemyColor = base.GetRivalColor(movecolor);
		var nTempColor = this.GetColor(wLeft);

		if (nTempColor == movecolor && this.GetLiberty(wLeft) > 1 || nTempColor == nEnemyColor && this.GetLiberty(wLeft) ==
			1) {
			return true;
		}

		var wTop = base.GetTop(coord, this.boardsize);
		nTempColor = this.GetColor(wTop);

		if (nTempColor == movecolor && this.GetLiberty(wTop) > 1 || nTempColor == nEnemyColor && this.GetLiberty(wTop) == 1) {
			return true;
		}

		var wRight = base.GetRight(coord, this.boardsize);
		nTempColor = this.GetColor(wRight);

		if (nTempColor == movecolor && this.GetLiberty(wRight) > 1 || nTempColor == nEnemyColor && this.GetLiberty(wRight) ==
			1) {
			return true;
		}

		var wBottom = base.GetBottom(coord, this.boardsize);
		nTempColor = this.GetColor(wBottom);

		if (nTempColor == movecolor && this.GetLiberty(wBottom) > 1 || nTempColor == nEnemyColor && this.GetLiberty(wBottom) ==
			1) {
			return true;
		}

		return false;
	}

	CanMove(wCoord, nColor) {
		var bRet = this.CanMoveFirst(wCoord);

		if (bRet != -1) {
			return bRet;
		}

		return this.CanMoveSecond(wCoord, nColor);
	}

	GetBlackKilledCount() {
		return this.m_BKilledCount;
	}

	GetWhiteKilledCount() {
		return this.m_WKilledCount;
	}

	GetLiberty(coord) {
		return this.GetStoneLiberty(coord);
	}

	GetCurMoveCoord(coord) {
		return this.m_CurMoveCoord;
	}

	GetStoneLiberty(coord) {
		var theColor = this.GetStoneColor(coord);

		if (theColor <= BLANK) {
			return 0;
		}

		var stones = new Array();
		var libertys = new Array();

		this._GetStoneLiberty(stones, libertys, coord, theColor);

		return libertys.length;
	}

	GetCurMoveColor() {
		return this.m_CurMoveColor;
	}

	CaclChangeStoneForRepend(beforestones) {
		for (var i = 0; i < MAX_WORDCOORD; i++) {
			var nX = base.GetCoordX(i, this.boardsize);
			var nY = base.GetCoordY(i, this.boardsize);

			if (nX >= BEGINCOORD && nX <= this.boardsize && nY >= BEGINCOORD && nY <= this.boardsize) {
				if (beforestones[i] > BLANK && this.game_stones[i] == 0) {
					this.move_deletestones.push(i);
				} else if (beforestones[i] == BLANK && this.game_stones[i] > BLANK) {
					this.move_addstones.push(i);
				}
			}
		}
	}

	Repend() {
		let placemovestep = this.m_nPlaceMoveStep;
		this.m_WKilledCount = 0;
		this.m_BKilledCount = 0;
		this.move_addstones = null;
		this.move_deletestones = null;
		this.move_addstones = new Array();
		this.move_deletestones = new Array();
		var beforestones = new Array();
		beforestones = this.game_stones;
		var stepinfos = new Array();
		stepinfos = this.game_stepinfos;
		this.StartGame(this.m_nMyColor);
		var nStep = stepinfos.length - 1;

		for (var i = 0; i < nStep; i++) {
			if (i < placemovestep) {
				this.PlaceMove(stepinfos[i]);
			} else {
				this.Move(stepinfos[i]);
			}
		}

		stepinfos = null;
		this.CaclChangeStoneForRepend(beforestones);
		beforestones = null;
	}

	GetAddStones() {
		return this.move_addstones;
	}

	GetDeleteStones() {
		return this.move_deletestones;
	}

	PassMove() {
		this.Move(0);
	}

	PlaceMove(coord) {
		this.Move(coord);
		this.m_nPlaceMoveStep++;
	}

	Move(coord) {
		var nextMoveColor = this.GetNextMoveColor();

		if (this.CanMove(coord, nextMoveColor)) {
			var enemycolor = base.GetRivalColor(nextMoveColor);
			this.move_addstones = null;
			this.move_deletestones = null;
			this.move_addstones = new Array();
			this.move_deletestones = new Array();
			this.m_wKoPos = 0;
			this.game_stones[coord] = nextMoveColor;
			this.game_stepinfos[this.m_nCurrentStep++] = coord;
			var wLeft = base.GetLeft(coord, this.boardsize);
			var tempcolor = this.GetStoneColor(wLeft);
			var nKillStoneCount = 0;
			var OneKilledCoord = 0;

			if (tempcolor == enemycolor) {
				var stones = new Array();
				var libertys = new Array();

				this._GetStoneLiberty(stones, libertys, wLeft, tempcolor);

				if (libertys.length == 0) {
					nKillStoneCount += stones.length;
					OneKilledCoord = stones[0];

					for (var i = 0; i < stones.length; i++) {
						this.move_deletestones.push(stones[i]);
						this.game_stones[stones[i]] = BLANK;
					}
				}
			}

			var wTop = base.GetTop(coord, this.boardsize);
			tempcolor = this.GetStoneColor(wTop);

			if (tempcolor == enemycolor) {
				var stones = new Array();
				var libertys = new Array();

				this._GetStoneLiberty(stones, libertys, wTop, tempcolor);

				if (libertys.length == 0) {
					nKillStoneCount += stones.length;
					OneKilledCoord = stones[0];

					for (var i = 0; i < stones.length; i++) {
						this.move_deletestones.push(stones[i]);
						this.game_stones[stones[i]] = BLANK;
					}
				}
			}

			var wRight = base.GetRight(coord, this.boardsize);
			tempcolor = this.GetStoneColor(wRight);

			if (tempcolor == enemycolor) {
				var stones = new Array();
				var libertys = new Array();

				this._GetStoneLiberty(stones, libertys, wRight, tempcolor);

				if (libertys.length == 0) {
					nKillStoneCount += stones.length;
					OneKilledCoord = stones[0];

					for (var i = 0; i < stones.length; i++) {
						this.move_deletestones.push(stones[i]);
						this.game_stones[stones[i]] = BLANK;
					}
				}
			}

			var wBottom = base.GetBottom(coord, this.boardsize);
			tempcolor = this.GetStoneColor(wBottom);

			if (tempcolor == enemycolor) {
				var stones = new Array();
				var libertys = new Array();

				this._GetStoneLiberty(stones, libertys, wBottom, tempcolor);

				if (libertys.length == 0) {
					nKillStoneCount += stones.length;
					OneKilledCoord = stones[0];

					for (var i = 0; i < stones.length; i++) {
						this.move_deletestones.push(stones[i]);
						this.game_stones[stones[i]] = BLANK;
					}
				}
			}

			if (nKillStoneCount == 1) {
				var stones = new Array();
				var libertys = new Array();

				this._GetStoneLiberty(stones, libertys, coord, nextMoveColor);

				if (libertys.length == 1 && stones.length == 1) {
					this.m_wKoPos = OneKilledCoord;
				}
			}

			if (nextMoveColor == BLACK) {
				this.m_WKilledCount += this.move_deletestones.length;
			} else {
				this.m_BKilledCount += this.move_deletestones.length;
			}

			this.m_CurMoveColor = 3 - this.m_CurMoveColor;
			this.move_addstones.push(coord);
			this.m_CurMoveCoord = coord;
		} else if (coord == 0) // is PASSMOVE
		{
			this.move_addstones = null;
			this.move_deletestones = null;
			this.move_addstones = new Array();
			this.move_deletestones = new Array();
			this.m_wKoPos = 0;
			this.game_stepinfos[this.m_nCurrentStep++] = coord;
			this.m_CurMoveColor = 3 - this.m_CurMoveColor;
			this.m_CurMoveCoord = coord;
		}
	}

}
