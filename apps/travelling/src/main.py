from fastapi import FastAPI
from pydantic import BaseModel
from agent import travel_agent_graph

app = FastAPI()

class TripRequest(BaseModel):
    question: str
    
class TripResponse(BaseModel):
    city: str
    travel_dates: str
    preferences: str
    plan: str
    # final: str
    
@app.post('/ai/planning')
async def generate_trip(args: TripRequest):
    result = await travel_agent_graph.ainvoke({"question": args.question})
    
    return TripResponse(
        city=result.get("city", ""),
        travel_dates=result.get("travel_dates", ""),
        preferences=result.get("preferences", ""),
        plan=result.get("final", "") 
    )
    