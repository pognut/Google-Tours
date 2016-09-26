class ToursController < ApplicationController
  def index
    @tours = Tour.all
  end

  def create
    blurbs = params[:tour]
    startLng = params[:startLng]
    startLat = params[:startLat]
    Tour.create(blurbs: blurbs, startLng: startLng, startLat: startLat, user_id: current_user.id)
  end
end

# Left to do:
# * Clean up code (at least that giant ass listener at the start)
# * Double check heading wrap around
# * Remove unnecessary controls
# * Create pop up windows for street view, at least. Try for blurbs as well.
# * Prettify and center.
# * If time, whip up demo tour.
