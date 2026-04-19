import React, { useEffect } from 'react';
import { Card, Button, Tag, Space, Tooltip, message } from 'antd';
import {
  BgColorsOutlined, SyncOutlined, ReloadOutlined, DeleteOutlined,
} from '@ant-design/icons';
import ImageUploadZone from './components/ImageUploadZone';
import SelectionCanvas from './components/SelectionCanvas';
import ResultPreview from './components/ResultPreview';
import { useLogoRemoveLogic } from './useLogoRemoveLogic';
import SEO from '../../components/SEO';

const LogoRemove: React.FC = () => {
  const {
    step,
    imageDataUrl,
    imageWidth,
    imageHeight,
    selection,
    processing,
    resultUrl,
    openCVStatus,
    initOpenCV,
    handleImageLoaded,
    handleSelectionChange,
    handleRemove,
    handleReselect,
    handleReupload,
  } = useLogoRemoveLogic();

  // 进入页面时触发 OpenCV 加载
  useEffect(() => {
    initOpenCV();
  }, [initOpenCV]);

  const seo = (
    <SEO
      title="AI 水印去除"
      description="免费在线 AI 水印去除工具，上传图片、框选水印区域，一键智能消除，无需安装任何软件。"
      canonical="/logo-remove"
    />
  );

  // OpenCV 状态 Tag
  const statusTag = (() => {
    if (openCVStatus === 'loading') {
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          正在加载图像处理引擎…
        </Tag>
      );
    }
    if (openCVStatus === 'fallback') {
      return (
        <Tooltip title="OpenCV 加载失败，已切换为内置基础修复算法，效果可能略有不同">
          <Tag color="warning">已切换为基础修复模式</Tag>
        </Tooltip>
      );
    }
    return (
      <Tag color="success">图像处理引擎就绪</Tag>
    );
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {seo}
      {/* 引擎状态常驻提示 */}
      <Card size="small" style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <BgColorsOutlined style={{ fontSize: 20, color: '#6366f1' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>水印去除</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
              上传图片，框选水印区域，一键去除，结果图像可直接下载
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>{statusTag}</div>
        </div>
      </Card>

      {/* 第一步：上传 */}
      {step === 'upload' && (
        <Card
          title="第一步：上传图片"
          style={{ borderRadius: 8 }}
        >
          <ImageUploadZone onImageLoaded={handleImageLoaded} />
        </Card>
      )}

      {/* 第二步：框选 */}
      {step === 'select' && (
        <Card
          title="第二步：拖拽框选水印区域"
          style={{ borderRadius: 8 }}
          extra={
            <Space>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleReupload}
              >
                重新上传
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<DeleteOutlined />}
                loading={processing}
                disabled={!selection}
                onClick={() => {
                  if (!selection) {
                    message.warning('请先框选水印区域');
                    return;
                  }
                  handleRemove();
                }}
              >
                去除水印
              </Button>
            </Space>
          }
        >
          <div style={{ marginBottom: 10, fontSize: 13, color: '#595959' }}>
            按住鼠标左键（或手指触摸）在图片上拖拽，圈出需要去除的水印区域
            {selection && (
              <span style={{ marginLeft: 12, color: '#6366f1' }}>
                ✓ 已选区域：{selection.width} × {selection.height} px
              </span>
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <SelectionCanvas
              imageUrl={imageDataUrl}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </Card>
      )}

      {/* 第三步：结果 */}
      {step === 'result' && (
        <Card
          title="第三步：查看并下载结果"
          style={{ borderRadius: 8 }}
        >
          <ResultPreview
            originalUrl={imageDataUrl}
            resultUrl={resultUrl}
            onReselect={handleReselect}
            onReupload={handleReupload}
          />
        </Card>
      )}
    </div>
  );
};

export default LogoRemove;
