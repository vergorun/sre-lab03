#/bin/bash
K6_PROMETHEUS_RW_SERVER_URL=http://91.185.85.11:9090/api/v1/write \
k6 run -e APP_HOSTNAME=http://app.pub.sre.lab -e FIRST_ID=1 -e LAST_ID=700 -o experimental-prometheus-rw --summary-trend-stats "avg,min,med,max,p(95),p(99)" test.js