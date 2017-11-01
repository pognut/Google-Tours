var MapHolder = React.createClass({
  //set state to
  //need to use refs so I can stick create map in will mount, and create marker in did mount



  componentDidMount: function(){
       console.log("asdfasdf")
       this.props.createMap()
       // this.props.createMarker()
      },

  componentDidUpdate: function(prevProps, prevState){

    if(this.props.isCreating===true&&prevProps.isCreating===false){
      var startCreating = this.props.startCreating
      this.props.mapProp.addListener('click', function(e){
              var coords = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            }
              startLng = Number(coords.lng);
              startLat = Number(coords.lat);
              startCreating(coords)
            })
    }
    else if(this.props.isCreating===false&&prevProps.isCreating===true){
      google.maps.event.clearListeners(this.props.mapProp, 'click');

    }
  },

  render: function() {
    //changes to Panorama cause map to rerender as well due to the flow of data
    //this will need to be fixed, either through redux or repositioning pano

    //will probably have to do the loop over blurbs here? If not, make a panorama and do blurb loop there
    //http://stackoverflow.com/questions/32157286/rendering-react-components-from-array-of-objects
    if(this.props.isCreating||this.props.isViewing){
      var pano = <Panorama inputChange={this.props.inputChange} handleControls={this.props.handleControls} isStop={this.props.isStop} addStop={this.props.addStop} firstSave={this.props.firstSave} tourMarkerPopulate={this.props.markers} isViewing={this.props.isViewing} saveTour={this.props.saveTour} editBlurb={this.props.editBlurb} blurbs={this.props.blurbs} addBlurb={this.props.addBlurb} isCreating={this.props.isCreating} setPano={this.props.setPano} mapProp={this.props.mapProp} panoProp={this.props.panoProp}/>
    }
    return(
      <div>
        {this.props.loggedIn ? (<button onClick={(e)=> this.props.create()}>Make a tour</button>):(<h4>Sign in to make a tour!</h4>)}
        <div id="map">
        <ReactModal
          isOpen={this.props.modal}
          contentLabel="Modal"
          onRequestClose={this.props.closePanorama}
        >
        {pano}
        </ReactModal>
        </div>

      </div>
    )
  }
});
