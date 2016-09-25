class ChangeTourBlurbsToJson < ActiveRecord::Migration[5.0]
  def change
    change_table :tours do |t|
      remove_column :tours, :blurbs
      t.json :blurbs
    end
  end
end
