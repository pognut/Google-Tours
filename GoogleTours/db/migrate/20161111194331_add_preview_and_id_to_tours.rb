class AddPreviewAndIdToTours < ActiveRecord::Migration[5.0]
  def change
    change_table :tours do |t|
      t.string :preview
      t.string :tourID
    end
  end
end
