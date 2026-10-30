def test_dashboard_stats(client, auth_headers):
    headers = {"Authorization": auth_headers["Authorization"]}

    res = client.get("/api/dashboard/stats", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_movies" in data
    assert "total_books" in data
    assert "avg_movie_rating" in data
    assert "avg_book_rating" in data
    assert "recent_items" in data
    assert "favorite_items" in data
    assert "currently_reading" in data
    assert isinstance(data["total_movies"], int)
    assert isinstance(data["total_books"], int)
