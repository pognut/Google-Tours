var Blurb = React.createClass({
  //set state to
  //need to use refs so I can stick create map in will mount, and create marker in did mount



  componentDidMount: function(){
    // console.log('yey')
      },

  render: function() {
    var stylings = {top: this.props.anchor.top, left:this.props.anchor.left}
    if(this.props.isCreating){
    return(
      <div className="blurb" style={stylings}>
        <input value={this.props.text} onChange={(e)=>this.props.editBlurb(this.props.index, e.target.value)}>
        </input>
      </div>
    )
  }
    else if(this.props.isViewing){
          return(
      <div className="blurb" style={stylings}>
        {this.props.text}
      </div>
    )
    }
  }
});
