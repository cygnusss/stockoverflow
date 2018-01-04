import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Search from './components/search.jsx';
import Article from './components/articleEntry.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      q: {},
      articles: []
    }
  }

  handleInput(q) {
    const data = {
      name: q,
      type: "DAILY",
      priceDate: undefined
    };
    $.post('http://127.0.0.1:8080/renderStock', data, data => {
      this.setState({
        q: data
      });
    });
    // $.post('http://127.0.0.1:8080/renderNews', data);
    $.get('http://127.0.0.1:8080/renderNews', {name: q})
      .done((data) => {
        this.setState({
          articles: data
        });
      });
  }

  /*
    name: inputStock.name,
    priceDate: inputStock.priceDate,
    openingPrice: inputStock.openingPrice,
    highPrice: inputStock.highPrice,
    lowPrice: inputStock.lowPrice,
    closingPrice: inputStock.closingPrice,
    date: new Date
  */

  render () {
    return (
    <div id="main_app">
      <Search onSearch={this.handleInput.bind(this)}/>
      <h1> NAME: {this.state.q.name} </h1>
      <h4>OPENENING: ${this.state.q.openingPrice} </h4>
      <h4>CLOSING ${this.state.q.closingPrice} </h4>
      <h4>HIGH: ${this.state.q.highPrice} </h4>
      <h4>LOW: ${this.state.q.lowPrice} </h4>
      <p>DATE: {this.state.q.priceDate} </p>
      <div>
        {
          this.state.articles.map(entry => {
            return <Article entry={entry} />
          })
        }
      </div>
    </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));