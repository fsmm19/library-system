'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoanCard from '@/components/member/LoanCard';
import EmptyState from '@/components/member/EmptyState';

export default function MemberLoansPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Mock data - replace with real API calls
  const [activeLoans] = useState([
    {
      id: 1,
      material: {
        title: 'Clean Code',
        type: 'Libro',
        author: 'Robert C. Martin',
      },
      loanDate: new Date('2024-01-10'),
      returnDate: new Date('2024-01-24'),
      status: 'active' as const,
    },
    {
      id: 2,
      material: {
        title: 'El Quijote',
        type: 'Libro',
        author: 'Miguel de Cervantes',
      },
      loanDate: new Date('2024-01-15'),
      returnDate: new Date('2024-01-22'),
      status: 'due_soon' as const,
    },
    {
      id: 3,
      material: {
        title: 'JavaScript: The Good Parts',
        type: 'Libro',
        author: 'Douglas Crockford',
      },
      loanDate: new Date('2024-01-01'),
      returnDate: new Date('2024-01-18'),
      status: 'overdue' as const,
    },
  ]);

  const [loanHistory] = useState([
    {
      id: 4,
      material: {
        title: 'Design Patterns',
        type: 'Libro',
        author: 'Gang of Four',
      },
      loanDate: new Date('2023-12-01'),
      returnDate: new Date('2023-12-15'),
      actualReturnDate: new Date('2023-12-14'),
      status: 'returned' as const,
    },
    {
      id: 5,
      material: {
        title: 'The Pragmatic Programmer',
        type: 'Libro',
        author: 'Andrew Hunt',
      },
      loanDate: new Date('2023-11-15'),
      returnDate: new Date('2023-11-29'),
      actualReturnDate: new Date('2023-11-30'),
      status: 'returned' as const,
    },
  ]);

  const handleRenewLoan = (id: number) => {
    console.log('Renovar préstamo:', id);
    // Implement renewal logic
  };

  const handleViewDetails = (id: number) => {
    console.log('Ver detalles préstamo:', id);
    // Implement view details logic
  };

  const filteredActiveLoans = activeLoans.filter((loan) =>
    loan.material.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = loanHistory.filter((loan) =>
    loan.material.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mis Prestamos</h1>
        <p className="text-muted-foreground mt-1">
          Administra y renueva tus prestamos activos
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Fecha de préstamo</SelectItem>
            <SelectItem value="return">Fecha de devolución</SelectItem>
            <SelectItem value="title">título</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Prestamos activos ({activeLoans.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Historial ({loanHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filteredActiveLoans.length > 0 ? (
            filteredActiveLoans.map((loan) => (
              <LoanCard
                key={loan.id}
                {...loan}
                variant="expanded"
                onRenew={handleRenewLoan}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <EmptyState type="loans" />
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((loan) => (
                <LoanCard
                  key={loan.id}
                  id={loan.id}
                  material={loan.material}
                  loanDate={loan.loanDate}
                  returnDate={loan.returnDate}
                  status="active"
                  variant="expanded"
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="history" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
