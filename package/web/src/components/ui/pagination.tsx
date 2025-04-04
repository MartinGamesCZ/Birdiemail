import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  onPageChange?: (page: number) => void;
  className?: string;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  onPageChange,
  className = "",
  maxVisiblePages = 5,
}: PaginationProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePageChange = (page: number) => {
    if (onPageChange) onPageChange(page);
  };

  const getPageUrl = (page: number) => `${baseUrl}/${page}`;

  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages > 0) pageNumbers.push(1);

    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

    if (endPage < startPage + maxVisiblePages - 3) {
      startPage = Math.max(2, endPage - (maxVisiblePages - 3));
    }

    if (startPage > 2) pageNumbers.push("ellipsis-start");

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) pageNumbers.push("ellipsis-end");

    if (totalPages > 1) pageNumbers.push(totalPages);

    return pageNumbers;
  };

  const pageNumbers = totalPages > 1 ? getPageNumbers() : [];

  const PageButton = ({ page }: { page: number | string }) => {
    const isEllipsis = typeof page === "string";
    const isCurrentPage = page === currentPage;

    if (isEllipsis) return <span className="px-2 text-gray-500">...</span>;

    const numPage = page as number;

    return (
      <Button
        variant={isCurrentPage ? "default" : "outline"}
        size="sm"
        className={cn(
          "w-8 h-8 p-0 flex items-center justify-center",
          isCurrentPage
            ? "pointer-events-none bg-blue-600 hover:bg-blue-700 text-white"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
        onClick={onPageChange ? () => handlePageChange(numPage) : undefined}
      >
        {!onPageChange && !isCurrentPage ? (
          <Link
            className="w-full h-full flex items-center justify-center"
            href={getPageUrl(numPage)}
          >
            {numPage}
          </Link>
        ) : (
          numPage
        )}
      </Button>
    );
  };

  return (
    <div
      className={`flex items-center justify-between w-full gap-2 my-4 px-2 ${className}`}
    >
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 p-0"
        onClick={
          onPageChange ? () => handlePageChange(currentPage - 1) : undefined
        }
        disabled={!hasPrevious}
      >
        {!onPageChange && hasPrevious ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="flex items-center gap-1 w-full h-full px-2"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>Prev</span>
          </Link>
        ) : (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="flex items-center gap-1 w-full h-full px-2 opacity-70"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>Prev</span>
          </Link>
        )}
      </Button>

      <div className="flex items-center justify-center flex-1">
        {pageNumbers.length > 0 && (
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, i) => (
              <PageButton key={`${page}-${i}`} page={page} />
            ))}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 p-0"
        onClick={
          onPageChange ? () => handlePageChange(currentPage + 1) : undefined
        }
        disabled={!hasNext}
      >
        {!onPageChange && hasNext ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="flex items-center gap-1 w-full h-full px-2"
          >
            <span>Next</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="flex items-center gap-1 w-full h-full px-2 opacity-70"
          >
            <span>Next</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        )}
      </Button>
    </div>
  );
}
