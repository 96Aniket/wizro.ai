const getDashboardStats = async (req, res) => {
  try {
    // TEMP MOCK DATA (replace with DB later)
    res.json([
      {
        total_vms: 12,
        running_vms: 8,
        stopped_vms: 3,
        pending_vms: 1,
        avg_cpu: 64,
        total_storage: 520,
      },
    ]);
  } catch (err) {
    res.status(500).json({ message: 'VM dashboard stats error' });
  }
};

const getVmUsageStats = async (req, res) => {
  try {
    res.json([
      {
        id: 1,
        vm_name: 'VM-Production',
        cpu: 70,
        ram: 16,
        status: 'Running',
      },
      {
        id: 2,
        vm_name: 'VM-Staging',
        cpu: 35,
        ram: 8,
        status: 'Stopped',
      },
    ]);
  } catch (err) {
    res.status(500).json({ message: 'VM usage stats error' });
  }
};

export default {
  getDashboardStats,
  getVmUsageStats,
};
