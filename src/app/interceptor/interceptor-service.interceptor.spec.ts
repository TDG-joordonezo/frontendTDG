import { TestBed } from '@angular/core/testing';

import { InterceptorServiceInterceptor } from './interceptor-service.interceptor';

describe('InterceptorServiceInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      InterceptorServiceInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: InterceptorServiceInterceptor = TestBed.inject(InterceptorServiceInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
