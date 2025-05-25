export const useCloudinaryUploader = () => {
  const uploadImage = async (file: File): Promise<string> => {
    const config = useRuntimeConfig();
    const cloudinaryApiKey = config.public.CLOUDINARY_API_KEY as string;
    const cloudinaryCloudName = config.public.CLOUDINARY_CLOUD_NAME as string;
    const cloudinaryUploadPreset = config.public.CLOUDINARY_UPLOAD_PRESET as string;
    
    console.log('Cloudinary API Key:', cloudinaryApiKey);
    console.log('Cloudinary Cloud Name:', cloudinaryCloudName);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryUploadPreset);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/upload`, {
        method: 'POST',
        body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Upload failed');

        console.log('Upload response:', data);
        return data.secure_url;
    } catch (err) {
        console.error('Error uploading image:', err);
        throw createError({ statusCode: 500, message: 'Failed to upload image' });
    }
  };

  return { uploadImage };
};
