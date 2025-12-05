const request = require('supertest');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const { app, server, wss } = require('./index'); // Assuming you export app, server, and wss from index.js

afterAll((done) => {
  server.close(done);
});

describe('API Endpoints', () => {
  it('should register a teacher', async () => {
    const res = await request(app)
      .post('/api/teachers/register')
      .send({
        name: 'Test Teacher',
        email: 'test@teacher.com',
        password: 'password',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Test Teacher');
  });

  it('should login a teacher', async () => {
    await request(app)
      .post('/api/teachers/register')
      .send({
        name: 'Test Teacher 2',
        email: 'test2@teacher.com',
        password: 'password',
      });

    const res = await request(app)
      .post('/api/teachers/login')
      .send({
        email: 'test2@teacher.com',
        password: 'password',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Test Teacher 2');
  });

  it('should create a room', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({
        name: 'Test Room',
        game: 'test-game',
        difficulty: 'easy',
        duration: 60,
        teacher: { name: 'Test Teacher', email: 'test@teacher.com' },
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Test Room');
  });

  it('should join a room', async () => {
    const roomRes = await request(app)
      .post('/api/rooms')
      .send({
        name: 'Test Room 2',
        game: 'test-game',
        difficulty: 'easy',
        duration: 60,
        teacher: { name: 'Test Teacher', email: 'test@teacher.com' },
      });
    
    const roomCode = roomRes.body.code;

    const res = await request(app)
      .post(`/api/rooms/${roomCode}/join`)
      .send({
        studentName: 'Test Student',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.students).toContain('Test Student');
  });

  it('should get room details', async () => {
    const roomRes = await request(app)
      .post('/api/rooms')
      .send({
        name: 'Test Room 3',
        game: 'test-game',
        difficulty: 'easy',
        duration: 60,
        teacher: { name: 'Test Teacher', email: 'test@teacher.com' },
      });
    
    const roomCode = roomRes.body.code;

    const res = await request(app).get(`/api/rooms/${roomCode}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Test Room 3');
  });

  it('should submit results', async () => {
    const roomRes = await request(app)
      .post('/api/rooms')
      .send({
        name: 'Test Room 4',
        game: 'test-game',
        difficulty: 'easy',
        duration: 60,
        teacher: { name: 'Test Teacher', email: 'test@teacher.com' },
      });
    
    const roomCode = roomRes.body.code;

    const res = await request(app)
      .post(`/api/rooms/${roomCode}/results`)
      .send({
        studentName: 'Test Student',
        results: { score: 100 },
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('studentName', 'Test Student');
  });

  it('should get results', async () => {
    const roomRes = await request(app)
      .post('/api/rooms')
      .send({
        name: 'Test Room 5',
        game: 'test-game',
        difficulty: 'easy',
        duration: 60,
        teacher: { name: 'Test Teacher', email: 'test@teacher.com' },
      });
    
    const roomCode = roomRes.body.code;

    await request(app)
      .post(`/api/rooms/${roomCode}/results`)
      .send({
        studentName: 'Test Student',
        results: { score: 100 },
      });
    
    const res = await request(app).get(`/api/rooms/${roomCode}/results`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('studentName', 'Test Student');
  });
});
