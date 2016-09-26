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
# * Clean up code (at least that giant ass listener at the start) Done(enough)
# * Double check heading wrap around !!! done?
# * Remove unnecessary controls Done
# * Create pop up windows for street view, at least. Try for blurbs as well. Done
# * Prettify and center. DONE
# * If time, whip up demo tour.
