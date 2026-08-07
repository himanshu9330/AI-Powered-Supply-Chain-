const request = require('supertest');
const app = require('../app');

describe('Control Tower Backend API Integration Tests', () => {
  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
    expect(res.body.service).toEqual('supply-chain-control-tower-api');
  });

  it('GET /api/nonexistent should return 404', async () => {
    const res = await request(app).get('/api/unknown-endpoint-xyz');
    expect(res.statusCode).toEqual(404);
  });
});
