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
| 1.3, 1.4 одновременное чтение записей справочника Cities (k6, GET /Cities), Forecast (k6, GET /Forecast/{id}) и сводного WeatherForecast (k6, GET /WeatherForecast) | 10 | 10 * 7 | K6_PROMETHEUS_RW_SERVER_URL=http://91.185.85.11:9090/api/v1/write<br>k6 run -e APP_HOSTNAME=http://app.pub.sre.lab -e FIRST_ID=1 -e LAST_ID=8477 -o experimental-prometheus-rw --summary-trend-stats "avg,min,med,max,p(95),p(99)" test.js |
| 2.1 заполнение справочника Cities (locust, POST /Cities) | 100 | - | locust -f locustfile_post_city.py -H http://app.pub.sre.lab -u 1 --headless |
| 2.2 заполнение справочника Forecast (locust, POST /Forecast) | 100 | 100 * 7 | locust -f locustfile_post_forecast.py -H http://app.pub.sre.lab -u 1 --headless |
| 2.3, 2.4 одновременное чтение записей справочника Cities (k6, GET /Cities), Forecast (k6, GET /Forecast/{id}) и сводного WeatherForecast (k6, GET /WeatherForecast) | 100 | 100 * 7 | K6_PROMETHEUS_RW_SERVER_URL=http://91.185.85.11:9090/api/v1/write<br>k6 run -e APP_HOSTNAME=http://app.pub.sre.lab -e FIRST_ID=1 -e LAST_ID=8477 -o experimental-prometheus-rw --summary-trend-stats "avg,min,med,max,p(95),p(99)" test.js |
| 3.1 заполнение справочника Cities (locust, POST /Cities) | 400 | - | locust -f locustfile_post_city.py -H http://app.pub.sre.lab -u 1 --headless |
| 3.2 заполнение справочника Forecast (locust, POST /Forecast) | 400 | 400 * 7 | locust -f locustfile_post_forecast.py -H http://app.pub.sre.lab -u 1 --headless |
| 3.3, 3.4 одновременное чтение записей справочника Cities (k6, GET /Cities), Forecast (k6, GET /Forecast/{id}) и сводного WeatherForecast (k6, GET /WeatherForecast) | 400 | 400 * 7 | K6_PROMETHEUS_RW_SERVER_URL=http://91.185.85.11:9090/api/v1/write<br>k6 run -e APP_HOSTNAME=http://app.pub.sre.lab -e FIRST_ID=1 -e LAST_ID=8477 -o experimental-prometheus-rw --summary-trend-stats "avg,min,med,max,p(95),p(99)" test.js |
| 4.1 заполнение справочника Cities (locust, POST /Cities) | 1211 | - |locust -f locustfile_post_city.py -H http://app.pub.sre.lab -u 1 --headless |
| 4.2 заполнение справочника Forecast (locust, POST /Forecast) | 1211 | 1211 * 7 | locust -f locustfile_post_forecast.py -H http://app.pub.sre.lab -u 1 --headless |
| 4.3, 4.4 одновременное чтение записей справочника Cities (k6, GET /Cities), Forecast (k6, GET /Forecast/{id}) и сводного WeatherForecast (k6, GET /WeatherForecast) | 1211 | 1211 * 7 | K6_PROMETHEUS_RW_SERVER_URL=http://91.185.85.11:9090/api/v1/write<br>k6 run -e APP_HOSTNAME=http://app.pub.sre.lab -e FIRST_ID=1 -e LAST_ID=8477 -o experimental-prometheus-rw --summary-trend-stats "avg,min,med,max,p(95),p(99)" test.js |

2. База "weather"инициализируется заново перед каждым набором сценариев при переходе к следующему размеру справочника Cities
3. Сценарии *locustfile_post_city, locustfile_post_forecast* импортируют список городов из CSV-файлов, при переходе к следующей группе нужно отредактировать импорт в переменной ctites *(c ru_worldcities_10.csv на ru_worldcities_100.csv/ru_worldcities_400.csv/ru_worldcities.csv)*
4. Сценарий для k6 test.js в случайном порядке обращается к Forecast {id}, начало и конец интересующего диапазона нужно указать в переменных *FIRST_ID|LAST_ID*<br>В сценарии использован функционал остановки теста при превышении целевых пороговых значений ошибок и времени ответа (если тестирование проводится на продуктовой среде - чтобы не было импакта на ее работу)
5. В переменной окружения K6_PROMETHEUS_RW_SERVER_URL задается url для API Prometheus (соответствует ip LoadBalancer) для записи результатов тестирования, для которых настроен Dashboard в Grafana, в APP_HOSTNAME указан baseURL для подключения (соответствует kubernetes ingress host)
7. Сценарии \*.1, \*.2 выполняются последовательно - проверка capacity, а \*.3, \*.4 объединены и выполняются вместе - проверка response time

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
