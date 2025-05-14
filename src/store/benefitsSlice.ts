/**
 * @description
 * Redux slice for managing benefits state via API.
 * All CRUD and calculation logic is handled by API routes.
 * 
 * Key features:
 * - Async thunks for all employee and dependent CRUD operations.
 * - Async thunks for fetching total and per-employee benefits.
 * - State is always in sync with the API.
 * 
 * @dependencies
 * - Redux Toolkit: For slice, async thunks, and state management.
 * 
 * @notes
 * - All business logic is in the API, not in the client.
 * - This slice is the only source of truth for the UI.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  BenefitsState,
  Employee,
  Dependent,
  CreateEmployeeRequest,
  CreateDependentRequest,
  BenefitsCalculation,
} from '@/types/benefits';

interface ExtendedBenefitsState extends BenefitsState {
  totalBenefits: BenefitsCalculation | null;
  employeeBenefits: Record<string, BenefitsCalculation>;
}

const initialState: ExtendedBenefitsState = {
  employees: [],
  loading: false,
  error: null,
  selectedEmployeeId: null,
  totalBenefits: null,
  employeeBenefits: {},
};

// --- Async Thunks ---

export const fetchEmployees = createAsyncThunk<Employee[]>(
  'benefits/fetchEmployees',
  async (_, { rejectWithValue }) => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    if (data.status === 'success') return data.data;
    return rejectWithValue(data.error || 'Failed to fetch employees');
  }
);

export const addEmployeeAsync = createAsyncThunk<Employee, CreateEmployeeRequest>(
  'benefits/addEmployee',
  async (employee, { rejectWithValue }) => {
    const res = await fetch('/api/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.status === 'success') return data.data;
    return rejectWithValue(data.error || 'Failed to add employee');
  }
);

export const updateEmployeeAsync = createAsyncThunk<Employee, Employee>(
  'benefits/updateEmployee',
  async (employee, { rejectWithValue }) => {
    const res = await fetch(`/api/employees/${employee.id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.status === 'success') return data.data;
    return rejectWithValue(data.error || 'Failed to update employee');
  }
);

export const deleteEmployeeAsync = createAsyncThunk<string, string>(
  'benefits/deleteEmployee',
  async (id, { dispatch, rejectWithValue }) => {
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.status === 'success') {
      // Fetch total benefits after successful deletion
      await dispatch(fetchTotalBenefits());
      return id;
    }
    return rejectWithValue(data.error || 'Failed to delete employee');
  }
);

export const addDependentAsync = createAsyncThunk<Dependent, CreateDependentRequest>(
  'benefits/addDependent',
  async (dep, { rejectWithValue }) => {
    const res = await fetch(`/api/employees/${dep.employeeId}/dependents`, {
      method: 'POST',
      body: JSON.stringify(dep),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.status === 'success') return data.data;
    return rejectWithValue(data.error || 'Failed to add dependent');
  }
);

export const updateDependentAsync = createAsyncThunk<Dependent, Dependent>(
  'benefits/updateDependent',
  async (dep, { rejectWithValue }) => {
    const res = await fetch(`/api/employees/${dep.employeeId}/dependents`, {
      method: 'PUT',
      body: JSON.stringify(dep),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.status === 'success') return data.data;
    return rejectWithValue(data.error || 'Failed to update dependent');
  }
);

export const deleteDependentAsync = createAsyncThunk<{ employeeId: string; dependentId: string }, { employeeId: string; dependentId: string }>(
  'benefits/deleteDependent',
  async ({ employeeId, dependentId }, { rejectWithValue }) => {
    const res = await fetch(`/api/employees/${employeeId}/dependents`, {
      method: 'DELETE',
      body: JSON.stringify({ dependentId }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.status === 'success') return { employeeId, dependentId };
    return rejectWithValue(data.error || 'Failed to delete dependent');
  }
);

export const fetchTotalBenefits = createAsyncThunk<BenefitsCalculation>(
  'benefits/fetchTotalBenefits',
  async (_, { rejectWithValue }) => {
    const res = await fetch('/api/benefits/total');
    const data = await res.json();
    if (data.status === 'success') return data.data;
    return rejectWithValue(data.error || 'Failed to fetch total benefits');
  }
);

export const fetchEmployeeBenefits = createAsyncThunk<{ id: string; benefits: BenefitsCalculation }[], Employee[]>(
  'benefits/fetchEmployeeBenefits',
  async (employees, { rejectWithValue }) => {
    try {
      const results = await Promise.all(
        employees.map(async (emp) => {
          const res = await fetch(`/api/employees/${emp.id}`);
          const data = await res.json();
          if (data.status === 'success') {
            return { id: emp.id, benefits: data.data as BenefitsCalculation };
          }
          throw new Error(data.error || 'Failed to fetch employee benefits');
        })
      );
      return results;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// --- Slice ---

const benefitsSlice = createSlice({
  name: 'benefits',
  initialState,
  reducers: {
    setSelectedEmployee: (state, action: PayloadAction<string | null>) => {
      state.selectedEmployeeId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
        state.loading = false;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add employee
      .addCase(addEmployeeAsync.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      // Update employee
      .addCase(updateEmployeeAsync.fulfilled, (state, action) => {
        const idx = state.employees.findIndex(e => e.id === action.payload.id);
        if (idx !== -1) state.employees[idx] = action.payload;
      })
      // Delete employee
      .addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
        state.employees = state.employees.filter(e => e.id !== action.payload);
      })
      // Add dependent
      .addCase(addDependentAsync.fulfilled, (state, action) => {
        const emp = state.employees.find(e => e.id === action.payload.employeeId);
        if (emp) emp.dependents.push(action.payload);
      })
      // Update dependent
      .addCase(updateDependentAsync.fulfilled, (state, action) => {
        const emp = state.employees.find(e => e.id === action.payload.employeeId);
        if (emp) {
          const idx = emp.dependents.findIndex(d => d.id === action.payload.id);
          if (idx !== -1) emp.dependents[idx] = action.payload;
        }
      })
      // Delete dependent
      .addCase(deleteDependentAsync.fulfilled, (state, action) => {
        const emp = state.employees.find(e => e.id === action.payload.employeeId);
        if (emp) {
          emp.dependents = emp.dependents.filter(d => d.id !== action.payload.dependentId);
        }
      })
      // Fetch total benefits
      .addCase(fetchTotalBenefits.fulfilled, (state, action) => {
        state.totalBenefits = action.payload;
      })
      // Fetch employee benefits
      .addCase(fetchEmployeeBenefits.fulfilled, (state, action) => {
        state.employeeBenefits = {};
        action.payload.forEach(({ id, benefits }) => {
          state.employeeBenefits[id] = benefits;
        });
      });
  },
});

export const {
  setSelectedEmployee,
  setLoading,
  setError,
} = benefitsSlice.actions;

export default benefitsSlice.reducer; 