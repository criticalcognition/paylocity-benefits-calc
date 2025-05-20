import { Employee, Dependent, CreateEmployeeRequest, CreateDependentRequest, BenefitsCalculation, BENEFITS_CONSTANTS } from '@/types/benefits';
import { promises as fs } from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'employees.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dir = path.dirname(DB_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Read from file
async function readStore(): Promise<Employee[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

// Write to file
async function writeStore(employees: Employee[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DB_FILE, JSON.stringify(employees, null, 2));
}

export async function getAllEmployees(): Promise<Employee[]> {
  return readStore();
}

export async function getEmployeeById(id: string): Promise<Employee | undefined> {
  const employees = await readStore();
  return employees.find(emp => emp.id === id);
}

export async function addEmployee(data: CreateEmployeeRequest): Promise<Employee> {
  const employees = await readStore();
  const newEmployee: Employee = {
    id: crypto.randomUUID(),
    type: 'employee',
    dependents: [],
    ...data,
  };
  employees.push(newEmployee);
  await writeStore(employees);
  return newEmployee;
}

export async function updateEmployee(updated: Employee): Promise<Employee | undefined> {
  const employees = await readStore();
  const idx = employees.findIndex(emp => emp.id === updated.id);
  if (idx === -1) return undefined;
  employees[idx] = updated;
  await writeStore(employees);
  return updated;
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const employees = await readStore();
  const before = employees.length;
  const newEmployees = employees.filter(emp => emp.id !== id);
  if (newEmployees.length < before) {
    await writeStore(newEmployees);
    return true;
  }
  return false;
}

export async function addDependent(data: CreateDependentRequest): Promise<Dependent | undefined> {
  const employees = await readStore();
  const employee = employees.find(emp => emp.id === data.employeeId);
  if (!employee) return undefined;
  
  const newDependent: Dependent = {
    id: crypto.randomUUID(),
    type: 'dependent',
    ...data,
  };
  
  const empIdx = employees.findIndex(emp => emp.id === data.employeeId);
  if (empIdx === -1) return undefined;
  
  employees[empIdx] = {
    ...employees[empIdx],
    dependents: [...employees[empIdx].dependents, newDependent]
  };
  
  await writeStore(employees);
  return newDependent;
}

export async function updateDependent(dep: Dependent): Promise<Dependent | undefined> {
  const employees = await readStore();
  const empIdx = employees.findIndex(emp => emp.id === dep.employeeId);
  if (empIdx === -1) return undefined;
  
  const depIdx = employees[empIdx].dependents.findIndex(d => d.id === dep.id);
  if (depIdx === -1) return undefined;
  
  employees[empIdx] = {
    ...employees[empIdx],
    dependents: [
      ...employees[empIdx].dependents.slice(0, depIdx),
      dep,
      ...employees[empIdx].dependents.slice(depIdx + 1)
    ]
  };
  
  await writeStore(employees);
  return dep;
}

export async function deleteDependent(employeeId: string, dependentId: string): Promise<boolean> {
  const employees = await readStore();
  const empIdx = employees.findIndex(emp => emp.id === employeeId);
  if (empIdx === -1) return false;
  
  const before = employees[empIdx].dependents.length;
  employees[empIdx] = {
    ...employees[empIdx],
    dependents: employees[empIdx].dependents.filter(dep => dep.id !== dependentId)
  };
  
  if (employees[empIdx].dependents.length < before) {
    await writeStore(employees);
    return true;
  }
  return false;
}

// Calculation logic remains synchronous since it doesn't need to access the store
export function calculateBenefits(employee: Employee): BenefitsCalculation {
  const employeeCost = BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST;
  const dependentCost = employee.dependents.length * BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST;

  const employeeDiscount = employee.firstName.toLowerCase().startsWith(BENEFITS_CONSTANTS.DISCOUNT_NAME_STARTS_WITH.toLowerCase())
    ? employeeCost * BENEFITS_CONSTANTS.DISCOUNT_PERCENTAGE
    : 0;

  const dependentDiscount = employee.dependents.reduce((total, dependent) => {
    return total + (dependent.firstName.toLowerCase().startsWith(BENEFITS_CONSTANTS.DISCOUNT_NAME_STARTS_WITH.toLowerCase())
      ? BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST * BENEFITS_CONSTANTS.DISCOUNT_PERCENTAGE
      : 0);
  }, 0);

  const totalDiscount = employeeDiscount + dependentDiscount;
  const totalCost = employeeCost + dependentCost - totalDiscount;
  const perPaycheck = totalCost / BENEFITS_CONSTANTS.PAYCHECKS_PER_YEAR;

  return {
    employeeCost,
    dependentCost,
    discount: totalDiscount,
    totalCost,
    perPaycheck,
    perYear: totalCost,
    paycheckAfterDeductions: BENEFITS_CONSTANTS.PAYCHECK_AMOUNT - perPaycheck,
    paycheckBeforeDeductions: BENEFITS_CONSTANTS.PAYCHECK_AMOUNT,
  };
}

export async function calculateTotalBenefits(): Promise<BenefitsCalculation> {
  const employees: Employee[] = await readStore();
  const all: BenefitsCalculation[] = employees.map(calculateBenefits);
  return all.reduce(
    (acc: BenefitsCalculation, curr: BenefitsCalculation) => ({
      employeeCost: acc.employeeCost + curr.employeeCost,
      dependentCost: acc.dependentCost + curr.dependentCost,
      discount: acc.discount + curr.discount,
      totalCost: acc.totalCost + curr.totalCost,
      perPaycheck: acc.perPaycheck + curr.perPaycheck,
      perYear: acc.perYear + curr.perYear,
      paycheckAfterDeductions: BENEFITS_CONSTANTS.PAYCHECK_AMOUNT - (acc.perPaycheck + curr.perPaycheck),
      paycheckBeforeDeductions: BENEFITS_CONSTANTS.PAYCHECK_AMOUNT,
    }),
    {
      employeeCost: 0,
      dependentCost: 0,
      discount: 0,
      totalCost: 0,
      perPaycheck: 0,
      perYear: 0,
      paycheckAfterDeductions: BENEFITS_CONSTANTS.PAYCHECK_AMOUNT,
      paycheckBeforeDeductions: BENEFITS_CONSTANTS.PAYCHECK_AMOUNT,
    }
  );
}
