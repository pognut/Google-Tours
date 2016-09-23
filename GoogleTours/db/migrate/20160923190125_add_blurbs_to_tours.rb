class AddBlurbsToTours < ActiveRecord::Migration[5.0]
  def change
    change_table :tours do |t|
      t.string :blurbs
      t.string :coords
    end
  end
end
