# Paylocity Benefits Calculator

A Next.js application for calculating employee benefits costs, including dependents and discounts.

## Features

- Add, edit, and delete employees
- Add, edit, and delete dependents
- Automatic calculation of benefits costs
- 10% discount for names starting with 'A'
- Real-time cost updates
- Responsive design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- React 18
- Redux Toolkit
- React Bootstrap
- Jest
- React Testing Library

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm 9.6.7 or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/paylocity-benefits-calc.git
cd paylocity-benefits-calc
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # React components
│   ├── __tests__/        # Component tests
│   ├── Employee.tsx      # Employee component
│   ├── EmployeeForm.tsx  # Employee form modal
│   ├── EmployeeList.tsx  # Employee list component
│   └── DependentForm.tsx # Dependent form modal
├── services/             # API services
│   ├── __tests__/       # Service tests
│   └── benefitsService.ts
├── store/               # Redux store
│   ├── benefitsSlice.ts # Benefits slice
│   └── store.ts        # Store configuration
└── types/              # TypeScript types
    └── benefits.ts     # Benefits types
```

## Business Logic

### Benefits Calculation

- Employee cost: $1,000/year
- Dependent cost: $500/year
- 10% discount for names starting with 'A'
- 26 paychecks per year
- $2,000 per paycheck before deductions

### API Endpoints

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/[id]` - Get employee benefits
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee
- `POST /api/employees/[id]/dependents` - Add dependent
- `PUT /api/employees/[id]/dependents` - Update dependent
- `DELETE /api/employees/[id]/dependents` - Delete dependent
- `GET /api/benefits/total` - Get total benefits calculation

## Development Notes

### Performance Optimizations

- React.memo for component memoization
- useCallback for event handlers
- useMemo for derived calculations
- Proper list rendering with keys
- Redux state management
- API response caching

### Future Improvements

- Add proper database integration
- Add authentication/authorization
- Add more sophisticated error handling
- Add more comprehensive testing
- Add proper logging and monitoring
- Add proper analytics
- Add proper documentation
- Add proper CI/CD
- Add proper deployment
- Add proper security measures

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 