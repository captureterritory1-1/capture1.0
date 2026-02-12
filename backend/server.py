from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="CAPTURE API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ========================
# Models
# ========================

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# User Models
class UserPreferences(BaseModel):
    unit: str = "km"  # km or miles
    activity_type: str = "run"  # run or walk
    territory_color: str = "#EF4444"  # hex color

class UserCreate(BaseModel):
    email: str
    display_name: str
    preferences: Optional[UserPreferences] = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    display_name: str
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Territory Models
class Coordinate(BaseModel):
    lng: float
    lat: float

class TerritoryCreate(BaseModel):
    user_id: str
    name: str
    coordinates: List[List[float]]  # [[lng, lat], ...]
    color: str
    distance: float  # in km
    duration: int  # in seconds

class Territory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    coordinates: List[List[float]]
    color: str
    area: float  # in sq km
    distance: float
    duration: int
    is_sponsored: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Brand Territory Model (for sponsored zones)
class BrandTerritory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    brand: str
    color: str
    coordinates: List[List[float]]
    area: float
    is_sponsored: bool = True


# ========================
# Routes
# ========================

@api_router.get("/")
async def root():
    return {"message": "Welcome to CAPTURE API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Status routes (existing)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ========================
# User Routes
# ========================

@api_router.post("/users", response_model=User)
async def create_user(input: UserCreate):
    """Create a new user"""
    # Check if user already exists
    existing = await db.users.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user_obj = User(
        email=input.email,
        display_name=input.display_name,
        preferences=input.preferences or UserPreferences()
    )
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get a user by ID"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return user

@api_router.put("/users/{user_id}/preferences")
async def update_user_preferences(user_id: str, preferences: UserPreferences):
    """Update user preferences"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"preferences": preferences.model_dump()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Preferences updated successfully"}


# ========================
# Territory Routes
# ========================

@api_router.post("/territories", response_model=Territory)
async def create_territory(input: TerritoryCreate):
    """Create a new territory from a completed run"""
    # Calculate area (simplified - in real app, use turf.js on backend or accept from frontend)
    # This is a placeholder - actual area should be calculated from coordinates
    area = 0.0001  # Default small area
    
    territory = Territory(
        user_id=input.user_id,
        name=input.name,
        coordinates=input.coordinates,
        color=input.color,
        area=area,
        distance=input.distance,
        duration=input.duration,
    )
    
    doc = territory.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.territories.insert_one(doc)
    return territory

@api_router.get("/territories", response_model=List[Territory])
async def get_territories(user_id: Optional[str] = None):
    """Get all territories, optionally filtered by user"""
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    territories = await db.territories.find(query, {"_id": 0}).to_list(1000)
    
    for t in territories:
        if isinstance(t['created_at'], str):
            t['created_at'] = datetime.fromisoformat(t['created_at'])
    
    return territories

@api_router.get("/territories/{territory_id}", response_model=Territory)
async def get_territory(territory_id: str):
    """Get a specific territory"""
    territory = await db.territories.find_one({"id": territory_id}, {"_id": 0})
    if not territory:
        raise HTTPException(status_code=404, detail="Territory not found")
    
    if isinstance(territory['created_at'], str):
        territory['created_at'] = datetime.fromisoformat(territory['created_at'])
    
    return territory

@api_router.delete("/territories/{territory_id}")
async def delete_territory(territory_id: str):
    """Delete a territory"""
    result = await db.territories.delete_one({"id": territory_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Territory not found")
    
    return {"message": "Territory deleted successfully"}


# ========================
# Brand Territories Routes
# ========================

@api_router.get("/brand-territories", response_model=List[BrandTerritory])
async def get_brand_territories():
    """Get all brand/sponsored territories (hardcoded for now)"""
    # Hardcoded MuscleBlaze territories in Bangalore
    brand_territories = [
        BrandTerritory(
            id="brand_muscleblaze_1",
            name="MuscleBlaze Zone - Indiranagar",
            brand="MuscleBlaze",
            color="#FFD700",
            coordinates=[
                [77.6390, 12.9780],
                [77.6420, 12.9810],
                [77.6450, 12.9790],
                [77.6440, 12.9750],
                [77.6400, 12.9740],
                [77.6390, 12.9780],
            ],
            area=0.15,
        ),
        BrandTerritory(
            id="brand_muscleblaze_2",
            name="MuscleBlaze Zone - Koramangala",
            brand="MuscleBlaze",
            color="#FFD700",
            coordinates=[
                [77.6150, 12.9340],
                [77.6190, 12.9370],
                [77.6230, 12.9350],
                [77.6220, 12.9310],
                [77.6170, 12.9300],
                [77.6150, 12.9340],
            ],
            area=0.18,
        ),
        BrandTerritory(
            id="brand_muscleblaze_3",
            name="MuscleBlaze Zone - HSR Layout",
            brand="MuscleBlaze",
            color="#FFD700",
            coordinates=[
                [77.6400, 12.9120],
                [77.6440, 12.9150],
                [77.6480, 12.9130],
                [77.6470, 12.9090],
                [77.6420, 12.9080],
                [77.6400, 12.9120],
            ],
            area=0.16,
        ),
    ]
    return brand_territories


# ========================
# Leaderboard Routes
# ========================

@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Get top users by territory count"""
    # Aggregate user stats from territories
    pipeline = [
        {"$group": {
            "_id": "$user_id",
            "territory_count": {"$sum": 1},
            "total_area": {"$sum": "$area"},
            "total_distance": {"$sum": "$distance"},
        }},
        {"$sort": {"territory_count": -1}},
        {"$limit": limit}
    ]
    
    results = await db.territories.aggregate(pipeline).to_list(limit)
    
    # Enrich with user data
    leaderboard = []
    for i, result in enumerate(results):
        user = await db.users.find_one({"id": result["_id"]}, {"_id": 0})
        if user:
            leaderboard.append({
                "rank": i + 1,
                "user_id": result["_id"],
                "display_name": user.get("display_name", "Unknown"),
                "color": user.get("preferences", {}).get("territory_color", "#EF4444"),
                "territories": result["territory_count"],
                "total_area": round(result["total_area"], 4),
                "total_distance": round(result["total_distance"], 2),
                "points": result["territory_count"] * 100,
            })
    
    return leaderboard


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
