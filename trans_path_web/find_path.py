from fastapi import FastAPI
import asyncpg, math, time
from haversine import haversine
from heapq import heappush, heappop
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

async def create_db_pool(app: FastAPI) -> None:
    app.state.db_pool = await asyncpg.create_pool(
        database=os.getenv("DATABASE_NAME"),
        user=os.getenv("USER_NAME"),
        password=os.getenv("PASSWORD"),
        host=os.getenv("HOST"),
        port=5432
    )

@app.on_event("startup")
async def startup_event():
    await create_db_pool(app)

@app.get("/fastapi/find")
async def find_path(start_lat: float, start_lon: float, end_lat: float, end_lon: float, hour: int, minute: int, weektype: str):
    start_time = time.time()
    async with app.state.db_pool.acquire() as connection:
        query1 = "SELECT * FROM stations"
        stations = await connection.fetch(query1)

        query2 = "SELECT * FROM lines"
        lines = await connection.fetch(query2)

        query3 = "SELECT * FROM departures"
        departures = await connection.fetch(query3)

        query4 = "SELECT * FROM line_station"
        line_station = await connection.fetch(query4)

    route = ROUTE_MAP(stations,lines,departures,line_station)
    start_coord = start_lat, start_lon
    end_coord = end_lat, end_lon
    now_time = hour*3600+minute*60
    arrive_time,path = route.shortest_time_path(start_coord, end_coord,weektype,now_time)
    end_time = time.time()

    return_json = {}
    return_json["cal_time"] = round(end_time-start_time,2)
    return_json["depart_time"] = sec2hour(now_time)
    return_json["arrive_time"] = sec2hour(arrive_time)
    return_json["time_use"] = sec2hour(arrive_time-now_time)
    return_json["path"] = route.trans_to_json(path,now_time)

    return return_json

@app.on_event("shutdown")
async def shutdown_event():
    await app.state.db_pool.close()

def sec2hour(time):
    hour = (time+30)//3600
    if hour >= 24:
        hour -= 24
    minute = (time+30)%3600//60
    if minute < 10:
        minute = '0'+str(minute)
    return str(f"{hour}:{minute}")

def sec2min(time):
    minute = time//60
    second = time%60
    return str(f"{minute} min {second} sec")

class ROUTE_MAP:

    def __init__(self, stations: list, lines: list, departures: list, line_station: list):
        self.station_info = {}
        for row in stations:
            station_id, station_name, latitude, longitude = row            
            self.station_info[station_id] = (station_name, latitude, longitude)
        
        self.line_info = {}
        for row in lines:
            line_id, line_code, line_name, station_number = row            
            self.line_info[line_id] = (line_code, line_name, station_number)
        
        self.departure_info = {}
        for row in departures:
            departure_id, line_id, weekday_type, departure_time, start_station_index, end_station_index = row      
            if line_id not in self.departure_info:
                self.departure_info[line_id] = {}
            if weekday_type not in self.departure_info[line_id]:
               self. departure_info[line_id][weekday_type] = []
            self.departure_info[line_id][weekday_type].append((departure_time, start_station_index, end_station_index))
        
        self.line_station_info = {}
        self.relative_time_info = {}
        for row in line_station:
            line_station_id, line_id, station_index, station_id, relative_time = row           
            if station_id not in self.line_station_info:
                self.line_station_info[station_id] = []
            self.line_station_info[station_id].append((line_id, station_index, relative_time))        
            if line_id not in self.relative_time_info:
                self.relative_time_info[line_id] = {}
            self.relative_time_info[line_id][station_index] = (station_id, relative_time)
    
    def getDistance(self, latitude1, longitude1, latitude2, longitude2):
        return haversine((latitude1, longitude1), (latitude2, longitude2))

    def find_wait_time(self, now_time, relative_time, line_id, station_index, weekday_type):
        min_time = math.inf
        for departure_time, start_index, end_index in  self.departure_info[line_id][weekday_type]:
            if start_index <= station_index < end_index:
                start_station_id, start_relative_time =  self.relative_time_info[line_id][start_index]
                wait_time = departure_time + (relative_time-start_relative_time) - now_time
                if wait_time >= 0:
                    min_time = min(min_time,wait_time)
        return min_time
    
    def shortest_time_path(self, start_coord, end_coord, weekday_type, start_time):
        start_lat, start_lon = start_coord
        end_lat, end_lon = end_coord
        used_station = set()
        
        shortest_walk_dis = self.getDistance(start_lat, start_lon, end_lat, end_lon)
        walk_start_time = start_time
        start_point = (start_time, 0, start_lat, start_lon, 0, 0, [])
        priority_q = [start_point]
        
        while priority_q:
            
            time, _, lat, lon, station, line, path = heappop(priority_q)
            
            if (lat,lon) == end_coord:
                return time,path
            
            if station in used_station:
                continue
            
            walked_dis = (time-walk_start_time)/3600*4
            rest_walk_dis = shortest_walk_dis-walked_dis if shortest_walk_dis-walked_dis > 0 else 0
            now_walk_dis = self.getDistance(lat, lon, end_lat, end_lon)
            
            if now_walk_dis <= rest_walk_dis:
                shortest_walk_dis = now_walk_dis
                walk_start_time = time
                walk_time = int(now_walk_dis/4*3600+0.5)
                heappush(priority_q,(time+walk_time, len(path)+1, end_lat, end_lon, 0, 0, path+[['walk',None,'目的地',end_lat,end_lon,walk_time]]))
            
            search_dis = min(rest_walk_dis, now_walk_dis)
            
            for station_id in  self.station_info:
                if station_id in used_station:
                    continue
                station_name, station_lat, station_lon =  self.station_info[station_id]
                dis = self.getDistance(lat, lon, station_lat, station_lon)
                if dis <= search_dis:
                    for line_id, station_index, relative_time in  self.line_station_info[station_id]:
                        
                        line_code, line_name, station_number =  self.line_info[line_id]
                        
                        if station_index == station_number :
                            continue
                            
                        next_station_id, next_relative_time =  self.relative_time_info[line_id][station_index+1]
                        if next_station_id in used_station:
                            continue
                        
                        next_station_name, next_lat, next_lon =  self.station_info[next_station_id]
                        
                        take_time = next_relative_time-relative_time
                        
                        if line_id == line and station_id == station:
                            final_time = time+take_time
                            new_path = path\
                                        +[['take',line_name,next_station_name,next_lat,next_lon,take_time]]

                            heappush(priority_q,(final_time, len(new_path), next_lat, next_lon, next_station_id, line_id, new_path))
                        
                        elif station_id == station:
                            trans_time = 60*3
                            wait_time = self.find_wait_time(time+trans_time, relative_time, line_id, station_index, weekday_type)
                            final_time = time+trans_time+wait_time+take_time
                            new_path = path\
                                        +[['trans',line_name,station_name,station_lat,station_lon,trans_time]]\
                                        +[['wait',line_name,station_name,station_lat,station_lon,wait_time]]\
                                        +[['take',line_name,next_station_name,next_lat,next_lon,take_time]]

                            heappush(priority_q,(final_time, len(new_path), next_lat, next_lon, next_station_id, line_id, new_path))
                        
                        else:
                            walk_time = int(dis/4*3600+0.5)
                            wait_time = self.find_wait_time(time+walk_time, relative_time, line_id, station_index, weekday_type)
                            final_time = time+walk_time+wait_time+take_time
                            new_path = path\
                                        +[['walk',line_name,station_name,station_lat,station_lon,walk_time]]\
                                        +[['wait',line_name,station_name,station_lat,station_lon,wait_time]]\
                                        +[['take',line_name,next_station_name,next_lat,next_lon,take_time]]

                            heappush(priority_q,(final_time, len(new_path), next_lat, next_lon, next_station_id, line_id, new_path))
                            
            used_station.add(station)
    
    def trans_to_json(self, path, now_time):
        abs_time = now_time
        json_list = []
        for i,obj in enumerate(path):
            action, line, station, lat, lon, time = obj
            abs_time += time
            struct = {}
            struct["sequence"] = i+1
            struct["action"] = action
            struct["line"] = line
            struct["station"] = station
            struct["lat"] = lat
            struct["lon"] = lon
            struct["time"] = sec2min(time)
            struct["abs_time"] = sec2hour(abs_time)
            json_list.append(struct)
        return json_list
            
            


