from fastapi import FastAPI
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
cred = credentials.Certificate("service-account.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/v1/helpers/recommend")
async def recommend_helpers(category: str, limit: int = 10):
    helpers_ref = db.collection("helpers").where("category", "==", category).limit(limit)
    docs = helpers_ref.stream()
    
    helpers = []
    for doc in docs:
        data = doc.to_dict()
        # You can add complex Python logic here:
        # e.g., ranking algorithms, distance calculations, AI semantic matching
        helpers.append({"id": doc.id, **data})
            
    return {"status": "success", "data": helpers}
