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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  User as UserIcon,
  Lock,
  Trash2,
  Upload,
  Settings as SettingsIcon,
  Clock,
  Star,
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
import { SettingsPageSkeleton } from '@/components/loadings/settings-skeletons';
import { Badge } from '@/components/ui/badge';
import TextareaField from '@/components/form/textarea-field';
import TextInputField from '@/components/form/text-input-field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

type BusinessHour = {
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

const DEFAULT_BUSINESS_HOURS: BusinessHour[] = [
  { day: 'Monday', open: '07:00', close: '20:00', closed: false },
  { day: 'Tuesday', open: '07:00', close: '20:00', closed: false },
  { day: 'Wednesday', open: '07:00', close: '20:00', closed: false },
  { day: 'Thursday', open: '07:00', close: '20:00', closed: false },
  { day: 'Friday', open: '07:00', close: '20:00', closed: false },
  { day: 'Saturday', open: '08:00', close: '18:00', closed: false },
  { day: 'Sunday', open: '09:00', close: '17:00', closed: false },
];

const AdminSettingsPage = () => {
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
    defaultValues: { name: '', email: '', phone: '', address: '' },
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
    defaultValues: { currentPassword: '', deletionReason: '' },
  });

  const [systemSettings, setSystemSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    allowNewRegistrations: true,
    minReviewRating: 4,
    businessName: "Tyler's Laundry",
    businessEmail: 'admin@tylerslaundry.com',
    businessPhone: '+1 (555) 123-4567',
    businessAddress: '123 Laundry Street, Clean City, CC 12345',
  });

  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(
    DEFAULT_BUSINESS_HOURS,
  );

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
      await update();
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
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePictureUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadPictureMutation.mutateAsync(selectedFile);
      await update();
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

  const handleSystemSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateBusinessHour = (
    index: number,
    field: keyof BusinessHour,
    value: string | boolean,
  ) => {
    setBusinessHours(prev =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    );
  };

  const handleSaveBusinessInfo = () => {
    // TODO: persist to backend
    toast.success('Business information saved!');
  };

  const handleSaveSystemPreferences = () => {
    // TODO: persist to backend
    toast.success('System preferences saved!');
  };

  if (isLoadingUser) return <SettingsPageSkeleton />;

  const user = currentUser ?? (session?.user as any);
  const userProfile = user.profileUrl
    ? `/api/images${user.profileUrl}`
    : undefined;

  return (
    <div className='container mx-auto pb-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Admin Settings
        </h1>
        <p className='text-gray-600'>
          Manage your admin account settings, system preferences, and business
          information
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
          <TabsTrigger value='system' className='flex items-center gap-2'>
            <SettingsIcon className='w-4 h-4' />
            System
          </TabsTrigger>
          <TabsTrigger value='danger' className='flex items-center gap-2'>
            <Trash2 className='w-4 h-4' />
            Account
          </TabsTrigger>
        </TabsList>

        {/* ── Profile ── */}
        <TabsContent value='profile'>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        .join('') ?? 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {user?.name ?? 'Admin User'}
                    </h3>
                    <p className='text-gray-600 mb-2'>{user?.email}</p>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='secondary'
                        className='bg-red-100 text-red-800'
                      >
                        Administrator
                      </Badge>
                      <Badge variant='outline'>
                        {user?.phone ?? 'No phone number'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

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
                      <LoadingSpinnerSmall /> Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Password ── */}
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
                      <LoadingSpinnerSmall /> Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Picture ── */}
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

        {/* ── System ── */}
        <TabsContent value='system'>
          <div className='space-y-6'>
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details, contact information, and
                  operating hours
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Contact details */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <TextInputField
                    label='Business Name'
                    name='businessName'
                    value={systemSettings.businessName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSystemSettingChange('businessName', e.target.value)
                    }
                  />
                  <TextInputField
                    label='Business Email'
                    name='businessEmail'
                    type='email'
                    value={systemSettings.businessEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSystemSettingChange('businessEmail', e.target.value)
                    }
                  />
                  <TextInputField
                    label='Business Phone'
                    name='businessPhone'
                    value={systemSettings.businessPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSystemSettingChange('businessPhone', e.target.value)
                    }
                  />
                </div>
                <TextareaField
                  label='Business Address'
                  value={systemSettings.businessAddress}
                  onChange={e =>
                    handleSystemSettingChange('businessAddress', e.target.value)
                  }
                  rows={3}
                />

                <Separator />

                {/* Business Hours */}
                <div>
                  <div className='flex items-center gap-2 mb-4'>
                    <Clock className='w-4 h-4 text-gray-500' />
                    <h3 className='font-semibold text-gray-900'>
                      Business Hours
                    </h3>
                    <span className='text-xs text-gray-400'>
                      — shown in the footer on the public site
                    </span>
                  </div>

                  <div className='space-y-2'>
                    {/* Header row */}
                    <div className='grid grid-cols-[120px_1fr_1fr_80px] gap-3 px-3 pb-1'>
                      <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                        Day
                      </span>
                      <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                        Opens
                      </span>
                      <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                        Closes
                      </span>
                      <span className='text-xs font-medium text-gray-500 uppercase tracking-wide text-center'>
                        Closed
                      </span>
                    </div>

                    {businessHours.map((row, i) => (
                      <div
                        key={row.day}
                        className={`grid grid-cols-[120px_1fr_1fr_80px] gap-3 items-center px-3 py-2 rounded-lg transition-colors ${
                          row.closed ? 'bg-gray-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${
                            row.closed ? 'text-gray-400' : 'text-gray-700'
                          }`}
                        >
                          {row.day}
                        </span>

                        <Input
                          type='time'
                          value={row.open}
                          disabled={row.closed}
                          onChange={e =>
                            updateBusinessHour(i, 'open', e.target.value)
                          }
                          className='h-9 text-sm disabled:opacity-40 disabled:cursor-not-allowed'
                        />

                        <Input
                          type='time'
                          value={row.close}
                          disabled={row.closed}
                          onChange={e =>
                            updateBusinessHour(i, 'close', e.target.value)
                          }
                          className='h-9 text-sm disabled:opacity-40 disabled:cursor-not-allowed'
                        />

                        <div className='flex justify-center'>
                          <Checkbox
                            checked={row.closed}
                            onCheckedChange={checked =>
                              updateBusinessHour(i, 'closed', !!checked)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='flex justify-end'>
                  <Button onClick={handleSaveBusinessInfo}>
                    Save Business Information
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Configure notifications, access control, and review display
                  settings
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base'>Email Notifications</Label>
                    <p className='text-sm text-gray-600'>
                      Receive email notifications for important system events
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={checked =>
                      handleSystemSettingChange('emailNotifications', checked)
                    }
                  />
                </div>

                <Separator />

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base'>SMS Notifications</Label>
                    <p className='text-sm text-gray-600'>
                      Receive SMS notifications for urgent matters
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.smsNotifications}
                    onCheckedChange={checked =>
                      handleSystemSettingChange('smsNotifications', checked)
                    }
                  />
                </div>

                <Separator />

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base'>Maintenance Mode</Label>
                    <p className='text-sm text-gray-600'>
                      Temporarily disable the system for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={checked =>
                      handleSystemSettingChange('maintenanceMode', checked)
                    }
                  />
                </div>

                <Separator />

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base'>Allow New Registrations</Label>
                    <p className='text-sm text-gray-600'>
                      Allow new customers to register accounts
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.allowNewRegistrations}
                    onCheckedChange={checked =>
                      handleSystemSettingChange(
                        'allowNewRegistrations',
                        checked,
                      )
                    }
                  />
                </div>

                <Separator />

                {/* Minimum Review Rating */}
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <div className='flex items-center gap-1.5'>
                      <Label className='text-base'>Minimum Review Rating</Label>
                      <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                    </div>
                    <p className='text-sm text-gray-600'>
                      Only display reviews with this rating or higher on the
                      public website
                    </p>
                  </div>
                  <Select
                    value={String(systemSettings.minReviewRating)}
                    onValueChange={val =>
                      handleSystemSettingChange('minReviewRating', Number(val))
                    }
                  >
                    <SelectTrigger className='w-28'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? 'star' : 'stars'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex justify-end pt-2'>
                  <Button onClick={handleSaveSystemPreferences}>
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Danger Zone ── */}
        <TabsContent value='danger'>
          <Card className='border-red-200'>
            <CardHeader>
              <CardTitle className='text-red-600'>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that will affect your admin account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className='mb-6'>
                <AlertDescription>
                  Deleting your admin account will permanently remove all your
                  data and cannot be undone. This action may affect system
                  administration.
                </AlertDescription>
              </Alert>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive' className='w-full md:w-auto'>
                    <Trash2 className='w-4 h-4 mr-2' />
                    Delete Admin Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your admin account and remove all associated data from our
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
                        label='Reason for Deletion (Optional)'
                        placeholder='Please tell us why you are deleting your account'
                        {...deleteForm.register('deletionReason')}
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
                            <LoadingSpinnerSmall /> Deleting...
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

export default AdminSettingsPage;
