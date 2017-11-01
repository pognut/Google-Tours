Rails.application.routes.draw do
  devise_for :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root to: "tours#index"
  resources :tours
  get '/populate', to: 'tours#populate'
  get '/content', to: 'tours#content'
  get '/is_signed_in', to: 'tours#is_signed_in?'
  get '/profile', to: 'tours#profile'
end
