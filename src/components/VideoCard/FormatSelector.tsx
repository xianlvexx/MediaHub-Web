import React from 'react';
import { Table, Button, Typography, Radio, Grid } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FormatItem } from '../../api/types';
import { formatFileSize } from '../../utils/formatSize';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface FormatSelectorProps {
  formats: FormatItem[];
  selectedFormat: string;
  onFormatChange: (formatId: string) => void;
  onDownload: () => void;
  downloadLoading: boolean;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({
  formats,
  selectedFormat,
  onFormatChange,
  onDownload,
  downloadLoading,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (formats.length === 0) {
    return <Text type="secondary">未找到可用的视频格式</Text>;
  }

  const columns: ColumnsType<FormatItem> = [
    {
      title: '',
      dataIndex: 'formatId',
      key: 'select',
      width: 40,
      render: (formatId: string) => (
        <Radio
          checked={selectedFormat === formatId}
          onChange={() => onFormatChange(formatId)}
        />
      ),
    },
    {
      title: '画质',
      dataIndex: 'formatNote',
      key: 'formatNote',
      ellipsis: true,
      render: (text: string, record: FormatItem) => text || record.formatId,
    },
    {
      title: '格式',
      dataIndex: 'ext',
      key: 'ext',
    },
    ...(!isMobile
      ? [
          {
            title: '视频编码',
            dataIndex: 'vcodec',
            key: 'vcodec',
            ellipsis: true,
            render: (text: string) => text || '-',
          } as const,
          {
            title: '音频编码',
            dataIndex: 'acodec',
            key: 'acodec',
            ellipsis: true,
            render: (text: string) => text || '-',
          } as const,
          {
            title: '码率',
            dataIndex: 'tbr',
            key: 'tbr',
            render: (val: number) => (val > 0 ? `${Math.round(val)}k` : '-'),
          } as const,
        ]
      : []),
    {
      title: '大小',
      dataIndex: 'filesize',
      key: 'filesize',
      render: (val: number) => (val > 0 ? formatFileSize(val) : '-'),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text strong>选择画质：</Text>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          size={isMobile ? 'middle' : 'middle'}
          onClick={onDownload}
          loading={downloadLoading}
          disabled={!selectedFormat}
        >
          开始下载
        </Button>
      </div>
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        <Table<FormatItem>
          columns={columns}
          dataSource={formats}
          rowKey="formatId"
          size="small"
          pagination={false}
          tableLayout="auto"
          onRow={(record) => ({
            onClick: () => onFormatChange(record.formatId),
            style: {
              cursor: 'pointer',
              background: selectedFormat === record.formatId ? '#e6f4ff' : undefined,
            },
          })}
        />
      </div>
    </div>
  );
};

export default FormatSelector;
