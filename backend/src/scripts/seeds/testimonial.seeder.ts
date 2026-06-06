/* eslint-disable no-console */
import { Testimonial } from '../../models/testimonial.model';
import { IUser } from '../../models/user.model';

export async function clearTestimonials(): Promise<void> {
  await Testimonial.deleteMany({});
  console.log('  Cleared: testimonials');
}

export async function seedTestimonials(users: {
  user1: IUser;
  user2: IUser;
  user3: IUser;
  user4: IUser;
  user5: IUser;
}): Promise<void> {
  const { user1, user2, user3, user5 } = users;

  await Testimonial.insertMany([
    {
      userId: user1._id,
      rating: 5,
      title: 'Excellent Service!',
      content:
        "Tyler's Laundry has been a lifesaver! Their wash and fold service is incredibly convenient, and my clothes always come back clean and neatly folded. Highly recommend!",
      isApproved: true,
      isActive: true,
    },
    {
      userId: user2._id,
      rating: 5,
      title: 'Best Dry Cleaning in Town',
      content:
        "I trust Tyler's with all my delicate fabrics. Their dry cleaning service is top-notch, and they always handle my clothes with care. The staff is professional and friendly.",
      isApproved: true,
      isActive: true,
    },
    {
      userId: user3._id,
      rating: 5,
      title: 'Premium Care Is Worth Every Penny',
      content:
        'I brought in my silk blouses and was blown away by the results. Every garment came back looking brand new. The attention to detail is outstanding.',
      isApproved: true,
      isActive: true,
    },
    {
      userId: user1._id,
      rating: 4,
      title: 'Quick and Reliable',
      content:
        'Great ironing service! They turned my wrinkled shirts into crisp, professional-looking garments in no time. Very satisfied with the quality.',
      isApproved: true,
      isActive: true,
    },
    {
      userId: user5._id,
      rating: 4,
      title: 'Convenient Pickup and Delivery',
      content:
        'Love that they come right to my door. The wash and iron package is my go-to for work clothes every week. Consistent quality every time.',
      isApproved: true,
      isActive: true,
    },
    {
      userId: user2._id,
      rating: 5,
      title: 'My Favourite Laundry Service',
      content:
        "I've tried a few places in the area but Tyler's is by far the best. Friendly staff, fast turnaround, and clothes always smell fresh. Will keep coming back!",
      isApproved: false,
      isActive: true,
    },
  ]);

  console.log('  Seeded: testimonials (6 records)');
}
