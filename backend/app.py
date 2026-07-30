from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models
from routes.auth import router as auth_router
from routes.project import router as project_router
from routes.resource import router as resource_router
from routes.inventory import router as inventory_router
from routes.workforce import router as workforce_router
from routes.procurement import router as procurement_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BuildTrack Backend",
    version="1.0.0"
)

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:3000",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(project_router)
app.include_router(resource_router)
app.include_router(inventory_router)
app.include_router(workforce_router)
app.include_router(procurement_router)


@app.get("/")
def home():
    return {
        "message": "BuildTrack Backend Running"
    }