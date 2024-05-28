import { uc } from '../src/uc';

describe("Unit Test upper case", () => {
  
  
  it("should return true when upper case for a input valid string", () => {
    const result = uc('hello');
    expect(result).toBe('HELLO');
  });


}); 
