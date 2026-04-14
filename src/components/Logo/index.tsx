import React from 'react';

interface LogoProps {
  size?: number;
  collapsed?: boolean;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 32, collapsed = false, light = false }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* 圆角方块背景，参考 CC 风格的蓝紫色 */}
        <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#logoBg)" />

        {/* MH 字母组合，白色粗体居中 */}
        <text
          x="32"
          y="32"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
          fontWeight="700"
          fontSize="26"
          fill="white"
          letterSpacing="-1"
        >
          MH
        </text>
      </svg>

      {!collapsed && (
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: light ? '#fff' : '#1a1a2e',
            letterSpacing: '0px',
            whiteSpace: 'nowrap',
          }}
        >
          Media Hub
        </span>
      )}
    </div>
  );
};

export default Logo;
