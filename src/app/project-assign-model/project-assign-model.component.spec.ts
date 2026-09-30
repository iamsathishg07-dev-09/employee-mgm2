import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAssignModelComponent } from './project-assign-model.component';

describe('ProjectAssignModelComponent', () => {
  let component: ProjectAssignModelComponent;
  let fixture: ComponentFixture<ProjectAssignModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectAssignModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectAssignModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
