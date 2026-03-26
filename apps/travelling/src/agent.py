import json
import requests
from datetime import datetime
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.utilities import OpenWeatherMapAPIWrapper
from typing import TypedDict
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, START
from langgraph.graph.message import add_messages
from typing import Annotated
from setup import TYPHOON_KEY
from setup import WEATHER_KEY


llm = ChatOpenAI(
    base_url="https://api.opentyphoon.ai/v1",
    api_key=TYPHOON_KEY,
    model='typhoon-v2.5-30b-a3b-instruct',
    temperature=0.5,
    max_tokens=20000,
    streaming=True
)

weather = OpenWeatherMapAPIWrapper(
    openweathermap_api_key=WEATHER_KEY
)

class State(TypedDict):
    weather: str
    messages: Annotated[list, add_messages]
    city: str
    preferences: str
    travel_dates: str
    budget: str
    hotels: str
    final: str
    search: str


def extract_node(state: State):
    chat_history = ""
    for msg in state["messages"]:
        if hasattr(msg, "type"):
            role = "User" if msg.type in ["human", "user"] else "AI"
            content = msg.content
        else:
            role = "User" if msg.get("role") == "user" else "AI"
            content = msg.get("content", "")
            
        chat_history += f"{role}: {content}\n"

    prompt = f"""
        วิเคราะห์ "ประวัติการสนทนาล่าสุด" เพื่อสกัดหรืออัปเดตข้อมูลการท่องเที่ยวเป็น JSON Format

        [ประวัติการสนทนา]:
        {chat_history}

        กฎ: 
        1. สกัดชื่อเมือง จังหวัด หรือสถานที่หลักออกมา (ถ้า User สั่งเปลี่ยนเมือง ให้ยึดเมืองล่าสุด)
        2. แปลงชื่อเมืองนั้นเป็น "ภาษาอังกฤษ" ให้ถูกต้อง (เช่น "เขาใหญ่" -> "Khao Yai")
        3. สกัดสไตล์การเที่ยว (เช่น คาเฟ่, ทะเล) ถ้าไม่มีหรือไม่ได้พูดถึง ให้คงค่าเดิมไว้ หรือใส่ "ทั่วไป"
        4. สกัด "งบประมาณ" (เช่น ประหยัด, ปานกลาง) ถ้าไม่ระบุ ให้คงค่าเดิมไว้ หรือใส่ "ทั่วไป"

        ตัวอย่าง JSON Format ที่ต้องการ:
        {{
            "city": "ชื่อเมืองภาษาอังกฤษ",
            "preferences": "สไตล์การเที่ยว",
            "travel_dates": "วันที่เดินทาง เช่น 3-6 มีนาคม",
            "budget": "งบประมาณ"
        }}
        ตอบเฉพาะ JSON เท่านั้น ห้ามมีคำอธิบายอื่น
    """

    response = llm.invoke(prompt).content.strip()

    try:
        if response.startswith("```json"):
            response = response[7:-3].strip()
        elif response.startswith("```"):
            response = response[3:-3].strip()

        data = json.loads(response)
        city = data.get("city", "")
        prefs = data.get("preferences", "ทั่วไป")
        dates = data.get("travel_dates", "ไม่ระบุ")
        budget = data.get("budget", "ทั่วไป")
    except json.JSONDecodeError:
        city = response
        prefs = "ทั่วไป"
        dates = "ไม่ระบุ"
        budget = "ทั่วไป"

    return {"city": city, "preferences": prefs, "travel_dates": dates, "budget": budget}


def search_node(state: State):
    search = TavilySearchResults(max_results=3)
    query = f"สถานที่ท่องเที่ยว {state.get('city', '')} สไตล์ {state.get('preferences', '')}"
    docs = search.invoke({"query": query})

    return {"search": str(docs)}

def hotels_node(state: State):
    search = TavilySearchResults(max_results=3)
    query = f"โรงแรมใน {state.get('city', '')} งบประมาณ {state.get('budget', '')}"
    docs = search.invoke({"query": query})

    return {"hotels": str(docs)}


def weather_node(state: State):
    city = state.get("city")
    if not city:
        return {"weather": "ไม่พบชื่อสถานที่สำหรับตรวจสอบสภาพอากาศ"}

    try:
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={WEATHER_KEY}"
        geo_response = requests.get(geo_url).json()

        if not geo_response or len(geo_response) == 0:
            return {"weather": f"ไม่พบข้อมูลพิกัดสำหรับสถานที่: {city}"}

        lat = geo_response[0]['lat']
        lon = geo_response[0]['lon']
        actual_location_name = geo_response[0].get('name', city)

        weather_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={WEATHER_KEY}&units=metric&lang=th"
        weather_response = requests.get(weather_url).json()

        if weather_response.get("cod") != 200:
            return {"weather": f"Weather error: {weather_response.get('message')}"}

        daily_weather = {}
        for item in weather_response['list']:
            date = item['dt_txt'].split(' ')[0]
            if date not in daily_weather:
                daily_weather[date] = {'temps': [], 'descs': []}
            daily_weather[date]['temps'].append(item['main']['temp'])
            daily_weather[date]['descs'].append(item['weather'][0]['description'])

        summary = f"พยากรณ์อากาศล่วงหน้า 5 วัน (นับจากวันนี้) สำหรับ {actual_location_name}:\n"
        for date, data in daily_weather.items():
            avg_temp = sum(data['temps']) / len(data['temps'])
            desc = max(set(data['descs']), key=data['descs'].count)
            summary += f"- วันที่ {date}: อุณหภูมิเฉลี่ย {avg_temp:.1f}°C, สภาพอากาศ: {desc}\n"

        return {"weather": summary}

    except Exception as e:
        return {"weather": f"System error ในระหว่างดึงข้อมูลสภาพอากาศ: {e}"}
    
def ask_user_node(state: State):
    city = state.get("city", "")
    dates = state.get("travel_dates", "")
    money = state.get("budget", "")
    
    if not city or city == "":
        return {"final": "คุณอยากให้ผมจัดทริปไปเที่ยวที่จังหวัด หรือเมืองไหนดีครับ? 🏙️"}
    
    if dates == "" or not dates:
        return {"final": f"ไป {city} น่าสนุกมากครับ! ไม่ทราบว่าแพลนจะเดินทางช่วงวันที่เท่าไหร่ หรือไปกี่วันดีครับ? 🗓️"}
    
    if money == "" or not money:
        return {"final": f"ไป {city} น่าสนุกมากครับ! ไม่ทราบว่างบประมาณคร่าวๆ ต่อคนอยู่ที่เท่าไหร่ครับ? 💰"}

    return {"final": "ขอข้อมูลเพิ่มเติมอีกนิดนะครับ เพื่อให้จัดทริปได้ถูกใจที่สุด"}

def check_required_info(state: State):
    city = state.get("city", "")
    dates = state.get("travel_dates", "")
    money = state.get("budget", "")
    
    if (city and city != "") and (dates and dates != "") and (money and money != ""):
        return "continue"
    else:
        return "ask_user"


def combine_node(state: State):
    latest_user_message = ""
    for msg in reversed(state["messages"]):
        if hasattr(msg, "type"):
            if msg.type in ["human", "user"]:
                latest_user_message = msg.content
                break
        else:
            if msg.get("role") == "user":
                latest_user_message = msg.get("content", "")
                break
    
    today_date = datetime.now().strftime("%Y-%m-%d")

    prompt = f"""
        คุณคือสุดยอดผู้ช่วยวางแผนการท่องเที่ยว (Dynamic Travel Planner) ที่จัดทริปได้น่าตื่นตาตื่นใจ
        หน้าที่ของคุณคือจัดทริปโดยอิงจาก "วันที่เดินทาง", "สภาพอากาศล่วงหน้า" และ "สถานที่จากระบบ" 

        ⚠️ ข้อมูลสำคัญ (อ้างอิงตามนี้เสมอ):
        - [วันที่ปัจจุบันของระบบ (Today)]: {today_date} (ใช้เป็นเกณฑ์นับว่าพยากรณ์อากาศถึงวันเดินทางหรือไม่)
        - ภาษาที่ใช้ตอบ: ภาษาไทยเท่านั้น (THAI LANGUAGE ONLY) ห้ามใช้ภาษาจีนเด็ดขาด

        [ความต้องการล่าสุดของผู้ใช้]: {latest_user_message}
        [วันที่ต้องการเดินทาง]: {state.get('travel_dates')}
        [สไตล์การเที่ยว]: {state.get('preferences')}
        [งบประมาณ]: {state.get('budget')}
        [ข้อมูลพยากรณ์อากาศล่วงหน้า]: 
        {state.get('weather')}
        
        [สถานที่ท่องเที่ยวที่ค้นพบ]: 
        {state.get('search')}
        [โรงแรมที่ค้นพบ]: 
        {state.get('hotels')}

        กฎเหล็ก (Strict Rules):
        1. 🇹🇭 บังคับใช้ "ภาษาไทย" ในการตอบเท่านั้นสำหรับทุกตัวอักษรใน JSON (MUST USE THAI LANGUAGE ONLY) หากข้อมูลต้นฉบับเป็นภาษาอื่น ให้แปลเป็นภาษาไทยก่อนเสมอ
        2. ตรวจสอบ [วันที่ต้องการเดินทาง] โดยนับจาก [วันที่ปัจจุบันของระบบ] หากเกิน 5 วัน ค่อยแจ้งเตือนใน proTip
        3. ยึดสภาพอากาศเป็นหลัก: วันไหนฝนตก/พายุ -> ต้องจัดสถานที่ Indoor | วันไหนแดดจัด/โปร่ง -> จัด Outdoor ได้
        4. อธิบายเหตุผลที่เลือกสถานที่นั้นเสมอ โดยเชื่อมโยงกับสภาพอากาศ
        5. 🗺️ สำหรับ `mapsLink` ห้ามใส่ URL มั่ว ให้สร้าง URL ค้นหาของ Google Maps จริงๆ โดยใช้รูปแบบนี้: https://www.google.com/maps/search/?api=1&query=ชื่อสถานที่

        **คุณต้องตอบกลับเป็น JSON Format ตามโครงสร้างนี้เท่านั้น ห้ามมีข้อความอื่นนอกเหนือจาก JSON:**
        {{
            "tripName": "ชื่อทริปสุดเก๋",
            "travelDates": "{state.get('travel_dates')}",
            "recommendedItems": ["ไอเทม 1", "ไอเทม 2"],
            "itinerary": [
                {{
                    "day": 1,
                    "date": "วันที่ (เช่น 12 ต.ค. หรือ วันที่ 1)",
                    "weather": "ระบุสภาพอากาศเป็นภาษาไทยเท่านั้น (ตัวอย่าง: แดดจัด 35°C, มีเมฆมาก 28°C, ฝนตกปรอยๆ)",
                    "activities": [
                        {{
                            "timeOfDay": "เช้า / บ่าย / เย็น",
                            "place": "ชื่อสถานที่",
                            "reason": "เหตุผลที่เลือก (เชื่อมโยงสภาพอากาศ)",
                            "mapsLink": "https://www.google.com/maps/search/?api=1&query=ระบุชื่อสถานที่ตรงนี้"
                        }}
                    ]
                }}
            ],
            "hotels": [
                {{
                    "name": "ชื่อโรงแรม",
                    "highlight": "จุดเด่น",
                    "agodaLink": "https://www.agoda.com/th-th/search?text=ชื่อโรงแรม"
                }}
            ],
            "estimatedCosts": {{
                "transportation": "ราคา บาท",
                "food": "ราคา บาท",
                "activities": "ราคา บาท",
                "accommodation": "ราคา บาท",
                "total": "ราคารวม บาท/คน"
            }},
            "proTip": "ทริคเล็กๆ น้อยๆ หรือคำเตือนเรื่องสภาพอากาศ"
        }}
    """

    print("\n[Planner Bot is generating JSON Plan...]\n")
    
    response = llm.invoke(prompt).content.strip()

    try:
        if response.startswith("```json"):
            response = response[7:-3].strip()
        elif response.startswith("```"):
            response = response[3:-3].strip()

        json.loads(response)
        
        final_plan = response
    except json.JSONDecodeError:
        final_plan = json.dumps({{
            "error": "Failed to generate valid JSON format",
            "raw_response": response
        }})

    return {"final": final_plan}

def tools_entry_node(state: State):
    return {} 

builder = StateGraph(State)
builder.add_node("extract", extract_node)
builder.add_node("ask_user", ask_user_node)
builder.add_node("tools_entry", tools_entry_node)
builder.add_node("hotels", hotels_node)
builder.add_node("search", search_node)
builder.add_node("weather", weather_node)
builder.add_node("combine", combine_node)

builder.add_edge(START, "extract")

builder.add_conditional_edges(
    "extract",
    check_required_info,
    {
        "continue": "tools_entry", 
        "ask_user": "ask_user"                     
    }
)

builder.add_edge("tools_entry", "search")
builder.add_edge("tools_entry", "weather")
builder.add_edge("tools_entry", "hotels")

builder.add_edge("search", "combine")
builder.add_edge("weather", "combine")
builder.add_edge("hotels", "combine")

builder.add_edge("combine", END)
builder.add_edge("ask_user", END)

travel_agent_graph = builder.compile()