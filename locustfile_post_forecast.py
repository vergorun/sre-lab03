from locust import HttpUser, task
from locust.exception import StopUser
from itertools import count
import pandas as pd
import json
from random import choice, randrange

from datetime import date, timedelta, datetime, time

FORECAST_DEPTH = 7 # days
SKY = ['Clear/Sunny', 'Mostly Clear/Mostly Sunny', 'Partly Cloudy/Partly Sunny', 'Mostly Cloudy', 'Cloudy'] # Sky
WIND = ['Light wind', 'Breezy', 'Windy', 'Very Windy', 'Storm'] # Wind
TEMPERATURE = [-40,+40] # temperature

today = date.today()
start_date = today
end_date = today + timedelta(FORECAST_DEPTH)

cities = pd.read_csv('ru_worldcities_100.csv')
cities_len = len(cities)

def daterange(start_date, end_date):
    for n in range(int((end_date - start_date).days)):
        yield (start_date + timedelta(n))

class Forecast(HttpUser):
    @task
    def forecast_filling(self):
        for single_date in daterange(start_date, end_date):
            print(single_date)
            #print(single_date.strftime("%Y-%m-%d"))
            for city in range(1, cities_len+1):
                forecast = { "cityId": city, 
                             "dateTime": int(datetime.combine(single_date, time.min).timestamp()), 
                             "temperature": randrange(TEMPERATURE[0], TEMPERATURE[-1]), 
                             "summary": "{}, {}".format(choice(SKY), choice(WIND)) }
                print(forecast)
                response = self.client.post(f"/Forecast/{city}", 
                                            headers = {'Content-Type': 'application/json', 'Accept': '*/*'}, 
                                            data = json.dumps(forecast))
                json_response_dict = response.json()
                print(json_response_dict)

        raise StopUser()