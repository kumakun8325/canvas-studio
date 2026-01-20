import { describe, it, expect } from 'vitest'
import { add } from './math'

describe('add', () => {
  it('should return 3 when adding 1 and 2', () => {
    expect(add(1, 2)).toBe(3)
  })

  it('should return 0 when adding -1 and 1', () => {
    expect(add(-1, 1)).toBe(0)
  })

  it('should return -5 when adding -2 and -3', () => {
    expect(add(-2, -3)).toBe(-5)
  })

  it('should return 0 when adding 0 and 0', () => {
    expect(add(0, 0)).toBe(0)
  })

  it('should handle decimal numbers', () => {
    expect(add(1.5, 2.5)).toBe(4)
  })
})
