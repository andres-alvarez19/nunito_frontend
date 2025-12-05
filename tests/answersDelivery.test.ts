import assert from 'assert';
import {
  buildAnswerSubmission,
  normalizeAnswerRecord,
  sendAnswerWithFallback,
} from '@/logic/answersDelivery';

describe('answersDelivery', () => {
  describe('buildAnswerSubmission', () => {
    it('fills defaults for attempt and sentAt', () => {
      const submission = buildAnswerSubmission({
        studentId: 's1',
        questionId: 'q1',
        answer: 'A',
        isCorrect: true,
        elapsedMs: 1200,
      });
      assert.strictEqual(submission.attempt, 1);
      assert.ok(submission.sentAt, 'sentAt should be set');
    });
  });

  describe('normalizeAnswerRecord', () => {
    it('maps correct flag into isCorrect/correct', () => {
      const record = normalizeAnswerRecord({
        studentId: 's1',
        questionId: 'q1',
        answer: 'A',
        correct: true,
      } as any);
      assert.strictEqual(record.isCorrect, true);
      assert.strictEqual(record.correct, true);
    });
  });

  describe('sendAnswerWithFallback', () => {
    const baseSubmission = {
      studentId: 's1',
      questionId: 'q1',
      answer: 'A',
      questionText: 'What is A?',
      isCorrect: true,
      elapsedMs: 1500,
    };

    it('uses WS when connected', async () => {
      const published: any[] = [];
      const stompClient = {
        connected: true,
        publish: ({ destination, body }: any) => {
          published.push({ destination, body });
        },
      };

      const result = await sendAnswerWithFallback({
        roomId: 'room-1',
        submission: baseSubmission,
        stompClient,
        restSubmit: async () => {
          throw new Error('Should not call REST');
        },
      });

      assert.strictEqual(result.deliveredVia, 'ws');
      assert.strictEqual(result.success, true);
      assert.strictEqual(published.length, 1);
      assert.ok(published[0].destination.includes('/app/monitoring/room/room-1/answer'));
      const body = JSON.parse(published[0].body);
      assert.strictEqual(body.roomId, 'room-1');
      assert.strictEqual(body.selectedOptionId, null);
      assert.strictEqual(body.selectedOptionText, 'A');
      assert.strictEqual(body.elapsedMillis, 1500);
      assert.strictEqual(body.questionText, 'What is A?');
      assert.ok(body.answeredAt, 'answeredAt should be present');
      assert.strictEqual('answer' in body, false);
      assert.strictEqual(body.isCorrect, true);
    });
  });
});
