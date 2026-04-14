import React, { useEffect, useState, useCallback } from 'react';
import {
  Row, Col, Card, Statistic, Progress, Descriptions, Typography,
  Badge, Spin, Button, message,
} from 'antd';
import {
  ReloadOutlined, ClockCircleOutlined, ClusterOutlined,
  HddOutlined, RocketOutlined,
} from '@ant-design/icons';
import { getMonitorData } from '../../api/monitor';
import type { MonitorData } from '../../api/monitor';

const { Title, Text } = Typography;

// ── 工具函数 ────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 0) return '不可用';
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + ' GB';
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function pct(used: number, total: number): number {
  if (total <= 0 || used < 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

function strokeColor(percent: number): string {
  if (percent >= 85) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#52c41a';
}

// ── 资源进度卡 ────────────────────────────────────────────────────────

interface ResourceCardProps {
  title: string;
  icon: React.ReactNode;
  percent: number;
  detail: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ title, icon, percent, detail }) => (
  <Card size="small" style={{ height: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
      <span style={{ color: '#8c8c8c', fontSize: 14 }}>{icon}</span>
      <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
      <span style={{ fontSize: 28, fontWeight: 600, color: strokeColor(percent) }}>
        {percent}
      </span>
      <span style={{ fontSize: 14, color: '#8c8c8c' }}>%</span>
    </div>
    <Progress
      percent={percent}
      strokeColor={strokeColor(percent)}
      showInfo={false}
      size="small"
      style={{ marginBottom: 6 }}
    />
    <Text type="secondary" style={{ fontSize: 12 }}>{detail}</Text>
  </Card>
);

// ── 主页面 ───────────────────────────────────────────────────────────────

const Monitor: React.FC = () => {
  const [data, setData]       = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastTime, setLastTime] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getMonitorData();
      setData(d);
      setLastTime(new Date());
    } catch (err: any) {
      message.error('获取监控数据失败：' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次加载 + 每 5s 自动刷新
  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const cpuPct  = data ? Math.round(data.cpu.usage) : 0;
  const sysPct  = data ? pct(data.systemMemory.used, data.systemMemory.total) : 0;
  const jvmPct  = data ? pct(data.jvmMemory.used, data.jvmMemory.max) : 0;
  const diskPct = data ? pct(data.disk.used, data.disk.total) : 0;

  return (
    <div>
      {/* 页头 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>系统监控</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastTime && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {lastTime.toLocaleTimeString()} 更新 · 每 5s 自动刷新
            </Text>
          )}
          <Button
            size="small"
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchData}
            loading={loading}
          >
            刷新
          </Button>
        </div>
      </div>

      <Spin spinning={loading && !data}>

        {/* ── 行 1：资源使用率 ── */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={12} md={6}>
            <ResourceCard
              title="CPU 使用率"
              icon={<RocketOutlined />}
              percent={cpuPct}
              detail={`${data?.cpu.processors ?? '-'} 核心`}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <ResourceCard
              title="系统内存"
              icon={<ClusterOutlined />}
              percent={sysPct}
              detail={`${formatBytes(data?.systemMemory.used ?? 0)} / ${formatBytes(data?.systemMemory.total ?? 0)}`}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <ResourceCard
              title="JVM 堆内存"
              icon={<ClusterOutlined />}
              percent={jvmPct}
              detail={`${formatBytes(data?.jvmMemory.used ?? 0)} / ${formatBytes(data?.jvmMemory.max ?? 0)}`}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <ResourceCard
              title="磁盘使用率"
              icon={<HddOutlined />}
              percent={diskPct}
              detail={`${formatBytes(data?.disk.used ?? 0)} / ${formatBytes(data?.disk.total ?? 0)}`}
            />
          </Col>
        </Row>

        {/* ── 行 2：运行详情 + 任务统计 ── */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <Card title="运行信息" size="small" style={{ height: '100%' }}>
              <Descriptions column={1} size="small" styles={{ label: { width: 110 } }}>
                <Descriptions.Item label="启动时间">
                  {data ? new Date(data.runtime.startTime).toLocaleString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="运行时长">
                  {data ? formatUptime(data.runtime.uptime) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="进程 PID">
                  {data?.runtime.pid ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="操作系统">
                  {data?.runtime.osName ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="CPU 核数">
                  {data?.cpu.processors ?? '-'} 核（逻辑）
                </Descriptions.Item>
                <Descriptions.Item label="线程数">
                  {data ? `${data.runtime.threads} 总 / ${data.runtime.daemonThreads} 守护` : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="下载任务统计" size="small" style={{ height: '100%' }}>
              <Row gutter={[8, 16]}>
                <Col span={8}>
                  <Statistic
                    title="累计总数"
                    value={data?.tasks.total ?? 0}
                    valueStyle={{ fontSize: 22 }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<Badge status="processing" text="运行中" />}
                    value={data?.tasks.running ?? 0}
                    valueStyle={{ fontSize: 22, color: '#6366f1' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<Badge color="gold" text="待处理" />}
                    value={data?.tasks.pending ?? 0}
                    valueStyle={{ fontSize: 22, color: '#faad14' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<Badge status="success" text="已完成" />}
                    value={data?.tasks.completed ?? 0}
                    valueStyle={{ fontSize: 22, color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<Badge status="error" text="失败" />}
                    value={data?.tasks.failed ?? 0}
                    valueStyle={{ fontSize: 22, color: '#ff4d4f' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title={<Badge color="default" text="已取消" />}
                    value={data?.tasks.cancelled ?? 0}
                    valueStyle={{ fontSize: 22, color: '#8c8c8c' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

      </Spin>
    </div>
  );
};

export default Monitor;
