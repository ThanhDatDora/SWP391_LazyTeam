import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 }  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'],    // Error rate should be less than 5%
    errors: ['rate<0.1']              // Custom error rate should be less than 10%
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // Setup code - authenticate if needed
  console.log(`Starting load test against ${BASE_URL}`);
}

export default function () {
  // Test scenarios
  
  // 1. Homepage
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'Homepage status is 200': (r) => r.status === 200,
    'Homepage loads in <2s': (r) => r.timings.duration < 2000
  }) || errorRate.add(1);
  
  sleep(1);
  
  // 2. Course catalog
  response = http.get(`${BASE_URL}/catalog`);
  check(response, {
    'Catalog status is 200': (r) => r.status === 200,
    'Catalog loads in <3s': (r) => r.timings.duration < 3000
  }) || errorRate.add(1);
  
  sleep(1);
  
  // 3. Auth page
  response = http.get(`${BASE_URL}/auth`);
  check(response, {
    'Auth page status is 200': (r) => r.status === 200,
    'Auth page loads in <1.5s': (r) => r.timings.duration < 1500
  }) || errorRate.add(1);
  
  sleep(1);
  
  // 4. API Health check
  response = http.get(`${BASE_URL}/api/health`);
  check(response, {
    'API health status is 200': (r) => r.status === 200,
    'API responds in <500ms': (r) => r.timings.duration < 500
  }) || errorRate.add(1);
  
  sleep(2);
}

export function teardown() {
  console.log('Load test completed');
}