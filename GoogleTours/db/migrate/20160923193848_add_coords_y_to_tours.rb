class AddCoordsYToTours < ActiveRecord::Migration[5.0]
  def change
    change_table :tours do |t|
      t.integer :startLng
      t.integer :startLat
      remove_column :tours, :images
      remove_column :tours, :coords
    end
  end
end

