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
#   * add scroll check
#   * link marker to tour start
#   * add controls/ensure panNum is correct
#   * add blurb div showing/hiding
