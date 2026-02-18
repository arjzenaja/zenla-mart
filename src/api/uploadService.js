import client from './client';
import { Platform } from 'react-native';

export const uploadImage = async (imageUri) => {
  try {
    const formData = new FormData();
    
    // Get filename from URI
    const filename = imageUri.split('/').pop();
    
    // Infer type from extension
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('image', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      name: filename,
      type: type,
    });

    const response = await client.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data, headers) => {
        // React Native needs standard FormData handling
        return data; 
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
