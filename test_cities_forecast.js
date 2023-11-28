import { check } from "k6";
import http from "k6/http";
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

//let d = '3m'
const base_endpoint = __ENV.APP_HOSTNAME
const first_forecast_id = __ENV.FIRST_ID // стартовый id диапазона, нужно изменить с 1 на новое значение если с момента создания DB удалялись записи мимо API
const last_forecast_id = __ENV.LAST_ID // конечный id диапазона

export const options = {
  discardResponseBodies: true,
  thresholds: {
    'http_req_failed{scenario:cities}': [{'threshold': 'rate<0.01', abortOnFail: true, delayAbortEval: '10s'}], // доля http errors должна быть ниже 1%
    'http_req_duration{scenario:cities}': [{'threshold':'p(99)<400', abortOnFail: true, delayAbortEval: '10s'}], // 95% запросов должны укладываться в 400ms
    'http_req_failed{scenario:forecast}': [{'threshold': 'rate<0.01', abortOnFail: true, delayAbortEval: '10s'}], // доля http errors должна быть ниже 1%
    'http_req_duration{scenario:forecast}': [{'threshold':'p(99)<400', abortOnFail: true, delayAbortEval: '10s'}] // 95% запросов должны укладываться в 400ms
  },
  scenarios: {
/*
    forecast: {
      executor: 'constant-vus',
      vus: 100,
      exec: 'forecast',
      duration: d,
      gracefulStop: '10s',
    },
    weather_forecast: {
      executor: 'constant-vus',
      vus: 10,
      exec: 'weather_forecast',
      duration: d,
      gracefulStop: '10s',
    },
*/
    forecast: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 10,
      maxVUs: 100,
      exec: 'forecast',
      stages: [
        { target: 200, duration: '300s' },
        { target: 0, duration: '300s' },
      ],
      gracefulStop: '10s',
    },
    cities: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 10,
      maxVUs: 100,
      exec: 'cities',
      stages: [
        { target: 200, duration: '300s' },
        { target: 0, duration: '300s' },
      ],
      gracefulStop: '10s',
    }
  },
};

export function forecast() {
  let req = `${base_endpoint}/Forecast/` + randomIntBetween(first_forecast_id, last_forecast_id)
  console.log(`request url: ${req}`);
  let res = http.get(req);
  check(res, {
    "is status 200": (r) => r.status === 200
  });
};
export function cities() {
  let req = `${base_endpoint}/Cities`
  console.log(`request url: ${req}`);
  let res = http.get(req);
  check(res, {
    "is status 200": (r) => r.status === 200
  });
};
export function weather_forecast() {
  let req = `${base_endpoint}/WeatherForecast`
  console.log(`request url: ${req}`);
  let res = http.get(req);
  check(res, {
    "is status 200": (r) => r.status === 200
  });
};
