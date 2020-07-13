const base = require("../../utils/Base.js");

var app = getApp().globalData;
export default class processcmd {
  constructor(joygoengine) {
    this.wygame = null;
    this.joygoengine = joygoengine;
    this.wygame_from_where = 0; //0 game desklist 1, game playlist.

    this.showBeInvitWinCount = 0;
    this.user_profile_win = null;
    this.myfriendlist = new Array();
    this.myblacklist = new Array();
    this.friendlist = null;
    this.blacklist = null;
    this.p2pim_win = null;
    this.my_game_info = null;
    this.go_move_seq = 0;
    this.gomovetimeoutProcess = null;
    this.roomdesklist = null;
    this.roomplayerlist = null;
    this.roomlist = null;
    this.mylanguage = 0;
    this.immessage_p2p = null;
    this.immessage = null;
  }

  setRoomDeskList(roomdesklist) {
    this.roomdesklist = roomdesklist;
  }

  setWyGame(wygame) {
    this.wygame = wygame;
  }

  OnMessage(msg) {
    var cmd = msg.Cmd;

    switch (cmd) {
      case 1002:
        this.OnHello_Ret(msg);
        break;

      case 1014:
        this.OnGetNews_Ret(msg);
        break;

      case 1010:
        this.OnCheckUser_Ret(msg);
        break;

      case 1142:
      case 1190:
        this.OnLogin_Ret(msg);
        break;

      case 1022:
        this.OnListGameRoom_Ret(msg);
        break;

      case 1030:
        this.OnUserEnterRoom_Ret(msg);
        break;

      case 1120:
        this.OnListRoomGameDesk_Ret(msg);
        break;

      case 1122:
        this.OnListRoomPlayer_Ret(msg);
        break;

      case 1042:
        this.OnGetGameInfo_Ret(msg);
        break;

      case 1043:
      case 1038:
        this.OnSvrUpdateGameDeskInfo(msg);
        break;

      case 1097:
        this.OnViewGoMove(msg);
        break;

      case 1118:
        this.OnGetUserProfile_Ret(msg);
        break;

      case 1047:
        this.OnGoMove(msg);
        break;

      case 1048:
        this.OnGoMove_Ret(msg);
        break;

      case 1108:
        this.OnGetGameSimpleInfo_Ret(msg);
        break;

      case 1099:
        this.OnIMMessage(msg);
        break;

      case 1100:
        this.OnIMMessage_Ret(msg);
        break;

      case 1000002:
        this.OnWebCmdCount_Ret(msg);
        break;

      case 1000004:
        this.OnWebCmdJudgeStatus_Ret(msg);
        break;

      case 1101:
        this.OnSvrNotifyGameEnd_ForView(msg);
        break;

      case 1075:
        this.OnSvrNotifyGameEnd(msg);
        break;

      case 1045:
        this.OnSvrGameStartStatus(msg);
        break;

      case 1051:
        this.OnAskRepend(msg);
        break;

      case 1053:
        this.OnAllowRepend(msg);
        break;

      case 1054:
        this.OnAllowRepend_Ret(msg);
        break;

      case 1059:
        this.OnAskStartCount(msg);
        break;

      case 1061:
        this.OnAgreeStartCount(msg);
        break;

      case 1063:
        this.OnCountWithResult(msg);
        break;

      case 1065:
        this.OnAskAgreeCountResult(msg);
        break;

      case 1067:
        this.OnAgreeCountResult(msg);
        break;

      case 1069:
        this.OnNotifyForceCount(msg);
        break;

      case 1071:
        this.OnEnemyResign(msg);
        break;

      case 1033:
        this.OnBeInvited(msg);
        break;

      case 1035:
        this.OnPlayerAcceptInvite(msg);
        break;

      case 1055:
        this.OnAskPeace(msg);
        break;

      case 1057:
        this.OnAgreePeace(msg);
        break;

      case 1124:
        this.OnApplyJudgeHelp_Ret(msg);
        break;

      case 1130:
        this.OnGetFriendList_Ret(msg);
        break;

      case 1089:
        this.OnAskAddFriend(msg);
        break;

      case 1091:
        this.OnPlayerAcceptAddFriend(msg);
        break;

      case 1094:
        this.OnDeleteFriend_Ret(msg);
        break;

      case 1110:
        this.OnAddToBlackList_Ret(msg);
        break;

      case 1112:
        this.OnDeleteBlackList_Ret(msg);
        break;

      case 1114:
        this.OnGetBlackList_Ret(msg);
        break;

      case 1133:
        this.OnAskStartIM(msg);
        break;

      case 1134:
        this.OnAskStartIM_Ret(msg);
        break;

      case 1135:
        this.OnAcceptStartIM(msg);
        break;

      case 1137:
        this.OnExitIM(msg);
        break;

      case 1104:
        this.OnJudgeTerminalGame_Ret(msg);
        break;

      case 1139:
        this.OnSvrPushAlert(msg);
        break;

      case 1145:
        this.OnSvrPushMsgOpenURL(msg);
        break;

      case 1088:
        this.OnUpdateUserNickName_Ret(msg);
        break;

      case 1154:
        this.OnGetOnlineUsers_Ret(msg);
        break;

      case 1164:
        this.OnGetCurrentGame_Ret(msg);

      default:
        break;
    }
  }

  showSmpMsg(textmsg) {
    uni.showModal({
      title: '信息',
      content: textmsg,
      success: function (res) {}
    });
  }

  OnHello_Ret(msg) {}

  OnCheckUser_Ret(msg) {}

  OnLogin_Ret(msg) {
    if (msg.Result >= 0) {
      this.cmd_GetFriendList();
      this.cmd_GetBlackList();

      if (this.wygame != null) {
        this.wygame.OnLogin_Ret(msg);
      } else if (this.roomplayerlist != null) {
        this.roomplayerlist.OnLogin_Ret(msg);
      }
    }
  }

  GetWyGameFromWhere() {
    return this.wygame_from_where;
  }

  cmd_getnews(localSeq) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1013,
      NewsSeq: localSeq,
      Language: 0,
      Token: 'abcde',
      UserID: this.joygoengine.GetMyUserID()
    };
    this.joygoengine.sendCmd(msg);
  }

  IAmInGame() {
    if (this.my_game_info != null) {
      return true;
    }

    return false;
  }

  OnGetNews_Ret(msg) {
    var news = msg.News; //	this.showSmpMsg(news);
  }

  cmd_ListGameRoom() {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1021,
      UserID: this.joygoengine.GetMyUserID()
    };
    this.joygoengine.sendCmd(msg);
  }

  OnListGameRoom_Ret(msg) {
    if (msg.Result >= 0) {
      this.joygoengine.SetRoomList(msg.RoomList);

      if (this.roomlist != null) {
        this.roomlist.Update(msg.RoomList);
      }
    }
  }

  cmd_UserEnterRoom(nRoomID, nGameType, nInviteUserID) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1029,
      UserID: this.joygoengine.GetMyUserID(),
      RoomID: nRoomID,
      GameType: nGameType,
      InviteUserID: nInviteUserID
    };
    this.joygoengine.sendCmd(msg);
  }

  OnUserEnterRoom_Ret(msg) {
    if (msg.Result == -2) {
      this.roomplayerlist = null;
      this.showSmpMsg("房间人数已满，请选择进入人数较少的房间。");
    } else if (msg.Result == -3) {
      this.roomplayerlist = null;
      this.showSmpMsg("进入房间失败，请重试或者选择其他房间。");
    } else {
      this.joygoengine.SetCurRoomID(msg.RoomID);

      if (msg.ExistGameDeskID > 0) {
        this.cmd_GetGameInfo(msg.RoomID, msg.ExistGameDeskID);
      }

      if (this.wygame != null) {
        this.wygame.OnUserEnterRoom_Ret(msg);
      }
      /*	else if(this.roomdesklist==null&&this.roomplayerlist==null)
      	{
      		this.roomdesklist= new DeskList();
      		g_backLayer.addChild(this.roomdesklist);
      		this.cmd_ListRoomGameDesk(msg.RoomID);
      	}
      	else if(this.roomdesklist!=null)
      	{
      		this.cmd_ListRoomGameDesk(msg.RoomID);
      	}
      	else if(this.roomplayerlist!=null)
      	{
      		this.cmd_ListRoomPlayer(msg.RoomID);
      	}*/
      //this.cmd_GetUserProfile(210000);

    }
  }

  cmd_ListRoomPlayer(roomid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1121,
      RoomID: roomid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnListRoomPlayer_Ret(msg) {
    if (msg.Result >= 0) {
      if (this.roomplayerlist != null) {
        this.roomplayerlist.Update(msg.RoomID, msg.PlayerList);
      }
    }
  }

  cmd_ListRoomGameDesk(roomid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1119,
      RoomID: roomid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnListRoomGameDesk_Ret(msg) {
    if (msg.Result >= 0) {
      if (this.roomdesklist != null) {
        this.roomdesklist.OnUpdateGameDeskList(msg.RoomID, msg.DeskList);
      }
    }
  }

  OnSvrUpdateGameDeskInfo(msg) {
    //可以不用返回消息的
    if (this.roomdesklist != null) {
      this.roomdesklist.OnUpdateGameDeskInfo(msg);
    }
  }

  cmd_SitDownDesk(bAutoSelect, nTheInviteUserID, nGameDeskID, nSitColor) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1037,
      FromUserID: this.joygoengine.GetMyUserID(),
      RoomID: this.joygoengine.GetCurRoomID(),
      AutoSelect: bAutoSelect,
      TheInviteUserID: nTheInviteUserID,
      GameDeskID: nGameDeskID,
      SitColor: nSitColor
    };
    this.joygoengine.sendCmd(msg);
  }

  cmd_GetGameInfo(roomid, deskid) {
    if (this.roomdesklist != null) {
      this.wygame_from_where = 0;
    } else if (this.roomplayerlist != null) {
      this.wygame_from_where = 1;
    } else {
      this.wygame_from_where = 0;
    }

    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1041,
      FromUserID: this.joygoengine.GetMyUserID(),
      RoomID: roomid,
      GameDeskID: deskid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnGetGameInfo_Ret(msg) {
    if (msg.Result < 0) {
      this.showSmpMsg("当前的对局已经不存在，请返回房间");
      return;
    }

    if (msg.BUserID == this.joygoengine.GetMyUserID() || msg.WUserID == this.joygoengine.GetMyUserID()) {
      this.my_game_info = msg;
    }

    if (this.wygame != null) {
      this.wygame.Update(msg);
    }
  }

  cmd_GetUserProfile(userid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1117,
      UserID: userid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnGetUserProfile_Ret(msg) {
    if (msg.Result >= 0) {
      if (this.wygame != null || this.roomdesklist != null || this.roomplayerlist != null || this.friendlist != null || this.blacklist != null) {
        showUserProfile(msg);
      } else {//console.log(msg.UserID);
        //cmd_GetUserProfile(msg.UserID+1);
      }
    }
  }

  cmd_GoMove(deskid, enemyuserid, wCoord, nMyColor, nCurStep) {
    this.go_move_seq = this.joygoengine.GetSeq();
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.go_move_seq,
      Cmd: 1047,
      FromUserID: this.joygoengine.GetMyUserID(),
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      ToUserID: enemyuserid,
      Coord: wCoord,
      MyColor: nMyColor,
      CurStep: nCurStep
    };
    this.joygoengine.sendCmd(msg);
    this.gomovetimeoutProcess = setTimeout(this.GoMoveTimeOut, 30000);
  }

  OnGoMove_Ret(msg) {
    if (msg.Seq == this.go_move_seq) {
      clearTimeout(this.gomovetimeoutProcess);
      this.gomovetimeoutProcess = null;
    }

    if (this.wygame != null) {
      this.wygame.OnGoMove_Ret(msg);
    }
  }

  GoMoveTimeOut() {
    this.gomovetimeoutProcess = null;
    uni.showModal({
      title: '信息',
      content: '您刚走的棋超时，没有提交成功，建议刷新下页面重新连接到服务器。',
      success: function (res) {}
    });
  }

  OnViewGoMove(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1098,
      Result: 0
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnViewGoMove(msg);
    }
  }

  OnGoMove(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1048,
      Result: 0
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnGoMove(msg);
    }
  }

  cmd_GetGameSimpleInfo(roomid, deskid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1107,
      FromUserID: this.joygoengine.GetMyUserID(),
      RoomID: roomid,
      GameDeskID: deskid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnGetGameSimpleInfo_Ret(msg) {
    if (this.wygame != null) {
      this.wygame.OnGetGameSimpleInfo_Ret(msg);
    }
  }

  cmd_SendIMMsg(immsg) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1099,
      FromUserID: this.joygoengine.GetMyUserID(),
      MsgType: immsg.MsgType,
      FromUserID: immsg.FromUserID,
      ToUserID: immsg.ToUserID,
      SessionID: immsg.SessionID,
      Msg: immsg.Msg,
      FromUserNick: immsg.FromUserNick
    };
    this.joygoengine.sendCmd(msg);
  }

  OnIMMessage(msg) {
    if (this.wygame != null) {
      this.wygame.OnIMMessage(msg);
    }
  }

  OnIMMessage_Ret(msg) {
    if (this.wygame != null) {
      this.wygame.OnIMMessage_Ret(msg);
    }
  }

  cmd_WebCmdCount(firstcall, steps, sethealths) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1000001,
      FromUserID: this.joygoengine.GetMyUserID(),
      FirstCall: firstcall,
      ShuZiSetHealth: sethealths,
      StepInfos: steps
    };
    this.joygoengine.sendCmd(msg);
  }

  OnWebCmdCount_Ret(msg) {
    if (this.wygame != null) {
      this.wygame.OnWebCmdCount_Ret(msg);
    }
  }

  cmd_WebCmdJudgeStatus(steps, sethealths) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1000003,
      FromUserID: this.joygoengine.GetMyUserID(),
      ShuZiSetHealth: sethealths,
      StepInfos: steps
    };
    this.joygoengine.sendCmd(msg);
  }

  OnWebCmdJudgeStatus_Ret(msg) {
    if (this.wygame != null) {
      this.wygame.OnWebCmdJudgeStatus_Ret(msg);
    }
  }

  OnSvrNotifyGameEnd_ForView(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1102,
      Result: 0
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnSvrNotifyGameEnd_ForView(msg);
    }
  }

  OnSvrNotifyGameEnd(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1076,
      Result: 0
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnSvrNotifyGameEnd(msg);
    }

    this.my_game_info = null;
  }

  OnSvrGameStartStatus(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1046,
      Result: 0
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (msg.Result >= 0) {
      if (this.roomplayerlist != null) {
        this.roomplayerlist.OnSvrGameStartStatus(msg);
      }

      this.cmd_GetGameInfo(msg.RoomID, msg.GameDeskID);
    }
  }

  cmd_AskRepend(deskid, mysuerid, enemyuserid, curstep) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1051,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: mysuerid,
      ToUserID: enemyuserid,
      CurStep: curstep
    };
    this.joygoengine.sendCmd(msg);
  }

  OnAskRepend(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1052,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (msg.Result >= 0) {
      if (this.wygame != null) {
        this.wygame.OnAskRepend(msg);
      }
    }
  }

  cmd_AllowRepend(deskid, mysuerid, enemyuserid, afterstep, ballow) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1053,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: mysuerid,
      ToUserID: enemyuserid,
      StepAfterRepend: afterstep,
      Allow: ballow
    };
    this.joygoengine.sendCmd(msg);
  }

  OnAllowRepend(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1054,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID,
      Allow: msg.Allow,
      StepAfterRepend: msg.StepAfterRepend
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (msg.Result >= 0) {
      if (this.wygame != null) {
        this.wygame.OnAllowRepend(msg);
      }
    }
  }

  OnAllowRepend_Ret(msg) {
    if (this.wygame != null) {
      this.wygame.OnAllowRepend_Ret(msg);
    }
  }

  cmd_AskStartCount(deskid, mysuerid, enemyuserid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1059,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: mysuerid,
      ToUserID: enemyuserid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnAskStartCount(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1060,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnAskStartCount(msg);
    }
  }

  cmd_AgreeStartCount(deskid, mysuerid, enemyuserid, agree, gamestarttime) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1061,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: mysuerid,
      ToUserID: enemyuserid,
      Agree: agree,
      GameStartTime: gamestarttime
    };
    this.joygoengine.sendCmd(msg);
  }

  OnAgreeStartCount(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1062,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnAgreeStartCount(msg);
    }
  }

  cmd_CountWithResult(deskid, mysuerid, enemyuserid, result, wincolor, controrls) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1063,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: mysuerid,
      ToUserID: enemyuserid,
      GameResult: result,
      WinColor: wincolor,
      Controls: controrls
    };
    this.joygoengine.sendCmd(msg);
  }

  OnCountWithResult(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1064,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnCountWithResult(msg);
    }
  }

  cmd_AskAgreeCountResult(deskid, mysuerid, enemyuserid, result, wincolor, blackvalue, whitevalue) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1065,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: mysuerid,
      ToUserID: enemyuserid,
      GameResult: result,
      WinColor: wincolor,
      BlackValueCount: blackvalue,
      WhiteValueCount: whitevalue
    };
    this.joygoengine.sendCmd(msg);
  }

  OnAskAgreeCountResult(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1066,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnAskAgreeCountResult(msg);
    }
  }

  cmd_AgreeCountResult(deskid, mysuerid, enemyuserid, agree, result, wincolor, blackvalue, whitevalue, gamestarttime) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1067,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: mysuerid,
      ToUserID: enemyuserid,
      AgreeResult: agree,
      GameResult: result,
      WinColor: wincolor,
      BlackValueCount: blackvalue,
      WhiteValueCount: whitevalue,
      GameStartTime: gamestarttime
    };
    this.joygoengine.sendCmd(msg);
  }

  OnAgreeCountResult(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1068,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnAgreeCountResult(msg);
    }
  }

  cmd_NotifyForceCount(deskid, mysuerid, enemyuserid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1069,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: mysuerid,
      ToUserID: enemyuserid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnNotifyForceCount(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1070,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnNotifyForceCount(msg);
    }
  }

  cmd_Resign(deskid, mysuerid, enemyuserid, reason, wincolor, gamestarttime) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1071,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: mysuerid,
      ToUserID: enemyuserid,
      WinColor: wincolor,
      Reason: reason,
      GameStartTime: gamestarttime
    };
    this.joygoengine.sendCmd(msg);
  }

  OnEnemyResign(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1072,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame != null) {
      this.wygame.OnEnemyResign(msg);
    }
  }

  cmd_InviteOtherPlayer(nInvitedUserID) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1033,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: 0,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: nInvitedUserID,
      Female: this.joygoengine.GetMyFemale(),
      InviteUserScore: this.joygoengine.GetMyUserScore(),
      InviteUserNick: this.joygoengine.GetMyNickName()
    };
    this.joygoengine.sendCmd(msg);
  }

  showBeInvited(msg) {
    var invitetxt = "玩家" + msg.FromUserNick + " " + base.GetLevelStr(msg.FromUserScore) + "邀请您进行网络对弈";
    var that = this;
    uni.showModal({
      title: '好友',
      content: invitetxt,
      success: function (res) {
        if (res.confirm) {
          that.cmd_PlayerAcceptInvite(true, msg.FromUserID);
        } else {
          that.cmd_PlayerAcceptInvite(false, msg.FromUserID);
        }
      }
    });
  }

  OnBeInvited(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1034,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame == null) {
      if (!this.IsMyBlack(msg.FromUserID)) {
        this.showBeInvited(msg);
      }
    }
  }

  cmd_PlayerAcceptInvite(bAccept, nToUserID) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1035,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: 0,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: nToUserID,
      Accept: bAccept,
      Female: this.joygoengine.GetMyFemale(),
      InviteUserScore: this.joygoengine.GetMyUserScore(),
      InviteUserNick: this.joygoengine.GetMyNickName()
    };
    this.joygoengine.sendCmd(msg);
  }

  OnPlayerAcceptInvite(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1036,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (msg.Accept != true) {
      if (this.immessage_room != null) {
        var text = "玩家" + msg.FromUserNick + " " + base.GetLevelStr(msg.FromUserScore) + "不接受您的对局邀请";
        var sys_msg = {
          MsgType: 1,
          FromUserID: this.joygoengine.GetMyUserID(),
          ToUserID: 0,
          SessionID: this.joygoengine.GetCurRoomID(),
          Msg: text,
          FromUserNick: ""
        };
        this.immessage_room.AddMsg(sys_msg);
      }
    }
  }

  DeleteAllIM() {
    if (this.immessage != null) {
      this.immessage.remove();
      this.immessage = null;
    }

    if (this.immessage_room != null) {
      this.immessage_room.remove();
      this.immessage_room = null;
    }

    if (this.immessage_p2p != null) {
      this.immessage_p2p.remove();
      this.immessage_p2p = null;
    }
  }

  cmd_AskPeace(deskid, enemyuserid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1055,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: enemyuserid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnAskPeace(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1056,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame) {
      this.wygame.OnAskPeace(msg);
    }
  }

  cmd_AgreePeace(deskid, mysuerid, enemyuserid, agree, gamestarttime) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1057,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: mysuerid,
      ToUserID: enemyuserid,
      Agree: agree,
      GameStartTime: gamestarttime
    };
    this.joygoengine.sendCmd(msg);
  }

  OnAgreePeace(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1058,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (this.wygame) {
      this.wygame.OnAgreePeace(msg);
    }
  }

  cmd_ApplyJudgeHelp(deskid, helpinfo, issuetype) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1123,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: this.joygoengine.GetMyUserID(),
      IssueType: issuetype,
      HelpInfo: helpinfo
    };
    this.joygoengine.sendCmd(msg);
  }

  OnApplyJudgeHelp_Ret(msg) {
    if (this.wygame) {
      this.wygame.OnApplyJudgeHelp_Ret(msg);
    }
  }

  cmd_GetFriendList() {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1129,
      FromUserID: this.joygoengine.GetMyUserID()
    };
    this.joygoengine.sendCmd(msg);
  }

  OnGetFriendList_Ret(msg) {
    this.myfriendlist.length = 0;

    for (var i = 0; i < msg.PlayerList.length; i++) {
      this.myfriendlist[i] = msg.PlayerList[i].ID;
    }

    if (this.friendlist != null) {
      this.friendlist.OnGetFriendList_Ret(msg);
    }
  }

  cmd_AskAddFriend(touserid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1089,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: 0,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: touserid,
      Female: this.joygoengine.GetMyFemale(),
      InviteUserScore: this.joygoengine.GetMyUserScore(),
      InviteUserNick: this.joygoengine.GetMyNickName()
    };
    this.joygoengine.sendCmd(msg);
  }

  showAskAddFriend(msg) {
    var msgtxt = "玩家" + msg.FromUserNick + " " + base.GetLevelStr(msg.FromUserScore) + "请求加您为好友";
    var friendtxt = "对手" + this.enemy_nick + "请求悔棋";
    var that = this;
    uni.showModal({
      title: '好友',
      content: friendtxt,
      success: function (res) {
        if (res.confirm) {
          that.cmd_PlayerAcceptAddFriend(true, msg.FromUserID);
        } else {
          that.cmd_PlayerAcceptAddFriend(false, msg.FromUserID);
        }
      }
    });
  }

  OnAskAddFriend(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1090,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);
    this.showAskAddFriend(msg);
  }

  cmd_PlayerAcceptAddFriend(bAccept, nToUserID) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1091,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: 0,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: nToUserID,
      Accept: bAccept,
      Female: this.joygoengine.GetMyFemale(),
      InviteUserScore: this.joygoengine.GetMyUserScore(),
      InviteUserNick: this.joygoengine.GetMyNickName()
    };
    this.joygoengine.sendCmd(msg);
  }

  OnPlayerAcceptAddFriend(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1092,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (msg.Accept != true) {
      var text = "玩家" + msg.FromUserNick + " " + base.GetLevelStr(msg.FromUserScore) + "拒绝加您为好友";
      this.showSmpMsg(text);
    } else {
      this.cmd_GetFriendList();
      var text = "玩家" + msg.FromUserNick + " " + base.GetLevelStr(msg.FromUserScore) + "同意加您为好友";
      this.showSmpMsg(text);
    }
  }

  cmd_DeleteFriend(friendid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1093,
      FromUserID: this.joygoengine.GetMyUserID(),
      FriendUserID: friendid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnDeleteFriend_Ret(msg) {
    if (msg.Result >= 0) {
      this.cmd_GetFriendList();
      this.showSmpMsg("删除好友成功");
    } else {
      this.showSmpMsg("删除好友失败");
    }
  }

  cmd_AddToBlackList(userid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1109,
      FromUserID: this.joygoengine.GetMyUserID(),
      BlackUserID: userid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnAddToBlackList_Ret(msg) {
    if (msg.Result >= 0) {
      this.cmd_GetBlackList();
      this.showSmpMsg("添加到黑名单成功");
    } else {
      this.showSmpMsg("添加到黑名单失败");
    }
  }

  cmd_DeleteBlackList(userid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1111,
      FromUserID: this.joygoengine.GetMyUserID(),
      BlackUserID: userid
    };
    this.joygoengine.sendCmd(msg);
  }

  OnDeleteBlackList_Ret(msg) {
    if (msg.Result >= 0) {
      this.cmd_GetBlackList();
      this.showSmpMsg("从黑名单取消玩家成功");
    } else {
      this.showSmpMsg("从黑名单取消玩家失败");
    }
  }

  cmd_GetBlackList() {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1113,
      FromUserID: this.joygoengine.GetMyUserID()
    };
    this.joygoengine.sendCmd(msg);
  }

  OnGetBlackList_Ret(msg) {
    this.myblacklist.length = 0;

    for (var i = 0; i < msg.PlayerList.length; i++) {
      this.myblacklist[i] = msg.PlayerList[i].ID;
    }

    if (this.blacklist != null) {
      this.blacklist.OnGetBlackList_Ret(msg);
    }
  }

  IsMyFriend(userid) {
    if (this.myfriendlist.contain(userid)) {
      return true;
    }

    return false;
  }

  IsMyBlack(userid) {
    if (this.myblacklist.contain(userid)) {
      return true;
    }

    return false;
  }

  showUserProfile(msg) {
    /*&if(this.user_profile_win!=null)
    {
    	this.user_profile_win.remove();
    	this.user_profile_win=null;
    }
    this.user_profile_win = new LWindow(300,430);
    this.user_profile_win.x = clientwidth*0.75;
    this.user_profile_win.y = titlebarheight+document.body.scrollTop;
    g_backLayer.addChild(this.user_profile_win);
    var lineheight=26;
    var lineY=40;
    var LX=25;
    var RX=130
    addWin_Text(this.user_profile_win,LX,lineY,"昵称:");
    addWin_Text(this.user_profile_win,RX,lineY,msg.NickName);
    addWin_Text(this.user_profile_win,LX,lineY+lineheight,"用户ID:");
    addWin_Text(this.user_profile_win,RX,lineY+lineheight,msg.UserID);
    addWin_Text(this.user_profile_win,LX,lineY+lineheight*2,"段位:");
    addWin_Text(this.user_profile_win,RX,lineY+lineheight*2,base.GetLevelStr(msg.UserScore));
    addWin_Text(this.user_profile_win,LX,lineY+lineheight*3,"经验值:");
    addWin_Text(this.user_profile_win,RX,lineY+lineheight*3,msg.User_Exp);
    addWin_Text(this.user_profile_win,LX,lineY+lineheight*4,"财富:");
    addWin_Text(this.user_profile_win,RX,lineY+lineheight*4,msg.User_Money);
    addWin_Text(this.user_profile_win,LX,lineY+lineheight*5,"积分:");
    addWin_Text(this.user_profile_win,RX,lineY+lineheight*5,msg.UserScore);
    addWin_Text(this.user_profile_win,LX,lineY+lineheight*6,"战斗次数:");
    addWin_Text(this.user_profile_win,RX,lineY+lineheight*6,msg.PlayCount);
    addWin_Text(this.user_profile_win,LX,lineY+lineheight*7,"胜局数:");
    addWin_Text(this.user_profile_win,RX,lineY+lineheight*7,msg.WinCount);
    addWin_Text(this.user_profile_win,LX,lineY+lineheight*8,"胜率:");
    addWin_Text(this.user_profile_win,RX,lineY+lineheight*8,GetWinRaio(msg.WinCount,msg.LoseCount)+"%");
    addWin_Text(this.user_profile_win,LX,lineY+lineheight*9,"负局数:");
    addWin_Text(this.user_profile_win,RX,lineY+lineheight*9,msg.LoseCount);
    addWin_Text(this.user_profile_win,LX,lineY+lineheight*10,"和局数:");
    addWin_Text(this.user_profile_win,RX,lineY+lineheight*10,msg.DrawCount);
    this.user_profile_win.addEventListener(LWindow.CLOSE, function(event)
    {
    	this.user_profile_win=null;
    });
    	
    var isMyFriend=IsMyFriend(msg.UserID);
    var btntitle="加好友";
    if(isMyFriend)
    {
    	btntitle="删除好友";
    }
    var f_button = new LButtonSample1(btntitle,commontextsize);
    f_button.x = LX;
    f_button.y = 370;
    f_button.width=titlebarheight*1.6;
    f_button.height=titlebarheight*0.7;
    this.user_profile_win.addChild(f_button);
    f_button.addEventListener(LMouseEvent.MOUSE_UP, function(event)
    {
    	if(isMyFriend)
    	{
    		var truthBeTold = window.confirm("确定要删除该好友吗？"); 
    		if (truthBeTold)
    		{ 
    			this.cmd_DeleteFriend(msg.UserID);
    		} 
    	}
    	else
    	{
    		this.cmd_AskAddFriend(msg.UserID);
    	}
    });
    
    var isMyBlack=IsMyBlack(msg.UserID);
    var btitle="黑名单";
    if(isMyBlack)
    {
    	btitle="白名单";
    }
    var b_button = new LButtonSample1(btitle,commontextsize);
    b_button.x = 115;
    b_button.y = 370;
    b_button.width=titlebarheight*1.6;
    b_button.height=titlebarheight*0.7;
    this.user_profile_win.addChild(b_button);
    b_button.addEventListener(LMouseEvent.MOUSE_UP, function(event)
    {
    	if(!isMyBlack)
    	{
    		var truthBeTold = window.confirm("确定要拉入黑名单吗？"); 
    		if (truthBeTold)
    		{ 
    			this.cmd_AddToBlackList(msg.UserID);
    		} 
    	}
    	else
    	{
    		var truthBeTold = window.confirm("确定要取消黑名单吗？"); 
    		if (truthBeTold)
    		{ 
    			this.cmd_DeleteBlackList(msg.UserID);
    		} 
    	}
    });
    		var O_button = new LButtonSample1("退出",commontextsize);
    O_button.x = 205;
    O_button.y = 370;
    O_button.width=titlebarheight*1.6;
    O_button.height=titlebarheight*0.7;
    this.user_profile_win.addChild(O_button);
    O_button.addEventListener(LMouseEvent.MOUSE_UP, function(event)
    {
    	this.user_profile_win.remove();
    	this.user_profile_win=null;
    });
    		var d_button = new LButtonSample1("详细信息->对局记录",commontextsize,commontextsize,"blue");
    d_button.x = LX;
    d_button.y = 330;
    d_button.width=titlebarheight*4;
    d_button.height=titlebarheight*0.7;
    this.user_profile_win.addChild(d_button);
    d_button.addEventListener(LMouseEvent.MOUSE_UP, function(event)
    {
    	var openurl="http://www.gog361.com/joygo/usercenter.html?userid=";
    	openurl+=this.joygoengine.GetMyUserID();
    	openurl+="&sessionkey=";
    	openurl+=this.joygoengine.GetSessionKey();
    	openurl+="&getuserid=";
    	openurl+=msg.UserID;
    	window.open(openurl,'_blank'); 
    	
    });
    */
  }

  cmd_AskStartIM(touserid) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1133,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: 0,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: touserid,
      Female: this.joygoengine.GetMyFemale(),
      InviteUserScore: this.joygoengine.GetMyUserScore(),
      InviteUserNick: this.joygoengine.GetMyNickName()
    };
    this.joygoengine.sendCmd(msg);
  }

  showAskStartIM(msg) {
    /*var invitewin = new LWindow(300,200);
    var thewidth=clientwidth*0.75;
    if(this.showBeInvitWinCount%3==0)
    {
    	invitewin.x = thewidth;
    }
    else if(this.showBeInvitWinCount%3==1)
    {
    	invitewin.x = thewidth;
    }
    else 
    {
    	invitewin.x = thewidth;
    }
    invitewin.y = screenwidth/4-invitewin.getHeight()/2;
    g_backLayer.addChild(invitewin);
    this.showBeInvitWinCount++;
    setTimeout(function(){
    	if(invitewin!=null)
    	{
    		invitewin.remove();
    		invitewin=null;
    	}
    },10000);
    var rependtxt="玩家"+msg.FromUserNick+" "+ base.GetLevelStr(msg.FromUserScore)+"请求和您进行对话";
    addWin_Text(invitewin,20,50,rependtxt);
    invitewin.addEventListener(LWindow.CLOSE, function(event)
    {
    	this.cmd_AcceptStartIM(false, msg.FromUserID);	
    	invitewin=null;		
    });
    
    
    
    var cancel_button = new LButtonSample1("拒绝",commontextsize);
    cancel_button.x = 75;
    cancel_button.y = 90;
    cancel_button.width=titlebarheight*1.6;
    cancel_button.height=titlebarheight*0.7;
    invitewin.addChild(cancel_button);
    cancel_button.addEventListener(LMouseEvent.MOUSE_UP, function(event)
    {
    	this.cmd_AcceptStartIM(false, msg.FromUserID);
    	invitewin.remove();
    	invitewin=null;
    });
    		var ok_button = new LButtonSample1("同意",commontextsize);
    ok_button.x = 170;
    ok_button.y = 90;
    ok_button.width=titlebarheight*1.6;
    ok_button.height=titlebarheight*0.7;
    invitewin.addChild(ok_button);
    ok_button.addEventListener(LMouseEvent.MOUSE_UP, function(event)
    {
    	this.cmd_AcceptStartIM(true, msg.FromUserID);
    	invitewin.remove();
    	invitewin=null;
    	toLaunchP2PIM(msg.FromUserID);
    });
    */
  }

  OnAskStartIM(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1134,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg); //showAskStartIM(msg);
  }

  OnAskStartIM_Ret(msg) {
    if (msg.Result == -5) {
      this.showSmpMsg("您已经被系统屏蔽，请联系管理员。");
    } else if (msg.Result == -4) {
      this.showSmpMsg("对方版本不支持。");
    } else if (msg.Result < 0) {
      this.showSmpMsg("请求对话失败。");
    }
  }

  cmd_AcceptStartIM(bAccept, nToUserID) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1135,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: 0,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: nToUserID,
      Accept: bAccept,
      Female: this.joygoengine.GetMyFemale(),
      InviteUserScore: this.joygoengine.GetMyUserScore(),
      InviteUserNick: this.joygoengine.GetMyNickName()
    };
    this.joygoengine.sendCmd(msg);
  }

  OnAcceptStartIM(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1036,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (msg.Accept != true) {
      var text = "玩家" + msg.FromUserNick + " " + base.GetLevelStr(msg.FromUserScore) + "拒绝和你对话";
      this.showSmpMsg(text);
    } else {
      toLaunchP2PIM(msg.FromUserID);
    }
  }

  toExitP2PIM() {
    /*this.showSmpMsg("对方退出了对话，对话结束");
    g_backLayer.removeChild(this.p2pim_win);
    this.p2pim_win=null;
    this.immessage_p2p=null;*/
  }

  toLaunchP2PIM(touserid) {
    /*(if(this.p2pim_win!=null)
    {
    	g_backLayer.removeChild(this.p2pim_win);
    	this.p2pim_win=null;
    }
    var winwidth=clientwidth/3;
    this.p2pim_win=new LWindow(winwidth,winwidth);
    this.p2pim_win.x=clientwidth*0.75;
    this.p2pim_win.y=titlebarheight*2;
    g_backLayer.addChild(this.p2pim_win);
    this.p2pim_win.addEventListener(LWindow.CLOSE, function(event)
    {
    	this.cmd_ExitIM(touserid);	
    	invitewin=null;	
    	this.immessage_p2p=null;	
    });
    var sessionid=(touserid+this.joygoengine.GetMyUserID())*64;;
    this.immessage_p2p=new IMMessage(0,30,winwidth-30,winwidth-30,sessionid,touserid);
    this.p2pim_win.addChild(this.immessage_p2p);*/
  }

  cmd_ExitIM(nToUserID) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1137,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: 0,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: nToUserID
    };
    this.joygoengine.sendCmd(msg);
  }

  OnExitIM(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1138,
      Result: 0,
      RoomID: msg.RoomID,
      GameDeskID: msg.GameDeskID,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: msg.FromUserID
    };
    this.joygoengine.sendRetCmd(retmsg);
    this.toExitP2PIM();
  }

  cmd_ExitMatch(deskid, enemyuserid, reason, wincolor, gamestarttime) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1073,
      RoomID: this.joygoengine.GetCurRoomID(),
      GameDeskID: deskid,
      FromUserID: this.joygoengine.GetMyUserID(),
      ToUserID: enemyuserid,
      WinColor: wincolor,
      Reason: reason,
      GameStartTime: gamestarttime
    };
    this.joygoengine.sendCmd(msg);
    this.my_game_info = null;
  }

  cmd_JudgeTerminalGame(roomid, deskid, wincolor, gamestarttime) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1103,
      RoomID: roomid,
      GameDeskID: deskid,
      FromUserID: this.joygoengine.GetMyUserID(),
      WinColor: wincolor,
      GameStartTime: gamestarttime
    };
    this.joygoengine.sendCmd(msg);
  }

  OnJudgeTerminalGame_Ret(msg) {
    if (msg.Result >= 0) {
      this.showSmpMsg("棋局裁决成功");
    } else {
      this.showSmpMsg("棋局裁决失败");
    }
  }

  SvrPushMsgOpenURL(type, seconds, msg, url) {
    /*var thewidth=clientwidth*0.75;
    var win=new MsgOpenUrl(thewidth,thewidth/4,type,seconds,msg,url);
    g_backLayer.addChild(win);*/
  }

  OnSvrPushAlert(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1140,
      Result: 0
    };
    this.joygoengine.sendRetCmd(retmsg);

    if (msg.Type == 0) {
      this.showSmpMsg(msg.Alert);
    } else if (msg.Type == 1) {
      this.joygoengine.Logout();
      this.showSmpMsg(msg.Alert);
    } else if (msg.Type == 2) {}
  }

  OnSvrPushMsgOpenURL(msg) {
    var retmsg = {
      T: base.getTime(),
      Ts: 0,
      Seq: msg.Seq,
      Cmd: 1146,
      Result: 0
    };
    this.joygoengine.sendRetCmd(retmsg);
    var themsg = msg.MsgChn;

    if (this.mylanguage != 0) {
      themsg = msg.MsgEng;
    }

    this.SvrPushMsgOpenURL(msg.Type, msg.RemainSecond, themsg, msg.URL);
  }

  cmd_UpdateUserNick(newNick) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1087,
      UserID: this.joygoengine.GetMyUserID(),
      NewNickName: newNick
    };
    this.joygoengine.sendCmd(msg);
  }

  OnUpdateUserNickName_Ret(msg) {
    if (msg.Result >= 0) {
      this.showSmpMsg("修改昵称成功");
      this.joygoengine.ReLogin();
    } else {
      this.showSmpMsg("修改昵称失败,昵称已经存在");
    }
  }

  cmd_GetCurrentGame() {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1163,
      UserID: this.joygoengine.GetMyUserID()
    };
    this.joygoengine.sendCmd(msg);
  }

  OnGetCurrentGame_Ret(msg) {
    if (this.wygame != null) {
      this.wygame.OnGetCurrentGame_Ret(msg);
    }
  }

  cmd_GetOnlineUsers() {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.joygoengine.GetSeq(),
      Cmd: 1153,
      UserID: this.joygoengine.GetMyUserID()
    };
    this.joygoengine.sendCmd(msg);
  }

  OnGetOnlineUsers_Ret(msg) {
    if (this.wygame != null) {
      this.wygame.OnGetOnlineUsers_Ret(msg);
    }
  }

}