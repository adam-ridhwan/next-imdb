import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import {
  GenreId,
  GenreSlug,
  MediaModalSlug,
  MediaType,
  MOVIE_GENRES,
  TODO,
  TV_GENRES,
} from '@/types/global-types';
import { extractGenreMediaTypeSlugs, getGenreIdBySlug } from '@/lib/utils';
import Backdrop from '@/components/media-modal/backdrop';
import BonusContent from '@/components/media-modal/bonus-content';
import Cast from '@/components/media-modal/cast';
import { Label } from '@/components/media-modal/label';
import MediaModal from '@/components/media-modal/media-modal';
import { Actors, Genres, Keywords } from '@/components/media-modal/metadata';
import MoreLikeThis from '@/components/media-modal/more-like-this';
import Overlay from '@/components/media-modal/overlay';
import Trailers from '@/components/media-modal/trailers';
import {
  BackdropSkeleton,
  HeadshotsSkeleton,
  MetadataSkeleton,
  OverviewSkeleton,
  TileLoadingSkeleton,
} from '@/components/skeletons';

type MediaPageProps = {
  params: {
    slug: MediaModalSlug;
  };
};

/**
 * First slug: [movie, tv, genre]
 *  - movie
 *  - tv
 *  - [genre]-movies | [genre]-tv
 *
 * Second slug: [id]
 *  - movie/[id]
 *  - tv/[id]
 *
 * */

const isEmpty = (obj: TODO) => Object.keys(obj).length === 0;

const MediaModalPage = async ({ params }: MediaPageProps) => {
  if (isEmpty(params)) return null;

  const parsedMediaModalSlug = MediaModalSlug.safeParse(params.slug);
  if (!parsedMediaModalSlug.success) {
    redirect('/error');
  }

  const mediaCategorySlug = parsedMediaModalSlug.data[0];
  const mediaIdSlug = parsedMediaModalSlug?.data[1] || '';

  const parsedMediaType = MediaType.safeParse(mediaCategorySlug);
  if (parsedMediaType.success) {
    return <MovieTvModal mediaType={parsedMediaType.data} id={mediaIdSlug} />;
  }

  const parsedGenreSlug = GenreSlug.safeParse(mediaCategorySlug);
  if (parsedGenreSlug.success) {
    const [genre, mediaType] = extractGenreMediaTypeSlugs(parsedGenreSlug.data);

    const genreObj = mediaType === 'movie' ? MOVIE_GENRES : TV_GENRES;

    const id = getGenreIdBySlug(genreObj, genre);
    if (!id) return null;

    return <GenreModal slug={genre} id={id} />;
  }
};
export default MediaModalPage;

type MediaModalProps = {
  mediaType: MediaType;
  id: string;
};

const MovieTvModal = ({ mediaType, id }: MediaModalProps) => {
  return (
    <>
      <Overlay />
      <MediaModal>
        <Suspense fallback={<BackdropSkeleton />}>
          <Backdrop mediaType={mediaType} id={id} />
        </Suspense>

        <div className='flex flex-col gap-12 px-custom py-4 pb-10 lg:flex-row'>
          <div className='mx-[0.5%] flex w-full flex-col gap-4 lg:w-3/5'>
            <Suspense fallback={<OverviewSkeleton />}>
              <Label mediaType={mediaType} id={id} />
            </Suspense>
          </div>

          <div className='flex w-full flex-col justify-center gap-4 lg:w-2/5'>
            <Suspense fallback={<MetadataSkeleton />}>
              <Actors mediaType={mediaType} id={id} />
              <Genres mediaType={mediaType} id={id} />
              <Keywords mediaType={mediaType} id={id} />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<TileLoadingSkeleton count={1} />}>
          <MoreLikeThis mediaType={mediaType} id={id} />
        </Suspense>

        <Suspense>
          <Trailers mediaType={mediaType} id={id} />
        </Suspense>

        <Suspense>
          <BonusContent mediaType={mediaType} id={id} />
        </Suspense>

        <Suspense fallback={<HeadshotsSkeleton />}>
          <Cast mediaType={mediaType} id={id} />
        </Suspense>
      </MediaModal>
    </>
  );
};

type GenreModalProps = {
  slug: GenreSlug;
  id: GenreId;
};

const GenreModal = ({ slug, id }: GenreModalProps) => {
  return (
    <>
      <Overlay />
      <MediaModal>
        <div>
          {slug}:{id}
        </div>
      </MediaModal>
    </>
  );
};
