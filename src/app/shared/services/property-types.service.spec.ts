import { TestBed } from '@angular/core/testing';

import { PropertyTypesService } from './property-types.service';

describe('PropertyTypesService', () => {
  let service: PropertyTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
