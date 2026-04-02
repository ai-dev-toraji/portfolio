import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

function pageHref(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}/page/${page}`;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const arrowPath = "M-5.24541e-07 6.41606L35.5 6.41605L26.5 0.416016";
  const arrowClass = "md:w-8 md:h-1.5 w-6 h-1";
  const linkClass = "md:text-base text-sm text-white hover:text-(--color-accent) transition-colors duration-300";

  return (
    <div className="flex justify-center items-center gap-4 md:gap-6">
      {hasPrev ? (
        <Link href={pageHref(basePath, currentPage - 1)} className={`flex items-center gap-2 ${linkClass}`}>
          <svg viewBox="0 0 38 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={`scale-x-[-1] ${arrowClass}`}>
            <path d={arrowPath} stroke="currentColor" strokeWidth="1" />
          </svg>
          PREV
        </Link>
      ) : (
        <span className="flex items-center gap-2 md:text-base text-sm text-white/30  cursor-not-allowed">
          <svg viewBox="0 0 38 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={`scale-x-[-1] ${arrowClass}`}>
            <path d={arrowPath} stroke="currentColor" strokeWidth="1" />
          </svg>
          PREV
        </span>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) =>
        page === currentPage ? (
          <span key={page} className="text-white bg-(--color-accent) px-3 py-1 rounded-md md:text-base text-sm">
            {page}
          </span>
        ) : (
          <Link key={page} href={pageHref(basePath, page)} className={linkClass}>
            {page}
          </Link>
        )
      )}

      {hasNext ? (
        <Link href={pageHref(basePath, currentPage + 1)} className={`flex items-center gap-2 ${linkClass}`}>
          NEXT
          <svg viewBox="0 0 38 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={arrowClass}>
            <path d={arrowPath} stroke="currentColor" strokeWidth="1" />
          </svg>
        </Link>
      ) : (
        <span className="flex items-center gap-2 md:text-base text-sm text-white/30 cursor-not-allowed">
          NEXT
          <svg viewBox="0 0 38 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={arrowClass}>
            <path d={arrowPath} stroke="currentColor" strokeWidth="1" />
          </svg>
        </span>
      )}
    </div>
  );
}
