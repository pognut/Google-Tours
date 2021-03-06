var GMap = React.createClass({

  getInitialState() {
    //see if this might go better in componentwillmount or whatever
    return {
      zoom:10,
      location:{lat:null, lng:null},
      havelocation: false
    }
  },

  componentWillMount(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        console.log('working?')
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.setState({location:pos, havelocation:true})
        this.map = this.createMap()
        this.marker = this.createMarker()
        this.infoWindow = this.createInfoWindow()
        // if(navigator.geolocation.getCurrentPosition)
      }.bind(this))
    }
    else{

    }
    console.log(this.state.havelocation)
  },


  // componentDidMount() {
  //   // create the map, marker and infoWindow after the component has
  //   // been rendered because we need to manipulate the DOM for Google =(
  //   console.log(this.state.location)


  //   // have to define google maps event listeners here too
  //   // because we can't add listeners on the map until its created
  //   google.maps.event.addListener(this.map, 'zoom_changed', ()=> this.handleZoomChange())
  // },

  // clean up event listeners when component unmounts
  componentDidUnMount() {
    google.maps.event.clearListeners(map, 'zoom_changed')
  },

  createMap() {
    let mapOptions = {
      zoom: this.state.zoom,
      center: this.mapCenter()
    }
    return new google.maps.Map(this.refs.mapCanvas, mapOptions)
  },

  mapCenter() {
    return new google.maps.LatLng(
      this.state.location.lat,
      this.state.location.lng
    )
  },

  createMarker() {
    return new google.maps.Marker({
      position: this.mapCenter(),
      map: this.map
    })
  },

  createInfoWindow() {
    let contentString = "<div class='InfoWindow'>I'm a Window that contains Info Yay</div>"
    return new google.maps.InfoWindow({
      map: this.map,
      anchor: this.marker,
      content: contentString
    })
  },

  handleZoomChange() {
    this.setState({
      zoom: this.map.getZoom()
    })
  },

  render() {
    return <div className="GMap">
      <div className='UpdatedText'>
        <p>Current Zoom: { this.state.zoom }</p>
      </div>
      <div className='GMap-canvas' ref="mapCanvas">
      </div>
    </div>
  }

})

// var initialCenter = { lng: -90.1056957, lat: 29.9717272 }

// ReactDOM.render(<GMap initialCenter={initialCenter} />, document.getElementById('container'));


