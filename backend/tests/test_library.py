def test_create_and_get_movie(client, auth_headers):
    headers = {"Authorization": auth_headers["Authorization"]}
    payload = {
        "item_type": "movie",
        "title": "Inception",
        "genre": "Sci-Fi",
        "rating": 5,
        "description": "A thief who steals corporate secrets through dream-sharing technology.",
        "cover_image_url": "https://example.com/inception.jpg",
        "is_favorite": True,
        "personal_notes": "Masterpiece ending.",
        "movie_details": {
            "release_year": 2010,
            "director": "Christopher Nolan",
            "video_url": "https://example.com/inception.mp4"
        }
    }
    create_res = client.post("/api/library-items", json=payload, headers=headers)
    assert create_res.status_code == 201
    item = create_res.json()
    assert item["title"] == "Inception"
    assert item["item_type"] == "movie"
    assert item["movie_details"]["director"] == "Christopher Nolan"
    assert item["movie_details"]["release_year"] == 2010
    assert item["movie_details"]["video_url"] == "https://example.com/inception.mp4"

    # Retrieve single item
    get_res = client.get(f"/api/library-items/{item['id']}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == item["id"]
    assert get_res.json()["movie_details"]["video_url"] == "https://example.com/inception.mp4"



def test_create_and_update_book(client, auth_headers):
    headers = {"Authorization": auth_headers["Authorization"]}
    payload = {
        "item_type": "book",
        "title": "Dune",
        "genre": "Sci-Fi",
        "rating": 5,
        "description": "Set on the desert planet Arrakis.",
        "book_details": {
            "author": "Frank Herbert",
            "publication_year": 1965,
            "reading_status": "currently_reading",
            "current_page": 50,
            "total_pages": 412
        }
    }
    create_res = client.post("/api/library-items", json=payload, headers=headers)
    assert create_res.status_code == 201
    book_id = create_res.json()["id"]

    # Update reading progress
    patch_res = client.patch(f"/api/library-items/{book_id}/reading-progress", json={
        "current_page": 120,
        "reading_status": "currently_reading"
    }, headers=headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["book_details"]["current_page"] == 120

    # Update book details
    update_res = client.put(f"/api/library-items/{book_id}", json={
        "rating": 4,
        "personal_notes": "Epic worldbuilding.",
        "book_details": {
            "current_page": 200
        }
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["rating"] == 4
    assert update_res.json()["personal_notes"] == "Epic worldbuilding."


def test_pagination_and_filtering(client, auth_headers):
    headers = {"Authorization": auth_headers["Authorization"]}
    # Add multiple items
    for i in range(15):
        client.post("/api/library-items", json={
            "item_type": "movie" if i % 2 == 0 else "book",
            "title": f"Item Number {i:02d}",
            "genre": "Drama" if i % 3 == 0 else "Action",
            "rating": 3 + (i % 3),
            "movie_details": {"release_year": 2000 + i} if i % 2 == 0 else None,
            "book_details": {"author": f"Author {i}", "publication_year": 1990 + i} if i % 2 != 0 else None
        }, headers=headers)

    # Test page 1 with default page_size 12
    res_p1 = client.get("/api/library-items?page=1&page_size=12", headers=headers)
    assert res_p1.status_code == 200
    data_p1 = res_p1.json()
    assert len(data_p1["items"]) == 12
    assert data_p1["page"] == 1
    assert data_p1["has_next"] is True
    assert data_p1["has_prev"] is False

    # Test page 2
    res_p2 = client.get("/api/library-items?page=2&page_size=12", headers=headers)
    assert res_p2.status_code == 200
    data_p2 = res_p2.json()
    assert data_p2["page"] == 2
    assert data_p2["has_prev"] is True

    # Test search filter
    search_res = client.get("/api/library-items?search=Number 05", headers=headers)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert any("05" in it["title"] for it in search_data["items"])


def test_user_data_isolation(client, auth_headers, auth_headers_user2):
    """
    CRITICAL SECURITY TEST:
    Verify that User 2 CANNOT read, edit, or delete User 1's library records.
    """
    headers1 = {"Authorization": auth_headers["Authorization"]}
    headers2 = {"Authorization": auth_headers_user2["Authorization"]}

    # User 1 creates a private movie
    create_res = client.post("/api/library-items", json={
        "item_type": "movie",
        "title": "User 1 Secret Movie",
        "genre": "Mystery",
        "rating": 5,
        "personal_notes": "Extremely private notes."
    }, headers=headers1)
    assert create_res.status_code == 201
    item_id = create_res.json()["id"]

    # User 2 tries to GET the item -> must be 404
    get_res = client.get(f"/api/library-items/{item_id}", headers=headers2)
    assert get_res.status_code == 404

    # User 2 tries to UPDATE the item -> must be 404
    update_res = client.put(f"/api/library-items/{item_id}", json={
        "title": "Hacked Title"
    }, headers=headers2)
    assert update_res.status_code == 404

    # User 2 tries to DELETE the item -> must be 404
    delete_res = client.delete(f"/api/library-items/{item_id}", headers=headers2)
    assert delete_res.status_code == 404

    # Verify item is intact for User 1
    verify_res = client.get(f"/api/library-items/{item_id}", headers=headers1)
    assert verify_res.status_code == 200
    assert verify_res.json()["title"] == "User 1 Secret Movie"
