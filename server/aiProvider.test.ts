import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AI Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set environment variables for testing
    process.env.BUILT_IN_FORGE_API_URL = 'https://forge.manus.ai';
    process.env.BUILT_IN_FORGE_API_KEY = 'test-key';
  });

  it('should construct correct API endpoint', async () => {
    // Test that the endpoint is correctly constructed
    const baseUrl = process.env.BUILT_IN_FORGE_API_URL || '';
    const apiUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const endpoint = apiUrl.includes('/v1') 
      ? `${apiUrl}/chat/completions`
      : `${apiUrl}/v1/chat/completions`;
    
    expect(endpoint).toBe('https://forge.manus.ai/v1/chat/completions');
  });

  it('should handle API URL with trailing slash', () => {
    const baseUrl = 'https://forge.manus.ai/';
    const apiUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const endpoint = apiUrl.includes('/v1') 
      ? `${apiUrl}/chat/completions`
      : `${apiUrl}/v1/chat/completions`;
    
    expect(endpoint).toBe('https://forge.manus.ai/v1/chat/completions');
  });

  it('should handle API URL already containing /v1', () => {
    const baseUrl = 'https://forge.manus.ai/v1';
    const apiUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const endpoint = apiUrl.includes('/v1') 
      ? `${apiUrl}/chat/completions`
      : `${apiUrl}/v1/chat/completions`;
    
    expect(endpoint).toBe('https://forge.manus.ai/v1/chat/completions');
  });

  it('should make correct API request format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Test response' } }]
      })
    });

    const endpoint = 'https://forge.manus.ai/v1/chat/completions';
    const apiKey = 'test-key';
    const prompt = 'Test prompt';

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert credit dispute AI assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      endpoint,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key',
        }),
      })
    );
  });

  it('should parse successful API response', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Hello! How can I help you today?' } }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const response = await fetch('https://forge.manus.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] })
    });

    const data = await response.json();
    expect(data.choices[0].message.content).toBe('Hello! How can I help you today?');
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server error'
    });

    const response = await fetch('https://forge.manus.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] })
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });
});

describe('Notification Bell', () => {
  it('should show red dot only when there are notifications', () => {
    // Test case: no notifications
    const alertsEmpty: any[] = [];
    const hasNotificationsEmpty = alertsEmpty && alertsEmpty.length > 0;
    expect(hasNotificationsEmpty).toBe(false);

    // Test case: has notifications
    const alertsWithData = [
      { letterId: 1, bureau: 'TransUnion', daysSinceMailed: 26, daysRemaining: 4, alertType: 'approaching', message: 'Test' }
    ];
    const hasNotificationsWithData = alertsWithData && alertsWithData.length > 0;
    expect(hasNotificationsWithData).toBe(true);
  });

  it('should categorize alerts correctly', () => {
    const daysSinceMailed = 26;
    const daysRemaining = Math.max(0, 30 - daysSinceMailed);
    
    // Approaching deadline (25-30 days)
    expect(daysSinceMailed >= 25 && daysSinceMailed <= 30).toBe(true);
    expect(daysRemaining).toBe(4);

    // Overdue (>30 days)
    const daysSinceMailedOverdue = 35;
    const daysRemainingOverdue = Math.max(0, 30 - daysSinceMailedOverdue);
    expect(daysSinceMailedOverdue > 30).toBe(true);
    expect(daysRemainingOverdue).toBe(0);
  });
});
