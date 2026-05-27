export interface Appointment {
  id: string;
  name: string;
  phone: string;
  wilaya: string;
  service_type: string;
  datetime: string;
  added_by: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  buying_price: number;
  selling_price: number;
  quantity: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: 'IN' | 'OUT';
  amount: number;
  description: string;
  date: string;
  added_by: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
}
