import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ConteudosComponent } from './conteudos';

describe('ConteudosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConteudosComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ConteudosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
