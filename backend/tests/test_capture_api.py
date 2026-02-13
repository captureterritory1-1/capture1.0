"""
CAPTURE PWA Backend API Tests
Tests for user management, territories, profile pictures, and image proxy
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://polygame.preview.emergentagent.com')

class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_check(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print("✅ Health check passed")


class TestUserEndpoints:
    """User CRUD endpoint tests"""
    
    def test_create_user(self):
        """Test creating a new user"""
        payload = {
            "email": "TEST_user@capture.app",
            "display_name": "Test User"
        }
        response = requests.post(f"{BASE_URL}/api/users", json=payload)
        # May return 400 if user already exists
        assert response.status_code in [200, 201, 400]
        if response.status_code in [200, 201]:
            data = response.json()
            assert "id" in data
            assert data["email"] == payload["email"]
            print(f"✅ User created: {data['id']}")
        else:
            print("✅ User already exists (expected)")
    
    def test_get_user_not_found(self):
        """Test getting a non-existent user returns 404"""
        response = requests.get(f"{BASE_URL}/api/users/nonexistent_user_id")
        assert response.status_code == 404
        print("✅ Non-existent user returns 404")


class TestTerritoryEndpoints:
    """Territory CRUD endpoint tests"""
    
    def test_get_territories(self):
        """Test getting all territories"""
        response = requests.get(f"{BASE_URL}/api/territories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Got {len(data)} territories")
    
    def test_create_territory(self):
        """Test creating a new territory"""
        payload = {
            "user_id": "TEST_user_123",
            "name": "TEST_Territory_1",
            "coordinates": [[77.638, 12.975], [77.642, 12.975], [77.642, 12.972], [77.638, 12.972], [77.638, 12.975]],
            "color": "#EF4444",
            "distance": 1.5,
            "duration": 600
        }
        response = requests.post(f"{BASE_URL}/api/territories", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        assert data["user_id"] == payload["user_id"]
        print(f"✅ Territory created: {data['id']}")
        return data["id"]
    
    def test_get_territory_by_id(self):
        """Test getting a specific territory"""
        # First create a territory
        payload = {
            "user_id": "TEST_user_456",
            "name": "TEST_Territory_Get",
            "coordinates": [[77.638, 12.975], [77.642, 12.975], [77.642, 12.972], [77.638, 12.972], [77.638, 12.975]],
            "color": "#3B82F6",
            "distance": 2.0,
            "duration": 900
        }
        create_response = requests.post(f"{BASE_URL}/api/territories", json=payload)
        assert create_response.status_code == 200
        territory_id = create_response.json()["id"]
        
        # Then get it
        get_response = requests.get(f"{BASE_URL}/api/territories/{territory_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["id"] == territory_id
        assert data["name"] == payload["name"]
        print(f"✅ Got territory: {territory_id}")
    
    def test_delete_territory(self):
        """Test deleting a territory"""
        # First create a territory
        payload = {
            "user_id": "TEST_user_789",
            "name": "TEST_Territory_Delete",
            "coordinates": [[77.638, 12.975], [77.642, 12.975], [77.642, 12.972], [77.638, 12.972], [77.638, 12.975]],
            "color": "#22C55E",
            "distance": 1.0,
            "duration": 300
        }
        create_response = requests.post(f"{BASE_URL}/api/territories", json=payload)
        assert create_response.status_code == 200
        territory_id = create_response.json()["id"]
        
        # Then delete it
        delete_response = requests.delete(f"{BASE_URL}/api/territories/{territory_id}")
        assert delete_response.status_code == 200
        
        # Verify it's deleted
        get_response = requests.get(f"{BASE_URL}/api/territories/{territory_id}")
        assert get_response.status_code == 404
        print(f"✅ Territory deleted: {territory_id}")


class TestTerritoryClaimEndpoint:
    """Territory claim/over-capture endpoint tests"""
    
    def test_claim_territory(self):
        """Test claiming/over-capturing an existing territory"""
        # First create a territory to claim
        payload = {
            "user_id": "TEST_original_owner",
            "name": "TEST_Territory_ToClaim",
            "coordinates": [[77.638, 12.975], [77.642, 12.975], [77.642, 12.972], [77.638, 12.972], [77.638, 12.975]],
            "color": "#EF4444",
            "distance": 1.5,
            "duration": 600
        }
        create_response = requests.post(f"{BASE_URL}/api/territories", json=payload)
        assert create_response.status_code == 200
        territory_id = create_response.json()["id"]
        print(f"Created territory to claim: {territory_id}")
        
        # Now claim it with a new owner
        claim_payload = {
            "new_owner_id": "TEST_new_owner",
            "new_color": "#3B82F6"
        }
        claim_response = requests.put(f"{BASE_URL}/api/territories/{territory_id}/claim", json=claim_payload)
        assert claim_response.status_code == 200
        claim_data = claim_response.json()
        assert claim_data["success"] == True
        print(f"✅ Territory claimed successfully")
        
        # Verify the territory was updated
        get_response = requests.get(f"{BASE_URL}/api/territories/{territory_id}")
        assert get_response.status_code == 200
        updated_territory = get_response.json()
        assert updated_territory["user_id"] == "TEST_new_owner"
        assert updated_territory["color"] == "#3B82F6"
        print(f"✅ Territory ownership verified: {updated_territory['user_id']}")
        
        # Clean up
        requests.delete(f"{BASE_URL}/api/territories/{territory_id}")
    
    def test_claim_nonexistent_territory(self):
        """Test claiming a non-existent territory returns 404"""
        claim_payload = {
            "new_owner_id": "TEST_new_owner",
            "new_color": "#3B82F6"
        }
        response = requests.put(f"{BASE_URL}/api/territories/nonexistent_id/claim", json=claim_payload)
        assert response.status_code == 404
        print("✅ Non-existent territory claim returns 404")


class TestBrandTerritoryEndpoints:
    """Brand territory endpoint tests"""
    
    def test_get_brand_territories(self):
        """Test getting brand/sponsored territories"""
        response = requests.get(f"{BASE_URL}/api/brand-territories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # Should have at least 3 MuscleBlaze territories
        
        # Verify structure
        for territory in data:
            assert "id" in territory
            assert "name" in territory
            assert "brand" in territory
            assert "color" in territory
            assert "coordinates" in territory
            assert territory["is_sponsored"] == True
        
        print(f"✅ Got {len(data)} brand territories")


class TestImageProxyEndpoint:
    """Image proxy endpoint tests for CORS bypass"""
    
    def test_proxy_image_muscleblaze(self):
        """Test proxying MuscleBlaze logo"""
        logo_url = "https://customer-assets.emergentagent.com/job_area-claim/artifacts/hdwrq9jx_images-2.png"
        response = requests.get(f"{BASE_URL}/api/proxy-image", params={"url": logo_url})
        assert response.status_code == 200
        assert "image" in response.headers.get("content-type", "")
        print("✅ MuscleBlaze logo proxied successfully")
    
    def test_proxy_image_superyou(self):
        """Test proxying Super You logo"""
        logo_url = "https://customer-assets.emergentagent.com/job_area-claim/artifacts/qderkt0t_channels4_profile.jpg"
        response = requests.get(f"{BASE_URL}/api/proxy-image", params={"url": logo_url})
        assert response.status_code == 200
        assert "image" in response.headers.get("content-type", "")
        print("✅ Super You logo proxied successfully")
    
    def test_proxy_image_thewholetruth(self):
        """Test proxying The Whole Truth logo"""
        logo_url = "https://customer-assets.emergentagent.com/job_area-claim/artifacts/en3r28t5_images-4.png"
        response = requests.get(f"{BASE_URL}/api/proxy-image", params={"url": logo_url})
        assert response.status_code == 200
        assert "image" in response.headers.get("content-type", "")
        print("✅ The Whole Truth logo proxied successfully")
    
    def test_proxy_image_invalid_domain(self):
        """Test that invalid domains are rejected"""
        invalid_url = "https://evil-domain.com/malicious.png"
        response = requests.get(f"{BASE_URL}/api/proxy-image", params={"url": invalid_url})
        assert response.status_code == 400
        print("✅ Invalid domain correctly rejected")


class TestProfilePictureEndpoints:
    """Profile picture upload/download endpoint tests"""
    
    def test_get_profile_picture_not_found(self):
        """Test getting profile picture for user without one"""
        response = requests.get(f"{BASE_URL}/api/profile-picture/nonexistent_user")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == False
        assert data["url"] is None
        print("✅ Non-existent profile picture returns success=False")
    
    def test_upload_and_get_profile_picture(self):
        """Test uploading and retrieving a profile picture"""
        user_id = "TEST_profile_user"
        
        # Create a simple 1x1 red PNG image
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        )
        
        files = {"file": ("test.png", png_data, "image/png")}
        upload_response = requests.post(f"{BASE_URL}/api/profile-picture/{user_id}", files=files)
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        assert upload_data["success"] == True
        assert "url" in upload_data
        print(f"✅ Profile picture uploaded for {user_id}")
        
        # Get the profile picture
        get_response = requests.get(f"{BASE_URL}/api/profile-picture/{user_id}")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["success"] == True
        assert get_data["url"] is not None
        print(f"✅ Profile picture retrieved for {user_id}")
        
        # Clean up - delete the profile picture
        delete_response = requests.delete(f"{BASE_URL}/api/profile-picture/{user_id}")
        assert delete_response.status_code == 200
        print(f"✅ Profile picture deleted for {user_id}")


class TestLeaderboardEndpoint:
    """Leaderboard endpoint tests"""
    
    def test_get_leaderboard(self):
        """Test getting the leaderboard"""
        response = requests.get(f"{BASE_URL}/api/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Got leaderboard with {len(data)} entries")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
