var Map = React.createClass({
  //set state to
  //need to use refs so I can stick create map in will mount, and create marker in did mount



  componentDidMount: function(){
       this.props.createMap()
       // this.props.createMarker()
      },

  render: function() {
    //will probably have to do the loop over blurbs here? If not, make a panorama and do blurb loop there
    //http://stackoverflow.com/questions/32157286/rendering-react-components-from-array-of-objects
    return(
      <div>
        <div id="map">
        </div>
        <button onClick={(e)=> this.props.markers()}>TESTING</button>
        <h1>{this.props.lat}, {this.props.lng}</h1>
      </div>
    )
  }
});
