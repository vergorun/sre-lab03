from locust_plugins.csvreader import CSVReader
import pandas as pd
import np

class WeatherData:
    def __init__(self, datafile):
        df = pd.read_csv(datafile)
        df = df[df['country']=='Russia'].reset_index()
        df.index = np.arange(1, len(df) + 1)
        df.to_csv(f'ru_{datafile}', columns=['city'])

if __name__ == '__main__':
    WD = WeatherData('worldcities.csv')
