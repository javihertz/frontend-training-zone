import { findDitto } from './find-ditto';

describe('FindDitto', () => {
  describe('when does have points as eyes', () => {
    it('should return the dittos', () => {
      const result = findDitto();
      const expectedArray = [
        expect.objectContaining({
          eyes: 'point',
          name: 'Charmander',
          type: 'Fire',
        }),
        expect.objectContaining({
          eyes: 'point',
          name: 'Pikachu',
          type: 'Electric',
        }),
      ];

      expect(result).toEqual(expect.arrayContaining(expectedArray));
    });
  });
});
