class ToursController < ApplicationController
  def index
    gon.tours = Tour.all
  end

  def profile
    @test2 = Tour.where("user_id = ?", current_user.id)

    render 'profile'
  end

  def create
    blurbs = params[:tour]
    startLng = params[:startLng]
    startLat = params[:startLat]
    preview = params[:preview]
    userID = params[:id]
    id = SecureRandom.base58(24)
    # preview = params[:preview]
    Tour.create(blurbs: blurbs, startLng: startLng, startLat: startLat, user_id: userID, preview: preview, tourID: id)
  end

  def populate
    bounds = JSON.parse(params[:bounds])
    # pluck tour.all.startlat/lng where startlat/lng is in bounds limit i dunno 10
    test = Tour.joins(:user).where(startLat: bounds['south']..bounds['north'],startLng: bounds['west']..bounds['east']).limit(10).pluck(:startLng, :startLat, :id, :preview, :email)
    # figure out the best way to get associated email for each tour
    render :json => test
  end

  def content
    id = params[:id]
    #use for call when content needed
    blurbs = Tour.where(id: id).pluck(:blurbs)
    render :json => blurbs
  end

  def is_signed_in?
    if user_signed_in?
      render :json => {"signed_in" => true, "user" => current_user}.to_json()
      print current_user.to_json()
    else
      render :json => {"signed_in" => false}.to_json()
    end

  end

end


