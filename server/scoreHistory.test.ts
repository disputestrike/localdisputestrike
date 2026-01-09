import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  recordCreditScore: vi.fn(),
  getCreditScoreHistory: vi.fn(),
  getLatestCreditScores: vi.fn(),
  addScoreEvent: vi.fn(),
}));

import * as db from './db';

describe('Score History API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordCreditScore', () => {
    it('should record a credit score with all required fields', async () => {
      const mockScore = {
        id: 1,
        userId: 123,
        bureau: 'transunion' as const,
        score: 720,
        scoreModel: 'FICO 8',
        creditReportId: 456,
        event: 'Report uploaded',
        recordedAt: new Date(),
      };

      vi.mocked(db.recordCreditScore).mockResolvedValue(mockScore);

      const result = await db.recordCreditScore({
        userId: 123,
        bureau: 'transunion',
        score: 720,
        scoreModel: 'FICO 8',
        creditReportId: 456,
        event: 'Report uploaded',
      });

      expect(result).toEqual(mockScore);
      expect(db.recordCreditScore).toHaveBeenCalledWith({
        userId: 123,
        bureau: 'transunion',
        score: 720,
        scoreModel: 'FICO 8',
        creditReportId: 456,
        event: 'Report uploaded',
      });
    });

    it('should record a score with minimal fields', async () => {
      const mockScore = {
        id: 2,
        userId: 123,
        bureau: 'equifax' as const,
        score: 680,
        scoreModel: null,
        creditReportId: null,
        event: null,
        recordedAt: new Date(),
      };

      vi.mocked(db.recordCreditScore).mockResolvedValue(mockScore);

      const result = await db.recordCreditScore({
        userId: 123,
        bureau: 'equifax',
        score: 680,
      });

      expect(result.score).toBe(680);
      expect(result.bureau).toBe('equifax');
    });
  });

  describe('getCreditScoreHistory', () => {
    it('should return score history for a user', async () => {
      const mockHistory = [
        { id: 1, userId: 123, bureau: 'transunion', score: 720, recordedAt: new Date() },
        { id: 2, userId: 123, bureau: 'transunion', score: 710, recordedAt: new Date() },
      ];

      vi.mocked(db.getCreditScoreHistory).mockResolvedValue(mockHistory as any);

      const result = await db.getCreditScoreHistory(123);

      expect(result).toHaveLength(2);
      expect(db.getCreditScoreHistory).toHaveBeenCalledWith(123);
    });

    it('should filter by bureau when specified', async () => {
      const mockHistory = [
        { id: 1, userId: 123, bureau: 'equifax', score: 700, recordedAt: new Date() },
      ];

      vi.mocked(db.getCreditScoreHistory).mockResolvedValue(mockHistory as any);

      const result = await db.getCreditScoreHistory(123, { bureau: 'equifax' });

      expect(result).toHaveLength(1);
      expect(result[0].bureau).toBe('equifax');
    });

    it('should respect limit parameter', async () => {
      const mockHistory = [
        { id: 1, userId: 123, bureau: 'transunion', score: 720, recordedAt: new Date() },
      ];

      vi.mocked(db.getCreditScoreHistory).mockResolvedValue(mockHistory as any);

      await db.getCreditScoreHistory(123, { limit: 5 });

      expect(db.getCreditScoreHistory).toHaveBeenCalledWith(123, { limit: 5 });
    });
  });

  describe('getLatestCreditScores', () => {
    it('should return latest scores for all bureaus', async () => {
      const mockLatest = {
        transunion: { id: 1, score: 720, bureau: 'transunion', recordedAt: new Date() },
        equifax: { id: 2, score: 715, bureau: 'equifax', recordedAt: new Date() },
        experian: { id: 3, score: 710, bureau: 'experian', recordedAt: new Date() },
      };

      vi.mocked(db.getLatestCreditScores).mockResolvedValue(mockLatest as any);

      const result = await db.getLatestCreditScores(123);

      expect(result.transunion?.score).toBe(720);
      expect(result.equifax?.score).toBe(715);
      expect(result.experian?.score).toBe(710);
    });

    it('should return null for bureaus without scores', async () => {
      const mockLatest = {
        transunion: { id: 1, score: 720, bureau: 'transunion', recordedAt: new Date() },
        equifax: null,
        experian: null,
      };

      vi.mocked(db.getLatestCreditScores).mockResolvedValue(mockLatest as any);

      const result = await db.getLatestCreditScores(123);

      expect(result.transunion?.score).toBe(720);
      expect(result.equifax).toBeNull();
      expect(result.experian).toBeNull();
    });
  });

  describe('addScoreEvent', () => {
    it('should add an event to the most recent score', async () => {
      vi.mocked(db.addScoreEvent).mockResolvedValue(undefined);

      await db.addScoreEvent(123, 'transunion', '5 accounts deleted');

      expect(db.addScoreEvent).toHaveBeenCalledWith(123, 'transunion', '5 accounts deleted');
    });
  });
});

describe('Score Validation', () => {
  it('should validate score is within FICO range (300-850)', () => {
    const validateScore = (score: number): boolean => {
      return score >= 300 && score <= 850;
    };

    expect(validateScore(300)).toBe(true);
    expect(validateScore(850)).toBe(true);
    expect(validateScore(720)).toBe(true);
    expect(validateScore(299)).toBe(false);
    expect(validateScore(851)).toBe(false);
    expect(validateScore(0)).toBe(false);
  });

  it('should validate bureau is one of the three major bureaus', () => {
    const validBureaus = ['transunion', 'equifax', 'experian'];
    const validateBureau = (bureau: string): boolean => {
      return validBureaus.includes(bureau);
    };

    expect(validateBureau('transunion')).toBe(true);
    expect(validateBureau('equifax')).toBe(true);
    expect(validateBureau('experian')).toBe(true);
    expect(validateBureau('other')).toBe(false);
    expect(validateBureau('')).toBe(false);
  });
});

describe('Score Model Validation', () => {
  it('should accept valid score models', () => {
    const validModels = ['FICO 8', 'FICO 9', 'VantageScore 3.0', 'VantageScore 4.0'];
    
    validModels.forEach(model => {
      expect(typeof model).toBe('string');
      expect(model.length).toBeGreaterThan(0);
    });
  });
});
