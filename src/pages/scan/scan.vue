<template>
<view>
<camera class="camera" :style="'top: ' + camera_top + 'px;width:' + camera_width + 'px;height:' + camera_height + 'px;'" :device-position="device?'back':'front'" v-if="showcamera" flash="off">
    <cover-view class="cover-0">
     识别完整棋盘，请把棋盘四角放入方框内，
    </cover-view>
    <cover-view class="cover-0">
     识别死活题请确保把角放入方框内，
    </cover-view>
    <cover-view class="cover-0">
    识别失败请换个角度试一试
     </cover-view>
    <cover-image class="cover-1" :style="'top:' + square_select_top + 'px;left:' + square_select_left + 'px;width:' + square_select_width + 'px;height:' + square_select_height + 'px;'" src="../../images/square_select.png"></cover-image>

    <canvas class="cover-1" v-if="isShowCanvas" canvas-id="image-canvas" :style="'top:' + canvas_select_top + 'px;left:' + canvas_select_left + 'px;width:' + canvas_select_width + 'px;height:' + canvas_select_height + 'px;'"></canvas>

    <cover-view class="cover-1" :style="'top:' + album_btn_top + 'px;left:' + album_btn_left + 'px;width:' + album_btn_width + 'px;height:' + album_btn_height + 'px;color:white;'" @tap="open_album"> 
     相册 
    </cover-view>

    <cover-image class="cover-4" src="../../images/photograph@3x.png" :style="'top:' + button_photo_top + 'px;left:' + button_photo_left + 'px;width:' + button_photo_width + 'px ;height:' + button_photo_height + 'px;'" @tap="takephoto"></cover-image>    
  </camera>
  <view class="previewimage" v-if="showimage">
    <image class="cover-1" :src="imagepath" mode="widthFix" :style="'top: ' + imageview_top + 'px;width:' + imageview_width + 'px;height:' + imageview_height + 'px;'"></image>
    <cover-view class="cover-1" :style="'top:' + chongpai_btn_top + 'px;left:' + chongpai_btn_left + 'px;width:' + chongpai_btn_width + 'px;height:' + chongpai_btn_height + 'px;color:red;'" @tap="start_rescan"> 
     重拍 
    </cover-view>
    <cover-view class="cover-1" :style="'top:' + shibie_btn_top + 'px;left:' + shibie_btn_left + 'px;width:' + shibie_btn_width + 'px;height:' + shibie_btn_height + 'px;color:red;'" @tap="start_detect"> 
     开始识别 
    </cover-view>
  </view>
</view>
</template>

<script>
//index.js
//获取应用实例
let app = getApp();

export default {
  data() {
    return {
      device: true,
      tempImagePath: "",
      // 拍照的临时图片地址
      tempThumbPath: "",
      // 录制视频的临时缩略图地址
      tempVideoPath: "",
      // 录制视频的临时视频地址
      showcamera: true,
      showimage: false,
      imagepath: "",
      ctx: {},
      camera_top: 0,
      camera_width: 320,
      camera_height: 320,
      imageview_top: 0,
      imageview_width: 320,
      imageview_height: 320,
      square_select_left: 10,
      square_select_top: 100,
      square_select_width: 320,
      square_select_height: 320,
      album_btn_left: 10,
      album_btn_top: 100,
      album_btn_width: 320,
      album_btn_height: 40,
      button_photo_left: 100,
      button_photo_top: 100,
      button_photo_width: 100,
      button_photo_height: 100,
      chongpai_btn_left: 10,
      chongpai_btn_top: 100,
      chongpai_btn_width: 320,
      chongpai_btn_height: 320,
      shibie_btn_left: 10,
      shibie_btn_top: 100,
      shibie_btn_width: 320,
      shibie_btn_height: 320,
      isShowCanvas: false,
      canvas_select_left: 0,
      canvas_select_top: 100,
      canvas_select_width: 320,
      canvas_select_height: 320,
      width: 320,
      height: 320,
      camera: false,
      type: ""
    };
  },

  components: {},
  props: {},
  onShareAppMessage: function () {
    let thepath = "/pages/scan/scan?type=0&fromuserid=" + app.globalData.userid;
    return {
      title: '拍照识棋,识别棋局和死活题',
      imageUrl: '/',
      path: thepath
    };
  },

  onLoad() {
    let c = uni.createCameraContext();
    this.setData({
      ctx: c
    });
    this.initPage();
  },

  methods: {
    // 切换相机前后置摄像头
    devicePosition() {
      this.setData({
        device: !this.device
      });
      console.log("当前相机摄像头为:", this.device ? "后置" : "前置");
    },

    initPage() {
      uni.setNavigationBarTitle({
        title: '拍照识棋'
      });
      let winwidth = uni.getSystemInfoSync().windowWidth;
      let winheight = uni.getSystemInfoSync().windowHeight;
      let ispad = false;

      if (winheight / winwidth < 1.5) {
        ispad = true;
      }

      let buttonphotowidth = winwidth * 0.28;

      if (ispad) {
        buttonphotowidth = winwidth * 0.14;
      }

      this.setData({
        imageview_top: 0,
        imageview_width: winwidth,
        imageview_height: winheight,
        camera_top: 0,
        camera_width: winwidth,
        camera_height: winheight,
        square_select_left: winwidth * 0.01,
        square_select_top: winheight * 0.15,
        square_select_width: winwidth * 0.98,
        square_select_height: winwidth * 0.98,
        canvas_select_left: 0,
        canvas_select_top: 0,
        canvas_select_width: winwidth,
        canvas_select_height: winheight,
        album_btn_left: winwidth * 0.15,
        album_btn_top: winheight * 0.86,
        album_btn_width: winheight * 0.2,
        album_btn_height: winheight * 0.2,
        button_photo_left: winwidth * 0.38,
        button_photo_top: winheight * 0.8,
        button_photo_width: buttonphotowidth,
        button_photo_height: buttonphotowidth,
        chongpai_btn_left: winwidth * 0.15,
        chongpai_btn_top: winheight * 0.88,
        chongpai_btn_width: winheight * 0.2,
        chongpai_btn_height: winheight * 0.2,
        shibie_btn_left: winwidth * 0.69,
        shibie_btn_top: winheight * 0.88,
        shibie_btn_width: winheight * 0.2,
        shibie_btn_height: winheight * 0.2
      });
    },

    cameraFun() {
      this.setData({
        imageview_top: this.square_select_top,
        imageview_width: this.camera_width,
        imageview_height: this.camera_width
      });
      var that = this;
      let ctx = this.ctx; // 拍照

      console.log("拍照");
      ctx.takePhoto({
        quality: "normal",
        success: res => {
          console.log(res.tempImagePath);
          /* that.setData({
             imagepath: res.tempImagePath,
             showcamera: false,
             showimage: true,
           });*/

          that.loadTempImagePath(res.tempImagePath);
        },
        fail: e => {
          console.log(e);
        }
      });
    },

    loadTempImagePath: function (options) {
      var that = this;
      that.path = options;
      uni.getSystemInfo({
        success: function (res) {
          // 矩形的位置
          var image_x = that.canvas_select_top;
          var image_y = that.canvas_select_left;
          var image_width = that.canvas_select_width;
          var image_height = that.canvas_select_height;
          uni.getImageInfo({
            src: that.path,
            success: function (res) {
              that.setData({
                isShowCanvas: true
              });
              let theimgwidth = res.width;
              let theimgheight = res.height;
              let theoutputheight = theimgheight * image_width / theimgwidth;
              that.canvas = uni.createCanvasContext("image-canvas", that); //过渡页面中，图片的路径坐标和大小

              that.canvas.drawImage(that.path, 0, 0, image_width, theoutputheight);
              uni.showLoading({
                title: '数据处理中...',
                icon: 'loading',
                duration: 10000
              }); // 这里有一些很神奇的操作,总结就是MD拍出来的照片规格居然不是统一的过渡页面中，对裁剪框的设定
              //that.canvas.setStrokeStyle('black')
              //that.canvas.strokeRect(image_x, image_y, image_width, image_height)

              let cutx = 0;
              let cuty = that.square_select_top;
              let cutwidth = image_width;
              let cutheight = cutwidth;
              that.canvas.draw();
              setTimeout(function () {
                uni.canvasToTempFilePath({
                  //裁剪对参数
                  canvasId: "image-canvas",
                  x: cutx,
                  //画布x轴起点
                  y: cuty,
                  //画布y轴起点
                  width: cutwidth,
                  //画布宽度
                  height: cutheight,
                  //画布高度
                  destWidth: cutwidth,
                  //输出图片宽度
                  destHeight: cutheight,
                  //输出图片高度
                  success: function (res) {
                    that.setData({
                      showimage: true,
                      imagepath: res.tempFilePath,
                      showcamera: false,
                      isShowCanvas: false
                    }); //清除画布上在该矩形区域内的内容。
                    // that.canvas.clearRect(0, 0, that.data.width, that.data.height)
                    // that.canvas.drawImage(res.tempFilePath, image_x, image_y, image_width, image_height)
                    // that.canvas.draw()

                    uni.hideLoading();
                    console.log(res.tempFilePath); //在此可进行网络请求
                  },
                  fail: function (e) {
                    uni.hideLoading();
                    uni.showToast({
                      title: '出错啦...',
                      icon: 'loading'
                    });
                  }
                });
              }, 1000);
            }
          });
        }
      });
    },

    scanProcess(imgpath) {
      console.log("imgpath=", imgpath);
      uni.showLoading({
        title: '识别中...'
      });
      var that = this;
      let posturl = "https://app.gog361.com/flask/v1/app/ai/scanimage/" + app.globalData.userid;
      uni.uploadFile({
        url: posturl,
        filePath: imgpath,
        name: 'file',
        header: {
          "Content-Type": "multipart/form-data"
        },
        formData: {
          //和服务器约定的token, 一般也可以放在header中
          'userid': app.globalData.userid,
          'sessionkey': app.globalData.sessionkey,
          'session_token': uni.getStorageSync('session_token')
        },
        success: function (res) {
          console.log(res);

          if (res.statusCode != 200) {
            uni.showModal({
              title: '提示',
              content: '上传失败',
              showCancel: false
            });
            return;
          }

          var data = JSON.parse(res.data); //let sgf="(;GM[1]AP[WangYouWeiQi]SZ[19]AB[cf][ck][cn][co][fc][fp][fq][go][nq][oc][oe][pe][pq][qd][qo][qp][rd]AW[ci][dd][dn][do][dp][fd][fo][gp][hc][pf][pj][pn][po][qe][qf][qn])";
          //this.startwithsgf(sgf,false);
          //let sgftopic="(;AB[rp][qp][pp][op][np][mo][mn][nm][on][pn][qn][rn]AW[rq][qq][pq][oq][nq][mp][lp][lo][ln][lm][ml][nl][om][pm][qm][rm]AP[MultiGo:4.2.4]SZ[19]GN[项羽举鼎]RE[白先黑死]US[桥本宇太郎解说]SO[《玄玄棋经》]MULTIGOGM[1](;W[so];B[ro];W[po];B[oo];W[nn]C[此为正解]))";
          //let sgf=data.sgf;
          //let istopic=data.istopic

          if (data.code >= 0) {
            that.startresult(data);
          } else {
            uni.showModal({
              title: '提示',
              content: '可能因为光线原因识别失败,请稍微换个角度重拍',
              showCancel: false,
              success: function (res) {
                that.start_rescan();
              }
            });
          }

          return;
        },
        fail: function (e) {
          console.log(e);
          uni.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          });
        },
        complete: function () {
          uni.hideLoading();
        }
      });
    },

    open_album: function () {
      var that = this;
      uni.chooseImage({
        count: 1,
        // 默认9
        sizeType: ['compressed'],
        // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'],
        // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          console.log(res.tempFilePaths);
          that.setData({
            imageview_top: 0,
            imageview_width: that.camera_width,
            imageview_height: that.camera_height,
            imagepath: res.tempFilePaths[0],
            showcamera: false,
            showimage: true
          });
        },
        fail: function (res) {
          console.log(res.errMsg);
        }
      });
    },
    takephoto: function () {
      //let sgf="(;GM[1]AP[WangYouWeiQi]SZ[19]AB[cf][ck][cn][co][fc][fp][fq][go][nq][oc][oe][pe][pq][qd][qo][qp][rd]AW[ci][dd][dn][do][dp][fd][fo][gp][hc][pf][pj][pn][po][qe][qf][qn])";
      //this.startwithsgf(sgf,false);
      //let sgf="(;AB[rp][qp][pp][op][np][mo][mn][nm][on][pn][qn][rn]AW[rq][qq][pq][oq][nq][mp][lp][lo][ln][lm][ml][nl][om][pm][qm][rm]AP[MultiGo:4.2.4]SZ[19]GN[项羽举鼎]RE[白先黑死]US[桥本宇太郎解说]SO[《玄玄棋经》]MULTIGOGM[1](;W[so];B[ro];W[po];B[oo];W[nn]C[此为正解]))";
      //let sgf="(;AB[ab][ad][dd][cd][ef]AW[ba][da][dc][fe][bb][jf]SZ[9])";
      //let scaninfo={sgf:sgf,boardsize:19,firstmovecolor:1,istopic:false,sgfpath:"https://app.gog361.com/tmpsgf/abcd.sgf"};
      //this.startresult(scaninfo);
      //return 
      this.cameraFun();
    },
    start_rescan: function () {
      this.setData({
        showcamera: true,
        showimage: false
      });
    },
    startresult: function (data) {
      if (data.istopic) {
        let theurl = "./scantopic?scanresult=" + JSON.stringify(data);
        uni.navigateTo({
          url: theurl
        });
      } else {
        let theurl = "./scanviewgame?scanresult=" + JSON.stringify(data);
        uni.navigateTo({
          url: theurl
        });
      }
    },
    start_detect: function () {
      this.scanProcess(this.imagepath);
    },

    // 打开模拟的相机界面
    open(e) {
      let {
        type
      } = e.target.dataset;
      console.log("开启相机准备", type == "takePhoto" ? "拍照" : "录视频");
      this.setData({
        camera: true,
        type
      });
    },

    // 关闭模拟的相机界面
    close() {
      console.log("关闭相机");
      this.setData({
        camera: false
      });
    }

  }
};
</script>
<style>
@import "./scan.css";
</style>