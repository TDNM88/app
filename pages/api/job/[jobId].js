// pages/api/job/[jobId].js
import axios from 'axios';

const TAMS_JOB_STATUS_ENDPOINT = 'https://ap-east-1.tensorart.cloud/v1/jobs'; // Replace with the actual TAMS API endpoint

async function fetchJobInfo(jobId) {
  // Replace with the actual logic to fetch job info
  // For example, making an API request to TAMS to get the job status
  const headers = {
    'Authorization': `Bearer ${process.env.TAMS_API_KEY}`,
    'x-app-id': process.env.TAMS_APP_ID
  };

  const response = await axios.get(`${TAMS_JOB_STATUS_ENDPOINT}/${jobId}`, { headers });
  return response.data;
}

export default async (req, res) => {
  if (req.method === 'GET') {
    const { jobId } = req.query;

    try {
      const jobInfo = await fetchJobInfo(jobId);

      if (!jobInfo) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Check if the job is complete and an image URL is available
      if (jobInfo.status === 'completed' && jobInfo.imageUrl) {
        return res.status(200).json({ imageUrl: jobInfo.imageUrl });
      } else {
        // If the job is not complete, return the current status
        return res.status(200).json({ status: jobInfo.status });
      }

    } catch (error) {
      console.error('Error fetching job info:', error);
      return res.status(500).json({ message: 'Error fetching job info', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};