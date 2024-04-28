import React, { useState } from 'react';
import axios from 'axios';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setImageSrc(null); // Clear the previous image

    try {
      const response = await axios.post('/api/generate-image', { prompt });
      if (response.status === 200) {
        // Instead of setting a placeholder image, we just enable the loading state
        // The UI will show a loading message instead of an image
        pollForImage();
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false); // Stop loading if there's an error
    }
  };

  const pollForImage = () => {
  // Define the function that will check the image status
  const checkImageStatus = async () => {
    try {
      // Replace 'your-job-id' with the actual job ID returned from the `/api/generate-image` endpoint
      const jobId = 'your-job-id'; // This should be dynamically set based on the response from the `/api/generate-image` endpoint
      const response = await axios.get(`/api/job/${jobId}`);

      // Check if the image is ready based on your API's response structure
      if (response.data && response.data.imageUrl) {
        setImageSrc(response.data.imageUrl);
        setLoading(false); // Image is ready, stop loading
        return true; // Return true to indicate the image is ready
      }
    } catch (error) {
      console.error('Error checking image status:', error);
      setLoading(false); // Stop loading if there's an error
      return false; // Return false to indicate the image is not ready
    }
    return false; // Return false by default if the image is not ready
  };

  // Call `checkImageStatus` periodically until the image is ready
  const intervalId = setInterval(async () => {
    const isReady = await checkImageStatus();
    if (isReady) {
      clearInterval(intervalId);
    }
  }, 3000); // Poll every 3 seconds, adjust as needed
};

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button type="submit">Generate Image</button>
      </form>
      {loading && <p>Generating image...</p>} {/* Show loading message */}
      {imageSrc && <img src={imageSrc} alt="Generated" />} {/* Show generated image */}
    </div>
  );
};

export default ImageGenerator;