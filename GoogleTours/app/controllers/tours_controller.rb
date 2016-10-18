class ToursController < ApplicationController
  def index
    gon.tours = Tour.all
  end

  def create
    blurbs = params[:tour]
    startLng = params[:startLng]
    startLat = params[:startLat]
    Tour.create(blurbs: blurbs, startLng: startLng, startLat: startLat, user_id: current_user.id)
  end

end



# Left to do:
# * Tour Demo
# * Readme
# * Put on Heroku without exploding
# * Resume, Cover letter and profile
