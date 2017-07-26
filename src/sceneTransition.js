export class sceneTransition {
  constructor() {
    this.scenes = {};
  }
  /*
    config:
      name: 场景名称
      parent: 父场景名称
      isSame: 出场和进场动画相同
  */
  addScene(config) {
    let { name, parent = 'root', isSame } = config;
    if (this.scenes[name]) {
      this.removeScence(name);
    }
    this.scenes[name] = {
      scene: new Scene(config),
      parentScene: parent,
      childScene: []
    }
    let parentScene = this.scenes[parentScene];
    if (parentScene) {
      parentScene.childScene.push(name);
    }
  }
  // 重置一个场景
  removeScence(name) {
    let scene = this.scenes[name];
    if (!scene) {
      return;
    }
    let { parentScene, childScene} = scene;
    // 移除子场景
    childScene.map((item) => this.resetScene(item.name))
    // 父场景的childScene移除它
    if (parentScene != 'root') {
      let parentChildScene =  this.scene[parent].childScene;
      let index;
      for( let i = 0; i < parentChildScene.length; i++ ) {
        if (parentChildScene[i] == name) {
          index = i;
          break;
        }
      }
      if (index || index == 0) {
        parentChildScene.slice(index,)
      }
    }
    // 当前场景置为null
    this.scenes[name] = null;
  }
  /*
    name: 场景标识
    type: in/out 进场or出场
  */
  playScene(name, type, translateData) {
    // debugger;
    let scene = this.scenes[name] && this.scenes[name].scene;
    if (!scene) {
      console.error(name + ' the scene has not be added');
      return;
    }
    scene.setPreSceneTranslateData(translateData);
    scene.play(type);
  }
}

// 单个场景状态切换
export class Scene {
  /*
    config:
      inQueue: 入场队列
      outQueue: 出场队列
      isSame: 出场和进场动画相同
      inPlayOverCb: 进场动画播放结束回调
      outPlayOverCb: 出场动画播放结束回调
      playNextSceneCb: 播放下一场回调
      inPlayTime: 单个区域入场动画时间
      outPlayTime: 单个区域出场动画时间
      inWaitTime: 单个区域每项入场等待时间
      outWaitTime: 单个区域每项出场等待时间
      inPlayType: 进场动画类型
      outPlayType: 出场动画类型
    queueItem:
      el: 动画区域
      playTime: 动画时间
      playType: 动画类型:平移(left,top,bottom,right) 渐影(fade) 平移到下场景(translate)
      waitTime: 下一区域动画等待时间，默认是上一场结束
      translateName: 多场景平移相同区域标识字段
  */
  constructor(config) {
    let { 
      name, //场景名称
      inQueue = [], //入场队列
      outQueue = [], //出场队列
      inWaitTime = 300, //单个区域每项入场等待时间
      outWaitTime = 300, //单个区域每项出场等待时间
      inPlayType = 'left', //进场动画类型
      outPlayType = 'left', //进场动画类型
      inPlayTime = 300, //单个区域入场动画时间
      outPlayTime = 300, //单个区域出场动画时间
      isSame, //出场和进场动画相同
      inPlayOverCb, //进场动画播放结束回调
      outPlayOverCb, //出场动画播放结束回调
      playNextSceneCb, //播放下一场回调
   } = config
    inQueue.map((item) => {
      item.playTime = item.playTime || inPlayTime;
      item.waitTime = item.waitTime || inWaitTime || item.playTime;
      item.playType = item.playType || inPlayType;
    });
    outQueue.map(item => {
      item.playTime = item.playTime || outPlayTime;
      item.waitTime = item.waitTime || outWaitTime || item.playTime;
      item.playType = item.playType || outPlayType;
    });
    if (isSame && (!outQueue || !outQueue.length)) {
      outQueue = inQueue;
    }
    this.inQueue = inQueue;
    this.outQueue = outQueue;
    this.name = name;
    this.outPlayOverCb = outPlayOverCb;
    this.inPlayOverCb = inPlayOverCb;
    this.playNextSceneCb = playNextSceneCb;
    this.translateData = {}
  }
  setPreSceneTranslateData(translateData) {
    this.preSceneTranslateData = translateData;
  }
  playover(type){
    if (type == 'in') {
      this.inPlayOverCb && this.inPlayOverCb();
    }
    if (type == 'out') {
      this.outPlayOverCb && this.outPlayOverCb(this.translateData);
    }
  }
  playNextScene(type) {
    if (type == 'out') {
      this.playNextSceneCb && this.playNextSceneCb(this.translateData);
    }
  }
  play(type) {
    let queueList = {
      'in': this.inQueue,
      'out': this.outQueue
    }
    let queue = queueList[type];
    let len = queue.length;
    queue = this.combineTranslate(queue, type);
    let isLastSyncQueue = false;
    let start = async () => {
      let i = 0;
      let item;
      while(item = queue[i]){
        // 上一步是平移，特殊处理
        let { playType, queueType, lastSync } = item; 
        this.anim(item, type);
        if (queueType != 'sync') {
          // 异步队列，延迟执行下一步
          await this.sleep(item.waitTime);
        } else {
          // 同步队列，最后一项才延迟
          if (lastSync) {
            if (type == 'out') {
              // 出场同步队列最后一项，播放下一场动画
              isLastSyncQueue = true;
              this.playNextScene(type);
            }
            await this.sleep(item.waitTime);
          }
        }
        i += 1;
      }
      if (!isLastSyncQueue) {
        this.playNextScene(type);
      }
      this.playover(type);
    }
    start();
  }
  // 处理执行顺序，分为同步进行,异步进行两部分，进场的同步先行，出场的异常先行
  combineTranslate(queue, type) {
    let syncQueue = [];
    let asyncQueue = [];
    queue.map((item) => {
      if (item.playType == 'translate' || item.playType == 'fade') {
        item.queueType = 'sync';
        syncQueue.push(item);
      } else {
        asyncQueue.push(item);
      }
    })
    if (syncQueue.length) {
      syncQueue[syncQueue.length -1].lastSync = true;
    }
    if (type == 'in') {
      return syncQueue.concat(asyncQueue);
    } else {
      return asyncQueue.concat(syncQueue);
    }
  }
  anim(item, type) {
    let { el, translateName, playType } = item;
    let wrap = el.parentNode;
    console.log(document.body.contains(el))
    let wrapOffset = wrap.getBoundingClientRect();
    let itemOffset = el.getBoundingClientRect();
    let translate;
    let opacity;
    let extraData;
    switch(playType) {
      case 'left':
      case 'right':
      case 'top':
      case 'bottom':
        this.moveAnim(playType, type, itemOffset, wrapOffset, item)
        break;
      case 'fade':
        this.fadeAnim(type, item);
        break;
      case 'translate':
        this.translateAnim(type, item, itemOffset);
        break;
      default: 
        break;
    }  
  }
  translateAnim(type, item, itemOffset, wrapOffset) {
    // debugger;
    let { translateName, el, playTime } = item;
    if (type == 'out') {
      this.translateData[translateName] =  itemOffset;
      el.style.visibility = 'hidden';
    }
    if (type == 'in') {
      let preOffset = this.preSceneTranslateData && this.preSceneTranslateData[translateName];
      if (!preOffset) {
        this.moveAnim('left', type, itemOffset, wrapOffset, item);
        return;
      }
      let translate = (preOffset.left - itemOffset.left) + 'px, ' + (preOffset.top - itemOffset.top) + 'px, 0';
      el.style.webkitTransform = 'translate3d(' + translate + ')';
      el.style.visibility = 'visible';
      setTimeout(() => {
        el.style.webkitTransition = 'transform ' + playTime/1000 + 's ease-in';
        el.style.webkitTransform = 'translate3d(0,0,0)';
      }, 30)
    }
  }
  moveAnim(dir, type, itemOffset, wrapOffset, item) {
    let { el, playTime } = item
    let translate;
    wrapOffset = {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    }
    switch(dir) {
      case 'left':
        translate = wrapOffset.left - itemOffset.left - itemOffset.width + 'px, 0, 0';
        break;
      case 'right':
        translate = wrapOffset.right - itemOffset.right + itemOffset.width + 'px, 0, 0';
        break;
      case 'top':
        translate = '0, ' + (wrapOffset.top - itemOffset.top - itemOffset.height) + 'px, 0';
        break;
      case 'bottom':
        translate = '0, ' + (wrapOffset.bottom - itemOffset.top + itemOffset.height) + 'px, 0';
        break;
      default:
        break;
    }
    if (type == 'in') {
      el.style.webkitTransform = 'translate3d(' + translate + ')';
      el.style.visibility = 'visible';
      setTimeout(() => {
        el.style.webkitTransition = 'transform ' + playTime/1000 + 's ease-in';
        el.style.webkitTransform = 'translate3d(0,0,0)';
      }, 30)
    }
    if (type == 'out') {
      el.style.webkitTransition = 'transform ' + playTime/1000 + 's ease-in';
      el.style.webkitTransform = 'translate3d(' + translate + ')';
      setTimeout(() => {
        el.style.visibility = 'hidden';
      }, playTime)
    }
  }
  fadeAnim(type, item) {
    let { el, playTime } = item;
    if (type == 'in') {
      el.style.opacity = 0;
      el.style.visibility = 'visible';
      setTimeout(() => {
        el.style.webkitTransition = 'opacity ' + playTime/1000 + 's ease-in';
        el.style.opacity = 1;
      })
    }
    if (type == 'out') {
      el.style.opacity = 0;
      el.style.webkitTransition = 'opacity ' + playTime/1000 + 's ease-in';
      setTimeout(() => {
        el.style.visibility = 'hidden';
      }, playTime)
    }

  }
  sleep(waitTime) {
    return new Promise((resolve) => {
      setTimeout(() => resolve && resolve(), waitTime)
    })
  }
}

export default new sceneTransition();