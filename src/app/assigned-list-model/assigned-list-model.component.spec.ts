import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedListModelComponent } from './assigned-list-model.component';

describe('AssignedListModelComponent', () => {
  let component: AssignedListModelComponent;
  let fixture: ComponentFixture<AssignedListModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedListModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedListModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
