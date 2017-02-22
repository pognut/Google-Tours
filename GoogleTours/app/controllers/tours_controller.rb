class ToursController < ApplicationController
  def index
    gon.tours = Tour.all
  end

  def create
    blurbs = params[:tour]
    startLng = params[:startLng]
    startLat = params[:startLat]
    # preview = params[:preview]
    Tour.create(blurbs: blurbs, startLng: startLng, startLat: startLat, user_id: 1, tourID: "N/A", preview: "N/A")
  end

  def populate
    bounds = JSON.parse(params[:bounds])
    # pluck tour.all.startlat/lng where startlat/lng is in bounds limit i dunno 10
    test = Tour.where(startLat: bounds['south']..bounds['north'],startLng: bounds['west']..bounds['east']).limit(10).pluck(:startLng, :startLat, :id, :preview)

    render :json => test
  end

  def content
    id = params[:id]
    #use for call when content needed
    blurbs = Tour.where(id: id).pluck(:blurbs)
    render :json => blurbs
  end
end



# Left to do:
# * Tour Demo
# * Readme
# * Put on Heroku without exploding
# * Resume, Cover letter and profile
