export interface Appointment {
  id: string;
  name: string;
  phone: string;
  wilaya: string;
  service_type: string;
  date: string | null;   // null when the appointment is urgent
  description: string;  // ✅ new field
  added_by: string;
  urgent: boolean;
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
