export interface ContactPerson {
  name: string;
  phone?: string;
  email?: string;
  position?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billingAddress?: string;
  contactPersons?: ContactPerson[];
  loyaltyMemberId?: string;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type CustomerCreateInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>

export interface CustomerUpdateInput {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
}

export type CustomerUpdatePayload = Omit<CustomerUpdateInput, 'id'>;
