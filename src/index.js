import React from 'react';
import sceneTransition from './sceneTransition';

export default class Transition extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
      render: props.show
    }
    // this.appear = props.show;
    this.disappear = !props.show;
    this.statusChange = false;
    this.play = false;
  }
  componentDidMount() {
    if (this.state.render) {
      this.doTransition();
    }
    let self = this;
    document.addEventListener('fireAppear', (e) => {
      if (!self.disappear) {
        if (!self.name) {
          self.play = true;
          self.eventData = e;
        } else {
          sceneTransition.playScene(self.name, 'in', e.detail);
        }
      }
    })
  }
  componentWillUpdate(nextProps) {
    let preShow = this.props.show;
    let nextShow = nextProps.show;

    if (preShow != nextShow) {
      this.statusChange = true;
      if (nextShow) {
        this.state.render = true;
        this.disappear = false;
      } else {
        this.disappear = true;
      }
    } else {
      this.statusChange = false;
    }
  }
  componentDidUpdate() {
    if (this.statusChange) {
      this.doTransition();
    }
  }
  addScene() {
    let config = this.sceneConfig();
    this.name = config.name;
    config.playNextSceneCb = (data) => this.playNextSceneCb(data)
    config.outPlayOverCb = (data) => this.transitionOver(data);
    sceneTransition.addScene(config);
  }
  doTransition() {
    let { render } = this.state;
    // debugger;
    if (this.disappear) {
      sceneTransition.playScene(this.name, 'out');
    } else if (render) {
      this.addScene();
      if (this.play) {
        this.play = false;
        sceneTransition.playScene(this.name, 'in', this.eventData.detail);
      }
    }
  }
  playNextSceneCb(translateData) {
    this.disappear = true;
    let fireAppear = new CustomEvent('fireAppear',{detail: translateData});
    document.dispatchEvent(fireAppear);
  }
  transitionOver() {
    this.setState({
      render: false,
      disappear: false
    })
  }
  resetScene() {
    sceneTransition.removeScence(this.name);
    this.name = null;
  }
  render() {
    let { render } = this.state;
    if (render) {
      return this.renderContent();
    } else {
      // this.resetScene();
      return null;
    }
    
  }
}