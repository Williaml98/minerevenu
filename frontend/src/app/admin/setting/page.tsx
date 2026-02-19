"use client"
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useState, useRef } from 'react'
import { useUpdateProfileMutation } from '../../../lib/redux/slices/AuthSlice'

const ProfileSettings = () => {
    const { data: sessionData, update: updateSession } = useSession()
    const [updateProfile, { isLoading }] = useUpdateProfileMutation()


    const [message, setMessage] = useState<{
        type: 'success' | 'error' | 'info' | null;
        text: string;
    }>({ type: null, text: '' })


    interface ProfileFormData {
        username: string
        email: string
        currentPassword: string
        newPassword: string
        profilePicture: File | null
    }

    const [formData, setFormData] = useState<ProfileFormData>({
        username: sessionData?.user?.name || '',
        email: sessionData?.user?.email || '',
        currentPassword: '',
        newPassword: '',
        profilePicture: null
    })

    const [emailNotifications, setEmailNotifications] = useState(true)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
        setMessage({ type, text })
        setTimeout(() => {
            setMessage({ type: null, text: '' })
        }, 5000)
    }


    interface ProfileFormData {
        username: string
        email: string
        currentPassword: string
        newPassword: string
        profilePicture: File | null
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev: ProfileFormData) => ({
            ...prev,
            [name]: value
        }))

        if (message.type) {
            setMessage({ type: null, text: '' })
        }
    }


    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file: File | undefined = e.target.files?.[0]
        if (file) {

            if (file.size > 5 * 1024 * 1024) {
                showMessage('error', '📷 Image size should be less than 5MB. Please choose a smaller image.')
                return
            }

            if (!file.type.startsWith('image/')) {
                showMessage('error', '📷 Please select a valid image file (JPG, PNG, GIF, etc.).')
                return
            }

            setFormData((prev: ProfileFormData) => ({
                ...prev,
                profilePicture: file
            }))

            const reader: FileReader = new FileReader()
            reader.onload = (event: ProgressEvent<FileReader>) => {
                setPreviewImage(event.target?.result as string)
                showMessage('info', '📷 New profile picture selected! Don\'t forget to save your changes.')
            }
            reader.readAsDataURL(file)
        }
    }

    const handleUpdatePictureClick = () => {
        fileInputRef.current?.click()
    }

    interface UpdateSessionUser {
        name?: string;
        email?: string;
        image?: string;
    }

    interface UpdateSessionData {
        user?: UpdateSessionUser;
        [key: string]: unknown;
    }

    interface UpdateProfileResult {
        username?: string;
        profile_picture?: string;
        [key: string]: unknown;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setMessage({ type: null, text: '' })

        try {
            if (formData.newPassword && !formData.currentPassword) {
                showMessage('error', '🔐 Please enter your current password to change it.')
                return
            }

            if (formData.newPassword && formData.newPassword.length < 8) {
                showMessage('error', '🔐 New password must be at least 8 characters long.')
                return
            }

            const hasChanges =
                (formData.username && formData.username !== sessionData?.user?.name) ||
                formData.profilePicture ||
                formData.newPassword

            if (!hasChanges) {
                showMessage('info', '💡 No changes detected. Update your information and try again.')
                return
            }

            const formDataToSend = new FormData()
            if (formData.username && formData.username !== sessionData?.user?.name) {
                formDataToSend.append('username', formData.username)
            }

            if (formData.profilePicture) {
                formDataToSend.append('profile_picture', formData.profilePicture)
            }

            if (formData.newPassword) {
                formDataToSend.append('current_password', formData.currentPassword)
                formDataToSend.append('new_password', formData.newPassword)
            }

            showMessage('info', '⏳ Updating your profile... Please wait.')

            const result: UpdateProfileResult = await updateProfile(formDataToSend).unwrap()

            await updateSession({
                ...sessionData,
                user: {
                    ...sessionData?.user,
                    name: result.username || sessionData?.user?.name,
                    image: result.profile_picture || sessionData?.user?.image
                }
            } as UpdateSessionData)

            setFormData((prev: ProfileFormData) => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                profilePicture: null
            }))
            setPreviewImage(null)

            let successMessage = '✅ Profile updated successfully!'
            if (formData.username !== sessionData?.user?.name && formData.newPassword) {
                successMessage = '✅ Username and password updated successfully!'
            } else if (formData.username !== sessionData?.user?.name) {
                successMessage = '✅ Username updated successfully!'
            } else if (formData.newPassword) {
                successMessage = '✅ Password updated successfully!'
            } else if (formData.profilePicture) {
                successMessage = '✅ Profile picture updated successfully!'
            }

            showMessage('success', successMessage)

        } catch (error: unknown) {
            console.error('Profile update failed:', error)

            let errorMessage = '❌ Failed to update profile. Please try again.'

            if (
                typeof error === 'object' &&
                error !== null &&
                'data' in error &&
                typeof (error as { data?: unknown }).data === 'object' &&
                (error as { data?: unknown }).data !== null
            ) {
                const errorData = (error as { data: Record<string, unknown> }).data;
                if (errorData.current_password) {
                    errorMessage = '🔐 Current password is incorrect. Please check and try again.';
                } else if (errorData.new_password) {
                    errorMessage = '🔐 New password doesn\'t meet requirements. Please use a stronger password.';
                } else if (errorData.username) {
                    errorMessage = '👤 Username is invalid or already taken. Please choose a different one.';
                } else if (errorData.profile_picture) {
                    errorMessage = '📷 There was an issue with your profile picture. Please try a different image.';
                }
            } else if (
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as { message?: unknown }).message === 'string'
            ) {
                errorMessage = `❌ ${(error as { message: string }).message}`;
            }

            showMessage('error', errorMessage)
        }
    }

    const handleEmailNotificationToggle = () => {
        setEmailNotifications(!emailNotifications)
        const newStatus = !emailNotifications
        showMessage(
            'success',
            newStatus
                ? '🔔 Email notifications enabled! You\'ll receive updates via email.'
                : '🔕 Email notifications disabled. You won\'t receive email updates.'
        )
    }

    return (
        <div className='w-full bg-white min-h-screen'>
            <div className='w-full px-4 py-6 max-w-4xl mx-auto'>
                <h1 className='text-2xl font-semibold text-gray-900 mb-8'>Profile Settings</h1>

                {/* Message Display */}
                {message.type && (
                    <div className={`mb-6 p-4 rounded-lg border-l-4 ${message.type === 'success'
                        ? 'bg-green-50 border-green-400 text-green-700'
                        : message.type === 'error'
                            ? 'bg-red-50 border-red-400 text-red-700'
                            : 'bg-blue-50 border-blue-400 text-blue-700'
                        }`}>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {message.type === 'success' && (
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {message.type === 'error' && (
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {message.type === 'info' && (
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Profile Picture Section */}
                    <div className='mb-8'>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='relative'>
                                <div className='w-20 h-20 rounded-full border-4 border-blue-200 overflow-hidden bg-indigo-900 flex items-center justify-center'>
                                    {previewImage ? (
                                        <Image
                                            src={previewImage}
                                            alt='Profile Preview'
                                            width={80}
                                            height={80}
                                            className='object-cover w-full h-full'
                                        />
                                    ) : sessionData?.user?.image ? (
                                        <Image
                                            src={sessionData.user.image}
                                            alt='Profile'
                                            width={80}
                                            height={80}
                                            className='object-cover w-full h-full'
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full text-white font-semibold text-lg">
                                            👨‍💼
                                        </div>
                                    )}
                                </div>
                                {previewImage && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleProfilePictureChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={handleUpdatePictureClick}
                            className='text-blue-600 hover:text-blue-700 font-medium text-sm underline flex items-center gap-1'
                        >
                            📷 Update Profile Picture
                        </button>
                        <p className='text-xs text-gray-500 mt-1'>Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</p>
                    </div>

                    {/* Form Fields */}
                    <div className='space-y-6'>
                        {/* Name Field */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                👤 Username:
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                placeholder="Enter your display name"
                            />
                        </div>

                        {/* Email Field - Display only */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                📧 Email:
                            </label>
                            <input
                                type="email"
                                value={sessionData?.user?.email || ''}
                                disabled
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed'
                            />
                            <p className='text-xs text-gray-500 mt-1'>🔒 Email cannot be changed for security reasons</p>
                        </div>

                        {/* Current Password Field */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                🔐 Current Password:
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                placeholder="Enter current password (required to change password)"
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                🔑 New Password:
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="Enter new password (leave blank to keep current)"
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            />
                            <p className='text-xs text-gray-500 mt-1'>💡 Password must be at least 8 characters long</p>
                        </div>
                    </div>

                    <div className='mt-10'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-6'>⚙️ System Settings:</h2>

                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-full bg-gray-900'>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M10.834 2.49999C10.834 2.03975 10.4609 1.66666 10.0006 1.66666C9.54038 1.66666 9.16728 2.03975 9.16728 2.49999V2.97571C6.34052 3.37993 4.16729 5.81018 4.16729 8.74908L4.16728 12.0827C4.16728 12.0827 4.16729 12.0826 4.16728 12.0827C4.1672 12.0843 4.16664 12.0955 4.16302 12.1174C4.15869 12.1436 4.15098 12.1793 4.13827 12.2252C4.1125 12.3183 4.07148 12.4342 4.01418 12.5712C3.89929 12.8459 3.73732 13.1622 3.55819 13.4813C3.2214 14.0813 3.05164 14.7962 3.17909 15.476C3.31349 16.193 3.77499 16.8182 4.56317 17.1183C5.26726 17.3864 6.20448 17.6316 7.44217 17.7775C7.47162 17.803 7.50644 17.8323 7.54645 17.8643C7.67169 17.9644 7.85062 18.0943 8.07675 18.2235C8.52556 18.48 9.18914 18.75 10.0006 18.75C10.8121 18.75 11.4757 18.48 11.9245 18.2235C12.1506 18.0943 12.3295 17.9644 12.4548 17.8643C12.4948 17.8323 12.5296 17.803 12.5591 17.7775C13.7968 17.6316 14.734 17.3864 15.4381 17.1183C16.2262 16.8182 16.6877 16.193 16.8221 15.476C16.9496 14.7962 16.7798 14.0813 16.443 13.4813C16.2639 13.1622 16.1019 12.8459 15.9871 12.5712C15.9298 12.4342 15.8887 12.3183 15.863 12.2252C15.8503 12.1793 15.8426 12.1436 15.8382 12.1174C15.8346 12.0955 15.834 12.0845 15.834 12.083C15.834 12.0828 15.834 12.083 15.834 12.083L15.834 12.0759V8.74948C15.834 5.81066 13.6608 3.38 10.834 2.97572V2.49999ZM5.83395 8.74908C5.83395 6.44809 7.69923 4.58332 10.0006 4.58332C12.3019 4.58332 14.1673 6.4484 14.1673 8.74948V12.0833C14.1673 12.4691 14.3118 12.8852 14.4494 13.2143C14.5989 13.5717 14.7948 13.95 14.9897 14.2971C15.1792 14.6347 15.2244 14.9537 15.184 15.1689C15.1506 15.3471 15.0615 15.4783 14.845 15.5608C13.9493 15.9018 12.4372 16.25 10.0006 16.25C7.56401 16.25 6.05196 15.9018 5.15624 15.5608C4.93969 15.4783 4.85063 15.3471 4.81722 15.1689C4.77686 14.9537 4.82205 14.6347 5.01153 14.2971C5.2064 13.95 5.40231 13.5717 5.5518 13.2143C5.68941 12.8852 5.83395 12.4691 5.83395 12.0833V8.74908Z" fill="white" />
                                    </svg>
                                </div>
                                <div>
                                    <span className='text-gray-900 font-medium'>Email Notifications</span>
                                    <p className='text-xs text-gray-500'>Receive updates and alerts via email</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleEmailNotificationToggle}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifications
                                    ? 'bg-blue-400'
                                    : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications
                                        ? 'translate-x-6'
                                        : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className='mt-10 flex justify-end'>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-6 py-3 font-medium rounded-lg transition-colors flex items-center gap-2 ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    💾 Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProfileSettings;