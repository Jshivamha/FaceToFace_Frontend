import React from 'react';
import clsx from 'clsx';

export default function VideoTile({ stream, muted, label }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900">
      <video
        autoPlay
        playsInline
        muted={muted}
        ref={(node) => {
          if (node && stream) node.srcObject = stream;
        }}
        className={clsx('w-full h-full object-cover')}
      />
      {label && (
        <div className="absolute left-2 bottom-2 text-xs px-2 py-1 rounded bg-black/50 backdrop-blur-sm text-white">
          {label}
        </div>
      )}
    </div>
  );
}
