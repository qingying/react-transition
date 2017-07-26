import React, {Component} from 'react';
import Transition from '../../src/index';


export default class Page extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      showSection: 1
    }
  }
  getContent() {
    let { showSection } = this.state;
    showSection = showSection.toString();
    switch(showSection) {
      case '1':
        return <Section1 />
      case '2':
        return <Section2 />
      case '3':
        return <Section3 />
      default:
        return null;
    }
  }
  changeShowSection(index) {
    this.setState({
      showSection: index
    })
  }
  componentDidMount() {
    let fireAppear = new CustomEvent('fireAppear');
    document.dispatchEvent(fireAppear);
  }
  render() {
    let { showSection } = this.state;
    return <div className="page">
      <div className="container">
        <Section1 show = {1 == showSection}/>
        <Section2 show = {2 == showSection}/>
        <Section3 show = {3 == showSection}/>
      </div>
      <p className="btn-wrap">
        <span onClick={() => this.changeShowSection(1)}>1</span>
        <span onClick={() => this.changeShowSection(2)}>2</span>
        <span onClick={() => this.changeShowSection(3)}>3</span>
      </p>
    </div>
  }
}

export class Section1 extends Transition {
  sceneConfig() {
    return {
      name: 'section1',
      inPlayTime: 300,
      outPlayTime: 300,
      inQueue: [
        {
          el: this.left,
          playType: 'left',
        },
        {
          el: this.right,
          playType: 'right',
        },
        {
          el: this.top,
          playType: 'top',
        },
        {
          el: this.bottom,
          playType: 'bottom',
        }
      ],
      outQueue: [
        {
          el: this.right,
          playType: 'fade',
        },
        {
          el: this.top,
          playType: 'translate',
          translateName: 'top'
        },
        {
          el: this.bottom,
          playType: 'translate',
          translateName: 'bottom'
        }
      ]
    }
  }
  renderContent() {
    return <div className="wrap section1" ref={(el) => this.wrap = el}>
      <p ref={(el) => this.bottom = el}>bottom1</p>
      <p ref={(el) => this.top = el}>top1</p>
      <p ref={(el) => this.left = el} >left1</p>
      <p ref={(el) => this.right = el}>right1</p>
    </div>
  }
}

export class Section2 extends Transition {
  sceneConfig() {
    return {
      name: 'section2',
      inPlayTime: 300,
      inQueue: [
        {
          el: this.top,
          playType: 'translate',
          translateName: 'top'
        },
        {
          el: this.bottom,
          playType: 'translate',
          translateName: 'bottom'
        },
        {
          el: this.left,
          playType: 'left',
        },
        {
          el: this.right,
          playType: 'right',
        }
      ],
      outQueue: [
        {
          el: this.top,
          playType: 'fade',
          translateName: 'fade'
        },
        {
          el: this.bottom,
          playType: 'fade',
          translateName: 'fade'
        },
        {
          el: this.left,
          playType: 'fade',
        },
        {
          el: this.right,
          playType: 'fade',
        }
      ]
    }
  }
  renderContent() {
    return <div className="wrap section2" ref={(el) => this.wrap = el}>
      <p ref={(el) => this.left = el} >left2</p>
      <p ref={(el) => this.right = el}>right2</p>
      <p ref={(el) => this.top = el}>top2</p>
      <p ref={(el) => this.bottom = el}>bottom2</p>
    </div>
  }
}

export class Section3 extends Transition {
  sceneConfig() {
    return {
      name: 'section3',
      inPlayTime: 300,
      inQueue: [
        {
          el: this.top,
          playType: 'fade',
          translateName: 'fade'
        },
        {
          el: this.bottom,
          playType: 'fade',
          translateName: 'fade'
        },
        {
          el: this.left,
          playType: 'fade',
        },
        {
          el: this.right,
          playType: 'fade',
        }
      ],
      outQueue: [

      ]
    }
  }
  renderContent() {
    return <div className="wrap section3" ref={(el) => this.wrap = el}>
      <p ref={(el) => this.left = el} >left2</p>
      <p ref={(el) => this.right = el}>right2</p>
      <p ref={(el) => this.top = el}>top2</p>
      <p ref={(el) => this.bottom = el}>bottom2</p>
    </div>
  }
}