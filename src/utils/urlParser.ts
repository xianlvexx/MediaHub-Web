export type PlatformKey = 'bilibili' | 'youtube' | 'douyin' | 'shipinhao';

export interface PlatformConfig {
  value: PlatformKey;
  label: string;
  placeholder: string;
  validate: (url: string) => boolean;
  available: boolean;
}

const BILI_URL_REGEX = /^https?:\/\/(www\.)?bilibili\.com\/video\/(BV[a-zA-Z0-9]+|av\d+)/;
const YOUTUBE_URL_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/watch|youtu\.be\/)/;
const DOUYIN_URL_REGEX = /^https?:\/\/(www\.)?douyin\.com\/video\//;
const SHIPINHAO_URL_REGEX = /^https?:\/\/(channels\.weixin\.qq\.com|finder\.video\.qq\.com)\//;

export const PLATFORMS: PlatformConfig[] = [
  {
    value: 'bilibili',
    label: 'B站',
    placeholder: '粘贴视频链接',
    validate: (url: string) => BILI_URL_REGEX.test(url.trim()),
    available: true,
  },
  {
    value: 'youtube',
    label: 'YouTube',
    placeholder: '粘贴视频链接',
    validate: (url: string) => YOUTUBE_URL_REGEX.test(url.trim()),
    available: false,
  },
  {
    value: 'douyin',
    label: '抖音',
    placeholder: '粘贴视频链接',
    validate: (url: string) => DOUYIN_URL_REGEX.test(url.trim()),
    available: false,
  },
  {
    value: 'shipinhao',
    label: '视频号',
    placeholder: '粘贴视频链接',
    validate: (url: string) => SHIPINHAO_URL_REGEX.test(url.trim()),
    available: false,
  },
];

export function getPlatformConfig(platform: PlatformKey): PlatformConfig {
  return PLATFORMS.find((p) => p.value === platform) ?? PLATFORMS[0];
}

const PLATFORM_TAG_COLOR: Record<string, string> = {
  bilibili: '#6366f1',
  youtube: 'red',
  douyin: 'purple',
  shipinhao: 'green',
};

const PLATFORM_LABEL: Record<string, string> = {
  bilibili: 'B站',
  youtube: 'YouTube',
  douyin: '抖音',
  shipinhao: '视频号',
};

export function getPlatformDisplayInfo(platform: string): { label: string; color: string } {
  return {
    label: PLATFORM_LABEL[platform] ?? platform,
    color: PLATFORM_TAG_COLOR[platform] ?? 'default',
  };
}

// 保留向后兼容
export function validateBiliUrl(url: string): boolean {
  return BILI_URL_REGEX.test(url.trim());
}
