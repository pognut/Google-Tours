class FixStartCoordNums < ActiveRecord::Migration[5.0]
  def change
    change_table :tours do |t|
      remove_column :tours, :startLng
      remove_column :tours, :startLat
      t.decimal :startLat
      t.decimal :startLng
    end
  end
end
