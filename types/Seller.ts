export interface Seller {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  firebaseUid: string;

  // Store Info
  storeName?: string;
  storeUrl?: string;
  slug?: string;
  storeDescription?: string;
  storeLogoUrl?: string;
  storeBannerUrl?: string;
  storeAnnouncement?: string;

  // Rating & Category
  ratingAverage?: number;
  ratingCount?: number;
  productCategories?: string[];

  // Identity
  taxId?: string;
  isVerified?: boolean;
  status?: 'active' | 'pending' | 'suspended' | 'rejected';

  // Contact
  website?: string;
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };

  // Location
  location?: {
    province?: string;
    city?: string;
    district?: string;
    postalCode?: string;
  };

  // Optional Policies
  returnPolicy?: string;
  shippingPolicy?: string;
  paymentMethods?: string[];

  // Metadata (frontend expect string or Date, backend Timestamp)
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SellerCreateInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;

  storeName?: string;
  storeUrl?: string;
  slug?: string;
  storeDescription?: string;
  storeLogoUrl?: string;
  storeBannerUrl?: string;
  storeAnnouncement?: string;

  productCategories?: string[];

  taxId?: string;
  website?: string;
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };

  location?: {
    province?: string;
    city?: string;
    district?: string;
    postalCode?: string;
  };

  returnPolicy?: string;
  shippingPolicy?: string;
  paymentMethods?: string[];
}

export type SellerUpdatePayload = Partial<SellerCreateInput>;
