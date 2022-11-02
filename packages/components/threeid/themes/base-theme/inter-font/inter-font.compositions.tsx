import React from 'react';
import { interFont } from './index';

// export {};

export function FrontsPreview() {
  return (
    <div className={interFont} style={{ padding: 8 }}>
      <div style={{ fontWeight: 400 }}>
        Inter Regular (400)
        <TestText />
      </div>
      <Sep />
      <div style={{ fontWeight: 500 }}>
        Inter Medium (500)
        <TestText />
      </div>
      <Sep />
      <div style={{ fontWeight: 600 }}>
        Inter Semibold (600)
        <TestText />
      </div>
      <Sep />
      <Sep />
      <div style={{ fontWeight: 'bold' }}>
        Inter Bold (700)
        <TestText />
      </div>
      <Sep />
    </div>
  );
}

function TestText() {
  return (
    <div>
      abcdefghijklmnopqrstuvwxyz
      <br />
      ABCDEFGHIJKLMNOPQRSTUVWXYZ
      <br />
      0123456789
    </div>
  );
}

function Sep() {
  return <div style={{ height: '0.5em' }} />;
}
