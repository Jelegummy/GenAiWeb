import os
from dotenv import load_dotenv

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
TYPHOON_KEY = os.getenv("TYPHOON_KEY")
WEATHER_KEY = os.getenv("WEATHER_KEY")
