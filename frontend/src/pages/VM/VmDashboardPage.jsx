import axios from 'axios';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

import PageHeader from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/* -------------------- Reusable Stat Card -------------------- */
const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

/* -------------------- VM Dashboard -------------------- */
const VmDashboardPage = () => {
  const [stats, setStats] = useState({});
  const [vmStats, setVmStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getVmDashboardStats = async () => {
      try {
        const res = await axios.get(
          'http://localhost:5000/vm/getDashboardStats'
        );
        setStats(res.data[0]);
      } catch {
        toast.error('Failed to load VM stats');
      }
    };

    const getVmUsageStats = async () => {
      try {
        const res = await axios.get(
          'http://localhost:5000/vm/getVmUsageStats'
        );
        setVmStats(res.data);
        setLoading(false);
      } catch {
        toast.error('Failed to load VM usage');
      }
    };

    getVmDashboardStats();
    getVmUsageStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  /* -------------------- Chart Data -------------------- */
  const vmStatusData = [
    { name: 'Running', value: stats.running_vms, fill: '#16a34a' },
    { name: 'Stopped', value: stats.stopped_vms, fill: '#dc2626' },
    { name: 'Pending', value: stats.pending_vms, fill: '#ea580c' },
  ];

  return (
    <PageHeader title="VM Dashboard" actions={null}>
      <div className="p-2 space-y-4">
        {/* -------------------- Stats Cards -------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total VMs"
            value={stats.total_vms}
            icon={Server}
            color="text-blue-600"
            description="All virtual machines"
          />
          <StatCard
            title="Running VMs"
            value={stats.running_vms}
            icon={Activity}
            color="text-green-600"
            description="Currently active"
          />
          <StatCard
            title="CPU Usage"
            value={`${stats.avg_cpu}%`}
            icon={Cpu}
            color="text-orange-500"
            description="Average CPU utilization"
          />
          <StatCard
            title="Storage Used"
            value={`${stats.total_storage} GB`}
            icon={HardDrive}
            color="text-purple-600"
            description="Total disk usage"
          />
        </div>

        {/* -------------------- VM Usage + Status -------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VM Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                VM Resource Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vmStats.map((vm) => (
                  <div
                    key={vm.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{vm.vm_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        CPU: {vm.cpu}% | RAM: {vm.ram} GB
                      </p>
                    </div>
                    <Badge
                      variant={
                        vm.status === 'Running' ? 'default' : 'secondary'
                      }
                    >
                      {vm.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* VM Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                VM Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={vmStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {vmStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageHeader>
  );
};

export default VmDashboardPage;
