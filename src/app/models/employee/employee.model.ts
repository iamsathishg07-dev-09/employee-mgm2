import { project } from "../project/project.model";

  export interface Employee {
    account: any;
    id:number
    name: string;
    dob: string;
    email:string;
    mobile:string;
    gender: string;
    department: string;
    skills: string;
    doj:string;
    project:any;  
    [key: string]: any;
  }
  