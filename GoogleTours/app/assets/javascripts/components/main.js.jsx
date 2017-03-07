var Main = React.createClass({

  //pros and cons
  //pros:
  //vastly simplified handling of persistant data. No more having to pass all data from function to function
  //seriously, it's like night and day how simple it is to store things for later now
  //cons:
  //Google maps already acts like react in some ways, making it partially redundant


  //consider moving most of this state stuff down to map

  //current tour states: blurbs{panNum, panoID, text, heading/pitch(?)}, startLoc, preview, tourID,
  getInitialState: function() {
    //see if this might go better in componentwillmount or whatever
    return {
      location:{lat:null, lng:null},
      havelocation: false,
      bounds: null,
      //holds the map element
      map: null,
      //holds the street view panorama element
      panorama: null,
      //holds an array with objects representing each blurb.
      blurbs: [],
      //start coords
      startLoc: null,
      //current pan in tour sequence
      panNum: null,
      //current google panoID
      panoID: null,
      isCreating: false,
      isViewing: false,
      markers: null,
      //currently visible blurbs, currently unneccessary
      visibleBlurbs: [],
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
    var markerPop = this.tourMarkerPopulate
    google.maps.event.addListener(newMap, 'tilesloaded', function(){
      markerPop(newMap.getBounds())
      // newMap.addListener('tilesloaded',function(){
      //   markerPop(newMap.getBounds())
      // })
    })
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
    var blurbRetriever = this.blurbRetrieval
    var modalOpen = this.startCreating

    setTimeout(function(){$('#tourStart').on('click', function(){
        var longitude = Number(value[0])
        var latitude = Number(value[1])
        var coords = {lat:latitude, lng:longitude}
        modalOpen(coords)
        console.log('lajsdhflasdhf')
        blurbRetriever(value[2])
      })},50)
  },

  blurbRetrieval(id){
    $.ajax({
      "url":"/content",
      "method":"get",
      "data":{id:id}
    }).done(function(data){
      console.log(data)
      var blurbs = JSON.parse(data)
      this.startViewing(blurbs)
    }.bind(this))
  },

  startViewing(blurbs){
    this.setState({isViewing: true, blurbs:blurbs, panNum:1, panoID:blurbs[0].panoID})
  },
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
  //should definitely turn into dedicated modal opener/toggler
  startCreating: function(coords){
    this.setState({startLoc:coords, modalIsOpen:true})
  },

  //this should be a unified panorama opening function (it pretty much is, keep it that way)
  setPanorama: function(){
    var testing = document.getElementById('testPano');
    //make this outdoor only, it's a setting
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
    var setPanoID = this.setPanoID
    var blurbPositioner = this.blurbPositioner
    panorama.addListener('pano_changed', function(){
      var panoID = panorama.getPano()
      setPanoID(panoID)
      blurbPositioner()
    })
    panorama.addListener('pov_changed', function(){
      blurbPositioner()
    })
    this.state.map.setStreetView(panorama);
    console.log(this.state.startLoc, panorama)
    this.setState({panorama:panorama})
  },

  //for now, have a single panorama close function that wipes all data, but keep in mind this wont
  //work for more advanced features like remembering where in a tour a user was
  closePanorama: function(){
    this.setState({panorama:null,
      blurbs:[],
      startLoc: null,
      panNum: null,
      panoID: null,
      isCreating: false,
      isViewing: false,
      visibleBlurbs: [],
      heading: null,
      pitch: null,
      modalIsOpen: false})
  },

  setPanoID: function(panoID){
    this.setState({panoID:panoID})
  },


  setPanNum: function(){
    //if no first pan yet, this is first pan
    if(this.state.panNum===null){
      this.setState({panNum:1})
    }
    //if previously used pan, this is that pan
    // else if (this.state.visibleBlurbs===true){

    // }
    else {
      var newPan = this.state.panNum + 1
      this.setState({panNum:newPan})
    }
    //if not previously used and not first, this is panNum + 1
  },
   get3dFov: function(zoom) {
  return zoom <= 2 ?
      126.5 - zoom * 36.75 :  // linear descent
      195.93 / Math.pow(1.92, zoom); // parameters determined experimentally
  },
    povToPixel3d: function(targetPov) {
    var zoom = this.state.panorama.getZoom()
    var currentPov = this.state.panorama.getPov()
    // Gather required variables and convert to radians where necessary
    var width = $('#testPano').width();
    var height = $('#testPano').height();
    var target = {
      left: width / 2,
      top: height / 2
    };

    var DEG_TO_RAD = Math.PI / 180.0;
    var fov = this.get3dFov(zoom) * DEG_TO_RAD;
    var h0 = currentPov.heading * DEG_TO_RAD;
    var p0 = currentPov.pitch * DEG_TO_RAD;
    var h = targetPov.heading * DEG_TO_RAD;
    var p = targetPov.pitch * DEG_TO_RAD;

    // f = focal length = distance of current POV to image plane
    var f = (width / 2) / Math.tan(fov / 2);

    // our coordinate system: camera at (0,0,0), heading = pitch = 0 at (0,f,0)
    // calculate 3d coordinates of viewport center and target
    var cos_p = Math.cos(p);
    var sin_p = Math.sin(p);

    var cos_h = Math.cos(h);
    var sin_h = Math.sin(h);

    var x = f * cos_p * sin_h;
    var y = f * cos_p * cos_h;
    var z = f * sin_p;

    var cos_p0 = Math.cos(p0);
    var sin_p0 = Math.sin(p0);

    var cos_h0 = Math.cos(h0);
    var sin_h0 = Math.sin(h0);

    var x0 = f * cos_p0 * sin_h0;
    var y0 = f * cos_p0 * cos_h0;
    var z0 = f * sin_p0;

    var nDotD = x0 * x + y0 * y + z0 * z;
    var nDotC = x0 * x0 + y0 * y0 + z0 * z0;

    // nDotD == |targetVec| * |currentVec| * cos(theta)
    // nDotC == |currentVec| * |currentVec| * 1
    // Note: |currentVec| == |targetVec| == f

    // Sanity check: the vectors shouldn't be perpendicular because the line
    // from camera through target would never intersect with the image plane
    if (Math.abs(nDotD) < 1e-6) {
      return null;
    }

    // t is the scale to use for the target vector such that its end
    // touches the image plane. It's equal to 1/cos(theta) ==
    //     (distance from camera to image plane through target) /
    //     (distance from camera to target == f)
    var t = nDotC / nDotD;

    // Sanity check: it doesn't make sense to scale the vector in a negative
    // direction. In fact, it should even be t >= 1.0 since the image plane
    // is always outside the pano sphere (except at the viewport center)
    if (t < 0.0) {
      return null;
    }

    // (tx, ty, tz) are the coordinates of the intersection point between a
    // line through camera and target with the image plane
    var tx = t * x;
    var ty = t * y;
    var tz = t * z;

    // u and v are the basis vectors for the image plane
    var vx = -sin_p0 * sin_h0;
    var vy = -sin_p0 * cos_h0;
    var vz = cos_p0;

    var ux = cos_h0;
    var uy = -sin_h0;
    var uz = 0;

    // normalize horiz. basis vector to obtain orthonormal basis
    var ul = Math.sqrt(ux * ux + uy * uy + uz * uz);
    ux /= ul;
    uy /= ul;
    uz /= ul;

    // project the intersection point t onto the basis to obtain offsets in
    // terms of actual pixels in the viewport
    var du = tx * ux + ty * uy + tz * uz;
    var dv = tx * vx + ty * vy + tz * vz;

    // use the calculated pixel offsets
    target.left += du;
    target.top -= dv;
    return target;
  },

  addBlurb: function(heading, pitch, x, y){
    var blurb = {panNum:this.state.panNum, panoID:this.state.panoID, text:"", pov:{heading:heading, pitch:pitch}, anchor:{left:x, top:y}}
    var oldBlurbs = this.state.blurbs
    if(oldBlurbs==null){
      oldBlurbs = []
    }
    oldBlurbs.push(blurb)
    console.log(oldBlurbs)
    var oldVisibles = this.state.visibleBlurbs;
    oldVisibles.push(blurb)
    this.setState({blurbs:oldBlurbs, visibleBlurbs:oldVisibles})
  },

  editBlurb: function(index, value){
    var blurbs = this.state.visibleBlurbs
    blurbs[index].text=value
    this.setState({visibleBlurbs:blurbs})
  },

  blurbPositioner: function(){
    //split this into two functions, one to update visible blurbs, and one to update blurb positions
    // if(this.state.visibleBlurbs==[]||undefined||null||[undefined]){
    //   console.log('asdf')
    // }
    // else{
    var newBlurbs=[]
    this.state.blurbs.map(function(blurb){
      if(blurb.panoID==this.state.panoID){
        blurb.anchor=this.povToPixel3d(blurb.pov)
        newBlurbs.push(blurb)
      }
    }.bind(this))
    this.setState({visibleBlurbs:newBlurbs})
  // }
  },

  saveTour: function(){
    //put in a check to see if a tour id (db or custom) is present. If so, use update instead of create
    tourString = JSON.stringify(this.state.blurbs)
    $.ajax({
      "dataType": 'JSON',
      "url": '/tours/',
      "method": 'POST',
      "data": {tour: tourString, startLng: this.state.startLoc.lng, startLat: this.state.startLoc.lat},
      success: function(){
        console.log('tour saved')
      }
    })
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
          <Button state={this.findByZip}/>
          <Map closePanorama={this.closePanorama} isViewing={this.state.isViewing} saveTour={this.saveTour} editBlurb={this.editBlurb} blurbs={this.state.visibleBlurbs} addBlurb={this.addBlurb} startCreating={this.startCreating} modal={this.state.modalIsOpen} panoProp={this.state.panorama} setPano={this.setPanorama} mapProp={this.state.map} create={this.createTourSwitch} isCreating={this.state.isCreating} markers={this.tourMarkerPopulate} createMap={this.createMap} createMarker={this.createMarker} createInfoWindow={this.createInfoWindow} lng={this.state.location.lng} lat={this.state.location.lat} geolocate={this.geolocate}/>
        </div>
      )
    }
  }
});
