import React, { useState } from 'react';
import axios from 'axios';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setImageSrc(null);

    try {
      const response = await axios.post('/api/generate-image', { prompt });
      if (response.status === 200) {
        // Set a placeholder image or loading indicator
        setImageSrc('placeholder_or_loading_image_url');
        
        // Start polling for the actual image
        pollForImage();
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false);
    }
  };

  const pollForImage = () => {
  // Define the function that will check the image status
  const checkImageStatus = async () => {
    try {
      // Replace '/api/check-image-status' with the actual endpoint that
      // returns the status of the image generation job
      const response = await axios.get('/api/check-image-status', {
        params: { jobId: 'your-job-id' } // Pass the job ID if necessary
      });

      // Check the response to see if the image is ready
      // The condition here depends on how your API indicates readiness
      if (response.data.isImageReady) {
        // If the image is ready, update the image source with the generated image URL
        setImageSrc(response.data.imageUrl);
        // Stop the loading indicator
        setLoading(false);
        // Return true to indicate that the image is ready
        return true;
      }
    } catch (error) {
      console.error('Error checking image status:', error);
      // Optionally, handle retries or stop polling after certain conditions
    }
    // Return false to indicate that the image is not ready yet
    return false;
  };

  // Call `checkImageStatus` periodically until the image is ready
  const intervalId = setInterval(async () => {
    const isReady = await checkImageStatus();
    if (isReady) {
      clearInterval(intervalId);
    }
  }, 3000); // Poll every 3 seconds, adjust as needed
};

    // Call `checkImageStatus` periodically until the image is ready
    const intervalId = setInterval(() => {
      checkImageStatus().then((isReady) => {
        if (isReady) {
          clearInterval(intervalId);
        }
      });
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
      {loading && <p>Generating image...</p>}
      {imageSrc && <img src={imageSrc} alt="Generated" />}
    </div>
  );
};

export default ImageGenerator;