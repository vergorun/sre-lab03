from locust import HttpUser, task
from locust.exception import StopUser
from itertools import count
import pandas as pd
import json

cities = pd.read_csv('ru_worldcities_100.csv')
cities_iter = cities.iterrows()
cities_len = len(cities)

class Weather(HttpUser):
    @task
    def cities_filling(self):
        try:
           _, cityData = next(cities_iter)
        except StopIteration:
           raise StopUser()
        print(cityData.tolist())
        cityId, cityName = cityData.tolist()
        response = self.client.get(f"/Cities", headers = {'Content-Type': 'application/json', 'Accept': '*/*'})
        json_response_dict = response.json()
        if len(json_response_dict) <= cities_len:
            print(len(json_response_dict), cityName)
            self.client.post(f"/Cities", headers = {'Content-Type': 'application/json', 'Accept': '*/*'},
                             data = json.dumps({"id":cityId, "name":cityName}))
        else:
           raise StopUser()
