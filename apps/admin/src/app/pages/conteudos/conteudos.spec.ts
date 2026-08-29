import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Conteudos } from './conteudos';

describe('Conteudos', () => {
  let component: Conteudos;
  let fixture: ComponentFixture<Conteudos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Conteudos],
    }).compileComponents();

    fixture = TestBed.createComponent(Conteudos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
