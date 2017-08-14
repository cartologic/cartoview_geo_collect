import Edit from './Edit.jsx';
import React from 'react';
import {render} from 'react-dom';
class Viewer {
  constructor(domId, config, username) {
    this.domId = domId;
    this.appConfig = config;
    this.username = username;
  }

  set config(value) {
    this.appConfig = config;
  }

  view() {
    render(
      <Edit config={this.appConfig} username={this.username}/>, document.getElementById(this.domId));
  }
}
module.exports = Viewer;
global.Viewer = Viewer;
