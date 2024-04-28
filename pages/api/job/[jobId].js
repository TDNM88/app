// pages/api/job/[jobId].js

export default async (req, res) => {
  if (req.method === 'GET') {
    const { jobId } = req.query;

    try {
      // Thực hiện các thao tác để lấy thông tin công việc từ cơ sở dữ liệu hoặc từ nơi lưu trữ khác
      const jobInfo = await fetchJobInfo(jobId); // Hàm fetchJobInfo là hàm giả định, bạn cần thay thế bằng hàm thực tế của mình

      // Kiểm tra xem công việc có tồn tại không
      if (!jobInfo) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Trả về thông tin công việc
      return res.status(200).json({ job: jobInfo });
    } catch (error) {
      console.error('Error fetching job info:', error);
      return res.status(500).json({ message: 'Error fetching job info', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
