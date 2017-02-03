var Main = React.createClass({


  getInitialState: function() {
    //see if this might go better in componentwillmount or whatever
    return {
      location:{lat:null, lng:null},
      havelocation: false,
      bounds: null,
      map: null,
      panorama: null,
      blurbs: null,
      startLoc: null,
      panNum: null,
      isCreating: false,
      isViewing: true,
      markers: null
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
        // if(navigator.geolocation.getCurrentPosition)
      }.bind(this))
    }
  },


  // clean up event listeners when component unmounts, REMEMBER THIS FOR PANOS
  componentDidUnMount() {
    google.maps.event.clearListeners(map, 'zoom_changed')
  },

  createMap() {
    let mapOptions = {
      center: this.mapCenter(),
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false
    }
    var newMap =  new google.maps.Map(document.getElementById('map'), mapOptions)
    this.setState({map:newMap})
  },

  mapCenter() {
    return new google.maps.LatLng(
      this.state.location.lat,
      this.state.location.lng
    )
  },

  createMarker() {
    var newMarker = new google.maps.Marker({
      position: this.mapCenter(),
      map: this.state.map
    })
  },

  tourMarker: function(tourData){
    console.log('marker?')
    var bounds = this.state.map.getBounds();
    var ne = bounds.getNorthEast(); // LatLng of the north-east corner
    var sw = bounds.getSouthWest();
    var map = this.state.map
    var tourPrev = this.tourPreview
    var marks = []
      tourData.forEach(function(value){
        console.log(value)
        longitude = Number(value[0])
        latitude = Number(value[1])
        var id = value[2]
        if(ne.lng() > longitude && longitude > sw.lng() && ne.lat() > latitude && latitude > sw.lat()){
          //add the markerTrack check here
          // if(markerTrack.includes(id)===false){

            var startMarker = new google.maps.Marker({
              position: {lat: latitude, lng: longitude},
              map: map
            })
            startMarker.addListener('click', function(){
              tourPrev(value, startMarker)
              // tourMarker(value)
              $('#forward').on('click', function(){
                // tourControls(1, value)
              })
              $('#backward').on('click', function(){
                // tourControls(-1, value)
              })
          })
        marks.push(startMarker)
        }
      })
    this.setState({markers:marks})
  },

  tourPreview(value, marker){
    var contentString = $("<button id = tourStart>"+value[3]+"</button>")
    // contentString.on('click', function(){
    //   console.log('asdf;asdf')
    // })
    var infowindow = new google.maps.InfoWindow({
    })
    infowindow.setContent(contentString[0])
    infowindow.open(map, marker)
    setTimeout(function(){$('#tourStart').on('click', function(){
        console.log('lajsdhflasdhf')
        // blurbRetrieval(value[2])
      })},50)
  },

  tourMarkerPopulate(){
    var bounds = this.state.map.getBounds();
    console.log('bounds')
    boundsJSON = JSON.stringify(bounds)
     $.ajax({
      "url":"/populate",
      "method":"get",
      "data":{bounds:boundsJSON}
      //feed bounds to controller
    }).done(function(data){
      console.log('yay')
      console.log(data)
      this.tourMarker(data)
    }.bind(this))
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

  geolocate: function(){
    var pos;
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        console.log('working?')
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log(pos)
        this.setState({location:pos, havelocation:true})
        // if(navigator.geolocation.getCurrentPosition)
      }.bind(this))

    }

  },

  findByZip: function(lat, lng){
    this.setState({location:{lat:lat,lng:lng}, havelocation:true})
  },

  render: function() {
    //do the geolocation check in set initial state if possible, use a boolean to track,
    //set boolean to true on findbyzip
    if(this.state.havelocation===false){
      return(
        <div>
          <Button state={this.findByZip}/>
        </div>
        )
    }
    else{
      return(
        <div>
          <Map markers={this.tourMarkerPopulate} createMap={this.createMap} createMarker={this.createMarker} createInfoWindow={this.createInfoWindow} lng={this.state.location.lng} lat={this.state.location.lat} geolocate={this.geolocate}/>
        </div>
      )
    }
  }
});
