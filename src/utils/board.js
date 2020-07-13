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
if (g_nScreenWidth > g_nScreenHeight) g_nScreenWidth = g_nScreenHeight
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

function initBoardParam(boardsize) {
	let nStoneType = 0;

	if (!g_bIsIPAD) {
		AMPLIFICATION_RATIO = 2.6;
	}

	var nScreenWidth = g_nScreenWidth;
	BOARD_WY_SIZE = nScreenWidth;
	let lineval = BOARD_WY_SIZE / (boardsize + 0.5);

	if (boardsize < 19) {
		lineval = BOARD_WY_SIZE / (boardsize + 1);
	}

	let margin = (BOARD_WY_SIZE - lineval * (boardsize - 1)) / 2;
	LINE_VALX = lineval;
	LINE_VALY = lineval;
	BOARD_BEGINX = margin;

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
	constructor(wygo = null) {
		this.init(wygo);
	}

	init(wygo) {
		this.wygo = wygo;
		this.boardsize = wygo.getBoardSize();
		this.viewgame = false;
		this.movecursor_coord = 0;
		this.clicked_coord = 0;
		this.boardLabels = [];
		this.numberLabels = [];
		this.clearLabels();
		this.clearStoneNumbers();
		this.count_controls = null;
		this.judgecurstatus_data = null;
		this.ai_suggestmove = null;
		this.kata_analysis = null;
		initBoardParam(this.boardsize);

		if (this.wygo.CanMove(88, this.wygo.GetNextMoveColor())) {
			this.movecursor_coord = 88;
		} else if (this.wygo.CanMove(100, this.wygo.GetNextMoveColor())) {
			this.movecursor_coord = 100;
		} else if (this.wygo.CanMove(340, this.wygo.GetNextMoveColor())) {
			this.movecursor_coord = 340;
		} else if (this.wygo.CanMove(352, this.wygo.GetNextMoveColor())) {
			this.movecursor_coord = 352;
		} else if (this.wygo.CanMove(220, this.wygo.GetNextMoveColor())) {
			this.movecursor_coord = 220;
		}

		this.pass_move = null;
		this.board_x = 0;
		this.board_y = 0;
		this.board_width = BOARD_WY_SIZE;
	}

	setViewGame(viewgame) {
		this.viewgame = viewgame;
	}

	getClickedCoord() {
		return this.clicked_coord;
	}

	getMoveCursorCoord() {
		return this.movecursor_coord;
	}

	drawBoard(ctx) {
		ctx.rect(this.board_x, this.board_y, this.board_width, this.board_width);
		ctx.setFillStyle('rgb(219, 180, 124)');
		ctx.fill();
		let lineval = this.board_width / (this.boardsize + 0.5);

		if (this.boardsize < 19) {
			lineval = this.board_width / (this.boardsize + 1);
		}

		let margin = (this.board_width - lineval * (this.boardsize - 1)) / 2;

		for (let i = 0; i < this.boardsize; i++) {
			//横线
			let x1 = this.board_x + margin;
			let y1 = this.board_y + margin + i * lineval;
			let x2 = this.board_x + margin + (this.boardsize - 1) * lineval;
			let y2 = y1;
			ctx.beginPath();
			ctx.setLineWidth(0.75);
			ctx.setStrokeStyle('black');
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			x1 = this.board_x + margin + i * lineval;
			y1 = this.board_y + margin;
			x2 = x1;
			y2 = this.board_y + margin + (this.boardsize - 1) * lineval;
			ctx.beginPath();
			ctx.setLineWidth(0.8);
			ctx.setStrokeStyle('black');
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		}

		if (this.boardsize == 19) {
			for (let i = 0; i < 3; i++) {
				let cx = this.board_x + margin + lineval * 3 + 6 * i * lineval;

				for (let j = 0; j < 3; j++) {
					let cy = this.board_y + margin + lineval * 3 + 6 * j * lineval;
					ctx.beginPath(); //开始一个新的路径  

					ctx.arc(cx, cy, 1.5, 0, 2 * Math.PI, true); //设置一个原点(100,50)，半径为为50的圆的路径到当前路径  

					ctx.stroke(); //对当前路径进行描边  

					ctx.closePath(); //关闭当前路径 

					ctx.setFillStyle('black');
					ctx.fill();
				}
			}
		} else if (this.boardsize == 13) {
			for (let i = 0; i < 2; i++) {
				let cx = this.board_x + margin + lineval * 3 + 6 * i * lineval;

				for (let j = 0; j < 3; j++) {
					let cy = this.board_y + margin + lineval * 3 + 6 * j * lineval;
					ctx.beginPath(); //开始一个新的路径  

					ctx.arc(cx, cy, 1.5, 0, 2 * Math.PI, true); //设置一个原点(100,50)，半径为为50的圆的路径到当前路径  

					ctx.stroke(); //对当前路径进行描边  

					ctx.closePath(); //关闭当前路径 

					ctx.setFillStyle('black');
					ctx.fill();
				}
			}

			let cx = this.board_x + margin + lineval * 6;
			let cy = this.board_y + margin + lineval * 6;
			ctx.beginPath(); //开始一个新的路径  

			ctx.arc(cx, cy, 1.5, 0, 2 * Math.PI, true); //设置一个原点(100,50)，半径为为50的圆的路径到当前路径  

			ctx.stroke(); //对当前路径进行描边  

			ctx.closePath(); //关闭当前路径 

			ctx.setFillStyle('black');
			ctx.fill();
		} else if (this.boardsize == 9) {
			for (let i = 0; i < 2; i++) {
				let cx = this.board_x + margin + lineval * 2 + 4 * i * lineval;

				for (let j = 0; j < 2; j++) {
					let cy = this.board_y + margin + lineval * 2 + 4 * j * lineval;
					ctx.beginPath(); //开始一个新的路径  

					ctx.arc(cx, cy, 1.5, 0, 2 * Math.PI, true); //设置一个原点(100,50)，半径为为50的圆的路径到当前路径  

					ctx.stroke(); //对当前路径进行描边  

					ctx.closePath(); //关闭当前路径 

					ctx.setFillStyle('black');
					ctx.fill();
				}
			}
		}

		if (this.boardsize == 19) {
			ctx.setFontSize(12);
		} else if (this.boardsize == 13) {
			ctx.setFontSize(12);
		} else if (this.boardsize == 9) {
			ctx.setFontSize(12);
		}

		ctx.setTextAlign('center');
		ctx.setTextBaseline('middle');
		ctx.setFillStyle('black');

		for (let n = 1; n <= this.boardsize; n++) {
			let sLabel = this.Life_GetStrCoordX(n);
			let fY = BOARD_MARGIN_Y * 0.33;
			let fX = (n - 1) * LINE_VALX + BOARD_BEGINX;
			let coord_x = fX; //positon in canvas

			let coord_y = fY; //postion in canvas

			ctx.fillText(sLabel, coord_x, coord_y);
			fY = BOARD_WY_SIZE - BOARD_MARGIN_Y * 0.33;
			fX = (n - 1) * LINE_VALX + BOARD_BEGINX;
			coord_x = fX; //positon in canvas

			coord_y = fY; //postion in canvas

			ctx.fillText(sLabel, coord_x, coord_y);
			sLabel = this.Life_GetStrCoordY(n);
			fX = BOARD_BEGINX * 0.33;
			fY = (n - 1) * LINE_VALY + BOARD_MARGIN_Y;
			coord_x = fX; //positon in canvas

			coord_y = fY; //postion in canvas

			ctx.fillText(sLabel, coord_x, coord_y);
			fX = BOARD_WY_SIZE - BOARD_BEGINX * 0.33;
			fY = (n - 1) * LINE_VALY + BOARD_MARGIN_Y;
			coord_x = fX; //positon in canvas

			coord_y = fY; //postion in canvas

			ctx.fillText(sLabel, coord_x, coord_y);
		}
	}

	Life_GetStrCoordX(nX) {
		return x_coord_label[nX - 1];
	}

	Life_GetStrCoordY(nY) {
		return this.boardsize + 1 - nY + "";
	}

	showPassMove(ctx) {
		let curcoord = this.wygo.GetCurMoveCoord();
		let color = this.wygo.GetCurMoveColor();

		if (curcoord == 0 && this.wygo != null && this.wygo.GetRealStepCount() > 0) {
			let coord_x = GetCoordCenterX(10);
			let coord_y = GetCoordCenterX(10);

			if (this.boardsize == 19) {
				ctx.setFontSize(16);
			} else if (this.boardsize == 13) {
				ctx.setFontSize(22);
			} else if (this.boardsize == 9) {
				ctx.setFontSize(28);
			}

			ctx.setTextAlign('center');
			ctx.setTextBaseline('middle');
			let sLabel = "PASS";

			if (color == BLACK) {
				sLabel = "黑方PASS";
				ctx.setFillStyle('black');
			} else {
				sLabel = "白方PASS";
				ctx.setFillStyle('white');
			}

			ctx.fillText(sLabel, coord_x, coord_y);
		}
	}

	drawCurMoveFlag(ctx) {
		let coord = this.wygo.GetCurMoveCoord();
		let color = this.wygo.GetCurMoveColor();

		if (coord > 0 && this.numberLabels[coord] == null) {
			if (this.viewgame) {
				let step = this.wygo.GetRealStepCount();

				if (step > 0) {
					if (this.boardsize == 19) {
						if (step.length == 1) {
							ctx.setFontSize(12);
						} else if (step.length == 2) {
							ctx.setFontSize(10);
						} else {
							ctx.setFontSize(8);
						}
					} else if (this.boardsize == 13) {
						if (step.length == 1) {
							ctx.setFontSize(24);
						} else if (step.length == 2) {
							ctx.setFontSize(20);
						} else {
							ctx.setFontSize(16);
						}
					} else if (this.boardsize == 9) {
						if (step.length == 1) {
							ctx.setFontSize(24);
						} else if (step.length == 2) {
							ctx.setFontSize(20);
						} else {
							ctx.setFontSize(16);
						}
					}

					ctx.setTextAlign('center');
					ctx.setTextBaseline('middle');
					var x = GetCoordCenterX(base.GetCoordX(coord, this.wygo.getBoardSize()));
					var y = GetCoordCenterY(base.GetCoordY(coord, this.wygo.getBoardSize()));

					if (color == BLACK) {
						ctx.setFillStyle('white');
						ctx.fillText(step, x, y);
					}

					if (color == WHITE) {
						ctx.setFillStyle('black');
						ctx.fillText(step, x, y);
					}
				}
			} else {
				var x = GetCoordCenterX(base.GetCoordX(coord, this.wygo.getBoardSize()));
				var y = GetCoordCenterY(base.GetCoordY(coord, this.wygo.getBoardSize()));
				ctx.beginPath();

				if (color == BLACK) {
					ctx.setFillStyle('yellow');
				} else {
					ctx.setFillStyle('blue');
				}

				ctx.moveTo(x, y);
				ctx.lineTo(x + STONE_WIDTH * 0.4, y);
				ctx.lineTo(x, y + STONE_WIDTH * 0.4);
				ctx.lineTo(x, y);
				ctx.closePath();
				ctx.fill();
			}
		} else {} //ctx.draw();

	}

	drawMoveCursor(ctx, coord) {
		if (this.boardsize < 19) {
			return;
		}

		let nX = base.GetCoordX(coord, this.wygo.getBoardSize());
		let nY = base.GetCoordY(coord, this.wygo.getBoardSize());
		let x = GetCoordCenterX(nX);
		let y = GetCoordCenterX(nY);

		if (this.wygo.CanMove(coord, this.wygo.GetNextMoveColor())) {
			ctx.beginPath();
			ctx.setLineWidth(2);
			ctx.setStrokeStyle('red');
			ctx.moveTo(x - STONE_WIDTH * 0.4, y - STONE_WIDTH * 0.4);
			ctx.lineTo(x - STONE_WIDTH * 0.4, y + STONE_WIDTH * 0.4);
			ctx.stroke();
			ctx.beginPath();
			ctx.setLineWidth(2);
			ctx.setStrokeStyle('red');
			ctx.moveTo(x + STONE_WIDTH * 0.4, y - STONE_WIDTH * 0.4);
			ctx.lineTo(x + STONE_WIDTH * 0.4, y + STONE_WIDTH * 0.4);
			ctx.stroke();
			ctx.beginPath();
			ctx.setLineWidth(2);
			ctx.setStrokeStyle('red');
			ctx.moveTo(x - STONE_WIDTH * 0.4, y - STONE_WIDTH * 0.4);
			ctx.lineTo(x + STONE_WIDTH * 0.4, y - STONE_WIDTH * 0.4);
			ctx.stroke();
			ctx.beginPath();
			ctx.setLineWidth(2);
			ctx.setStrokeStyle('red');
			ctx.moveTo(x - STONE_WIDTH * 0.4, y + STONE_WIDTH * 0.4);
			ctx.lineTo(x + STONE_WIDTH * 0.4, y + STONE_WIDTH * 0.4);
			ctx.stroke();
		}
	}

	setCountContorl(arcontrols) {
		if (this.count_controls != null) {
			this.count_controls = null;
		}

		this.count_controls = new Array();
		this.count_controls = arcontrols;
		this.drawAll();
	}

	setJudgeStatus(data) {
		if (this.judgecurstatus_data != null) {
			this.judgecurstatus_data = null;
		}

		this.judgecurstatus_data = data;
		this.drawAll();
	}

	clearJudgeStatus() {
		if (this.judgecurstatus_data != null) {
			this.judgecurstatus_data = null;
		}

		this.drawAll();
	}

	drawAISuggestMoves(ctx) {
		if (this.ai_suggestmove != null) {
			for (let i = 0; i < this.ai_suggestmove.length; i++) {
				let thecoord = this.ai_suggestmove[i].coord;
				let nX = base.GetCoordX(thecoord, this.wygo.getBoardSize());
				let nY = base.GetCoordY(thecoord, this.wygo.getBoardSize());
				let coord = base.CoordToWord(nX, nY, this.wygo.getBoardSize());
				let stonewidth = STONE_WIDTH * 0.9;
				let coord_x = GetCoordCenterX(nX) - stonewidth / 2.0;
				let coord_y = GetCoordCenterX(nY) - stonewidth / 2.0;
				let imagepath = "/static/images/aihelp.png";
				ctx.drawImage(imagepath, coord_x, coord_y, stonewidth, stonewidth);

				if (this.viewgame) {
					let winrate = parseFloat(this.ai_suggestmove[i].winrate);

					if (winrate > 10) {
						winrate = winrate.toFixed(1);
					} else {
						winrate = winrate.toFixed(2);
					}

					if (winrate.length == 1) {
						ctx.setFontSize(12);
					} else if (winrate == 2) {
						ctx.setFontSize(10);
					} else {
						ctx.setFontSize(8);
					}

					ctx.setTextAlign('center');
					ctx.setTextBaseline('middle');

					if (i == 0) {
						ctx.setFillStyle('red');
					} else {
						ctx.setFillStyle('black');
					}

					coord_x = GetCoordCenterX(nX);
					coord_y = GetCoordCenterX(nY);
					ctx.fillText(winrate, coord_x, coord_y);
				}
			}
		}
	}

	drawKataAnalysis(ctx) {
		if (this.kata_analysis != null) {
			for (let i = BEGINCOORD; i <= MAX_COORD; i++) {
				let stonecolor = this.wygo.GetStoneColor(i);

				if (stonecolor >= BLANK) {
					let thecolor = BLANK;
					let ownership = parseFloat(this.kata_analysis.whiteOwnership[i]);

					if (ownership > 0.5) {
						thecolor = WHITE;
					} else if (ownership < -0.5) {
						thecolor = BLACK;
					}

					if (thecolor != stonecolor && thecolor > BLANK) {
						let nX = base.GetCoordX(i, this.wygo.getBoardSize());
						let nY = base.GetCoordY(i, this.wygo.getBoardSize());
						let x = GetCoordCenterX(nX);
						let y = GetCoordCenterX(nY); //console.log("%d,%d,%d,%d",nX,nY,stonecolor,thecolor);		

						if (thecolor == BLACK) {
							ctx.setFillStyle('black');
							ctx.fillRect(x - STONE_WIDTH * 0.2, y - STONE_WIDTH * 0.2, STONE_WIDTH * 0.4, STONE_WIDTH * 0.4);
						} else if (thecolor == WHITE) {
							ctx.setFillStyle('white');
							ctx.fillRect(x - STONE_WIDTH * 0.2, y - STONE_WIDTH * 0.2, STONE_WIDTH * 0.4, STONE_WIDTH * 0.4);
						}
					}
				}
			}
		}
	}

	drawCountCountrols(ctx) {
		if (this.count_controls != null) {
			for (let i = BEGINCOORD; i <= MAX_COORD; i++) {
				let stonecolor = this.wygo.GetStoneColor(i);

				if (stonecolor >= BLANK) {
					var thecolor = parseInt(this.count_controls[i]);

					if (thecolor != stonecolor && thecolor > BLANK) {
						let nX = base.GetCoordX(i, this.wygo.getBoardSize());
						let nY = base.GetCoordY(i, this.wygo.getBoardSize());
						let x = GetCoordCenterX(nX);
						let y = GetCoordCenterX(nY); //console.log("%d,%d,%d,%d",nX,nY,stonecolor,thecolor);		

						if (thecolor == BLACK) {
							ctx.setFillStyle('black');
							ctx.fillRect(x - STONE_WIDTH * 0.2, y - STONE_WIDTH * 0.2, STONE_WIDTH * 0.4, STONE_WIDTH * 0.4);
						} else if (thecolor == WHITE) {
							ctx.setFillStyle('white');
							ctx.fillRect(x - STONE_WIDTH * 0.2, y - STONE_WIDTH * 0.2, STONE_WIDTH * 0.4, STONE_WIDTH * 0.4);
						}
					}
				}
			}
		}
	}

	drawJudgeStatusFlag(ctx, coord, color, nFlagType) {
		let nX = base.GetCoordX(coord, this.wygo.getBoardSize());
		let nY = base.GetCoordY(coord, this.wygo.getBoardSize());
		let x = GetCoordCenterX(nX);
		let y = GetCoordCenterX(nY);
		let left = 0,
			top = 0,
			right = 0,
			bottom = 0;

		if (nFlagType == 1) {
			left = x - STONE_WIDTH / 8;
			top = y - STONE_WIDTH / 8;
			right = left + STONE_WIDTH / 4;
			bottom = top + STONE_WIDTH / 4;
		} else {
			left = x - STONE_WIDTH / 4;
			top = y - STONE_WIDTH / 4;
			right = left + STONE_WIDTH / 2;
			bottom = top + STONE_WIDTH / 2;
		}

		if (nFlagType == 0 || nFlagType == 1 || nFlagType == 3 || nFlagType == 4) {
			if (color == BLACK) {
				ctx.setFillStyle('black');
			} else if (color == WHITE) {
				ctx.setFillStyle('white');
			}

			ctx.fillRect(left, top, right - left, bottom - top);
		} else if (nFlagType == 2) {
			if (color == BLACK) {
				ctx.setStrokeStyle('black');
			} else if (color == WHITE) {
				ctx.setStrokeStyle('white');
			}

			ctx.strokeRect(left, top, right - left, bottom - top);
		} else if (nFlagType == 5) {
			ctx.beginPath();
			ctx.setLineWidth(2);

			if (color == BLACK) {
				ctx.setFillStyle('black');
			} else if (color == WHITE) {
				ctx.setFillStyle('white');
			}

			ctx.moveTo((left + right) / 2, top);
			ctx.lineTo(left, bottom);
			ctx.lineTo(right, bottom);
			ctx.closePath();
			ctx.fill();
		}
	}

	drawJudgeStatus(ctx) {
		if (this.judgecurstatus_data != null) {
			this.showJudgeStatus(ctx, this.judgecurstatus_data);
		}
	}

	showJudgeStatus(ctx, judgecurstatus) {
		for (let iii = 0; iii < judgecurstatus.BlackMu.length; iii++) {
			let wcoord = judgecurstatus.BlackMu[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, BLACK, 0);
		}

		for (let iii = 0; iii < judgecurstatus.BlackHalfMu.length; iii++) {
			let wcoord = judgecurstatus.BlackHalfMu[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, BLACK, 1);
		}

		for (let iii = 0; iii < judgecurstatus.BlackThickMu.length; iii++) {
			let wcoord = judgecurstatus.BlackThickMu[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, BLACK, 2);
		}

		for (let iii = 0; iii < judgecurstatus.BlackControlArea.length; iii++) {
			let wcoord = judgecurstatus.BlackControlArea[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, BLACK, 3);
		}

		for (let iii = 0; iii < judgecurstatus.BlackDeadStones.length; iii++) {
			let wcoord = judgecurstatus.BlackDeadStones[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, WHITE, 4);
		}

		for (let iii = 0; iii < judgecurstatus.BlackHalfDeadStones.length; iii++) {
			let wcoord = judgecurstatus.BlackHalfDeadStones[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, WHITE, 5);
		}

		for (let iii = 0; iii < judgecurstatus.WhiteMu.length; iii++) {
			let wcoord = judgecurstatus.WhiteMu[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, WHITE, 0);
		}

		for (let iii = 0; iii < judgecurstatus.WhiteHalfMu.length; iii++) {
			let wcoord = judgecurstatus.WhiteHalfMu[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, WHITE, 1);
		}

		for (let iii = 0; iii < judgecurstatus.WhiteThickMu.length; iii++) {
			let wcoord = judgecurstatus.WhiteThickMu[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, WHITE, 2);
		}

		for (let iii = 0; iii < judgecurstatus.WhiteControlArea.length; iii++) {
			let wcoord = judgecurstatus.WhiteControlArea[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, WHITE, 3);
		}

		for (let iii = 0; iii < judgecurstatus.WhiteDeadStones.length; iii++) {
			let wcoord = judgecurstatus.WhiteDeadStones[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, BLACK, 4);
		}

		for (let iii = 0; iii < judgecurstatus.WhiteHalfDeadStones.length; iii++) {
			let wcoord = judgecurstatus.WhiteHalfDeadStones[iii];
			this.drawJudgeStatusFlag(ctx, wcoord, BLACK, 5);
		}
	}

	drawAllNumber(ctx) {
		for (let x = BEGINCOORD; x <= this.wygo.getBoardSize(); x++)
			for (let y = BEGINCOORD; y <= this.wygo.getBoardSize(); y++) {
				let coord = base.CoordToWord(x, y, this.wygo.getBoardSize());

				if (this.numberLabels[coord] != null) {
					let color = this.wygo.GetStoneColor(coord);
					let coord_x = GetCoordCenterX(x);
					let coord_y = GetCoordCenterX(y);
					let stonewidth = STONE_WIDTH;

					if (this.boardsize == 19) {
						if (this.numberLabels[coord].length == 1) {
							ctx.setFontSize(12);
						} else if (this.numberLabels[coord].length == 2) {
							ctx.setFontSize(10);
						} else {
							ctx.setFontSize(8);
						}
					} else if (this.boardsize == 13) {
						if (this.numberLabels[coord].length == 1) {
							ctx.setFontSize(20);
						} else if (this.numberLabels[coord].length == 2) {
							ctx.setFontSize(18);
						} else {
							ctx.setFontSize(14);
						}
					} else if (this.boardsize == 9) {
						if (this.numberLabels[coord].length == 1) {
							ctx.setFontSize(24);
						} else if (this.numberLabels[coord].length == 2) {
							ctx.setFontSize(22);
						} else {
							ctx.setFontSize(18);
						}
					}

					ctx.setTextAlign('center');
					ctx.setTextBaseline('middle');

					if (color == BLACK) {
						ctx.setFillStyle('white');
						ctx.fillText(this.numberLabels[coord], coord_x, coord_y);
					}

					if (color == WHITE) {
						ctx.setFillStyle('black');
						ctx.fillText(this.numberLabels[coord], coord_x, coord_y);
					}
				}
			}
	}

	drawAllLabel(ctx) {
		for (let x = BEGINCOORD; x <= this.wygo.getBoardSize(); x++)
			for (let y = BEGINCOORD; y <= this.wygo.getBoardSize(); y++) {
				let coord = base.CoordToWord(x, y, this.wygo.getBoardSize());

				if (this.boardLabels[coord] != null) {
					let coord_x = GetCoordCenterX(x);
					let coord_y = GetCoordCenterX(y);
					let stonewidth = STONE_WIDTH;

					if (this, boardsize == 19) {
						ctx.setFontSize(10);
					} else if (this, boardsize == 13) {
						ctx.setFontSize(13);
					} else if (this, boardsize == 9) {
						ctx.setFontSize(16);
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

		if (this.wygo != null) {
			for (let nX = BEGINCOORD; nX <= this.wygo.getBoardSize(); nX++) {
				for (let nY = BEGINCOORD; nY <= this.wygo.getBoardSize(); nY++) {
					let coord = base.CoordToWord(nX, nY, this.wygo.getBoardSize());
					let color = this.wygo.GetColor(coord);

					if (color == BLANK) {
						continue;
					}

					let coord_x = GetCoordCenterX(nX) - STONE_WIDTH / 2.0;
					let coord_y = GetCoordCenterX(nY) - STONE_WIDTH / 2.0;
					let stonewidth = STONE_WIDTH;
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
			this.drawAllNumber(context);
			this.drawAllLabel(context);
			this.drawMoveCursor(context, this.movecursor_coord);
			this.showPassMove(context);
			this.drawCurMoveFlag(context);
			this.drawCountCountrols(context);
			this.drawAISuggestMoves(context);
			this.drawJudgeStatus(context);
			this.drawKataAnalysis(context);
		}

		// uni.drawCanvas({
		//   canvasId: 'image-canvas-1',
		//   actions: context.getActions() //获取绘图动作数组  

		// });

		context.draw()
	}

	showKataAnalysis(katadata) {
		this.kata_analysis = katadata;
		this.drawAll();
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
		let fRatio = 1;
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
		let pointInViewBoard = [point[0], point[1]];
		let rect = [STONE_WIDTH / 2.0, STONE_WIDTH / 2.0, GetCoordCenterX(this.wygo.getBoardSize()), GetCoordCenterY(this.wygo
			.getBoardSize()) - VIEW_HEAD_HEIGHT];

		if (this.RectContainsPoint(rect, pointInViewBoard)) {
			return true;
		}

		return false;
	}

	getCoordFromPoint(pt) {
		let nX = 0;
		let nY = 0;
		let fMinDist = 888888888.8888;
		let fRatio = 1;
		let pointInBoard = this.RealPointToBoardPoint(pt);
		let pointInAmp = [pointInBoard[0], pointInBoard[1]];
		let nMinX = (pointInAmp[0] - BOARD_MARGIN_X * fRatio + LINE_VALX * fRatio / 2.0 - fRatio) / (LINE_VALX * fRatio) +
			BEGINCOORD;
		let nMinY = (pointInAmp[1] - BOARD_MARGIN_Y * fRatio + LINE_VALY * fRatio / 2.0 - fRatio) / (LINE_VALY * fRatio) +
			BEGINCOORD;
		nMinX = Math.floor(nMinX);
		nMinY = Math.floor(nMinY);
		let nTX = nMinX;
		let nTY = nMinY;
		let fXInImage = ((nTX - 1) * LINE_VALX + BOARD_MARGIN_X) * fRatio; // in big board xcoord

		let fYInImage = ((nTY - 1) * LINE_VALY + BOARD_MARGIN_Y) * fRatio; //in big board y coord;

		let fDist = (pointInAmp[0] - fXInImage) * (pointInAmp[0] - fXInImage) + (pointInAmp[1] - fYInImage) * (pointInAmp[1] -
			fYInImage);
		let wTempCoord = base.CoordToWord(nTX, nTY, this.wygo.getBoardSize());

		if (fMinDist > fDist && base.IsValidCoord2(nTX, nTY, this.wygo.getBoardSize())) {
			fMinDist = fDist;
			nX = nTX;
			nY = nTY;
		}

		nTX = nMinX + 1;
		nTY = nMinY;
		fXInImage = ((nTX - 1) * LINE_VALX + BOARD_MARGIN_X) * fRatio; // in big board xcoord

		fYInImage = ((nTY - 1) * LINE_VALY + BOARD_MARGIN_Y) * fRatio; //in big board y coord;

		fDist = (pointInAmp[0] - fXInImage) * (pointInAmp[0] - fXInImage) + (pointInAmp[1] - fYInImage) * (pointInAmp[1] -
			fYInImage);
		wTempCoord = base.CoordToWord(nTX, nTY, this.wygo.getBoardSize());

		if (fMinDist > fDist && base.IsValidCoord2(nTX, nTY, this.wygo.getBoardSize())) {
			fMinDist = fDist;
			nX = nTX;
			nY = nTY;
		}

		nTX = nMinX;
		nTY = nMinY + 1;
		fXInImage = ((nTX - 1) * LINE_VALX + BOARD_MARGIN_X) * fRatio; // in big board xcoord

		fYInImage = ((nTY - 1) * LINE_VALY + BOARD_MARGIN_Y) * fRatio; //in big board y coord;

		fDist = (pointInAmp[0] - fXInImage) * (pointInAmp[0] - fXInImage) + (pointInAmp[1] - fYInImage) * (pointInAmp[1] -
			fYInImage);
		wTempCoord = base.CoordToWord(nTX, nTY, this.wygo.getBoardSize());

		if (fMinDist > fDist && base.IsValidCoord2(nTX, nTY, this.wygo.getBoardSize())) {
			fMinDist = fDist;
			nX = nTX;
			nY = nTY;
		}

		nTX = nMinX + 1;
		nTY = nMinY + 1;
		fXInImage = ((nTX - 1) * LINE_VALX + BOARD_MARGIN_X) * fRatio; // in big board xcoord

		fYInImage = ((nTY - 1) * LINE_VALY + BOARD_MARGIN_Y) * fRatio; //in big board y coord;

		fDist = (pointInAmp[0] - fXInImage) * (pointInAmp[0] - fXInImage) + (pointInAmp[1] - fYInImage) * (pointInAmp[1] -
			fYInImage);
		wTempCoord = base.CoordToWord(nTX, nTY, this.wygo.getBoardSize());

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

	AddLabel(coord, color, t) {
		this.drawLabel(coord, t);
	}

	drawLabel(coord, t) {
		this.boardLabels[coord] = t;
	}

	drawStoneNumber(coord, t) {
		this.numberLabels[coord] = t;
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

	touchBegin(event) {
		this.clicked_coord = 0;
	}

	touchEnd(event) {
		// var x = event.changedTouches[0].x;
		// var y = event.changedTouches[0].y;
		var x = event.x;
		var y = event.y; //var nX = GetX(x);
		//var nY = GetY(y);
		//this.clickCoord(nX,nY);

		let wTempMoveCoord = this.getCoordFromPoint([x, y]);
		this.clicked_coord = wTempMoveCoord;

		if (base.IsValidWordCoord(wTempMoveCoord, this.wygo.getBoardSize()) && this.wygo != null && this.wygo.CanMove(
				wTempMoveCoord, this.wygo.GetNextMoveColor())) {
			//m_wRecMoveCoord=wTempMoveCoord;
			//[self setCurMoveFlag:wTempMoveCoord];
			//[self drawPromptStone:wTempMoveCoord withColor:m_pUIWyGo->GetNextMoveColor() setfRatio:m_fCurrPromptStoneRatio];
			this.clickCoord(wTempMoveCoord);
		}
	}

	clickCoord(coord) {
		this.movecursor_coord = coord;
		this.drawAll();
	}

	clearStoneNumbers() {
		for (let i = BEGINCOORD; i <= this.wygo.getBoardSize(); i++)
			for (let j = BEGINCOORD; j <= this.wygo.getBoardSize(); j++) {
				this.numberLabels[base.CoordToWord(i, j, this.wygo.getBoardSize())] = null;
			}
	}

	clearCountControl() {
		this.count_controls = null;
		this.drawAll();
	}

	clearLabels() {
		for (let i = BEGINCOORD; i <= this.wygo.getBoardSize(); i++)
			for (let j = BEGINCOORD; j <= this.wygo.getBoardSize(); j++) {
				this.boardLabels[base.CoordToWord(i, j, this.wygo.getBoardSize())] = null;
			}
	}

}
