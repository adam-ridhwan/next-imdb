import { cn } from '@/lib/utils';

export const TileLoadingSkeleton = ({ count }: { count: number }) => {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className=' px-custom flex flex-row pb-[29px] pt-12'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 0.25}s` }}
              className={cn('slider-tile animate-netflix-pulse')}
            >
              <div className='relative flex aspect-video flex-col justify-end gap-1 overflow-hidden rounded-2xl bg-muted-foreground/20' />

              <div className='pt-3'>
                <div className='flex flex-col gap-2'>
                  <div className='h-[14px] w-2/3 animate-netflix-pulse rounded-2xl bg-muted-foreground/20' />
                  <div className='h-[10px] w-1/3 animate-netflix-pulse rounded-2xl bg-muted-foreground/20' />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const BackdropSkeleton = () => {
  return (
    <div className='relative aspect-video animate-pulse bg-appBackground'>
      <div className='object-cover' />
      <div className='absolute bottom-0 left-0 right-0 z-10 h-1/2 bg-gradient-to-t from-muted via-transparent to-transparent' />
    </div>
  );
};

export const MetadataSkeleton = () => {
  return (
    <>
      <div className='h-[20px] w-[80%] animate-netflix-pulse rounded-sm bg-muted-foreground/10' />
      <div className='h-[20px] w-[90%] animate-netflix-pulse rounded-sm bg-muted-foreground/10' />
      <div className='h-[20px] w-[95%] animate-netflix-pulse rounded-sm bg-muted-foreground/10' />
      <div className='h-[20px] w-[85%] animate-netflix-pulse rounded-sm bg-muted-foreground/10' />
    </>
  );
};

export const OverviewSkeleton = () => {
  return (
    <>
      <div className='h-[30px] w-2/3 animate-netflix-pulse rounded-sm bg-muted-foreground/10' />
      <div className='flex flex-col gap-2'>
        <div className='h-[20px] w-[80%] animate-netflix-pulse rounded-sm bg-muted-foreground/10' />
        <div className='h-[20px] w-[90%] animate-netflix-pulse rounded-sm bg-muted-foreground/10' />
        <div className='h-[20px] w-[95%] animate-netflix-pulse rounded-sm bg-muted-foreground/10' />
        <div className='h-[20px] w-[85%] animate-netflix-pulse rounded-sm bg-muted-foreground/10' />
      </div>
    </>
  );
};

export const HeadshotsSkeleton = () => {
  return (
    <div className='px-custom flex h-[274px] flex-row gap-4 pt-5'>
      <div className='aspect-[4/5] h-48 animate-netflix-pulse rounded-xl bg-muted-foreground/10'></div>
      <div className='aspect-[4/5] h-48 animate-netflix-pulse rounded-xl bg-muted-foreground/10'></div>
      <div className='aspect-[4/5] h-48 animate-netflix-pulse rounded-xl bg-muted-foreground/10'></div>
      <div className='aspect-[4/5] h-48 animate-netflix-pulse rounded-xl bg-muted-foreground/10'></div>
      <div className='aspect-[4/5] h-48 animate-netflix-pulse rounded-xl bg-muted-foreground/10'></div>
      <div className='aspect-[4/5] h-48 animate-netflix-pulse rounded-xl bg-muted-foreground/10'></div>
    </div>
  );
};
