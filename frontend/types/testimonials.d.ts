export interface Testimonial {
  _id: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    name: string;
    profileUrl: string;
  };
}

export interface TestimonialQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  isApproved?: boolean;
}

export interface TestimonialRequest {
  rating: number;
  title: string;
  content: string;
}

export interface TestimonialStats {
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  averageRating: number;
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
}
