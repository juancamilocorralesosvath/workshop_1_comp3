export const validMembershipData = {
  name: 'Premium Membership',
  description: 'Premium gym membership with all facilities',
  price: 80000,
  duration_days: 30
};

export const invalidMembershipData = {
  // Missing required fields
  description: 'Invalid membership without name and price'
};

export const updateMembershipData = {
  name: 'Updated Premium Membership',
  description: 'Updated premium gym membership',
  price: 90000,
  duration_days: 45
};

export const membershipWithMinPrice = {
  name: 'Basic Membership',
  description: 'Basic gym membership',
  price: 1,
  duration_days: 30
};

export const membershipWithMaxPrice = {
  name: 'VIP Membership',
  description: 'VIP gym membership',
  price: 999999,
  duration_days: 365
};