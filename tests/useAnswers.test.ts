import assert from 'assert';

// Mock apiClient before importing the module
const mockApiClient: any = {
  post: async (url: string, body: any) => {
    return { data: { id: 'ans-1', roomId: 'room-1', ...body, createdAt: '2024-01-01T00:00:00Z' } };
  },
  get: async (_url: string, opts: any) => {
    return {
      data: [
        {
          id: 'ans-1',
          roomId: 'room-1',
          studentId: opts?.params?.studentId ?? 's1',
          questionId: opts?.params?.questionId ?? 'q1',
          answer: 'A',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
    };
  },
};
__registerMock('@/controllers', { apiClient: mockApiClient });

import { submitAnswer, fetchRoomAnswers, submitGameResult } from '@/services/useAnswers';

describe('useAnswers service', () => {
  it('submitAnswer returns persisted record shape', async () => {
    const record = await submitAnswer('room-1', {
      studentId: 's1',
      questionId: 'q1',
      answer: 'A',
    });

    assert.strictEqual(record.roomId, 'room-1');
    assert.strictEqual(record.studentId, 's1');
    assert.strictEqual(record.questionId, 'q1');
    assert.ok(record.id);
    assert.ok(record.createdAt);
  });

  it('fetchRoomAnswers returns list', async () => {
    const records = await fetchRoomAnswers('room-1', { studentId: 's1' });
    assert.ok(Array.isArray(records));
    assert.strictEqual(records[0].studentId, 's1');
  });

  it('submitGameResult forwards payload and returns StudentResult-like', async () => {
    // override post for this call to validate payload echo
    let receivedBody: any = null;
    mockApiClient.post = async (_url: string, body: any) => {
      receivedBody = body;
      return {
        data: {
          id: 'res-1',
          name: body.studentName,
          score: body.score,
          correctAnswers: body.correctAnswers,
          totalQuestions: body.totalQuestions,
          averageTime: body.averageTimeSeconds,
          completedAt: body.completedAt ?? '2024-01-01T00:00:00Z',
        },
      };
    };

    const result = await submitGameResult('room-1', {
      studentName: 'Stu',
      studentId: 's1',
      gameId: 'image-word',
      totalQuestions: 5,
      correctAnswers: 4,
      incorrectAnswers: 1,
      averageTimeSeconds: 10,
      score: 80,
    });

    assert.strictEqual(receivedBody.studentName, 'Stu');
    assert.strictEqual(result.score, 80);
    assert.strictEqual(result.totalQuestions, 5);
  });
});
