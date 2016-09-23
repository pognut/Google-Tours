class RemoveImageFromTours < ActiveRecord::Migration[5.0]
  def change
    remove_column :tours, :image
  end
end
