import { describe, expect, it } from 'vitest'
import { formatRuntime } from './commons'

describe('formatRuntime', () => {
  it('returns fallback text when runtime is undefined', () => {
    expect(formatRuntime()).toBe('Runtime unavailable')
  })

  it('returns fallback text when runtime is 0', () => {
    expect(formatRuntime(0)).toBe('Runtime unavailable')
  })

  it('formats runtimes under one hour in minutes only', () => {
    expect(formatRuntime(1)).toBe('1m')
    expect(formatRuntime(59)).toBe('59m')
  })

  it('formats exactly one hour with padded minutes', () => {
    expect(formatRuntime(60)).toBe('1h 00m')
  })

  it('formats one hour plus minutes with minute zero-padding', () => {
    expect(formatRuntime(61)).toBe('1h 01m')
  })

  it('formats multiple hours and remaining minutes correctly', () => {
    expect(formatRuntime(125)).toBe('2h 05m')
  })

  it('formats exact multi-hour durations with 00 minutes', () => {
    expect(formatRuntime(180)).toBe('3h 00m')
  })
})