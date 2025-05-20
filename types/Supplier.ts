export interface ContactPerson {
  name: string;
  phone?: string;
  email?: string;
  position?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  companyName?: string;
  contactPersons?: ContactPerson[];
  taxId?: string;
  paymentTerm?: string;
  productsSupplied?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type SupplierCreateInput = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>

export interface SupplierUpdateInput {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
}

export type SupplierUpdatePayload = Omit<SupplierUpdateInput, 'id'>;
