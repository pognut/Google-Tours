var Panorama = React.createClass({

  componentDidMount: function(){
    // ReactModal.setAppElement('testPano')
    console.log(this.props)
    if(this.props.isCreating===true){
      console.log('setting pano for create')
      this.props.setPano()
    }
    if(this.props.isViewing===true){
      console.log('setting pano for view')
      this.props.setPano()
    }

  },

  componentWillUnmount: function(){
    if(this.props.isCreating===false){
      google.maps.event.clearListeners(this.props.mapProp, 'click');
    }
  },

  addBlurbButton: function(){
    var xyToHeadingPitch = this.xyToHeadingPitch
    this.props.panoProp.setOptions({clickToGo:false, scrollwheel:false})
    $('#testPano').one('click', function(e){
      xyToHeadingPitch(e)
    })
    var povtest = this.props.panoProp.getPov()
  },

  get3dFov: function(zoom) {
  return zoom <= 2 ?
      126.5 - zoom * 36.75 :  // linear descent
      195.93 / Math.pow(1.92, zoom); // parameters determined experimentally
  },

  xyToHeadingPitch: function(e){
      var w = $('#testPano').width();
      var h = $('#testPano').height();
      var hp = this.props.panoProp.getPov()
      var x = e.offsetX;
      var y = e.offsetY;

      var x0 = w / 2;
      var y0 = h / 2;

      var dx = x - x0;
      var dy = y0 - y;
      var zoom = this.props.panoProp.getZoom()
      //sometimes undefined, why? seems to be if pano hasn't moved
      var fov = this.get3dFov(zoom)
      var fov_x = fov * Math.PI / 180.0;
      var fov_y = 2 * Math.atan( h * Math.tan( fov_x / 2 ) / w );

      var dtheta_x = Math.atan( 2 * dx * Math.tan( fov_x / 2 ) / w );
      var dtheta_y = Math.atan( 2 * dy * Math.tan( fov_y / 2 ) / h );

      var theta_x0 = hp.heading * Math.PI / 180.0;
      var theta_y0 = hp.pitch * Math.PI / 180.0;

      var theta_x = theta_x0 + dtheta_x;
      var theta_y = theta_y0 + dtheta_y;

      var newHead = 180.0 * theta_x / Math.PI;
      var newPitch = 180.0 * theta_y / Math.PI;

      // this.props.panoProp.setOptions({clickToGo:true, scrollwheel:true})
      this.props.addBlurb(newHead, newPitch, x, y)
  },

  povToPixel3d: function(targetPov) {
    var zoom = this.props.panoProp.getZoom()
    var currentPov = this.props.panoProp.getPov()
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


  render: function() {
    // var blurbArray;
    // this.props.blurbs.forEach(function(val){
    //   if(val.panNum===this.props.panNum){
    //     //make a <Blurb /> component here
    //     blurbArray.push(val)
    //   }
    // })
    // this.props.changeVisibleBlurbs(blurbArray)
    // if(this.props.blurbs==undefined||[]||null){
    //   var blurbs
    // }
    // else{
    //  var blurbs=this.props.blurbs.map((blurb)=>
    //     <Blurb panNum={blurb.panNum} panoID={blurb.panoID} key={blurb.panoID} text={blurb.text} anchor={this.povToPixel3d(blurb.anchor)}/>
    //   )
    // }
    if(this.props.isCreating){
      //instead of if/else, have button appearance be state based somehow, so that individual buttons
      //can be toggled on and off
      var buttons =  [<button onClick={this.addBlurbButton}>Add a blurb</button>, <button onClick={this.props.saveTour}>Save Tour</button>]
    }
    return(
      <div id="sigh">
      {buttons}
      <div id="testPano">
        {this.props.blurbs.map((blurb, index)=>
        <Blurb isCreating={this.props.isCreating} isViewing={this.props.isViewing} panNum={blurb.panNum} panoID={blurb.panoID} text={blurb.text} pov={blurb.pov} anchor={blurb.anchor} index={index} editBlurb={this.props.editBlurb}/>
      )}
      </div>
      </div>
      )
  }
});








    // previous attempt at conversion
    // var DEG_TO_RAD = Math.PI / 180.0;
    // var hp = this.props.panoProp.getPov()
    // var h0 = hp.heading * DEG_TO_RAD
    // var p0 = hp.pitch * DEG_TO_RAD
    // var zoom = this.props.panoProp.getZoom()
    // var fov = this.get3dFov(zoom) * DEG_TO_RAD
    // var f = ($('#testPano').width() / 2) / Math.tan(fov / 2)
    // var du = e.offsetX-($('#testPano').width()/2)
    // var dv = ($('#testPano').height()/2)-e.offsetY
    // var x0 = f * Math.cos( p0 ) * Math.sin( h0 )
    // var y0 = f * Math.cos( p0 ) * Math.cos( h0 )
    // var z0 = f * Math.sin( p0 )
    // var vx = -Math.sin( p0 ) * Math.sin ( h0 )
    // var vy = -Math.sin( p0 ) * Math.cos ( h0 )
    // var vz =  Math.cos( p0 )
    // var ux =  ( Math.cos ( p0 ) ) * Math.cos(h0);
    // var uy = -( Math.cos ( p0 ) ) * Math.sin(h0);
    // var uz = 0
    // var x = x0 + du * ux + dv * vx
    // var y = y0 + du * uy + dv * vy
    // var z = z0 + du * uz + dv * vz
    // var R = Math.sqrt( x * x + y * y + z * z )
    // var h = Math.atan2( x, y )
    // var p = Math.asin( z / R )
    // debugger;
    // console.log(h, p)
    // this.props.panoProp.setPov({heading:h, pitch:p})
