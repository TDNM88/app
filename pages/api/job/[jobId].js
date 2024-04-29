// pages/api/job/[jobId].js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Extract the jobId from the query parameters
    const { jobId } = req.query;

    // jobId is treated as a string, as JavaScript can handle uint64 values as strings

    // Define the endpoint for the external API that provides the job status
    const TAMS_JOB_STATUS_ENDPOINT = `https://ap-east-1.tensorart.cloud/v1/jobs/${jobId}`;

    try {
      // Set up the headers for the external API request
      const headers = {
        'Authorization': `Bearer ${process.env.TAMS_API_KEY}`,
        'x-app-id': process.env.TAMS_APP_ID,
      };

      // Make a GET request to the external API to fetch the job status
      const { data } = await axios.get(TAMS_JOB_STATUS_ENDPOINT, { headers });

      // Respond with the job status information
      res.status(200).json(data);
    } catch (error) {
      // Handle errors by logging them and responding with an error message
      console.error('Error fetching job status:', error);
      res.status(500).json({ message: 'Error fetching job status', error: error.message });
    }
  } else {
    // If the request method is not GET, return a 405 Method Not Allowed error
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}