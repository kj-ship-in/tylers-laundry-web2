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

const CustomerSettingsPage = () => {
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

  const handleUploadPicture = async () => {
    if (!selectedFile) return;

    try {
      await uploadPictureMutation.mutateAsync(selectedFile);
      await update({
        name: currentUser?.name,
        profileUrl: currentUser?.profileUrl,
      }); // Update the session
      toast.success('Profile picture updated successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to upload profile picture');
    }
  };

  const handleDeleteAccount = async (values: DeleteCustomerFormValues) => {
    try {
      await deleteAccountMutation.mutateAsync(values);
      toast.success('Account deleted successfully');
      // Redirect to login page
      router.push('/login');
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to delete account');
    }
  };

  const user = currentUser ?? (session?.user as any);

  const userProfile = user.profileUrl
    ? `/api/images${user.profileUrl}`
    : undefined;

  if (isLoadingUser) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className='container mx-auto pb-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
        <p className='text-gray-600 mt-2'>
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
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
                        .join('') ?? 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1'>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {user?.name ?? 'User'}
                    </h3>
                    <p className='text-gray-600 mb-2'>{user?.email ?? ''}</p>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='font-medium text-gray-700'>
                          Phone:
                        </span>
                        <span className='ml-2 text-gray-600'>
                          {user?.phone ?? 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className='font-medium text-gray-700'>Role:</span>
                        <span className='ml-2 text-gray-600 capitalize'>
                          {user?.role ?? 'Customer'}
                        </span>
                      </div>
                      <div className='sm:col-span-2'>
                        <span className='font-medium text-gray-700'>
                          Address:
                        </span>
                        <span className='ml-2 text-gray-600'>
                          {user?.address ?? 'Not provided'}
                        </span>
                      </div>
                    </div>

                    <div className='mt-3 flex items-center gap-4 text-xs text-gray-500'>
                      <span>
                        Member since:{' '}
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </span>
                      {user?.isVerified && (
                        <Badge className='bg-green-100 text-green-800 border border-green-800 text-xs'>
                          Verified Account
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Update Form */}
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className='space-y-6'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <TextInputField
                    control={profileForm.control}
                    name='name'
                    label='Full Name'
                    placeholder='Enter your full name'
                    prefixIcon={UserIcon}
                  />

                  <TextInputField
                    control={profileForm.control}
                    name='email'
                    label='Email Address'
                    type='email'
                    placeholder='Enter your email'
                    prefixIcon={Mail}
                  />

                  <TextInputField
                    control={profileForm.control}
                    name='phone'
                    label='Phone Number'
                    placeholder='Enter your phone number'
                    prefixIcon={Phone}
                  />

                  <TextareaField
                    control={profileForm.control}
                    name='address'
                    label='Address'
                    placeholder='Enter your address'
                    rows={3}
                  />
                </div>

                <div className='flex justify-end'>
                  <Button
                    type='submit'
                    disabled={updateProfileMutation.isPending}
                    className='min-w-32 bg-blue-500 hover:bg-blue-600 text-white'
                  >
                    {updateProfileMutation.isPending ? (
                      <div className='flex items-center gap-2'>
                        <LoadingSpinnerSmall size='w-4 h-4' />
                        Updating...
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </div>
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
                  placeholder='Enter your current password'
                  prefixIcon={Lock}
                  secureEntry
                />

                <TextInputField
                  control={passwordForm.control}
                  name='newPassword'
                  label='New Password'
                  type='password'
                  placeholder='Enter your new password'
                  prefixIcon={Lock}
                  secureEntry
                />

                <TextInputField
                  control={passwordForm.control}
                  name='confirmPassword'
                  label='Confirm New Password'
                  type='password'
                  placeholder='Confirm your new password'
                  prefixIcon={Lock}
                  secureEntry
                />

                <div className='flex justify-end'>
                  <Button
                    type='submit'
                    disabled={changePasswordMutation.isPending}
                    className='min-w-32 bg-blue-500 hover:bg-blue-600 text-white'
                  >
                    {changePasswordMutation.isPending ? (
                      <div className='flex items-center gap-2'>
                        <LoadingSpinnerSmall size='w-4 h-4' />
                        Changing...
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
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
                      onClick={handleUploadPicture}
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

        <TabsContent value='danger'>
          <Card className='border-red-200'>
            <CardHeader>
              <CardTitle className='text-red-600'>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that will affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div className='p-4 border border-red-200 rounded-lg bg-red-50'>
                  <h3 className='font-semibold text-red-900 mb-2'>
                    Delete Account
                  </h3>
                  <p className='text-red-700 text-sm mb-4'>
                    Once you delete your account, there is no going back. This
                    action cannot be undone. All your data, bookings, and
                    information will be permanently removed.
                  </p>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='destructive' className='min-w-32'>
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className='max-w-md'>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className='mb-4'>
                          This action cannot be undone. This will permanently
                          delete your account and remove all your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <form
                        onSubmit={deleteForm.handleSubmit(handleDeleteAccount)}
                        className='space-y-4'
                      >
                        <TextInputField
                          control={deleteForm.control}
                          name='currentPassword'
                          label='Current Password'
                          type='password'
                          placeholder='Enter your current password'
                          secureEntry
                        />

                        <TextareaField
                          control={deleteForm.control}
                          name='deletionReason'
                          label='Reason for deletion (Optional)'
                          placeholder='Please tell us why you are deleting your account...'
                        />

                        <AlertDialogFooter className='flex-col gap-2 sm:flex-row'>
                          <AlertDialogCancel type='button'>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            type='submit'
                            className='bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto'
                            disabled={deleteAccountMutation.isPending}
                          >
                            {deleteAccountMutation.isPending ? (
                              <div className='flex items-center gap-2'>
                                <LoadingSpinnerSmall size='w-4 h-4' />
                                Deleting...
                              </div>
                            ) : (
                              'Delete Account'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </form>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerSettingsPage;
