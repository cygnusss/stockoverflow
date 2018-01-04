import React from 'react';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      q: '',
      change: false
    }
  }

  onChange (e) {
    this.setState({
      q: e.target.value
    });
    console.log(this.state.q)
  }

  search() {
    this.props.onSearch(this.state.q);
  }

  render() {
    return (<div id="search_div">
      <input value={this.state.q} onChange={this.onChange.bind(this)}/>
      <button onClick={this.search.bind(this)}>BE RICH</button>
    </div>) 
  }
}

export default Search;