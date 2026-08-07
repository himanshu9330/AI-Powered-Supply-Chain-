import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KPICard } from './KPICard';

describe('KPICard Component', () => {
  it('renders title and value correctly', () => {
    render(<KPICard title="TOTAL REVENUE" value="$1,406,000" change="+14.2%" isPositive={true} />);
    expect(screen.getByText('TOTAL REVENUE')).toBeDefined();
    expect(screen.getByText('$1,406,000')).toBeDefined();
    expect(screen.getByText('+14.2%')).toBeDefined();
  });
});
