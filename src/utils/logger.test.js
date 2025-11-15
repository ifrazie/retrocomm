import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger utility', () => {
  let originalEnv;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleInfoSpy;
  let consoleLogSpy;

  beforeEach(() => {
    // Save original NODE_ENV
    originalEnv = process.env.NODE_ENV;
    
    // Create spies for console methods
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
    
    // Restore console methods
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleLogSpy.mockRestore();
    
    // Clear module cache to reload logger with new NODE_ENV
    vi.resetModules();
  });

  it('should log error in development mode', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('./logger.js');
    
    logger.error('Test error message');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Test error message');
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('should suppress error in production mode', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('./logger.js');
    
    logger.error('Test error message');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should log warn in development mode', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('./logger.js');
    
    logger.warn('Test warning message');
    
    expect(consoleWarnSpy).toHaveBeenCalledWith('Test warning message');
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  });

  it('should suppress warn in production mode', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('./logger.js');
    
    logger.warn('Test warning message');
    
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should log info in development mode', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('./logger.js');
    
    logger.info('Test info message');
    
    expect(consoleInfoSpy).toHaveBeenCalledWith('Test info message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
  });

  it('should suppress info in production mode', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('./logger.js');
    
    logger.info('Test info message');
    
    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  it('should log in development mode', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('./logger.js');
    
    logger.log('Test log message');
    
    expect(consoleLogSpy).toHaveBeenCalledWith('Test log message');
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should suppress log in production mode', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('./logger.js');
    
    logger.log('Test log message');
    
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should handle multiple arguments in development mode', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('./logger.js');
    
    logger.error('Error:', { code: 500 }, 'details');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', { code: 500 }, 'details');
  });

  it('should handle multiple arguments in production mode without logging', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('./logger.js');
    
    logger.error('Error:', { code: 500 }, 'details');
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
