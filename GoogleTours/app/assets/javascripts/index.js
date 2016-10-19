 var geocoder;
  var map;
  var panorama;
  var tour = []
  var startLng;
  var startLat;
  var panNum = 0;
  var currentPano;
  // $('#my_popup').popup({
  //   blur:false,
  //   onclose: function(){
  //     $('.blurbDiv').css('visibility', 'hidden')
  //     $('#saveTour').css('visibility', 'hidden')
  //     $('#panoWriter').css('visibility', 'hidden')
  //     $('#panoWriter').css('pointer-events', 'none')
  //   }
  // });
 function initMap() {
    $.fn.popup.defaults.blur = false;
    if(navigator.geolocation){
      geocoder = new google.maps.Geocoder();

      navigator.geolocation.getCurrentPosition(function(position){
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        // if(navigator.geolocation.getCurrentPosition)
        var mapOptions = {
          center: new google.maps.LatLng(pos.lat, pos.lang),
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false
        }
        map = new google.maps.Map(document.getElementById('map'), mapOptions)
        map.setCenter(pos)
        //LAT IS Y LNG IS X
        google.maps.event.addListenerOnce(map, 'idle', function(){
          tourViewer()
          map.addListener('bounds_changed',function(){
            tourViewer()
          })
          $('#zipbutton').on('click', function(){
            var address = $('#zipfinder').val()
            findByZip(address)
          })
          $('#createTour').on('click', function(){
            alert('Click your desired start point on the map!')
            map.addListener('click', function(e){
              var coords = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            }
              startLng = Number(coords.lng);
              startLat = Number(coords.lat);
              createTour(coords);
            })
          })
          $('#createBlurb').on('click', function(){
            console.log('works')
            createBlurb()
          })

        });

      })
    }
    else {
      alert("Please enter your zip")
    }
  };
  function findByZip(zip){
    geocoder.geocode( { 'address': zip}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        tourViewer();
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  function tourControls(dir, value){
    console.log(value)
    var currentTour = value.blurbs
    console.log(currentTour)
    var blurbs = JSON.parse(currentTour)
    newCurrent = panNum + dir
    panorama.setPano(blurbs[newCurrent].panoID)
  }

  function tourMarker(value){
              $('.blurbDiv').css('visibility', 'hidden')
              console.log('hitting')
              $('#view-popup').popup('show',{
                blur:false,
                onclose: function(){
                  $('.blurbDiv').css('visibility', 'hidden')
                  $('#saveTour').css('visibility', 'hidden')
                  $('#panoWriter').css('visibility', 'hidden')
                  $('#panoWriter').css('pointer-events', 'none')
                }
              });
              var currentTour = value.blurbs
              console.log(currentTour)
              var blurbs = JSON.parse(currentTour)
              var firstpan = blurbs[0].panoID
              // blurbs[pannum-1].panoid
              panorama = new google.maps.StreetViewPanorama(document.getElementById('panoView'), {zoomControl: false, addressControl: false, fullscreenControl: false});
              panorama.setPano(firstpan)
              blurbs.map(function(b){
                var blurbDiv = $('<div class = "'+b.panoID+' blurbDiv"></div>')
                blurbDiv.css('visibility', 'hidden')
                blurbDiv.css('position', 'absolute')
                blurbDiv.css('z-index', 100010)
                blurbDiv.text(b.content)
                $('#panoView').append(blurbDiv)
              })
              panorama.addListener('pano_changed', function(){
                blurbPositioner(panorama, blurbs)
              })
              panorama.addListener('pov_changed', function(){
                blurbPositioner(panorama, blurbs)
              })
            }

  function tourViewer(){
    panNum = 1;
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast(); // LatLng of the north-east corner
    var sw = bounds.getSouthWest();
      $.each(gon.tours, function(index, value){
        longitude = Number(value.startLng)
        latitude = Number(value.startLat)
        if(ne.lng() > longitude && longitude > sw.lng() && ne.lat() > latitude && latitude > sw.lat()){
          var startMarker = new google.maps.Marker({
            position: {lat: latitude, lng: longitude},
            map: map
          })
          startMarker.addListener('click', function(){
                  console.log(this)
            tourMarker(value)
            $('#forward').on('click', function(){
              tourControls(1, value)
            })
            $('#backward').on('click', function(){
              tourControls(-1, value)
            })
        })
      }
    })
  }


  function blurbPositioner(data, blurbs){
    blurbs.map(function(b){
      console.log(b)
      if(data.pano == b.panoID){
        // var leftBound = data.pov.heading - 45;
        // if(b.position.heading > data.pov.heading - 45 && b.position.heading < data.pov.heading + 45){
          $('.'+b.panoID).css('visibility', 'visible')
          var xYCoords = headingPitchToXY(b.position.heading, b.position.pitch)
          var bottomOffset = 250 + Number(xYCoords.y)
          var leftOffset = 250 + Number(xYCoords.x)
          $('.'+b.panoID).css('bottom', bottomOffset+"px")
          $('.'+b.panoID).css('left', leftOffset+'px')
          console.log(xYCoords.x,data.pov.heading, b.position.heading)
          console.log($('.'+b.panoID).css('left'))
        // }
      }
      else{
        $('.'+b.panoID).css('visibility', 'hidden')
      }
    })
  }

  function createTour(coords){
    //testing code that places marker on map click
    // var marker = new google.maps.Marker({
    //   position: coords,
    //   map: map
    // })
  panorama = new google.maps.StreetViewPanorama(
    document.getElementById('panoCreate'), {
        position: coords,
        pov: {
          heading: 34,
          pitch: 10
        },
        addressControl: false,
        zoomControl: false,
        fullscreenControl: false
      });
    // $('#pano').on('mouseup', function(){
    //   console.log(panorama)
    // })
    panorama.addListener('click', function(){
     console.log(panorama)
    })
    map.setStreetView(panorama);
    $('#saveTour').css('visibility', 'visible')
    $('#createBlurb').css('visibility', 'visible')
    $('#create-popup').popup('show',{blur:false})
  }

  function createBlurb(){
    $('#panoWriter').css('visibility', 'visible')
    $('#panoWriter').css('pointer-events', 'auto')
    var writerZ = Number($('#create-popup_wrapper').css('z-index'))+5
    $('#panoWriter').css('z-index', writerZ)
    console.log(writerZ)
    if(panorama.pano!==currentPano){
      panNum +=1
    }
    var clickPoint;
    $('#panoWriter').on('click', function(e){
      console.log(e, panorama)
      clickPoint = {e:e, panorama:panorama};
      $('#blurbInput').css('visibility', 'visible')
      $('#blurbSave').css('visibility', 'visible')
      $('#panoWriter').off('click')
    })
    $('#blurbSave').on('click', function(){
      saveBlurb(clickPoint)
      $('#saveTour').on('click', function(){
        saveTour()
      })
    })
  }

  function saveTour(){
    tourString = JSON.stringify(tour)
    $.ajax({
      "dataType": 'JSON',
      "url": '/tours/',
      "method": 'POST',
      "data": {tour: tourString, startLng: startLng, startLat: startLat},
      success: function(){
        console.log('tour saved')
        location.reload()
      }
    })
  }

  function saveBlurb(click){
    var blurbText = $('#blurbInput').val()
    var position = xyToHeadingPitch(click)
    currentPano = panorama.pano;
    var blurb = {
      content: blurbText,
      position: position,
      panoID: panorama.pano,
      panNum: panNum
    }
    tour.push(blurb)
    $('#panoWriter').css('visibility', 'hidden')
    $('#panoWriter').css('pointer-events', 'none')
    $('#panoWriter').css('z-index', '-2')
    $('#panoWriter').off('click')
    $('#blurbInput').val('')
   }



  function xyToHeadingPitch(e){
    var x = e.e.offsetX;
    var y = e.e.offsetY;
    var width = parseInt($('#panoCreate').css('width'), 10)
    var height = parseInt($('#panoCreate').css('height'), 10)
    var headingChange = x - width/2;
    var heading = e.panorama.pov.heading + (headingChange/(width/90))
    if(heading > 360){
      heading = heading - 360;
    }
    else if (heading < 0){
      heading = heading + 360;
    }
    var pitchChange = y - height/2;
    var pitch = e.panorama.pov.pitch - (pitchChange/(height/90));
    return {heading: heading, pitch: pitch}
  }



  function headingPitchToXY(h,p){
    var width = parseInt($('#panoView').css('width'), 10)
    var height = parseInt($('#panoView').css('height'), 10)
    var headingChange = h-panorama.pov.heading;
    var pitchChange = p-panorama.pov.pitch;
    var widthStretch = width/90;
    var heightStretch = height/90;
    var x = widthStretch * headingChange;
    var y = heightStretch * pitchChange;
    return {x:x, y:y}
  }







