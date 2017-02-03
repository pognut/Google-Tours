var HelloMessage = React.createClass({


  propTypes: {
    name: React.PropTypes.string
  },

  getInitialState: function() {
    return {
      name: this.props.name
    }
  },

  updateName: function(data){
    this.setState({name:data})
  },

  render: function() {
    return (
      <div>
        <input onChange={(e)=> this.updateName(e.target.value)}></input>
        <div>Name: {this.state.name}</div>
      </div>
    );
  }
});
