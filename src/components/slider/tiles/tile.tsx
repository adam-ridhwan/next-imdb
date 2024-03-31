import { forwardRef, ForwardRefRenderFunction } from 'react';
import Image from 'next/image';

import { DEVELOPMENT_MODE } from '@/lib/constants';
import { Tiles } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BodyMedium, BodySmall } from '@/components/fonts';
import { CategoryMovieIcon, DotIcon } from '@/components/icons';

type TileProps = {
  tile: Tiles;
  displayNumber: number | '';
  isVisibleOnScreen?: boolean;
};

const Tile: ForwardRefRenderFunction<HTMLDivElement, TileProps> = (
  { tile, displayNumber, isVisibleOnScreen = false },
  ref
) => {
  return (
    <div
      ref={ref}
      className={cn('slider-tile p-1', `tile-${isVisibleOnScreen ? displayNumber : ''}`)}
    >
      {DEVELOPMENT_MODE ? (
        <>
          <div
            className='relative flex aspect-video flex-col items-center justify-center gap-1
          text-8xl outline outline-black'
          >
            {tile.id}
            <div className='absolute right-1 top-0 text-4xl'>{tile.id}</div>
            <div className='absolute left-1 top-0 text-4xl'>{tile.id}</div>
          </div>
        </>
      ) : (
        <>
          <div className='relative flex aspect-video flex-col justify-end gap-1 p-4'>
            <Image
              src={tile.imageUrl}
              alt='thumbnail'
              priority
              fill
              sizes='(min-width: 1536px) 16.66vw, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33.33vw, 50vw'
              className='object-cover'
            />
            <div className='relative flex flex-row'>
              <BodySmall className='text-[12px] opacity-75'>{tile.year}</BodySmall>
              <DotIcon />
              <div className='flex flex-row items-center gap-1'>
                <CategoryMovieIcon />
                <BodySmall className='text-[12px] opacity-75'>{tile.category}</BodySmall>
              </div>
              <DotIcon />
              <BodySmall className='text-[12px] opacity-75'>{tile.rating}</BodySmall>
            </div>
            <div className='relative'>
              <BodyMedium>{tile.title}</BodyMedium>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default forwardRef(Tile);