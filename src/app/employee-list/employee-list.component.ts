import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { Employee } from '../models/employee/employee.model';
import { MessageComponent } from '../message/message.component';
import { AccountService } from '../services/account.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import * as XLSX from 'xlsx';
import { Chart, registerables } from 'chart.js'; // Import Chart and registerables
import { HeaderComponent } from '../shared/header/header.component';

// Register all Chart.js components
Chart.register(...registerables);

declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink, FormsModule, MessageComponent, ConfirmationModalComponent, HeaderComponent],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, AfterViewInit {

  //main view variables
  allEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];
  isLoading:boolean=true;

  //message modal view variable
  message: string | null = null;


  //pagination variables
  currentPage: number = 1;
  pageSize: number = 5;
  totalItems: number = 0;
  totalPages: number = 0;
  maxVisiblePages=5;

  //suggestion text field variables
  searchTerm: string = '';
  filteredSuggestions: Employee[] = [];
  selectedEmployee: Employee | null = null;

  //confirmation messageBox variables
  showConfirmationModal: boolean = false;
  confirmationMessage: string = '';
  employeeToDelete: Employee | null = null;

  // --- Sorting Variables ---
  sortColumn: string = 'null'; // Default sort column
  sortDirection: 'asc' | 'desc' = 'asc'; // Default sort direction

  private readonly USER_KEY = 'loggedInUsername';
  loggedInUsername: string | null = null; // Type it as string | null

  @ViewChild('genderPieChartCanvas') genderPieChartCanvas!: ElementRef<HTMLCanvasElement>;
  private genderPieChart: Chart | undefined;

  @ViewChild('departmentPieChartCanvas') departmentPieChartCanvas!: ElementRef<HTMLCanvasElement>;
  private departmentPieChart: Chart | undefined;

  @ViewChild('skillsDoughnutChartCanvas') skillsDoughnutChartCanvas!: ElementRef<HTMLCanvasElement>;
  private skillsDoughnutChart: Chart | undefined;

  private lastNavigationUrl: string | null = null;





  constructor(
    private employeeService: EmployeeService,
    private accountService: AccountService,
    private router: Router
  ) { 
    
this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.lastNavigationUrl && event.restoredState) {
          // This is a back/forward navigation
          console.log('Back navigation detected');
          this.router.navigateByUrl(this.lastNavigationUrl); // Redirect to last known route
        } else {
          this.lastNavigationUrl = event.url;
        }
      }
    });
  }
  ngOnInit(): void {
   
    this.loadEmployees();
    
    // Check if we're in browser environment before accessing sessionStorage
    if (typeof window !== 'undefined') {
      this.loggedInUsername = sessionStorage.getItem(this.USER_KEY);
    } else {
      this.loggedInUsername = 'Demo User'; // Default value for SSR
    }
    

  }

  ngAfterViewInit(): void {
    this.createGenderChart();
    this.createDepartmentChart();
    this.createSkillsDoughnutChart();
  }
  getSkillsChartData(): { labels: string[], data: number[] } {
    const skillCounts: { [key: string]: number } = {};

    this.allEmployees.forEach(employee => {
      if (employee.skills) {
        // Split the skills string by comma, trim whitespace from each skill
        const skillsArray = employee.skills.split(',').map(skill => skill.trim());

        skillsArray.forEach(skill => {
          if (skill) {
            const normalizedSkill = skill.toLowerCase();
            skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
          }
        });
      }
    });

    const labels = Object.keys(skillCounts).sort();
    const data = labels.map(label => skillCounts[label]);

    return { labels, data };
  }
  createSkillsDoughnutChart(): void {
    if (this.skillsDoughnutChartCanvas && this.skillsDoughnutChartCanvas.nativeElement) {
      const ctx = this.skillsDoughnutChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        if (this.skillsDoughnutChart) {
          this.skillsDoughnutChart.destroy();
        }

        const { labels, data } = this.getSkillsChartData();

        this.skillsDoughnutChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: ['#FF5733', '#33A1FD', '#28B463', '#F1C40F', '#AF7AC5', '#E67E22', '#1ABC9C', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12', '#16A085', '#D35400', '#5DADE2'],
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {

                }
              },
              title: {
                display: true,
                text: 'Employee Skills Distribution'
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    let label = context.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed !== null) {
                      const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
                      const percentage = ((context.parsed / total) * 100).toFixed(1);
                      label += `${context.parsed} employees (${percentage}%)`;
                    }
                    return label;
                  }
                }
              }
            }
          }
        });
      }
    }
  }
  updateSkillsDoughnutChartData(): void {
    if (this.skillsDoughnutChart) {
      const { labels, data } = this.getSkillsChartData();
      this.skillsDoughnutChart.data.labels = labels;
      this.skillsDoughnutChart.data.datasets[0].data = data;
      this.skillsDoughnutChart.update();
    } else {
      this.createSkillsDoughnutChart();
      this.updateSkillsDoughnutChartData();
    }
  }

  createGenderChart(): void {
    if (this.genderPieChartCanvas && this.genderPieChartCanvas.nativeElement) {
      const ctx = this.genderPieChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        // Destroy existing chart if it exists to prevent multiple instances
        if (this.genderPieChart) {
          this.genderPieChart.destroy();
        }

        const { labels, data } = this.getGenderChartData();

        this.genderPieChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: ['#007bff', '#dc3545', '#ffc107', '#6f42c1', '#17a2b8', '#fd7e14',],
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false, // Allow canvas to resize based on container
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Employee Gender Distribution'
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    let label = context.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed !== null) {
                      const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
                      const percentage = ((context.parsed / total) * 100).toFixed(1);
                      label += `${context.parsed} employees (${percentage}%)`;
                    }
                    return label;
                  }
                }
              }
            }
          }
        });
      }
    }
  }
  getGenderChartData(): { labels: string[], data: number[] } {
    const genderCounts: { [key: string]: number } = {};

    this.allEmployees.forEach(employee => {
      const gender = employee.gender || 'Unknown';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    const labels = Object.keys(genderCounts);
    const data = Object.values(genderCounts);

    return { labels, data };
  }

  // Call this method whenever  employee data changes (add, edit, delete)
  updateGenderChartData(): void {
    if (this.genderPieChart) {
      const { labels, data } = this.getGenderChartData();
      this.genderPieChart.data.labels = labels;
      this.genderPieChart.data.datasets[0].data = data;
      this.genderPieChart.update(); // Update the chart
    } else {
      this.createGenderChart(); // Create if not already created
    }
  }

  createDepartmentChart(): void {
    if (this.departmentPieChartCanvas && this.departmentPieChartCanvas.nativeElement) {
      const ctx = this.departmentPieChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        if (this.departmentPieChart) {
          this.departmentPieChart.destroy();
        }

        const { labels, data } = this.getDepartmentChartData();

        this.departmentPieChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1', '#17a2b8', '#fd7e14',],
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Employee Department Distribution' },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    let label = context.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed !== null) {
                      const total = context.dataset.data.reduce((sum: number, value: number) => sum + value, 0);
                      const percentage = ((context.parsed / total) * 100).toFixed(1);
                      label += `${context.parsed} employees (${percentage}%)`;
                    }
                    return label;
                  }
                }
              }
            }
          }
        });
      }
    }
  }

  getDepartmentChartData(): { labels: string[], data: number[] } {
    const departmentCounts: { [key: string]: number } = {};
    this.allEmployees.forEach(employee => {
      const department = employee.department || 'Unknown';
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });
    const labels = Object.keys(departmentCounts);
    const data = Object.values(departmentCounts);
    return { labels, data };
  }

  updateDepartmentChartData(): void {
    if (this.departmentPieChart) {
      const { labels, data } = this.getDepartmentChartData();
      this.departmentPieChart.data.labels = labels;
      this.departmentPieChart.data.datasets[0].data = data;
      this.departmentPieChart.update();
    } else {
      this.createDepartmentChart();
    }
  }

  LogOut(): void {
    sessionStorage.removeItem(this.USER_KEY);
    console.log('Logging out (placeholder action)');
    this.router.navigate(['/login']);
  }
  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data: Employee[]) => {
        this.allEmployees = data;
        setTimeout(()=>{
          this.isLoading = false;
        },3000)
        this.applyPagination();
        this.updateGenderChartData();
        this.updateDepartmentChartData();
        this.updateSkillsDoughnutChartData();
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.isLoading = false;
        // Set empty data to show the UI properly
        this.allEmployees = [];
        this.applyPagination();
        this.showError('Failed to load employees. Please check your connection or try again later.');
      }
    });
  }
  sortEmployees(): void {
    if (this.selectedEmployee) {
      return;
    }

    this.allEmployees.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (this.sortColumn) {
        case 'name':
        case 'department':
        case 'gender':
          valA = a[this.sortColumn]?.toLowerCase();
          valB = b[this.sortColumn]?.toLowerCase();
          break;
        case 'doj':
          valA = new Date(a.doj || 0);
          valB = new Date(b.doj || 0);
          break;
        default:
          valA = a[this.sortColumn];
          valB = b[this.sortColumn];
      }

      if (valA < valB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    this.applyPagination(); // Re-apply pagination after sorting
  }
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortEmployees();
  }

  applyPagination(): void {
    if (this.selectedEmployee) {
      this.paginatedEmployees = [this.selectedEmployee];
      this.totalItems = 1;
      this.totalPages = 1;
      this.currentPage = 1;
    } else {
      this.totalItems = this.allEmployees.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);

      if (this.currentPage > this.totalPages && this.totalPages > 0) { 
        this.currentPage = this.totalPages;
      } else if (this.totalPages === 0) {
        this.currentPage = 1;
      }

      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize,this.totalItems);
      this.paginatedEmployees = this.allEmployees.slice(startIndex, endIndex);
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyPagination();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  goToPage(page:string | number): void {
    if(typeof page==='string')
    {
       return;
    }
    if( page >= 1 && page <= this.totalPages && page!=this.currentPage) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  getPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    if(this.totalPages<=this.maxVisiblePages)
    {
      for(let i=1; i<=this.totalPages;i++)
      {
        pages.push(i);
      }
    }
    else{ 
      let startPage=Math.max(1,this.currentPage-Math.floor(this.maxVisiblePages/2));
      let endPage=startPage+this.maxVisiblePages-1;
      if(endPage>this.totalPages)
      {
        endPage=this.totalPages;
        startPage=endPage-this.maxVisiblePages+1;
      }
      for(let j=startPage;j<=endPage; j++)
      {
         pages.push(j);
      } 
      if(endPage<this.totalPages)
      {
         pages.push('...');
      }
    }  
    return pages;
  }

  addNewEmployee(): void {
    // this.router.navigate(['/employee-form']);
    this.router.navigateByUrl("employee-form")
  }

  confirmDeleteEmployee(employee: Employee) {
    this.employeeToDelete = employee;
    this.confirmationMessage = `Are you sure you want to delete employee '${employee.name}'? This action cannot be undone.`;
    this.showConfirmationModal = true; // Show the confirmation modal
  }
  deleteEmployee(confirmed: boolean): void {
    this.showConfirmationModal = false;
    if (confirmed && this.employeeToDelete) {
      const employee = this.employeeToDelete;
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => {
          this.accountService.deleteByMobileNumber(employee.account.mobileNumber).subscribe({
            next: () => {
              this.showSuccess('Employee and associated account deleted successfully!');
              this.loadEmployees();
            },
            error: (err) => {
              this.showError(err.message);
            }
          });
        },
        error: (err) => {
          this.showError('Error deleting employee: ' + (err.error?.message));
        }
      });
    }
  }

  showSuccess(msg: string): void {
    this.message = msg;
  }

  showError(msg: string): void {
    this.message = msg;

  }

  onSearchChange(): void {
    this.selectedEmployee = null;

    if (this.searchTerm.trim().length < 3) {
      this.filteredSuggestions = [];
      this.applyPagination();
      return;
    }
    
    this.filteredSuggestions = this.allEmployees.filter(employee =>
      employee.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    ).slice(0, 10); // Limit suggestions to 5


    this.applyPagination();
  }

  selectEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    this.searchTerm = employee.name;
    this.filteredSuggestions = [];
    this.applyPagination();
  }

  clearSearchAndSelection(reload: boolean = true): void {
    this.searchTerm = '';
    this.filteredSuggestions = [];
    this.selectedEmployee = null;
    if (reload) {
      this.loadEmployees();
    } else {
      this.sortEmployees();
    }
  }
  downloadPdf(): void {
    if (this.allEmployees.length === 0) {
      this.showError('No employees to download.');
      return;
    }

    const doc = new jsPDF('landscape');

    const head = [['Name', 'Department', 'Gender', 'DOB', 'Email', 'Skills', 'DOJ', 'Mobile', 'AccountNumber', 'BankName', 'IfscCode', 'BranchAddress','projectId','ProjectName']];
    console.log(this.allEmployees);
    const body = this.allEmployees.map(employee=> [
      employee.name,
      employee.department,
      employee.gender,
      employee.dob,
      employee.email,
      employee.skills,
      employee.doj,
      employee.account.mobileNumber,
      employee.account.accountNumber,
      employee.account.bankName,
      employee.account.ifscCode,
      employee.account.branchAddress,
      employee.project?.id,
      employee.project?.name,
    ])

    doc.setFontSize(18);
    doc.text('Employee List', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);


    autoTable(doc, {
      head: head,
      body: body,
      startY: 40,
      theme: 'striped',
      headStyles: {
        fillColor: [40, 53, 147]
      },
      styles: {
        cellPadding: 3,
        fontSize: 6,
        valign: 'middle',
        halign: 'center'
      },
    });

    doc.save('employee-list.pdf');
    this.showSuccess('Employee list downloaded as PDF!');

  }
  downloadExcel(): void {
    if (this.allEmployees.length === 0) {
      this.showError('No employees to download.');
      return;
    }

    const dataForExcel = this.allEmployees.map(employee => ({
      'Name': employee.name,
      'Department': employee.department,
      'Gender': employee.gender,
      'Date of Birth': employee.dob,
      'Email': employee.email,
      'Skills': employee.skills,
      'Date of Joining': employee.doj,
      'Mobile Number': employee.account?.mobileNumber,
      'Account Number': employee.account?.accountNumber,
      'Bank Name': employee.account?.bankName,
      'IFSC Code': employee.account?.ifscCode,
      'Branch Address': employee.account?.branchAddress
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee List');

    XLSX.writeFile(wb, 'employee-list.xlsx');

    this.showSuccess('Employee list downloaded as Excel!');
  }

  // Statistics methods for the new UI
  getGenderCount(gender: string): number {
    return this.allEmployees.filter(emp => emp.gender === gender).length;
  }

  getUniqueDepartments(): number {
    const departments = new Set(this.allEmployees.map(emp => emp.department));
    return departments.size;
  }

  // Missing methods for the new UI
  onDeleteConfirmed(): void {
    if (this.employeeToDelete) {
      this.deleteEmployee(true);
    }
    this.showConfirmationModal = false;
  }

  onDeleteCancelled(): void {
    this.employeeToDelete = null;
    this.showConfirmationModal = false;
  }

}
