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
  Settings as SettingsIcon,
  Building,
  Bell,
  Shield,
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

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    allowNewRegistrations: true,
    businessName: "Tyler's Laundry",
    businessEmail: 'admin@tylerslaundry.com',
    businessPhone: '+1 (555) 123-4567',
    businessAddress: '123 Laundry Street, Clean City, CC 12345',
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

  const handleSystemSettingsChange = (key: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    toast.success('System setting updated');
  };

  if (isLoadingUser) {
    return <SettingsPageSkeleton />;
  }

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

        <TabsContent value='system'>
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <TextInputField
                    label='Business Name'
                    name='businessName'
                    value={systemSettings.businessName}
                    onChange={e =>
                      handleSystemSettingsChange('businessName', e.target.value)
                    }
                  />
                  <TextInputField
                    label='Business Email'
                    name='businessEmail'
                    type='email'
                    value={systemSettings.businessEmail}
                    onChange={e =>
                      handleSystemSettingsChange(
                        'businessEmail',
                        e.target.value,
                      )
                    }
                  />
                  <TextInputField
                    label='Business Phone'
                    name='businessPhone'
                    value={systemSettings.businessPhone}
                    onChange={e =>
                      handleSystemSettingsChange(
                        'businessPhone',
                        e.target.value,
                      )
                    }
                  />
                </div>
                <TextareaField
                  label='Business Address'
                  value={systemSettings.businessAddress}
                  onChange={e =>
                    handleSystemSettingsChange(
                      'businessAddress',
                      e.target.value,
                    )
                  }
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Configure system-wide settings and notifications
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
                      handleSystemSettingsChange('emailNotifications', checked)
                    }
                  />
                </div>

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
                      handleSystemSettingsChange('smsNotifications', checked)
                    }
                  />
                </div>

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
                      handleSystemSettingsChange('maintenanceMode', checked)
                    }
                  />
                </div>

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
                      handleSystemSettingsChange(
                        'allowNewRegistrations',
                        checked,
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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

export default AdminSettingsPage;
