var Main = React.createClass({

  //pros and cons
  //pros:
  //vastly simplified handling of persistant data. No more having to pass all data from function to function
  //seriously, it's like night and day how simple it is to store things for later now
  //cons:
  //Google maps already acts like react in some ways, making it partially redundant


  //consider moving most of this state stuff down to map

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
      panoID: null,
      isCreating: false,
      isViewing: false,
      markers: null,
      visibleBlurbs: null,
      heading: null,
      pitch: null,
      zipInput: null,
      modalIsOpen: false
    }
  },


  componentWillMount(){
    ReactModal.setAppElement('body')
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
        blurbRetrieval(value[2])
      })},50)
  },

  //   function blurbRetrieval(id){
  //   $.ajax({
  //     "url":"/content",
  //     "method":"get",
  //     "data":{id:id}
  //   }).done(function(data){
  //     console.log(data)
  //     var blurbs = JSON.parse(data)
  //     this.setState({blurbs:blurbs, panNum:1, panoID:blurbs[0].panoID})
  //     tourViewer(data)
  //   })
  // },

  // function tourViewer(value){
  //   $('#view-popup').popup('show',{
  //       blur:false,
  //       onclose: function(){
  //       $('.blurbDiv').css('visibility', 'hidden')
  //       $('#saveTour').css('visibility', 'hidden')
  //       $('#panoWriter').css('visibility', 'hidden')
  //       $('#panoWriter').css('pointer-events', 'none')
  //     }
  //   });
  //   // var currentTour = value.blurbs
  //   // console.log(currentTour)
  //   var blurbs = JSON.parse(value)
  //   var firstpan = blurbs[0].panoID
  //   // blurbs[pannum-1].panoid
  //   panorama = new google.maps.StreetViewPanorama(document.getElementById('panoView'), {zoomControl: false, addressControl: false, fullscreenControl: false});
  //   panorama.setPano(firstpan)
  //   blurbs.map(function(b){
  //     var blurbDiv = $('<div class = "'+b.panoID+' blurbDiv"></div>')
  //     blurbDiv.css('visibility', 'hidden')
  //     blurbDiv.css('position', 'absolute')
  //     blurbDiv.css('z-index', 100010)
  //     blurbDiv.text(b.content)
  //     $('#panoView').append(blurbDiv)
  //   })
  //   panorama.addListener('pano_changed', function(){
  //     blurbPositioner(panorama, blurbs)
  //   })
  //   panorama.addListener('pov_changed', function(){
  //     blurbPositioner(panorama, blurbs)
  //   })
  // }

  //for tour viewer, can simply bring up panorama with gmaps, then have blurbs show up based on state
  //every time pano changes, can simply reshuffle state
  //will allow for showing and hiding of blurbs easily

  //for tour creator, will need to have listener for pano change, which will update state
  //on clicking (a button?) can mount a blurb component for writing, which can be dragged around
  //no need for writing pano/to make map uninteractible, can simply have user drag and drop to appropriate spot
  //thanks to state update, will always know both position and heading pitch, and so when save is clicked it's easy to get relevant data
  //can display blurbs based on state for creation, so that on save new blurb will appear immediately.

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

  // function blurbPositioner(data, blurbs){
  //   blurbs.map(function(b){
  //     console.log(b)
  //     if(data.pano == b.panoID){
  //       // var leftBound = data.pov.heading - 45;
  //       // if(b.position.heading > data.pov.heading - 45 && b.position.heading < data.pov.heading + 45){
  //         $('.'+b.panoID).css('visibility', 'visible')
  //         var xYCoords = headingPitchToXY(b.position.heading, b.position.pitch)
  //         var bottomOffset = 250 + Number(xYCoords.y)
  //         var leftOffset = 250 + Number(xYCoords.x)
  //         $('.'+b.panoID).css('bottom', bottomOffset+"px")
  //         $('.'+b.panoID).css('left', leftOffset+'px')
  //         console.log(xYCoords.x,data.pov.heading, b.position.heading)
  //         console.log($('.'+b.panoID).css('left'))
  //       // }
  //     }
  //     else{
  //       $('.'+b.panoID).css('visibility', 'hidden')
  //     }
  //   })
  // }



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

  findByZip: function(){
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': this.state.zipInput}, function(results, status) {
      if (status == 'OK') {
        console.log(results)
        this.state.map.setCenter(results[0].geometry.location);
        this.setState({location:{lat:results[0].geometry.location.lat(),lng:results[0].geometry.location.lng()}, havelocation:true})
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    }.bind(this));

  },

  createTourSwitch: function(){
    if(this.state.isCreating===false)
    {
      this.setState({isCreating:true})
    }
    else
    {
      this.setState({isCreating:false})
    }
  },

  startCreating: function(coords){
    this.setState({startLoc:coords, modalIsOpen:true})
  },

  setPanorama: function(){
    var testing = document.getElementById('testPano');
    debugger;
    panorama = new google.maps.StreetViewPanorama(
      document.getElementById('testPano'), {
        position: this.state.startLoc,
        pov: {
          heading: 34,
          pitch: 10
        },
        addressControl: false,
        zoomControl: false,
        fullscreenControl: false
      });
    this.state.map.setStreetView(panorama);
    console.log(this.state.startLoc, panorama)
    this.setState({panorama:panorama})
  },

  updateZipInput: function(zip){
    this.setState({zipInput:zip})
  },

  render: function() {
    //do the geolocation check in set initial state if possible, use a boolean to track,
    //set boolean to true on findbyzip
    if(this.state.havelocation===false){
      return(
        <div>
          <Button state={this.findByZip} input={this.updateZipInput}/>
        </div>
        )
    }
    else{
      return(
        <div>
          <Map startCreating={this.startCreating} modal={this.state.modalIsOpen} panoProp={this.state.panorama} setPano={this.setPanorama} mapProp={this.state.map} create={this.createTourSwitch} isCreating={this.state.isCreating} markers={this.tourMarkerPopulate} createMap={this.createMap} createMarker={this.createMarker} createInfoWindow={this.createInfoWindow} lng={this.state.location.lng} lat={this.state.location.lat} geolocate={this.geolocate}/>
          <Button state={this.findByZip}/>
        </div>
      )
    }
  }
});
