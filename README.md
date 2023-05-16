# Taipei Public Transportation Route Planning Website

This is a website for route planning of public transportation in Taipei. It helps users find the best public transport routes and provides information such as departure times, transfer stations, and estimated arrival times. The website is based on public transport data specific to Taipei, offering convenient and efficient route planning services.

[website](http://54.250.112.187/?title=MyPage)

## Features
* **Route Search**: Users can set the departure time, click the start point and end point on the map, and the system will provide the best route according to the bus database.
* **Visualization**: The calculated route will be displayed in a block, users can click on each station, and the system will display its location on the map.
* **Favorites Path**: Users can log in, save routes as routine or custom paths, and access them on the MyPlans page.

## Usage
### Route Search
![search_path](https://github.com/duck00036/Taipei-Public-Transportation-Planner/assets/48171500/55491f19-81a9-45c6-a6ac-b00633212b51)

### Visualization
![visual](https://github.com/duck00036/Taipei-Public-Transportation-Planner/assets/48171500/99e358dd-f5dd-448c-b7f0-7900f82210bb)

### Log in
![login](https://github.com/duck00036/Taipei-Public-Transportation-Planner/assets/48171500/9180e1a3-36b4-41cc-bcd9-f021228f487e)

### Save Path
![savepath](https://github.com/duck00036/Taipei-Public-Transportation-Planner/assets/48171500/4f088c0b-9bcb-49bd-992e-5b08f28d5389)

### Load Plan
![loadplan](https://github.com/duck00036/Taipei-Public-Transportation-Planner/assets/48171500/5f862acd-2d59-4711-a05e-a38e8240f660)

### Delete Plan
![deleteplan](https://github.com/duck00036/Taipei-Public-Transportation-Planner/assets/48171500/4d9c7de8-e80f-4fe0-bd75-9f173b291c1e)

## Architecture
![p1](https://github.com/duck00036/Taipei-Public-Transportation-Planner/assets/48171500/7d2eb0c1-fb20-4829-85da-1526b99102c5)

## Technologies Used
### Front-end Development:
* HTML
* CSS
* JavaScript
* Google Maps API

### Back-end Development:
* Python
* Django
* PostgreSQL
* AWS RDS
* FastAPI

### Deployment:
* AWS EC2
* Nginx
* gunicorn
* uvicorn
* Docker
* Docker-compose

## Algorithm

The project implements a pathfinding algorithm based on an optimized version of Dijkstra's algorithm. The algorithm efficiently finds the shortest time path between two locations by considering the following criteria during each search iteration:

* **Unvisited and Potential Nodes**: Only unvisited nodes that have a shorter estimated time of arrival than the current shortest time to the destination are considered during the search.

* **Update**: The algorithm will use the priority queue to find the node with the shortest time so far, and use this node to update the shortest time to the destination

* **Termination**: The algorithm terminates once the destination node is reached or all reachable nodes meeting the criteria have been visited. The resulting path provides the shortest time to the destination and the optimal path.

By considering only unvisited nodes with estimated arrival times earlier than the current shortest time to the destination, the algorithm effectively narrows down the search space and finds the shortest time path efficiently.

## Database Structure Behind the Algorithm

The database is structured into the following tables:

* **Station Table**: Stores information about each station, including its id, name, and location.
* **Line Table**: Contains data about different lines, including their id, name, and code.
* **Departure Table**: Stores the departure times for each line on different days of the week.
* **Station Line Table**: Stores the order and time intervals between stations for each line.

By organizing the data into these tables, the application can efficiently retrieve and utilize information about stations, lines, departure times, and intervals between stations.

## To do List
- [x] Route Search Algorithm
- [x] Visualization
- [x] Favorites Path
- [x] MRT
- [ ] Bus
- [ ] Train
- [ ] Path cost

