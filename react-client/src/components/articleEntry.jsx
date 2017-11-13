import React from 'react';

const Article = (props) => (
  <div>
    <img src={props.entry.image}/>
    <p>{props.entry.description}</p>
  </div>
)

export default Article;