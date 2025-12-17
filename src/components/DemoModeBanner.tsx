import { DEMO_MODE } from '../config/demoMode';

export function DemoModeBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      borderBottom: '2px solid #f59e0b',
      padding: '10px 20px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#92400e',
    }}>
      <strong>Demo Mode Active:</strong> Using localStorage instead of Firebase. 
      All data is stored locally and will be cleared when you clear browser data.
    </div>
  );
}

