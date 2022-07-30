import { isEmptyObj } from '../object.utils'

describe('Object Utils', () => {
  describe('isEmptyObj', () => {
    it('should return true if the object is empty', () => {
      expect(isEmptyObj({})).toBe(true)
      expect(isEmptyObj([])).toBe(true)
    })

    it('should return false if the object is not empty', () => {
      expect(isEmptyObj({ foo: 'bar' })).toBe(false)
      expect(isEmptyObj({ foo: null })).toBe(false)
      expect(isEmptyObj({ foo: undefined })).toBe(false)
      expect(isEmptyObj({ foo: {} })).toBe(false)
      expect(isEmptyObj({ foo: [] })).toBe(false)
      expect(isEmptyObj(['foo'])).toBe(false)
    })
  })
})
