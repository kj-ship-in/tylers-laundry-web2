export interface CreateTestimonialRequest {
  rating: number;
  title: string;
  content: string;
}

export interface UpdateTestimonialRequest {
  rating?: number;
  title?: string;
  content?: string;
}

export interface TestimonialResponse {
  id: number;
  userId: number;
  rating: number;
  title: string;
  content: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    profileUrl: string | null;
  };
}

export interface TestimonialListResponse {
  testimonials: TestimonialResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TestimonialStatsResponse {
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
}

export interface GetTestimonialsQuery {
  page?: number;
  limit?: number;
  rating?: number;
  isApproved?: boolean;
}