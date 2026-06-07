'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Check,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  ChevronLeft,
  Users,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

import { items, steps } from '@/mocks/dummy-data';
import ServiceDetailDialog from '@/components/dialog/ServiceDetailDialog';
import BookingDrawer from '@/components/drawer/BookingDrawer';
import { RatingDialog } from '@/components/dialog/RatingDialog';
import { AuthRequiredDialog } from '@/components/dialog/AuthRequiredDialog';
import Link from 'next/link';
import Logo from '@/components/svgs/Logo';
import { appImages } from '@/constants/app-images';
import { useSession } from 'next-auth/react';
import { LogOutConfirmation } from '@/components/logout-confirmation';
import Services from '@/components/service';
import type { Service } from '@/types/service';
import { useRouter } from 'next/navigation';
import { useMyTestimonials } from '@/hooks/useTestimonials';
import LaundryImage from '@/components/laundry-image';
import Testimonials from '@/components/testimonials';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const { data: user, status } = useSession();
  const router = useRouter();

  // Check if user already has testimonials
  const { data: myTestimonials } = useMyTestimonials();
  const existingTestimonial = myTestimonials ?? null;

  const smoothScroll = (e: React.MouseEvent<HTMLElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'home',
        'services',
        'how-it-works',
        'testimonials',
        'contact',
      ];
      const scrollPosition = window.scrollY + 100; // Offset for navbar

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBook = () => {
    if (status === 'authenticated') {
      setBookingDrawerOpen(true);
    } else {
      // Show authentication required dialog
      setAuthDialogOpen(true);
    }
  };

  const isActiveLink = (sectionId: string) => {
    return activeSection === sectionId;
  };

  return (
    <div className='min-h-screen bg-white'>
      <ServiceDetailDialog
        selectedService={selectedService}
        onClose={() => setSelectedService(null)}
        onBook={() => {
          setSelectedService(null);
          handleBook();
        }}
      />
      <BookingDrawer
        open={bookingDrawerOpen}
        onOpenChange={setBookingDrawerOpen}
      />
      <RatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        existingTestimonial={existingTestimonial}
      />
      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        title='Login Required'
        message='You need to be logged in to book a service.'
      />

      {/* Navigation */}
      <nav className='fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            <div className='flex items-center space-x-3'>
              <div className='w-16 h-10 rounded-xl flex items-center justify-center'>
                <Logo />
              </div>
            </div>

            <div className='hidden md:flex items-center space-x-6 gap-2'>
              <Link
                href='#home'
                onClick={e => smoothScroll(e, 'home')}
                className={`text-sm whitespace-nowrap transition cursor-pointer ${
                  isActiveLink('home')
                    ? 'font-semibold text-blue-600'
                    : 'hover:text-blue-500 text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                href='#services'
                onClick={e => smoothScroll(e, 'services')}
                className={`text-sm whitespace-nowrap transition cursor-pointer ${
                  isActiveLink('services')
                    ? 'font-semibold text-blue-600'
                    : 'hover:text-blue-500 text-gray-700'
                }`}
              >
                Services
              </Link>
              <Link
                href='#how-it-works'
                onClick={e => smoothScroll(e, 'how-it-works')}
                className={`text-sm whitespace-nowrap transition cursor-pointer ${
                  isActiveLink('how-it-works')
                    ? 'font-semibold text-blue-600'
                    : 'hover:text-blue-500 text-gray-700'
                }`}
              >
                How It Works
              </Link>
              <Link
                href='#testimonials'
                onClick={e => smoothScroll(e, 'testimonials')}
                className={`text-sm whitespace-nowrap transition cursor-pointer ${
                  isActiveLink('testimonials')
                    ? 'font-semibold text-blue-600'
                    : 'hover:text-blue-500 text-gray-700'
                }`}
              >
                Reviews
              </Link>
              <Link
                href='#contact'
                onClick={e => smoothScroll(e, 'contact')}
                className={`text-sm whitespace-nowrap transition cursor-pointer ${
                  isActiveLink('contact')
                    ? 'font-semibold text-blue-600'
                    : 'hover:text-blue-500 text-gray-700'
                }`}
              >
                Contact
              </Link>

              {status === 'authenticated' && (
                <Link
                  href={
                    user?.user?.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : user?.user?.role === 'STAFF'
                        ? '/staff/dashboard'
                        : '/customer/dashboard'
                  }
                  className='text-sm font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap transition'
                >
                  Dashboard
                </Link>
              )}

              <Button
                onClick={handleBook}
                className='bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-sm'
              >
                Book Now
              </Button>
              {status === 'authenticated' ? (
                <LogOutConfirmation />
              ) : (
                <Button
                  variant='outline'
                  className='border-blue-500 text-blue-600 hover:bg-blue-50 text-sm'
                  asChild
                >
                  <Link href='/login'>Log In</Link>
                </Button>
              )}
            </div>

            <button
              className='md:hidden'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className='md:hidden bg-white border-t'>
            <div className='px-4 py-4 space-y-3'>
              <Link
                href='#home'
                onClick={e => smoothScroll(e, 'home')}
                className={`block py-2 transition ${
                  isActiveLink('home')
                    ? 'font-semibold text-blue-600'
                    : 'text-gray-700 hover:text-blue-500'
                }`}
              >
                Home
              </Link>
              <Link
                href='#services'
                onClick={e => smoothScroll(e, 'services')}
                className={`block py-2 transition ${
                  isActiveLink('services')
                    ? 'font-semibold text-blue-600'
                    : 'text-gray-700 hover:text-blue-500'
                }`}
              >
                Services
              </Link>
              <Link
                href='#how-it-works'
                onClick={e => smoothScroll(e, 'how-it-works')}
                className={`block py-2 transition ${
                  isActiveLink('how-it-works')
                    ? 'font-semibold text-blue-600'
                    : 'text-gray-700 hover:text-blue-500'
                }`}
              >
                How It Works
              </Link>
              <Link
                href='#testimonials'
                onClick={e => smoothScroll(e, 'testimonials')}
                className={`block py-2 transition ${
                  isActiveLink('testimonials')
                    ? 'font-semibold text-blue-600'
                    : 'text-gray-700 hover:text-blue-500'
                }`}
              >
                Reviews
              </Link>
              <Link
                href='#contact'
                onClick={e => smoothScroll(e, 'contact')}
                className={`block py-2 transition ${
                  isActiveLink('contact')
                    ? 'font-semibold text-blue-600'
                    : 'text-gray-700 hover:text-blue-500'
                }`}
              >
                Contact
              </Link>
              {status === 'authenticated' && (
                <Link
                  href={
                    user?.user?.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : user?.user?.role === 'STAFF'
                        ? '/staff/dashboard'
                        : '/customer/dashboard'
                  }
                  className='block py-2 font-semibold text-blue-600 hover:text-blue-800 transition'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {status === 'authenticated' ? (
                <LogOutConfirmation />
              ) : (
                <Button variant='outline' className='w-full' asChild>
                  <Link href='/login'>Log In</Link>
                </Button>
              )}
              <Button
                onClick={() => {
                  handleBook();
                  setMobileMenuOpen(false);
                }}
                className='w-full bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
              >
                Book Now
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id='home'
        className='pt-32 pb-20 px-4 bg-linear-to-br from-blue-50 via-white to-orange-50'
      >
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className='space-y-8'>
              <div className='inline-block'>
                <span className='px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium'>
                  ✨ Premium Laundry Service
                </span>
              </div>
              <h1 className='text-5xl md:text-6xl font-bold text-gray-900 leading-tight'>
                Fresh Clothes,
                <span className='bg-linear-to-r from-orange-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent'>
                  {' '}
                  Delivered{' '}
                </span>
                to Your Door
              </h1>
              <p className='text-xl text-gray-600'>
                Professional laundry and dry cleaning with convenient pickup &
                delivery. Save time and get your clothes cleaned by experts.
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Button
                  onClick={() => setBookingDrawerOpen(true)}
                  size='lg'
                  className='px-8 py-6 bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-xl font-semibold text-lg'
                >
                  Schedule Pickup
                  <ArrowRight size={20} className='ml-2' />
                </Button>
                <Button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    smoothScroll(e, 'services')
                  }
                  variant='outline'
                  size='lg'
                  className='px-8 py-6 rounded-xl font-semibold text-lg'
                >
                  View Services
                </Button>
              </div>
              <div className='flex items-center gap-8 pt-4'>
                <div className='flex items-center gap-2'>
                  <Check className='text-green-500' size={20} />
                  <span className='text-gray-600'>Same-day service</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Check className='text-green-500' size={20} />
                  <span className='text-gray-600'>Free pickup & delivery</span>
                </div>
              </div>
            </div>
            <div className='relative'>
              <div className='absolute inset-0 bg-linear-to-br from-blue-400 to-orange-400 rounded-3xl transform rotate-6' />
              <div className='relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500'>
                <LaundryImage />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className='py-20 px-4 bg-white'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Why Choose Tyler&apos;s Laundry
            </h2>
            <p className='text-xl text-gray-600'>
              Trusted by thousands of customers across the city
            </p>
          </div>
          <div className='grid md:grid-cols-4 gap-8'>
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className='text-center p-6 rounded-xl hover:bg-gray-50 transition'
                >
                  <div className='w-16 h-16 bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Icon className='text-white' size={28} />
                  </div>
                  <h3 className='font-bold text-gray-900 mb-2'>{item.title}</h3>
                  <p className='text-gray-600 text-sm'>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id='services'
        className='py-20 px-4 bg-linear-to-br from-gray-50 to-blue-50'
      >
        <Services setSelectedService={setSelectedService} />
      </section>

      {/* How It Works */}
      <section id='how-it-works' className='py-20 px-4 bg-white'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              How It Works
            </h2>
            <p className='text-xl text-gray-600'>
              Simple, fast, and convenient
            </p>
          </div>
          <div className='grid md:grid-cols-4 gap-8'>
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={index} className='relative'>
                  <div className='flex flex-col justify-center items-center bg-linear-to-br from-white to-gray-50 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition border-2 border-gray-100'>
                    <div className='h-16 w-16 flex justify-center items-center bg-gray-100 rounded-full mb-4 shadow'>
                      <Icon width={32} height={32} />
                    </div>
                    <div className='w-12 h-12 bg-linear-to-r from-orange-500 to-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl'>
                      {index + 1}
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>
                      {step.title}
                    </h3>
                    <p className='text-gray-600'>{step.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className='hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10'>
                      <ChevronRight className='text-blue-400' size={32} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section
        id='testimonials'
        className='py-20 px-4 bg-linear-to-br from-blue-50 to-orange-50'
      >
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-8'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              What Our Customers Say
            </h2>
            <p className='text-xl text-gray-600 mb-6'>
              Join thousands of satisfied customers
            </p>
            <Button
              onClick={() => setRatingDialogOpen(true)}
              size='lg'
              className='bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white'
            >
              <Star className='mr-2' size={20} />
              Write a Review
            </Button>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 px-4 bg-linear-to-r from-blue-600 to-blue-700'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
            Ready to Experience Hassle-Free Laundry?
          </h2>
          <p className='text-xl text-blue-100 mb-8'>
            Sign up today and get 20% off your first order
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              asChild
              size='lg'
              className='px-10 py-6 bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-lg font-semibold'
            >
              <Link href='/signup'>Get Started Now</Link>
            </Button>
            <Button
              onClick={e => smoothScroll(e, 'contact')}
              variant='outline'
              size='lg'
              className='px-10 py-6 bg-white text-blue-600 hover:bg-gray-100 text-lg font-semibold'
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id='contact' className='bg-gray-900 text-white py-16 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-4 gap-12 mb-12'>
            <div>
              <h3 className='text-2xl font-bold mb-4 bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent'>
                Tyler&apos;s Laundry
              </h3>
              <p className='text-gray-400 mb-4'>
                Professional laundry service with a personal touch.
              </p>
              <div className='flex gap-4'>
                <Link
                  href='#'
                  className='w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition'
                >
                  <Users size={18} />
                </Link>
                <Link
                  href='#'
                  className='w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition'
                >
                  <Mail size={18} />
                </Link>
                <Link
                  href='#'
                  className='w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition'
                >
                  <Phone size={18} />
                </Link>
              </div>
            </div>
            <div>
              <h4 className='font-bold mb-4'>Quick Links</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a
                    href='#services'
                    onClick={e => smoothScroll(e, 'services')}
                    className='hover:text-white transition cursor-pointer'
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href='#how-it-works'
                    onClick={e => smoothScroll(e, 'how-it-works')}
                    className='hover:text-white transition cursor-pointer'
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setBookingDrawerOpen(true)}
                    className='hover:text-white transition cursor-pointer text-left'
                  >
                    Book Now
                  </button>
                </li>
                <li>
                  <a href='#' className='hover:text-white transition'>
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold mb-4'>Contact</h4>
              <ul className='space-y-3 text-gray-400'>
                <li className='flex items-center gap-2'>
                  <Phone size={16} />
                  <span>+220 123 4567</span>
                </li>
                <li className='flex items-center gap-2'>
                  <Mail size={16} />
                  <span>info@tylerslaundry.com</span>
                </li>
                <li className='flex items-center gap-2'>
                  <MapPin size={16} />
                  <span>Kairaba Ave, Banjul</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold mb-4'>Business Hours</h4>
              <ul className='space-y-2 text-gray-400'>
                <li className='flex items-center gap-2'>
                  <Clock size={16} />
                  <span>Mon-Fri: 7AM - 8PM</span>
                </li>
                <li className='flex items-center gap-2'>
                  <Clock size={16} />
                  <span>Sat: 8AM - 6PM</span>
                </li>
                <li className='flex items-center gap-2'>
                  <Clock size={16} />
                  <span>Sun: 9AM - 5PM</span>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 pt-8 text-center text-gray-400'>
            <p>&copy; 2025 Tyler&apos;s Laundry. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
