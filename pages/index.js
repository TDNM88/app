import React, { useState } from 'react';
import axios from 'axios';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null); // State variable to store the jobId

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setImageSrc(null); // Clear the previous image
    setJobId(null); // Reset the jobId

    try {
      const response = await axios.post('/api/generate-image', { prompt });
      if (response.status === 200 && response.data.jobId) {
        setJobId(response.data.jobId); // Store the jobId in the state
        pollForImage(response.data.jobId); // Start polling for the actual image
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false); // Stop loading if there's an error
    }
  };

  const pollForImage = (jobId) => {
    // Define the function that will check the image status
    const checkImageStatus = async (jobId) => {
      try {
        const response = await axios.get(`/api/job/${jobId}`);

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
      const isReady = await checkImageStatus(jobId);
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
      {jobId && <p>Your image is being processed. Job ID: {jobId}</p>} {/* Display jobId */}
      {imageSrc && <img src={imageSrc} alt="Generated" />} {/* Show generated image */}
    </div>
  );
};

export default ImageGenerator;