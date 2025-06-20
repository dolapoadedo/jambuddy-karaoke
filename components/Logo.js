import Link from 'next/link';

export default function Logo({ size = 'default' }) {
  const sizeClasses = {
    small: 'logo-sticker-small',
    default: 'logo-sticker',
    large: 'logo-sticker-large'
  };

  return (
    <Link href="/">
      <div className="logo-container">
        <div className={sizeClasses[size] || 'logo-sticker'}>
          <div className="logo-icon">
            <span>🎵</span>
          </div>
          <span className="logo-text">JamBuddy</span>
        </div>
      </div>
    </Link>
  );
} 