# sre-lab03

**Предполагаемый сценарий использования приложения**
Рассмотрим возможный сценарий:
1. В базу администратором/оператором заносятся данные со списком городов (одним или несколькоми батчами, (POST /Cities)
2. В базу администратором/оператором заносятся прогнозы, тоже одним или несколькоми батчами(POST /Forecast)
3. Через API внешним приложением(пользователем) читаются: список городов (GET /Citites) для резолва id в навания, отдельные прогнозы (GET /Forecast/{id}) и сводный прогноз (GET /WeatherForecast/), предположим, что соотношение пользователей, соверщающих запросы /городов/прогнозов отдельный/сводный составляет 1:1:10

**Нефункциональные требования**
*<font size="2">(на основе предполагаемого сценария использования и API endpoint's из swagger/index.html)</font>:*
1. Не менее 1000 уникальных City id, 
2. Скорость заполнения справочника City, последовательно, по одному, не менее 50 rps (создание/обновление через PUT /Cities/{id}) от 0 до 1000
3. Скорость заполнения bulk не менее 5 rps для запросов с 100 id (через POST /Cities) от 0 до 1000
4. Возможность чтения через GET /Cities/{id} не менее 100 rps (для 1000 записей в базе)
5. Возможность чтения через GET /Cities/ не менее 20 rps (для 1000 записей в базе)
6. Не менее 7000 уникальных Forecast id (из расчета 7 дневных прогнозов на один City id), 
7. Скорость заполнения по одному не менее 50 rps (создание/обновление через PUT /Forecast/{id}) от 0 до 1000
8. Скорость заполнения bulk не менее 5 rps для запросов с 100 id (через POST /Forecast/id) от 0 до 7000
9. Возможность чтения через GET /Forecastid/{id} не менее 100 rps (для 7000 записей в базе)
10. Время ответа для списка городов (GET /Cities) и для отдельного прогноза (GET /Forecast/{id}) не более 300мс, сводного прогноза (GET /WeatherForecast) не более 1с


**Описание методики тестирования**
За исходные данные взят список населенных пунктов https://simplemaps.com/data/world-cities (бесплатная Basic-версия) и отфильтрован список из 1200+ городов РФ

1. Тестирование проводится для нескольких capacity сценариев

| сценарий | целевое количество записей в таблице cities | количество forecast на один city id| команда запуска сценария| 
|---|---|---|---|
| 1.1 заполнение справочника Cities (locust, POST /Cities) | 10 | - | locust -f locustfile_post_city.py -H http://app.pub.sre.lab -u 1 --headless |
| 1.2 заполнение справочника Forecast (locust, POST /Forecast) | 10 | 10 * 7 | locust -f locustfile_post_forecast.py  -H http://app.pub.sre.lab -u 1 --headless |
| 1.3 одновременное чтение записей справочника Cities (k6, GET /Cities), Forecast (k6, GET /Forecast/{id}) и сводного WeatherForecast (k6, GET /WeatherForecast) | 10 | 10 * 7 | K6_PROMETHEUS_RW_SERVER_URL=http://91.185.85.11:9090/api/v1/write<br>k6 run -e APP_HOSTNAME=http://app.pub.sre.lab -e FIRST_ID=1 -e LAST_ID=8477 -o experimental-prometheus-rw --summary-trend-stats "avg,min,med,max,p(95),p(99)" test.js |
| 2.1 заполнение справочника Cities (locust, POST /Cities) | 100 | - | locust -f locustfile_post_city.py -H http://app.pub.sre.lab -u 1 --headless |
| 2.2 заполнение справочника Forecast (locust, POST /Forecast) | 100 | 100 * 7 | locust -f locustfile_post_forecast.py -H http://app.pub.sre.lab -u 1 --headless |
| 2.3 одновременное чтение записей справочника Cities (k6, GET /Cities), Forecast (k6, GET /Forecast/{id}) и сводного WeatherForecast (k6, GET /WeatherForecast) | 100 | 100 * 7 | K6_PROMETHEUS_RW_SERVER_URL=http://91.185.85.11:9090/api/v1/write<br>k6 run -e APP_HOSTNAME=http://app.pub.sre.lab -e FIRST_ID=1 -e LAST_ID=8477 -o experimental-prometheus-rw --summary-trend-stats "avg,min,med,max,p(95),p(99)" test.js |
| 3.1 заполнение справочника Cities (locust, POST /Cities) | 400 | - | locust -f locustfile_post_city.py -H http://app.pub.sre.lab -u 1 --headless |
| 3.2 заполнение справочника Forecast (locust, POST /Forecast) | 400 | 400 * 7 | locust -f locustfile_post_forecast.py -H http://app.pub.sre.lab -u 1 --headless |
| 3.3 одновременное чтение записей справочника Cities (k6, GET /Cities), Forecast (k6, GET /Forecast/{id}) и сводного WeatherForecast (k6, GET /WeatherForecast) | 400 | 400 * 7 | K6_PROMETHEUS_RW_SERVER_URL=http://91.185.85.11:9090/api/v1/write<br>k6 run -e APP_HOSTNAME=http://app.pub.sre.lab -e FIRST_ID=1 -e LAST_ID=8477 -o experimental-prometheus-rw --summary-trend-stats "avg,min,med,max,p(95),p(99)" test.js |
| 4.1 заполнение справочника Cities (locust, POST /Cities) | 1211 | - |locust -f locustfile_post_city.py -H http://app.pub.sre.lab -u 1 --headless |
| 4.2 заполнение справочника Forecast (locust, POST /Forecast) | 1211 | 1211 * 7 | locust -f locustfile_post_forecast.py -H http://app.pub.sre.lab -u 1 --headless |
| 4.3 одновременное чтение записей справочника Cities (k6, GET /Cities), Forecast (k6, GET /Forecast/{id}) и сводного WeatherForecast (k6, GET /WeatherForecast) | 1211 | 1211 * 7 | K6_PROMETHEUS_RW_SERVER_URL=http://91.185.85.11:9090/api/v1/write<br>k6 run -e APP_HOSTNAME=http://app.pub.sre.lab -e FIRST_ID=1 -e LAST_ID=8477 -o experimental-prometheus-rw --summary-trend-stats "avg,min,med,max,p(95),p(99)" test.js |

2. База "weather"инициализируется заново перед каждым набором сценариев при переходе к следующему размеру справочника Cities
3. Сценарии *locustfile_post_city, locustfile_post_forecast* импортируют список городов из CSV-файлов, при переходе к следующей группе нужно отредактировать импорт в переменной ctites *(c ru_worldcities_10.csv на ru_worldcities_100.csv/ru_worldcities_400.csv/ru_worldcities.csv)*
4. Сценарий для k6 test.js в случайном порядке обращается к Forecast {id}, начало и конец интересующего диапазона нужно указать в переменных *FIRST_ID|LAST_ID*<br>В сценарии использован функционал остановки теста при превышении целевых пороговых значений ошибок и времени ответа (если тестирование проводится на продуктовой среде - чтобы не было импакта на ее работу)
5. В переменной окружения K6_PROMETHEUS_RW_SERVER_URL задается url для API Prometheus (соответствует ip LoadBalancer) для записи результатов тестирования, для которых настроен Dashboard в Grafana, в APP_HOSTNAME указан baseURL для подключения (соответствует kubernetes ingress host)
7. Сценарии \*.1, \*.2 выполняются последовательно - проверка capacity, а тесты в \*.3 объединены и выполняются вместе - проверка response time

**Описание тестового стенда**

**RTT**: средний RTT от ВМ с ПО генерации трафика до точки входа (ip LB) около 18мс

**Генераторы**: Locust 2.19.1/python 3.11, k6 v0.47.0

**Kubernetes**
| APP | version/tag | replicas | resource limit |
|---|---|---|---|
|ghcr.io/ldest/sre-course/api| 7c04bc9 | 3 | cpu 0.33, memory 256M/512M (r/l)|

**Compute Cloud**
| VM | OS | resources | APP |
|---|---|---|---|
|LB|Debian 12|2vcpu/2gb ram/1gb swap|haproxy 2.6.12-1, etcd 3.5.9, prometheus 2.42.0+ds-5+b5|
|DB1|Debian 11|2vcpu/2gb ram/2gb swap|postgresql 15.4-2.pgdg110+1, patroni 3.1.0|
|DB2|Debian 11|2vcpu/2gb ram/2gb swap|postgresql 15.4-2.pgdg110+1, patroni 3.1.0|
|ETCD1|Debian 11|2vcpu/2gb ram/1gb swap|etcd 3.5.9|
|ETCD2|Debian 11|2vcpu/2gb ram/1gb swap|etcd 3.5.9|

**Результаты**
| сценарий | результат |
|---|---|
|1.1|<img alt="locust_post_city10_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/f79b7618-f77a-46e4-ba2c-9c1473cafdb5" width="600"/> <br> <img alt="locust_post_city10_stat" src="https://github.com/vergorun/sre-lab03/assets/36616396/f7b4c511-3cf1-42f2-941d-8e36950d1247" width="600"/> |
|1.2|<img alt="locust_post_forecast10_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/096071ab-db93-49b6-adaa-eb6610249d08" width="600"/> <br> <img alt="locust_post_forecast10_stat" src="https://github.com/vergorun/sre-lab03/assets/36616396/d8d5270a-a010-4b36-af1b-7f41da53472b" width="600"/> |
|1.3|<img alt="k6_get_70_stats" src="https://github.com/vergorun/sre-lab03/assets/36616396/59445023-0b08-46d4-babe-2f7ec66a2467" width="600"/> <br> <img alt="k6_get_70_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/7f3d2ffc-f232-484b-a800-8ce2b0922f4b" width="600"/> <br> **Узкое-место:** <br> <img alt="db_get_70" src="https://github.com/vergorun/sre-lab03/assets/36616396/de0f6790-ae6d-4198-8c10-6656b11d9f7f" width="600"/> |
|2.1|<img alt="locust_post_city100_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/6926ccf6-91f1-4fdc-a131-eff9081a22d0" width="600"/> <br> <img alt="locust_post_city100_stat" src="https://github.com/vergorun/sre-lab03/assets/36616396/24572f80-d846-48dc-b1bc-4fe16a50b7b6" width="600"/> |
|2.2|<img alt="locust_post_forecast100_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/d34b1fad-7891-445b-90de-7371c5ef7cb0" width="600"/> <br> <img alt="locust_post_forecast100_stat" src="https://github.com/vergorun/sre-lab03/assets/36616396/25c241d8-6b16-4a03-9da9-faf10da650e5" width="600"/> |
|2.3|<img alt="k6_get_700_stats" src="https://github.com/vergorun/sre-lab03/assets/36616396/0c18c30e-807b-4240-93d5-a041aeeac452" width="600"/> <br> <img alt="k6_get_700_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/3118669e-6627-49f3-8271-6be9d80c96a4" width="600"/> <br> **Узкое-место:** <br> <img alt="db_get_700" src="https://github.com/vergorun/sre-lab03/assets/36616396/8516c495-0201-4a77-a007-dd87b1d120cc" width="600"/> |
|3.1|<img alt="locust_post_city400_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/59176355-f8e5-4fe5-8b57-74bae49ea6e2" width="600"/> <br> <img alt="locust_post_city400_stat" src="https://github.com/vergorun/sre-lab03/assets/36616396/1f6377a5-1542-4e82-8356-4c31184f2504" width="600"/> |
|3.2|<img alt="locust_post_forecast400_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/c7c38a7b-f987-45d9-9bd7-b102337a9d69" width="600"/> <br> <img alt="locust_post_forecast400_stat" src="https://github.com/vergorun/sre-lab03/assets/36616396/c08a1401-15f5-4ec4-bea0-daadf0400d57" width="600"/> |
|3.3|<img alt="k6_get_2800_stats" src="https://github.com/vergorun/sre-lab03/assets/36616396/4c78775b-2806-4684-a62b-2603c7b518d9" width="600"/> <br> <img alt="k6_get_2800_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/ae9add4f-4b08-409f-99b6-840b30458929" width="600"/> <br> **Узкое-место:** <br> <img alt="db_get_2800" src="https://github.com/vergorun/sre-lab03/assets/36616396/0b7e4f33-ec32-4ffa-a0ef-1fcf9463d7f1" width="600"/> |
|4.1|<img alt="locust_post_city1211_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/36929eb6-d1fb-462a-b1cb-d5f9526e8bda" width="600"/> <br> <img alt="locust_post_city1211_stat" src="https://github.com/vergorun/sre-lab03/assets/36616396/e59779b5-41be-4296-a373-0cdfcc060109" width="600"/> |
|4.2|<img alt="locust_post_forecast1211_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/d99f3053-aec9-41ae-a4db-4114cac5f1b0" width="600"/> <br> <img alt="locust_post_forecast1211_stat" src="https://github.com/vergorun/sre-lab03/assets/36616396/480798b8-5f82-47e4-a4d2-3f91e6de9ede" width="600"/> |
|4.3|<img alt="k6_get_8477_stats" src="https://github.com/vergorun/sre-lab03/assets/36616396/9fbbe90e-ecf8-4e48-8d9b-93a2962dda59" width="600"/> <br> <img alt="k6_get_8477_graph" src="https://github.com/vergorun/sre-lab03/assets/36616396/1d1cd45c-09d9-4a76-88ec-cff5cecf0aa0" width="600"/> <br> **Узкое-место:** <br> <img alt="db_get_8477" src="https://github.com/vergorun/sre-lab03/assets/36616396/ca5df57f-f45e-45fc-a4aa-78d8a5d20208" width="600"/> |

**Вывод по результатам тестирования**
Узким местом является реализация реботы с базой данных, на один запрос API генерируется на порядо больше транзакций в DB, что приводит к тому что при увеличении интенсивности параллельных запросов экспоненциально увеличивается время ответа, что не позволяет уложиться в требуемое время ответа (и процент ответов без ошибок) даже на средне заполненной базе, при увеличении количества записей в DB ситуалция только ухудшается. Требуется переработка реализации работы с DB. 
Близкий к целевому показатель по времени ответа достигается только на практически пустой базе (1 сценарий - 10 городов/7 прогнозов на город), суммарный порог при этом около 35rps
