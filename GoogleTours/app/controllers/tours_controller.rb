class ToursController < ApplicationController
  def index
    @tours = Tour.all
  end

  def create
    data = params[:tour]
    Tour.create(image: data, user_id: current_user.id)
  end
end
