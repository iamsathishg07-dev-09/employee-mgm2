import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { ProjectService } from '../services/project.service';
import { Employee } from '../models/employee/employee.model';
import { project } from '../models/project/project.model';
import { HeaderComponent } from '../shared/header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule,HeaderComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent implements OnInit {
  reportType: string = 'employee';
  employees: Employee[] = [];
  projects: project[] = [];
  filteredEmployees: Employee[] = [];
  filteredProjects: project[] = [];
  loading: boolean = false;
  error: string = '';
  
  // Filter options
  departmentFilter: string = '';
  skillFilter: string = '';
  projectStatusFilter: string = '';
  clientFilter: string = '';
  
  // Available filter options
  departments: string[] = [];
  skills: string[] = [];
  clients: string[] = [];
  
  // Statistics
  totalEmployees: number = 0;
  totalProjects: number = 0;
  activeProjects: number = 0;
  employeesWithProjects: number = 0;

  //session  Data
  loggedInUsername: string | null = null;
  private readonly USER_KEY = 'loggedInUsername';
  constructor(
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private router: Router
    
  ) {}

  ngOnInit() {
    this.loadData();
    this.loggedInUsername = sessionStorage.getItem(this.USER_KEY);

  }

  loadData() {
    this.loading = true;
    this.error = '';
    
    // Load employees
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
        this.extractFilterOptions();
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        // Set empty data and continue loading
        this.employees = [];
        this.filteredEmployees = [];
        this.extractFilterOptions();
        this.calculateStatistics();
        this.loading = false;
        this.error = 'Unable to load data from server. Showing empty results.';
      }
    });

    // Load projects
    this.projectService.getAllProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.filteredProjects = data;
        this.extractProjectFilterOptions();
        this.calculateStatistics();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        // Set empty data and continue
        this.projects = [];
        this.filteredProjects = [];
        this.extractProjectFilterOptions();
        this.calculateStatistics();
        if (!this.error) {
          this.error = 'Unable to load data from server. Showing empty results.';
        }
      }
    });
  }


  LogOut(): void {
    sessionStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  extractFilterOptions() {
    // Extract unique departments
    this.departments = [...new Set(this.employees.map(emp => emp.department).filter(dept => dept))];
    
    // Extract unique skills
    const allSkills = this.employees
      .map(emp => emp.skills)
      .filter(skill => skill)
      .flatMap(skill => skill.split(',').map(s => s.trim()));
    this.skills = [...new Set(allSkills)];
  }

  extractProjectFilterOptions() {
    // Extract unique clients
    this.clients = [...new Set(this.projects.map(proj => proj.client).filter(client => client))];
  }

  calculateStatistics() {
    this.totalEmployees = this.employees.length;
    this.totalProjects = this.projects.length;
    this.activeProjects = this.projects.filter(proj => 
      !proj.endDate || new Date(proj.endDate) > new Date()
    ).length;
    this.employeesWithProjects = this.employees.filter(emp => emp.project).length;
  }

  onReportTypeChange() {
    this.clearFilters();
    this.applyFilters();
  }

  clearFilters() {
    this.departmentFilter = '';
    this.skillFilter = '';
    this.projectStatusFilter = '';
    this.clientFilter = '';
  }

  applyFilters() {
    if (this.reportType === 'employee') {
      this.filteredEmployees = this.employees.filter(emp => {
        const departmentMatch = !this.departmentFilter || emp.department === this.departmentFilter;
        const skillMatch = !this.skillFilter || 
          (emp.skills && emp.skills.toLowerCase().includes(this.skillFilter.toLowerCase()));
        return departmentMatch && skillMatch;
      });
    } else {
      this.filteredProjects = this.projects.filter(proj => {
        const statusMatch = !this.projectStatusFilter || 
          (this.projectStatusFilter === 'active' ? 
            (!proj.endDate || new Date(proj.endDate) > new Date()) :
            (proj.endDate && new Date(proj.endDate) <= new Date()));
        const clientMatch = !this.clientFilter || proj.client === this.clientFilter;
        return statusMatch && clientMatch;
      });
    }
  }

  exportToCSV() {
    let csvContent = '';
    let headers = '';
    let data = [];

    if (this.reportType === 'employee') {
      headers = 'Name,Email,Mobile,Department,Skills,Date of Joining,Project\n';
      data = this.filteredEmployees.map(emp => 
        `"${emp.name}","${emp.email}","${emp.mobile}","${emp.department}","${emp.skills}","${emp.doj}","${emp.project?.name || 'N/A'}"`
      );
    } else {
      headers = 'Project Name,Description,Client,Required Skills,Start Date,End Date,Status\n';
      data = this.filteredProjects.map(proj => {
        const status = (!proj.endDate || new Date(proj.endDate) > new Date()) ? 'Active' : 'Completed';
        return `"${proj.name}","${proj.description}","${proj.client}","${proj.requiredSkill}","${proj.startDate || 'N/A'}","${proj.endDate || 'N/A'}","${status}"`;
      });
    }

    csvContent = headers + data.join('\n');
    this.downloadCSV(csvContent, `${this.reportType}-report.csv`);
  }

  downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  refreshData() {
    this.loadData();
  }

  // Helper methods for template date comparisons
  isProjectActive(project: project): boolean {
    if (!project.endDate) {
      return true;
    }
    return new Date(project.endDate) > new Date();
  }

  isProjectCompleted(project: project): boolean {
    if (!project.endDate) {
      return false;
    }
    return new Date(project.endDate) <= new Date();
  }
}
