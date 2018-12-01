import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import './App.css';
import './App-global.css';
import TabsView from './TabsView';
import IntroView from './IntroView';
import HtmlView from './HtmlView';
import CssView from './CssView';
import JavascriptView from './JavascriptView'
import SettingsView from './SettingsView';

class App extends Component {
  render() {
    return (
      <div className="wrap">
        <Route path="/" component={TabsView} />
        <Route exact path="/" component={IntroView} />
        <Route path="/html" component={HtmlView} />
        <Route path="/css" component={CssView} />
        <Route path="/javascript" component={JavascriptView} />
        <Route path="/settings" component={SettingsView} />
      </div>
    );
  }
}

export default App;
