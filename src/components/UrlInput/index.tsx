import React from 'react';
import { Input, Button, Select, Space, message, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { PLATFORMS, getPlatformConfig, type PlatformKey } from '../../utils/urlParser';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  loading: boolean;
  platform: PlatformKey;
  onPlatformChange: (platform: PlatformKey) => void;
}

const platformSelectOptions = PLATFORMS.map((p) => ({
  value: p.value,
  label: p.label,
  disabled: !p.available,
}));

const UrlInput: React.FC<UrlInputProps> = ({
  value,
  onChange,
  onParse,
  loading,
  platform,
  onPlatformChange,
}) => {
  const config = getPlatformConfig(platform);

  const handleParse = () => {
    if (!value.trim()) {
      message.warning('请输入视频链接');
      return;
    }
    if (!config.validate(value)) {
      message.error(`请输入有效的${config.label}视频链接`);
      return;
    }
    onParse();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleParse();
    }
  };

  const handlePlatformChange = (val: PlatformKey) => {
    onPlatformChange(val);
    onChange('');
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Select
        size="large"
        value={platform}
        onChange={handlePlatformChange}
        disabled={loading}
        style={{ width: 110, flexShrink: 0 }}
        optionLabelProp="label"
        options={platformSelectOptions.map((opt) => ({
          ...opt,
          label: (
            <Space size={4}>
              <span>{opt.label}</span>
              {!PLATFORMS.find((p) => p.value === opt.value)?.available && (
                <Tag color="default" style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
                  敬请期待
                </Tag>
              )}
            </Space>
          ),
        }))}
        labelRender={(option) => <span>{option.label}</span>}
      />
      <Input
        size="large"
        placeholder={config.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        allowClear
        disabled={loading}
      />
      <Button
        type="primary"
        size="large"
        icon={<SearchOutlined />}
        loading={loading}
        onClick={handleParse}
      >
        解析
      </Button>
    </Space.Compact>
  );
};

export default UrlInput;
