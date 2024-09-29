defmodule Chirp.Timeline.Post do
  use Ecto.Schema
  import Ecto.Changeset

  schema "posts" do
    field :body, :string
    field :username, :string, default: "test"
    field :likes_count, :integer, default: 0
    field :repost_count, :integer, default: 0

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(post, attrs) do
    post
    |> cast(attrs, [ :body, :username])
    |> validate_required([:body])
    |> validate_length(:body, min: 2, max: 250)
  end
end
