const axios = require('axios');

const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const checkImageUrl = async (requestId) => {
  try {
    const jobResponse = await axios.get(`/api/job/${requestId}`);
    const imageUrl = jobResponse.data?.job?.successInfo?.images?.[0]?.url;
    return imageUrl;
  } catch (error) {
    console.error('Error calling Tams API:', error);
    throw new Error('Error calling Tams API');
  }
};

const generateImage = async (req, res) => {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    const TAMS_API_ENDPOINT = 'https://ap-east-1.tensorart.cloud/v1/jobs';
    const requestId = generateRandomString(16);

    const requestBody = {
      requestId: requestId,
      stages: [
        {
          "type": "INPUT_INITIALIZE",
          "inputInitialize": {
            "seed": -1,
            "count": 2
          }
        },
        {
          type: "DIFFUSION",
          diffusion: {
            width: 512,
            height: 512,
            prompts: [{ text: prompt }],
            negativePrompts: [],
            sampler: "DPM++ 2M Karras",
            sdVae: "Automatic",
            steps: 15,
            sd_model: "600423083519508503",
            clip_skip: 2,
            cfg_scale: 7
          }
        }
      ]
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TAMS_API_KEY}`,
      'x-app-id': process.env.TAMS_APP_ID
    };

    try {
      const tamsResponse = await axios.post(TAMS_API_ENDPOINT, requestBody, { headers });
      res.status(200).json({ requestId });

      // Chờ 30 giây trước khi kiểm tra lại URL
      const imageUrl = await Promise.race([
        new Promise((resolve) => setTimeout(resolve, 30000)), // Timeout sau 30 giây
        checkImageUrl(requestId) // Kiểm tra URL
      ]);

      if (imageUrl) {
        res.status(200).json({ imageUrl });
      } else {
        res.status(500).json({ message: 'Timeout waiting for imageUrl' });
      }
    } catch (error) {
      console.error('Error calling Tams API:', error);
      res.status(500).json({ message: 'Error calling Tams API', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default generateImage;
