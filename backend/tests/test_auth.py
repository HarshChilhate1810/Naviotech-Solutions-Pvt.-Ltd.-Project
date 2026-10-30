def test_register_success(client):
    res = client.post("/api/auth/register", json={
        "name": "Alice Wonderland",
        "email": "alice@example.com",
        "password": "SecurePassword999!"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["name"] == "Alice Wonderland"
    # Ensure password hash is NOT exposed in response
    assert "password_hash" not in data["user"]
    assert "password" not in data["user"]


def test_register_duplicate_email_fails(client):
    client.post("/api/auth/register", json={
        "name": "Alice Wonderland",
        "email": "alice2@example.com",
        "password": "SecurePassword999!"
    })
    res = client.post("/api/auth/register", json={
        "name": "Alice Duplicate",
        "email": "alice2@example.com",
        "password": "AnotherPassword!"
    })
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]


def test_login_success(client):
    client.post("/api/auth/register", json={
        "name": "Charlie Chaplin",
        "email": "charlie@example.com",
        "password": "Password123!"
    })
    res = client.post("/api/auth/login", json={
        "email": "charlie@example.com",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_invalid_password(client):
    client.post("/api/auth/register", json={
        "name": "David Bowie",
        "email": "david@example.com",
        "password": "Password123!"
    })
    res = client.post("/api/auth/login", json={
        "email": "david@example.com",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert "Incorrect email or password" in res.json()["detail"]


def test_refresh_token_rotation(client):
    reg = client.post("/api/auth/register", json={
        "name": "Eva Green",
        "email": "eva@example.com",
        "password": "Password123!"
    })
    old_refresh = reg.json()["refresh_token"]

    ref_res = client.post("/api/auth/refresh", json={"refresh_token": old_refresh})
    assert ref_res.status_code == 200
    new_data = ref_res.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data
    assert new_data["refresh_token"] != old_refresh

    # Using the old refresh token a second time should fail due to token rotation
    ref_res_2 = client.post("/api/auth/refresh", json={"refresh_token": old_refresh})
    assert ref_res_2.status_code == 401


def test_get_me_unauthorized(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
