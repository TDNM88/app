import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [runningInfo, setRunningInfo] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setImageSrc(null);
    setJobId(null);
    setRunningInfo(null);

    try {
      const response = await axios.post('/api/generate-image', { prompt });
      if (response.status === 200 && response.data.jobId) {
        setJobId(response.data.jobId);
        await pollForImage(response.data.jobId);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false);
    }
  };

  const pollForImage = async (jobId) => {
    setLoading(true);
    try {
      let isComplete = false;
      while (!isComplete) {
        const response = await axios.get(`/api/job/${jobId}`);
        if (response.data && response.data.job) {
          if (response.data.job.successInfo) {
            const successInfo = response.data.job.successInfo;
            if (successInfo.images && successInfo.images.length > 0) {
              const imageUrl = successInfo.images[0].url;
              setImageSrc(imageUrl);
              isComplete = true;
            }
          } else if (response.data.job.runningInfo) {
            setRunningInfo(response.data.job.runningInfo);
          }
        }
        // Delay the next poll by 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error('Error checking image status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      setLoading(false); // Stop loading when component unmounts
    };
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt"
        />
        <button type="submit" disabled={loading}>Generate Image</button>
      </form>
      {loading && !imageSrc && <p>Generating image...</p>}
      {jobId && <p>Job ID: {jobId}</p>}
      {runningInfo && (
        <div>
          <p>Image is being processed...</p>
          <p>Processing Image Progress: {runningInfo.processingImages[0].progress}%</p>
        </div>
      )}
      {imageSrc && <img src={imageSrc} alt="Generated" />}
    </div>
  );
};

export default ImageGenerator;