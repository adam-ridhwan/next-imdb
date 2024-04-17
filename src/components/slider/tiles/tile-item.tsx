import { forwardRef, ForwardRefRenderFunction } from 'react';
import Image from 'next/image';

import { DEVELOPMENT_MODE } from '@/lib/constants';
import { Movie } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePageUtils } from '@/components/slider/hooks/use-page-utils';

type TileItemProps = {
  tile: Movie | void;
  displayNumber?: number | '';
  isVisibleOnScreen?: boolean;
};

const TileItem: ForwardRefRenderFunction<HTMLDivElement, TileItemProps> = (
  { tile, displayNumber, isVisibleOnScreen = false },
  ref
) => {
  const {
    state: { isMounted },
  } = usePageUtils();

  if (!tile) return null;

  return (
    <div
      ref={ref}
      className={cn('slider-tile', `tile-${isVisibleOnScreen && isMounted ? displayNumber : ''}`)}
    >
      {!DEVELOPMENT_MODE && (
        <div className='relative flex aspect-video flex-col justify-end overflow-hidden rounded-md'>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
          <div className='absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 gap-1 text-8xl'>
            {tile.title}
          </div>
          <div className='absolute right-1 top-0 text-4xl'>{tile.title}</div>
          <div className='absolute left-1 top-0 text-4xl'>{tile.title}</div>
        </div>
      )}

      {DEVELOPMENT_MODE && (
        <div className='relative flex aspect-video flex-col justify-end overflow-hidden rounded-md'>
          {/* Image docs: https://developer.themoviedb.org/docs/image-basics */}
          <Image
            src={`https://image.tmdb.org/t/p/original${tile.backdrop_path}`}
            alt={tile.title}
            priority
            fill
            sizes='(min-width: 1536px) 16.66vw, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33.33vw, 50vw'
            className='object-cover'
          />
        </div>
      )}
    </div>
  );
};

export default forwardRef(TileItem);
