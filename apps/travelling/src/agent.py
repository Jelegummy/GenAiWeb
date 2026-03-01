import json
import requests
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.utilities import OpenWeatherMapAPIWrapper
from typing import TypedDict
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, START
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
    question: str
    city: str
    preferences: str
    travel_dates: str
    budget: str
    hotels: str
    final: str
    search: str


def extract_node(state: State):
    prompt = f"""
        วิเคราะห์คำถามของผู้ใช้งานเพื่อสกัดข้อมูลการท่องเที่ยวออกมาเป็น JSON Format

        User question:
        {state['question']}

        กฎ: 
        1. สกัดชื่อเมือง จังหวัด หรือสถานที่หลักออกมา
        2. แปลงชื่อเมืองนั้นเป็น "ภาษาอังกฤษ" ให้ถูกต้องตามมาตรฐานสากล (เช่น "เขาใหญ่" -> "Khao Yai", "เชียงใหม่" -> "Chiang Mai")
        3. สกัดสไตล์การเที่ยว (เช่น คาเฟ่, ทะเล, ภูเขา, ธรรมชาติ) ถ้าไม่มีให้ใส่ "ทั่วไป"
        4. สกัด "งบประมาณ" (เช่น ประหยัด, ปานกลาง, หรูหรา) ถ้าไม่ระบุให้ใส่ "ทั่วไป"

        ตัวอย่าง JSON Format ที่ต้องการ:
        {{
            "city": "ชื่อเมืองภาษาอังกฤษ",
            "preferences": "สไตล์การเที่ยว",
            "travel_dates": "วันที่เดินทาง เช่น 3-6 มีนาคม",
            "budget": "งบประมาณ เช่น ประหยัด, ปานกลาง, หรูหรา",
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


def combine_node(state: State):
    prompt = f"""
        คุณคือสุดยอดผู้ช่วยวางแผนการท่องเที่ยว (Dynamic Travel Planner) ที่จัดทริปได้น่าตื่นตาตื่นใจ
        หน้าที่ของคุณคือจัดทริปโดยอิงจาก "วันที่เดินทาง", "สภาพอากาศล่วงหน้า" และ "สถานที่จากระบบ" 

        [คำถามจากผู้ใช้]: {state.get('question')}
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
        1. ดู [วันที่ต้องการเดินทาง] ของผู้ใช้ และนำไปเทียบกับ [ข้อมูลพยากรณ์อากาศล่วงหน้า]
        2. หากวันที่ผู้ใช้ต้องการเดินทาง "อยู่นอกเหนือ" จากพยากรณ์อากาศ 5 วันที่มี ให้แจ้งผู้ใช้ตรงๆ ว่า "พยากรณ์อากาศล่วงหน้าดูได้เพียง 5 วัน จึงขอจัดทริปตามข้อมูลล่าสุดที่มีให้ก่อน"
        3. ยึดสภาพอากาศเป็นหลัก: วันไหนฝนตก/พายุ -> ต้องจัดสถานที่ Indoor | วันไหนแดดจัด/โปร่ง -> จัด Outdoor ได้
        4. อธิบายเหตุผลที่เลือกสถานที่นั้นเสมอ โดยเชื่อมโยงกับสภาพอากาศ

        **รูปแบบการแสดงผลที่ต้องการ (Must Output in this format):**
        ✨ **[ชื่อทริปสุดเก๋]**
        🗓️ **ช่วงเวลาเดินทาง:** {state.get('travel_dates')}
        🎒 **ไอเทมแนะนำ:** (ของที่ต้องพกให้เข้ากับสภาพอากาศรวมๆ ของทริป)

        🗺️ **แผนการเดินทาง (Itinerary):**
        (ให้สรุปแผนการเดินทางแบ่งเป็น "รายวัน" ตามจำนวนวันที่ผู้ใช้ไป)
        
        🏨 **ที่พักแนะนำ:**
        (เลือกแนะนำที่พัก 1-2 แห่งจาก [โรงแรม/ที่พักที่ค้นพบ] พร้อมบอกจุดเด่น)

        💰 **ประมาณการค่าใช้จ่าย (Estimated Costs):**
        (ให้คุณประเมินค่าใช้จ่ายคร่าวๆ ต่อคน ตามงบประมาณ {state.get('budget')} โดยอิงจากค่าครองชีพจริง)
        - 🚗 ค่าเดินทาง: [ประเมินราคา] บาท
        - 🍔 ค่าอาหารและเครื่องดื่ม: [ประเมินราคา] บาท
        - 🎟️ ค่าเข้าชมสถานที่/กิจกรรม: [ประเมินราคา] บาท
        - 🛏️ ค่าที่พัก (ต่อคืน): [ประเมินราคา] บาท
        - 💵 **รวมประมาณการ:** [ประเมินราคารวม] บาท/คน
        
        **ตัวอย่างรูปแบบรายวัน:**
        📍 **วันที่ [ระบุวันที่/วันในทริป]** (ระบุสภาพอากาศของวันนั้น เช่น แดดจัด 30°C)
        - **เช้า:** [สถานที่] - เหตุผล: ... - [Google Maps](https://www.google.com/maps/search/?api=1&query=ชื่อสถานที่ภาษาอังกฤษ+เมือง)
        - **บ่าย:** [สถานที่] - เหตุผล: ... - [Google Maps](https://www.google.com/maps/search/?api=1&query=ชื่อสถานที่ภาษาอังกฤษ+เมือง)

        💡 **Pro Tip:** ทริคเล็กๆ น้อยๆ
    """

    collected = ""
    print("\nPlanner Bot:\n")
    for chunk in llm.stream(prompt):
        token = chunk.content
        print(token, end="", flush=True)
        collected += token
    print("\n")

    return {"final": collected}


builder = StateGraph(State)
builder.add_node("extract", extract_node)
builder.add_node("hotels", hotels_node)
builder.add_node("search", search_node)
builder.add_node("weather", weather_node)
builder.add_node("combine", combine_node)

builder.add_edge(START, "extract")

builder.add_edge("extract", "search")
builder.add_edge("extract", "weather")
builder.add_edge("extract", "hotels")

builder.add_edge("search", "combine")
builder.add_edge("weather", "combine")
builder.add_edge("hotels", "combine")

builder.add_edge("combine", END)

travel_agent_graph = builder.compile()

# if __name__ == "__main__":
#     q = input("\nคุณ: ")
#     for _ in travel_agent_graph.stream({"question": q}):
#         pass
