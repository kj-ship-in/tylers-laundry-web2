'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Camera,
  User as UserIcon,
  Lock,
  Trash2,
  Upload,
  Mail,
  Phone,
  MapPin,
  Clock,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useCurrentUser,
  useUpdateProfile,
  useChangePassword,
  useUploadProfilePicture,
  useDeleteAccount,
} from '@/hooks/useUserQuery';
import type {
  UpdateProfileFormValues,
  ChangePasswordFormValues,
  DeleteCustomerFormValues,
} from '@/utils/schemas/user-settings.schema';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteCustomerSchema,
} from '@/utils/schemas/user-settings.schema';
import LoadingSpinnerSmall from '@/components/loadings/loading-spinner-small';
import {
  ProfileOverviewSkeleton,
  ProfileFormSkeleton,
  PasswordFormSkeleton,
  PictureUploadSkeleton,
  SettingsPageSkeleton,
} from '@/components/loadings/settings-skeletons';
import type { User } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import TextareaField from '@/components/form/textarea-field';
import TextInputField from '@/components/form/text-input-field';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const StaffSettingsPage = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const uploadPictureMutation = useUploadProfilePicture();
  const deleteAccountMutation = useDeleteAccount();

  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const deleteForm = useForm<DeleteCustomerFormValues>({
    resolver: zodResolver(deleteCustomerSchema),
    defaultValues: {
      currentPassword: '',
      deletionReason: '',
    },
  });

  // Work settings state
  const [workSettings, setWorkSettings] = useState({
    isActive: true,
    workSchedule: 'full-time',
    skills: [] as string[],
    maxDailyBookings: 10,
    preferredShift: 'morning',
    emergencyContact: '',
    emergencyPhone: '',
    yearsOfExperience: '',
    specializations: [] as string[],
  });

  // Reset profile form when user data loads
  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        name: currentUser.name ?? '',
        email: currentUser.email ?? '',
        phone: currentUser.phone ?? '',
        address: currentUser.address ?? '',
      });
    }
  }, [currentUser, profileForm]);

  const onProfileSubmit = async (values: UpdateProfileFormValues) => {
    try {
      await updateProfileMutation.mutateAsync(values);
      await update(); // Update the session
      toast.success('Profile updated successfully!');
      profileForm.reset(values);
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePasswordMutation.mutateAsync(values);
      toast.success('Password changed successfully!');
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to change password');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handlePictureUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadPictureMutation.mutateAsync(selectedFile);
      await update(); // Update the session
      toast.success('Profile picture updated successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to upload picture');
    }
  };

  const onDeleteAccount = async (values: DeleteCustomerFormValues) => {
    try {
      await deleteAccountMutation.mutateAsync(values);
      toast.success('Account deleted successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to delete account');
    }
  };

  const handleWorkSettingsChange = (key: string, value: any) => {
    setWorkSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    toast.success('Work setting updated');
  };

  const toggleSkill = (skill: string) => {
    setWorkSettings(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleSpecialization = (specialization: string) => {
    setWorkSettings(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization],
    }));
  };

  if (isLoadingUser) {
    return <SettingsPageSkeleton />;
  }

  const user = currentUser ?? (session?.user as any);

  const userProfile = user.profileUrl
    ? `/api/images${user.profileUrl}`
    : undefined;

  const availableSkills = [
    'Washing',
    'Drying',
    'Folding',
    'Ironing',
    'Dry Cleaning',
    'Stain Removal',
    'Quality Control',
    'Customer Service',
  ];

  const availableSpecializations = [
    'Delicate Fabrics',
    'Wedding Dresses',
    'Leather Care',
    'Sports Equipment',
    'Household Items',
    'Commercial Laundry',
  ];

  return (
    <div className='container mx-auto pb-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Staff Settings
        </h1>
        <p className='text-gray-600'>
          Manage your staff account settings, work preferences, and availability
        </p>
      </div>

      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='profile' className='flex items-center gap-2'>
            <UserIcon className='w-4 h-4' />
            Profile
          </TabsTrigger>
          <TabsTrigger value='password' className='flex items-center gap-2'>
            <Lock className='w-4 h-4' />
            Password
          </TabsTrigger>
          <TabsTrigger value='picture' className='flex items-center gap-2'>
            <Camera className='w-4 h-4' />
            Picture
          </TabsTrigger>
          <TabsTrigger value='work' className='flex items-center gap-2'>
            <Briefcase className='w-4 h-4' />
            Work
          </TabsTrigger>
          <TabsTrigger value='danger' className='flex items-center gap-2'>
            <Trash2 className='w-4 h-4' />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value='profile'>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Profile Overview Section */}
              <div className='mb-8 p-6 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-6'>
                  <Avatar className='w-20 h-20'>
                    <AvatarImage
                      src={userProfile}
                      alt={user?.name ?? 'Profile'}
                    />
                    <AvatarFallback className='text-xl'>
                      {user?.name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .join('') ?? 'S'}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1'>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {user?.name ?? 'Staff Member'}
                    </h3>
                    <p className='text-gray-600 mb-2'>{user?.email}</p>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='secondary'
                        className='bg-blue-100 text-blue-800'
                      >
                        Staff
                      </Badge>
                      <Badge
                        variant='outline'
                        className={
                          workSettings.isActive
                            ? 'border-green-500 text-green-700'
                            : 'border-red-500 text-red-700'
                        }
                      >
                        {workSettings.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className='space-y-6'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <TextInputField
                    control={profileForm.control}
                    name='name'
                    label='Full Name'
                    placeholder='Enter your full name'
                    error={profileForm.formState.errors.name?.message}
                  />

                  <TextInputField
                    control={profileForm.control}
                    name='email'
                    label='Email Address'
                    type='email'
                    placeholder='Enter your email'
                    error={profileForm.formState.errors.email?.message}
                  />

                  <TextInputField
                    control={profileForm.control}
                    name='phone'
                    label='Phone Number'
                    placeholder='Enter your phone number'
                    error={profileForm.formState.errors.phone?.message}
                  />

                  <TextInputField
                    control={profileForm.control}
                    name='address'
                    label='Address'
                    placeholder='Enter your address'
                    error={profileForm.formState.errors.address?.message}
                  />
                </div>

                <Button
                  type='submit'
                  disabled={updateProfileMutation.isPending}
                  className='w-full md:w-auto'
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <LoadingSpinnerSmall />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='password'>
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className='space-y-6'
              >
                <TextInputField
                  control={passwordForm.control}
                  name='currentPassword'
                  label='Current Password'
                  type='password'
                  placeholder='Enter current password'
                  error={passwordForm.formState.errors.currentPassword?.message}
                />

                <TextInputField
                  control={passwordForm.control}
                  name='newPassword'
                  label='New Password'
                  type='password'
                  placeholder='Enter new password'
                  error={passwordForm.formState.errors.newPassword?.message}
                />

                <TextInputField
                  control={passwordForm.control}
                  name='confirmPassword'
                  label='Confirm New Password'
                  type='password'
                  placeholder='Confirm new password'
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />

                <Button
                  type='submit'
                  disabled={changePasswordMutation.isPending}
                  className='w-full md:w-auto'
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <LoadingSpinnerSmall />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='picture'>
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a new profile picture for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='flex items-center gap-6'>
                  <Avatar className='w-24 h-24'>
                    <AvatarImage
                      src={previewUrl ?? userProfile}
                      alt={user?.name ?? 'Profile'}
                    />
                    <AvatarFallback className='text-lg'>
                      {user?.name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .join('') ?? 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className='space-y-4'>
                    <div>
                      <Label
                        htmlFor='picture-upload'
                        className='cursor-pointer'
                      >
                        <div className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50'>
                          <Upload className='w-4 h-4' />
                          Choose File
                        </div>
                        <Input
                          id='picture-upload'
                          type='file'
                          accept='image/*'
                          onChange={handleFileSelect}
                          className='hidden'
                        />
                      </Label>
                      {selectedFile && (
                        <p className='text-sm text-gray-600 mt-1'>
                          {selectedFile.name}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handlePictureUpload}
                      disabled={
                        !selectedFile || uploadPictureMutation.isPending
                      }
                      className='min-w-32'
                    >
                      {uploadPictureMutation.isPending ? (
                        <div className='flex items-center gap-2'>
                          <LoadingSpinnerSmall size='w-4 h-4' />
                          Uploading...
                        </div>
                      ) : (
                        'Upload Picture'
                      )}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    Supported formats: JPG, PNG, GIF. Maximum file size: 5MB.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='work'>
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Work Status & Availability</CardTitle>
                <CardDescription>
                  Manage your work status and availability preferences
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base'>Active Status</Label>
                    <p className='text-sm text-gray-600'>
                      Set your availability for accepting new bookings
                    </p>
                  </div>
                  <Switch
                    checked={workSettings.isActive}
                    onCheckedChange={checked =>
                      handleWorkSettingsChange('isActive', checked)
                    }
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Work Schedule</Label>
                    <Select
                      value={workSettings.workSchedule}
                      onValueChange={value =>
                        handleWorkSettingsChange('workSchedule', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select schedule' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='full-time'>Full Time</SelectItem>
                        <SelectItem value='part-time'>Part Time</SelectItem>
                        <SelectItem value='flexible'>Flexible</SelectItem>
                        <SelectItem value='weekends-only'>
                          Weekends Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label>Preferred Shift</Label>
                    <Select
                      value={workSettings.preferredShift}
                      onValueChange={value =>
                        handleWorkSettingsChange('preferredShift', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select shift' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='morning'>
                          Morning (6AM-2PM)
                        </SelectItem>
                        <SelectItem value='afternoon'>
                          Afternoon (2PM-10PM)
                        </SelectItem>
                        <SelectItem value='night'>Night (10PM-6AM)</SelectItem>
                        <SelectItem value='flexible'>Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <TextInputField
                    label='Max Daily Bookings'
                    name='maxDailyBookings'
                    type='number'
                    onChange={e =>
                      handleWorkSettingsChange(
                        'maxDailyBookings',
                        parseInt(e.target.value),
                      )
                    }
                    min={1}
                    max={50}
                  />

                  <TextInputField
                    label='Years of Experience'
                    name='yearsOfExperience'
                    placeholder='e.g., 3 years'
                    value={workSettings.yearsOfExperience}
                    onChange={e =>
                      handleWorkSettingsChange(
                        'yearsOfExperience',
                        e.target.value,
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills & Specializations</CardTitle>
                <CardDescription>
                  Select your skills and areas of specialization
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <Label className='text-base mb-3 block'>Skills</Label>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                    {availableSkills.map(skill => (
                      <Button
                        key={skill}
                        type='button'
                        variant={
                          workSettings.skills.includes(skill)
                            ? 'default'
                            : 'outline'
                        }
                        size='sm'
                        onClick={() => toggleSkill(skill)}
                        className='justify-start'
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className='text-base mb-3 block'>
                    Specializations
                  </Label>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                    {availableSpecializations.map(specialization => (
                      <Button
                        key={specialization}
                        type='button'
                        variant={
                          workSettings.specializations.includes(specialization)
                            ? 'default'
                            : 'outline'
                        }
                        size='sm'
                        onClick={() => toggleSpecialization(specialization)}
                        className='justify-start'
                      >
                        {specialization}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>
                  Provide emergency contact information for urgent situations
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <TextInputField
                  label='Emergency Contact Name'
                  name='emergencyContact'
                  placeholder='Enter emergency contact name'
                  value={workSettings.emergencyContact}
                  onChange={e =>
                    handleWorkSettingsChange('emergencyContact', e.target.value)
                  }
                />

                <TextInputField
                  label='Emergency Contact Phone'
                  name='emergencyPhone'
                  placeholder='Enter emergency contact phone'
                  value={workSettings.emergencyPhone}
                  onChange={e =>
                    handleWorkSettingsChange('emergencyPhone', e.target.value)
                  }
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='danger'>
          <Card className='border-red-200'>
            <CardHeader>
              <CardTitle className='text-red-600'>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that will affect your staff account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className='mb-6'>
                <AlertDescription>
                  Deleting your staff account will permanently remove all your
                  data and cannot be undone. This action may affect ongoing
                  bookings and services.
                </AlertDescription>
              </Alert>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive' className='w-full md:w-auto'>
                    <Trash2 className='w-4 h-4 mr-2' />
                    Delete Staff Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your staff account and remove all associated data from our
                      servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <form onSubmit={deleteForm.handleSubmit(onDeleteAccount)}>
                    <div className='space-y-4 py-4'>
                      <TextInputField
                        control={deleteForm.control}
                        name='currentPassword'
                        label='Current Password'
                        type='password'
                        placeholder='Enter your current password'
                        error={
                          deleteForm.formState.errors.currentPassword?.message
                        }
                      />

                      <TextareaField
                        control={deleteForm.control}
                        name='deletionReason'
                        label='Reason for Deletion (Optional)'
                        placeholder='Please tell us why you are deleting your account'
                        rows={3}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        type='submit'
                        className='bg-red-600 hover:bg-red-700'
                        disabled={deleteAccountMutation.isPending}
                      >
                        {deleteAccountMutation.isPending ? (
                          <>
                            <LoadingSpinnerSmall />
                            Deleting...
                          </>
                        ) : (
                          'Delete Account'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </form>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffSettingsPage;
