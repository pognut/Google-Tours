class ChangeBlurbsBackToJson < ActiveRecord::Migration[5.0]
  def change
    change_table :tours do |t|
      remove_column :tours, :blurbs
      t.jsonb :blurbs
    end
  end
end
