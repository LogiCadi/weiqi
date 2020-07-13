import processcmd from './processcmd';

const base = require("../../utils/Base.js");

var app = getApp().globalData;
export default class joygoengine {
  constructor(page) {
    this.nInviteUserID = 0;
    this.nInviteRoomID = -1;
    this.page = page;
    this.wygame = null;
    this.websocketsvrip = "wss://www.gog361.com:8443";
    this.processcmd = new processcmd(this);
    this.seq = 0;
    this.timer_count = 0;
    this.userOrginal = 102;
    this.cmd_sendBuf = new Array();
    this.nCurEnterRoomID = -1;
    this.nLoginUserID = 0;
    this.strUserEmail = "";
    this.strHashPassword = "";
    this.strSessionKey = "";
    this.strNickName = "";
    this.nUserFemale;
    this.nUserVIPFlag;
    this.nUserFlag;
    this.nUserScore;
    this.nUserPlayCount;
    this.nUserWinCount;
    this.nUserLoseCount;
    this.nUserDrawCount;
    this.nUserIsJudge;
    this.nUser_Exp;
    this.nUser_Money;
    this.nUser_Level;
    this.nUser_Star;
    this.bLogined = false;
    this.bConnectToSvr = false;
    this.bInConnectProcess = false;
    this.bInLoginProcess = false;
    this.bNeedReconnect = true;
    this.bNeedRelogin = true;
    this.nSecondTimes = 0;
    this.nLastHelloTime = 0;
    this.nTimeDiffSvrToLocal = 0;
    this.loginWindow = null;
    this.array_RoomTitle = new Array();
    this.array_RoomList = new Array();
    this.inClickToLoginProcess = false;
    this.clientguid = "";
    this.clientguid = this.createguid();
    this.mylanguage = 0;
    this.nExistGameRoomID = -1;
    this.haveCurrGame = false;
    this.needToCheckCurrGame = false;
  }

  init() {
    this.startInterval();
    this.connectServer();
  }

  setRoomDeskList(roomdesklist) {
    this.processcmd.setRoomDeskList(roomdesklist);
  }

  setInviteInfo(nInviteUserID, nInviteRoomID) {
    this.nInviteUserID = nInviteUserID;
    this.nInviteRoomID = nInviteRoomID;
  }

  getProcessCmd() {
    return this.processcmd;
  }

  getExistGameRoomID() {
    return this.nExistGameRoomID;
  }

  clearInterval() {
    var that = this; //清除计时器  即清除setInter

    clearInterval(that.setInterval);
  }

  startInterval() {
    var that = this; //将计时器赋值给setInter

    that.setInterval = setInterval(function () {
      that.OnTimer();
    }, 100);
  }

  setWyGame(wygame) {
    this.wygame = wygame;
    this.processcmd.setWyGame(wygame);
  }

  GetSeq() {
    this.seq++;
    return this.seq % 65535;
  }

  createguid() {
    let guid = uni.getStorageSync("mysavedguid");

    if (guid != null && guid != "") {
      return guid;
    } else {
      guid = base.NewGuid();
      uni.setStorage({
        key: 'mysavedguid',
        data: guid
      });
      return guid;
    }
  }

  GetLanguage() {
    return this.mylanguage;
  }

  SetLanguage(language) {
    this.mylanguage = language;
  }

  IsConnected() {
    return this.bConnectToSvr;
  }

  IsLogined() {
    return this.bLogined;
  }

  GetMyNickName() {
    return this.strNickName;
  }

  GetMyUserScore() {
    return this.nUserScore;
  }

  GetMyFemale() {
    return this.nUserFemale;
  }

  GetMyUserID() {
    return this.nLoginUserID;
  }

  GetCurRoomID() {
    return this.nCurEnterRoomID;
  }

  SetCurRoomID(roomid) {
    this.nCurEnterRoomID = roomid;
  }

  SetRoomList(roomlist) {
    this.array_RoomList = roomlist;
  }

  GetRoomList() {
    return this.array_RoomList;
  }

  GetCurRoomMaxGameCostTime() {
    var maxcosttime = 0;

    for (var i = 0; i < this.array_RoomList.length; i++) {
      if (this.array_RoomList[i].RoomID == this.nCurEnterRoomID) {
        maxcosttime = this.array_RoomList[i].RoomMaxGameCostTime;
        break;
      }
    }

    return maxcosttime;
  }

  GetCurRoomType() {
    var roomtype = 0;

    for (var i = 0; i < this.array_RoomList.length; i++) {
      if (this.array_RoomList[i].RoomID == this.nCurEnterRoomID) {
        roomtype = this.array_RoomList[i].RoomType;
        break;
      }
    }

    return roomtype;
  }

  SetRoomTitle(roomid, roomtitle) {
    this.array_RoomTitle[roomid] = roomtitle;
  }

  GetRoomTitle(roomid) {
    return this.array_RoomTitle[roomid];
  }

  DeleteSendCache(Seq) {
    //console.log("DeleteSendCache:"+Seq+"this.cmd_sendBuf.length=",this.cmd_sendBuf.length);
    var deleteSendMsg = new Array();

    for (var i = 0; i < this.cmd_sendBuf.length; i++) {
      if (this.cmd_sendBuf[i].Seq == Seq) {
        deleteSendMsg.push(this.cmd_sendBuf[i]);
      }
    }

    for (i = 0; i < deleteSendMsg.length; i++) {
      this.cmd_sendBuf.remove(deleteSendMsg[i]);
    } //console.log("DeleteSendCache:"+Seq+"this.cmd_sendBuf.length=",this.cmd_sendBuf.length);


    deleteSendMsg.splice(0, deleteSendMsg.length);
  }

  checkResendCmd() {
    var now = base.getTime();
    var failed_sendMsg = new Array();

    for (var i = 0; i < this.cmd_sendBuf.length; i++) {
      if (now - this.cmd_sendBuf[i].T > 20) //.T send time
        {
          if (this.cmd_sendBuf[i].Ts >= 2) //.Ts send times
            {
              //	console.log("Cmd send failed,cmd="+this.cmd_sendBuf[i].Cmd+"seq="+this.cmd_sendBuf[i].Seq);
              failed_sendMsg.push(this.cmd_sendBuf[i]);
              OnCmdSendFailed(this.cmd_sendBuf[i]);
            } else {
            //	console.log("reSendCmd now="+now+"T="+this.cmd_sendBuf[i].T);
            this.cmd_sendBuf[i].T = now;
            this.cmd_sendBuf[i].Ts++;
            reSendCmd(this.cmd_sendBuf[i]);
          }
        } else if (now - this.cmd_sendBuf[i].Time > 120) {
        failed_sendMsg.push(this.cmd_sendBuf[i]);
      }
    }

    if (failed_sendMsg.length > 0) {
      for (var i = 0; i < failed_sendMsg.length; i++) {
        this.cmd_sendBuf.remove(failed_sendMsg[i]);
      }

      failed_sendMsg.splice(0, failed_sendMsg.length);
    }
  }

  OnCmdSendFailed(msg) {
    if (msg.Cmd == 1047) //go move send failed;
      {
        this.CloseConn(false);
      }
  }

  checkConnect() {
    if (this.bNeedReconnect) {
      if (!this.bConnectToSvr && !this.bInConnectProcess) {
        this.connectServer();
      }
    }
  }

  checkLogin() {
    if (this.bNeedReconnect && this.bNeedRelogin && this.bConnectToSvr && !this.bLogined && !this.bInLoginProcess && this.strUserEmail.length > 0 && this.strHashPassword.length > 0 && this.IsValidUserID(this.nLoginUserID)) {
      this.cmd_Login(this.nLoginUserID, this.strHashPassword, this.mylanguage);
    }
  }

  OnTimer() //200ms
  {
    this.timer_count++;

    if (this.timer_count % 10 == 0) {
      this.OnSecond();
    }

    if (this.wygame != null) {
      this.wygame.OnTimer();
    }
  }

  OnSecond() {
    this.nSecondTimes++; //5秒执行一次

    if (this.nSecondTimes % 5 == 0) {
      this.checkConnect();
      this.checkLogin();
    }

    if (this.nSecondTimes % 10 == 0) {
      this.checkResendCmd();
    }

    if (this.nSecondTimes % 30 == 0) {
      if (base.getTime() - this.nLastHelloTime > 180) {
        this.CloseConn(false);
      }
    }

    if (this.nSecondTimes % 60 == 0) {
      this.cmd_Hello();
    }

    if (this.needToCheckCurrGame && this.nSecondTimes % 5 == 0) {
      this.checkCurrentGame();
    }
  }

  connectServer() {
    uni.setNavigationBarTitle({
      title: '正在连接...'
    });
    this.bInConnectProcess = true;
    var that = this;
    let theurl = this.websocketsvrip;
    uni.connectSocket({
      url: theurl
    });
    uni.onSocketOpen(function () {
      console.log('连接成功');
      uni.setNavigationBarTitle({
        title: '已连接...'
      });
      that.OnConnected();
    });
    uni.onSocketMessage(function (res) {
      //console.log(res);
      that.OnMessage(JSON.parse(res.data));
    });
    uni.onSocketError(function (res) {
      uni.setNavigationBarTitle({
        title: '连接失败'
      });
      that.OnError(res);
    });
    uni.onSocketClose(function (res) {
      uni.setNavigationBarTitle({
        title: '连接失败'
      });
      that.OnClose(res);
    });
  }

  Login(userid, sessionkey) {
    this.cmd_Login(userid, sessionkey, 0);
  }

  Logout() {
    this.bNeedReconnect = false;
    this.CloseConn(true);
    this.bNeedReconnect = false;
  }

  Disconnect() {
    this.CloseConn(true);
  }

  CloseConn(bOutCall) {
    this.nCurEnterRoomID = -1;
    this.bLogined = false;
    this.bConnectToSvr = false;
    this.bInConnectProcess = false;
    this.bInLoginProcess = false;
    this.bNeedReconnect = true;
    this.bNeedRelogin = true;
    this.cmd_sendBuf.splice(0, this.cmd_sendBuf.length);
    uni.closeSocket({
      success: function () {
        console.log("关闭成功...");
      },
      fail: function () {
        console.log("关闭失败...");
      }
    });
    uni.onSocketClose(function (res) {
      console.log("WebSocket连接已关闭");
    });

    if (this.inClickToLoginProcess) {
      alert("连接服务器失败");
    }
  }

  wxSendMsg(msg) {
    uni.sendSocketMessage({
      data: msg,
      success: function (e) {//console.log(e)
      },
      fail: function (e) {
        console.log(e);
      },
      complete: function (e) {
        console.log(e);
      }
    });
  }

  OnClose(e) {
    //console.log("onclose"+e.data);
    this.CloseConn(false);
  }

  OnError(e) {
    //console.log("OnError"+e.data);
    this.CloseConn(false);
  }

  OnConnected() {
    this.cmd_sendBuf.splice(0, this.cmd_sendBuf.length);
    this.bInConnectProcess = false;
    this.bNeedReconnect = true;
    this.bConnectToSvr = true;
    this.processcmd.cmd_ListGameRoom();
    this.toLogin(); //this.cmd_Hello();

    /*	this.processcmd.this.cmd_getnews(0);
    	if(this.g_roomlist)
    	{
    		this.ShowInProgress();
    		this.processcmd.cmd_ListGameRoom();
    	}*/
  }

  toLogin() {
    this.cmd_Login(app.globalData.userid, app.globalData.sessionkey, 0);
  }

  CmdIsReturn(cmd) {
    if (cmd % 2 == 0) return true;else return false;
  }

  OnMessage(msg) {
    this.nLastHelloTime = base.getTime();
    let cmd = msg.Cmd;
    console.log("OnMessage cmd=", cmd);

    if (this.CmdIsReturn(cmd)) {
      this.DeleteSendCache(msg.Seq);
    }

    if (cmd == 1002) {
      this.OnHello_Ret(msg);
    } else if (cmd == 1010) {
      this.OnCheckUser_Ret(msg);
    } else if (cmd == 1190) {
      this.OnLogin_Ret(msg);
    } else if (cmd == 1154) {
      this.OnGetOnlineUsers_Ret(msg);
    } else if (cmd == 1164) {
      this.OnGetCurrentGame_Ret(msg);
    } else if (cmd == 1030) {
      this.OnUserEnterRoom_Ret(msg);
    }

    this.processcmd.OnMessage(msg);
  }

  IsNeedLoginMsg(nCmd) {
    this.cmd_LOGIN_RET = 1024;
    this.cmd_LOGIN_WEB_SESSION = 1189;

    if (nCmd <= this.cmd_LOGIN_RET || nCmd == this.cmd_LOGIN_WEB_SESSION) {
      return false;
    } else {
      return true;
    }
  }

  sendCmd(msg) {
    if (this.bConnectToSvr) {
      var cmd = msg.Cmd;

      if (this.IsNeedLoginMsg(cmd) && !this.bLogined) {
        //console.log("Send need login cmd:"+cmd);
        return;
      }

      this.wxSendMsg(JSON.stringify(msg));
    }
  }

  sendRetCmd(msg) {
    if (this.bConnectToSvr) {
      this.wxSendMsg(JSON.stringify(msg));
    }
  }

  reSendCmd(msg) {
    //console.log("reSendCmd"+msg.Cmd+","+msg.Seq);
    if (this.bConnectToSvr) {
      this.wxSendMsg(JSON.stringify(msg));
    }
  }

  cmd_Hello() {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.GetSeq(),
      Cmd: 1001,
      RoomID: this.nCurEnterRoomID,
      UserID: this.nLoginUserID
    };
    this.sendCmd(msg);
  }

  SvrTimeToLocalTime(nSvrTime) {
    return nSvrTime - this.nTimeDiffSvrToLocal;
  }

  LocalTimeToSvrTime(nLocalTime) {
    return nLocalTime + this.nTimeDiffSvrToLocal;
  }

  OnHello_Ret = function (msg) {
    this.nTimeDiffSvrToLocal = msg.SvrTime - base.getTime();
  };

  cmd_CheckUser(email) {
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.GetSeq(),
      Cmd: 1009,
      UserOrginal: this.userOrginal,
      Email: email
    };
    this.sendCmd(msg);
  }

  ReLogin() {
    this.toLogin();
  }

  cmd_Login(userid, sessionkey, language) {
    uni.setNavigationBarTitle({
      title: '正登录...'
    });
    this.bInLoginProcess = true;
    var AuthStr = sessionkey;
    var msg = {
      T: base.getTime(),
      Ts: 0,
      Seq: this.GetSeq(),
      Cmd: 1189,
      UserOrginal: this.userOrginal,
      UserID: userid,
      Language: language,
      AuthData: AuthStr,
      Token: this.clientguid
    };
    this.sendCmd(msg);
  }

  checkCurrentGame() {
    this.processcmd.cmd_GetCurrentGame();
  }

  OnLogin_Ret(msg) {
    this.inClickToLoginProcess = false;
    this.bInLoginProcess = false;

    if (msg.Result == 0) {
      uni.setNavigationBarTitle({
        title: msg.NickName
      });
      this.bLogined = true;
      this.nLoginUserID = msg.UserID;
      this.strUserEmail = msg.UserEmail;
      this.strSessionKey = msg.SessionKey;
      this.strNickName = msg.NickName;
      this.nUserFemale = msg.Female;
      this.nUserVIPFlag = msg.UserVIPFlag;
      this.nUserFlag = msg.UserFlag;
      this.nUserScore = msg.UserScore;
      this.nUserPlayCount = msg.PlayCount;
      this.nUserWinCount = msg.WinCount;
      this.nUserLoseCount = msg.LoseCount;
      this.nUserDrawCount = msg.DrawCount;
      this.nUserIsJudge = msg.IAmJudge;
      this.nUser_Exp = msg.Exp;
      this.nUser_Money = msg.Money;
      this.nUser_Level = msg.Level;
      this.nUser_Star = msg.Star;
      this.processcmd.cmd_GetOnlineUsers();
      this.processcmd.cmd_GetCurrentGame();
    } else {
      if (msg.Result < 0) {
        let temp = "登录失败，错误码:" + msg.Result;
        uni.showModal({
          title: '失败',
          content: temp
        });
        uni.setNavigationBarTitle({
          title: '登录失败'
        });
      }
    }
  }

  OnUserEnterRoom_Ret(msg) {
    if (msg.Result >= 0) {
      this.SetCurRoomID(msg.RoomID);

      if (this.nInviteUserID > 0) {
        this.processcmd.cmd_PlayerAcceptInvite(true, this.nInviteUserID);
        this.nInviteUserID = 0;
        this.nInviteRoomID = -1;

        if (this.wygame == null) {
          this.needToCheckCurrGame = true;
          this.checkCurrentGame();
        }
      }

      this.processcmd.cmd_ListRoomGameDesk(msg.RoomID);
    }
  }

  listroom0() {
    this.processcmd.cmd_ListRoomGameDesk(0);
  }

  IAmJudge() {
    return this.nUserIsJudge;
  }

  GetSessionKey() {
    return this.strSessionKey;
  }

  removeRoomList() {
    if (this.g_roomlist != null) {
      this.g_backLayer.removeChild(this.g_roomlist);
      this.g_roomlist = null;
    }
  }

  showRoomList() {
    if (this.g_roomlist != null) {
      this.g_backLayer.removeChild(this.g_roomlist);
      this.g_roomlist = null;
    }

    this.g_roomlist = new RoomList();
    this.g_backLayer.addChild(this.g_roomlist);
  }

  OnGetOnlineUsers_Ret(msg) {
    if (msg.Result >= 0) {
      let onlines = msg.PlayerCount;
      let info = "(" + onlines + ")";
      this.page.setData({
        onlineusersinfo: info
      });
    }
  }

  hasCurrGame() {
    return this.haveCurrGame;
  }

  setHasCurrGame() {
    this.haveCurrGame = true;
  }

  setNoCurrGame() {
    this.haveCurrGame = false;
  }

  OnGetCurrentGame_Ret(msg) {
    this.haveCurrGame = false;

    if (msg.Result >= 0 && msg.HaveGame == 1) {
      this.needToCheckCurrGame = false;
      this.haveCurrGame = true;
      this.nExistGameRoomID = msg.ExistGameRoomID;

      if (this.wygame == null) {
        let theurl = "./netgame?gamemode=0&fromtype=2";
        uni.navigateTo({
          url: theurl
        });
      } else {}
    } else if (msg.Result >= 0) {
      this.haveCurrGame = false;

      if (this.nInviteUserID > 0) {
        this.processcmd.cmd_UserEnterRoom(this.nInviteRoomID, 0, 0);
      } else {
        this.processcmd.cmd_UserEnterRoom(0, 0, 0);
      }
    }
  }

}