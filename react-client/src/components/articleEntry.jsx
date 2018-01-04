import React from 'react';

const Article = (props) => (
  <div class="articles_div">
    <img src={props.entry.image}/>
    <p>{props.entry.description}</p>
  </div>
)

export default Article;