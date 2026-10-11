import { workshopReturn } from '../../../../../src/app/features/coding-labs/utils/workshop-context';
describe('Workshop return destination', () => {
  it('rejects external and unrelated routes', () => {
    for (const value of ['https://example.com', '//example.com', '/workshops/overview/other', '/workshops/overview#redirect', '/coding-labs/hello-world']) expect(workshopReturn(value)).toBeNull();
  });
  it('retains only workshop and lesson selection', () => {
    expect(workshopReturn('/workshops/overview?workshop=w%2F1&page=p2&unexpected=true')).toBe('/workshops/overview?workshop=w%2F1&page=p2');
  });
});
