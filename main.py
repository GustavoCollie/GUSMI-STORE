from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "alive", "cwd": os.getcwd()}

@app.get("/")
def root():
    return {"message": "Hello Codebase!"}
