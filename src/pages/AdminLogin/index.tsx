import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, message, Grid } from 'antd';
import { LockOutlined, UserOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import Logo from '../../components/Logo';
import { getCaptcha, login } from '../../api/auth';
import { authStore } from '../../store/authStore';

const { useBreakpoint } = Grid;

interface LoginPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

const features = [
  '多平台视频解析，高清画质自由选择',
  '实时进度推送，下载历史随时查阅',
  '智能水印去除，图像处理一步到位',
];

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<{ captchaId: string; captchaImage: string } | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const refreshCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      setCaptcha(await getCaptcha());
    } catch {
      message.error('验证码加载失败，请刷新重试');
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => { refreshCaptcha(); }, [refreshCaptcha]);

  const handleSubmit = async (values: { username: string; password: string; captchaCode: string }) => {
    if (!captcha) return;
    setLoading(true);
    try {
      const result = await login({
        username: values.username,
        password: values.password,
        captchaId: captcha.captchaId,
        captchaCode: values.captchaCode,
      });
      authStore.save(result.token, {
        userId: result.userId,
        username: result.username,
        role: result.role,
      });
      message.success('登录成功');
      onSuccess();
    } catch (err: any) {
      // 登录失败自动刷新验证码
      refreshCaptcha();
      form.setFieldValue('captchaCode', '');
      message.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* 背景装饰光晕 */}
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.blob3} />
      <div style={{ ...s.panel, flexDirection: isMobile ? 'column' : 'row' }}>

        {/* ── 左侧品牌区（仅桌面） ── */}
        {!isMobile && (
          <div style={s.brand}>
            <div style={s.brandCircle1} />
            <div style={s.brandCircle2} />
            <div style={s.brandContent}>
              <Logo size={56} collapsed={false} light />
              <p style={s.brandTagline}>视频与图像一站式处理</p>
              <div style={s.featureList}>
                {features.map((f) => (
                  <div key={f} style={s.featureItem}>
                    <span style={s.featureDot} />
                    <span style={s.featureText}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <svg style={s.wave} viewBox="0 0 400 60" preserveAspectRatio="none">
              <path d="M0,30 C80,60 160,0 240,30 C320,60 380,15 400,30 L400,60 L0,60 Z"
                fill="rgba(255,255,255,0.06)" />
            </svg>
          </div>
        )}

        {/* ── 右侧表单区 ── */}
        <div style={{ ...s.formArea, padding: isMobile ? '40px 28px 36px' : '48px 44px' }}>

          {isMobile && (
            <div style={{ marginBottom: 28 }}>
              <Logo size={38} collapsed={false} />
            </div>
          )}

          <h2 style={s.title}>欢迎登录</h2>
          <p style={s.desc}>请输入账号密码继续</p>

          <Form form={form} onFinish={handleSubmit} layout="vertical"
            style={{ marginTop: 28 }} requiredMark={false}>

            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#d9d9d9' }} />}
                placeholder="用户名"
                size="large"
                autoFocus={!isMobile}
                style={s.input}
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#d9d9d9' }} />}
                placeholder="密码"
                size="large"
                style={s.input}
              />
            </Form.Item>

            <Form.Item name="captchaCode" rules={[{ required: true, message: '请输入验证码' }]}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Input
                  placeholder="验证码"
                  size="large"
                  maxLength={4}
                  style={{ ...s.input, flex: 1 }}
                />
                <div style={s.captchaWrap} onClick={captchaLoading ? undefined : refreshCaptcha}
                  title="点击刷新验证码">
                  {captcha
                    ? <img src={captcha.captchaImage} alt="验证码" style={s.captchaImg} />
                    : <ReloadOutlined spin={captchaLoading} style={{ fontSize: 18, color: '#8c8c8c' }} />
                  }
                </div>
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 4 }}>
              <Button type="primary" htmlType="submit" loading={loading} block
                size="large" style={s.submitBtn}>
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={s.backLink} className="login-back-btn" onClick={onBack}>
            <ArrowLeftOutlined style={{ marginRight: 6, fontSize: 12 }} />
            返回首页
          </div>
        </div>

      </div>
    </div>
  );
};

const BLUE = '#6366f1';
const BLUE_DARK = '#4f46e5';

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e8f0fe 0%, #f5f7ff 45%, #ede8fb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: '-10%', left: '-8%',
    width: 480, height: 480, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(22,119,255,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-12%', right: '-6%',
    width: 420, height: 420, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(114,46,209,0.10) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob3: {
    position: 'absolute', top: '40%', right: '20%',
    width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,163,196,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  panel: {
    display: 'flex',
    width: '100%',
    maxWidth: 880,
    minHeight: 520,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 8px 48px rgba(0,0,0,0.12)',
    position: 'relative',
    zIndex: 1,
  },
  brand: {
    flex: '0 0 380px',
    position: 'relative',
    background: `linear-gradient(145deg, ${BLUE} 0%, ${BLUE_DARK} 100%)`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandCircle1: {
    position: 'absolute', top: -80, right: -80,
    width: 260, height: 260, borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
  },
  brandCircle2: {
    position: 'absolute', bottom: -60, left: -60,
    width: 200, height: 200, borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
  },
  brandContent: { position: 'relative', zIndex: 1, padding: '0 40px' },
  brandTagline: {
    marginTop: 20, marginBottom: 32,
    color: 'rgba(255,255,255,0.75)', fontSize: 14, letterSpacing: 2,
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: 14 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 10 },
  featureDot: {
    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(255,255,255,0.6)',
  },
  featureText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: '20px' },
  wave: {
    position: 'absolute', bottom: 0, left: 0,
    width: '100%', height: 60, pointerEvents: 'none',
  },
  formArea: {
    flex: 1, background: '#fff',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: 600, color: '#1a1a1a', margin: 0, lineHeight: 1.3 },
  desc: { marginTop: 8, color: '#8c8c8c', fontSize: 13 },
  input: { height: 44, borderRadius: 8, fontSize: 14 },
  captchaWrap: {
    width: 120, height: 44, flexShrink: 0,
    border: '1px solid #d9d9d9', borderRadius: 8,
    overflow: 'hidden', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#fafafa',
  },
  captchaImg: { width: '100%', height: '100%', display: 'block', userSelect: 'none' },
  submitBtn: {
    height: 44, borderRadius: 8, fontSize: 15, fontWeight: 500,
    background: `linear-gradient(90deg, ${BLUE} 0%, ${BLUE_DARK} 100%)`,
    border: 'none', boxShadow: `0 4px 14px rgba(22,119,255,0.30)`,
  },
  backLink: {
    display: 'inline-flex', alignItems: 'center',
    marginTop: 24, color: '#8c8c8c', fontSize: 13,
    cursor: 'pointer', userSelect: 'none', transition: 'color 0.15s',
  },
};

export default LoginPage;
