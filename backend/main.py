from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.workflow import router as workflow_router

app = FastAPI(title="PenTest Tool API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workflow_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "running"}