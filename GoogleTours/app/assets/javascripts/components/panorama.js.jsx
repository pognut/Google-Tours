var Panorama = React.createClass({

  componentDidMount: function(){
    // ReactModal.setAppElement('testPano')
    console.log(this.props)
    if(this.props.isCreating===true){
      console.log('setting pano')
      this.props.setPano()
    }

  },

  componentWillUnmount: function(){
    if(this.props.isCreating===false){
      google.maps.event.clearListeners(this.props.mapProp, 'click');
    }
  },

  render: function() {
    return(
      <div id="testPano">
        {this.props.blurbs}
      </div>
      )
  }
});
