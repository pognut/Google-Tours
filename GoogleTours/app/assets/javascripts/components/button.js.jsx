var Button = React.createClass({

  render: function() {
    return(
      <div>
        <input onChange={(e)=> this.props.update(e.target.value)}></input>
        <button onClick={(e)=> this.props.state()}>Find by zip</button>
      </div>
    )
  }
});
