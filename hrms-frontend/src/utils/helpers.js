// src/utils/helpers.js
import { format, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(parseISO(date), 'dd-MM-yyyy');
  } catch {
    return date;
  }
};

export const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getStatusBadge = (status) => {
  const badges = {
    APPROVED: 'badge-success',
    PRESENT: 'badge-success',
    ACTIVE: 'badge-success',
    PAID: 'badge-success',
    PENDING: 'badge-warning',
    HALF_DAY: 'badge-warning',
    GENERATED: 'badge-warning',
    REJECTED: 'badge-danger',
    ABSENT: 'badge-danger',
    INACTIVE: 'badge-danger',
    ON_LEAVE: 'badge-info',
  };
  return badges[status] || 'badge-info';
};