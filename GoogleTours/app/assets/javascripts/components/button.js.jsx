var Button = React.createClass({

  render: function() {
    return(
      <div>
        <button onClick={(e)=> this.props.state(40,74)}>Find by zip</button>
      </div>
    )
  }
});
