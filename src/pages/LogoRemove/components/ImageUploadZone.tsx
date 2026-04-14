import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

interface ImageUploadZoneProps {
  onImageLoaded: (file: File, dataUrl: string) => void;
}

const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({ onImageLoaded }) => {
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file) => {
      if (!ACCEPT_TYPES.includes(file.type)) {
        message.error('请上传 JPG / PNG / WebP / BMP 格式的图片');
        return Upload.LIST_IGNORE;
      }
      if (file.size > MAX_SIZE_BYTES) {
        message.error(`图片大小不能超过 ${MAX_SIZE_MB}MB`);
        return Upload.LIST_IGNORE;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onImageLoaded(file, dataUrl);
      };
      reader.readAsDataURL(file);
      return false; // 阻止自动上传
    },
  };

  return (
    <Dragger {...uploadProps} style={{ padding: '20px 0' }}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined style={{ fontSize: 48, color: '#6366f1' }} />
      </p>
      <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
        点击或拖拽图片到此区域上传
      </p>
      <p className="ant-upload-hint" style={{ fontSize: 13, color: '#8c8c8c' }}>
        支持 JPG、PNG、WebP、BMP 格式，单张图片最大 {MAX_SIZE_MB}MB
      </p>
    </Dragger>
  );
};

export default ImageUploadZone;
