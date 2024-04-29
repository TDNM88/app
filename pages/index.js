import React, { useState } from 'react';
import axios from 'axios';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobInfo, setJobInfo] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setImageSrc(null);
    setJobInfo(null);

    try {
      const response = await axios.post('/api/generate-image', { prompt });
      if (response.status === 200) {
        setJobInfo(response.data); // Display all information from the POST response
        pollForImageStatus(response.data.jobId); // Start polling using the jobId
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false);
    }
  };

  const pollForImageStatus = async (jobId) => {
    try {
      while (loading) {
        const response = await axios.get(`/api/job/${jobId}`);
        const jobData = response.data.job;

        setJobInfo(jobData); // Update the displayed job information

        if (jobData.status === 'SUCCESS' && jobData.successInfo.images.length > 0) {
          const imageUrl = jobData.successInfo.images[0].url;
          setImageSrc(imageUrl);
          setLoading(false); // Job is complete, stop loading
          break; // Exit the polling loop
        } else if (jobData.status === 'FAILED') {
          console.error('Job failed:', jobData.failedInfo.reason);
          setLoading(false); // Job failed, stop loading
          break; // Exit the polling loop
        }

        // Delay the next poll by 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error('Error polling image status:', error);
      setLoading(false);
    }
  };

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
      {loading && <p>Checking job status...</p>}
      {jobInfo && (
        <div>
          <p>Job ID: {jobInfo.id}</p>
          <p>Status: {jobInfo.status}</p>
          {/* Display additional job information details here */}
          <pre>{JSON.stringify(jobInfo, null, 2)}</pre> {/* This will format and display the jobInfo object */}
        </div>
      )}
      {imageSrc && <img src={imageSrc} alt="Generated" />}
    </div>
  );
};

export default ImageGenerator;