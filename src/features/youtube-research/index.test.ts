/**
 * Tests for YouTube Research Service
 */

import { describe, it, expect } from 'vitest';
import { YouTubeResearchService } from './index.js';

describe('YouTubeResearchService', () => {
  it('should initialize correctly', () => {
    const service = new YouTubeResearchService();
    expect(service).toBeDefined();
  });

  it('should have searchVideos method', () => {
    const service = new YouTubeResearchService();
    expect(typeof service.searchVideos).toBe('function');
  });

  it('should have getVideoInfo method', () => {
    const service = new YouTubeResearchService();
    expect(typeof service.getVideoInfo).toBe('function');
  });

  it('should have searchChannels method', () => {
    const service = new YouTubeResearchService();
    expect(typeof service.searchChannels).toBe('function');
  });

  it('should have analyzeData method', () => {
    const service = new YouTubeResearchService();
    expect(typeof service.analyzeData).toBe('function');
  });

  it('should have generateReport method', () => {
    const service = new YouTubeResearchService();
    expect(typeof service.generateReport).toBe('function');
  });
});
