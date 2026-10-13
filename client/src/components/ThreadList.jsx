import { useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersection } from "../hooks/useIntersection";
import { getThreads } from "../services/threads.service";
import ThreadItem from "./ThreadItem.jsx";

export default function ThreadList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery({
    queryKey: ["threads"],
    queryFn: ({ pageParam }) =>
      getThreads({ cursor: pageParam, take: 10 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor ?? undefined,
  });

  // Create a ref for the sentinel
  const sentinelRef = useRef(null);

  // Fetch the next page only when safe
  const onIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Observe the sentinel
  useIntersection(sentinelRef, onIntersect);

  if (isPending) {
    return <p>Loading…</p>;
  }

  if (isError) {
    return <p>Could not load threads.</p>;
  }

  // Combine all fetched pages into one array
  const threads = data.pages.flatMap((page) => page.threads);

  return (
    <div>
      <ul>
        {threads.map((thread) => (
          <ThreadItem key={thread.id} thread={thread} />
        ))}
      </ul>

      {/* Invisible sentinel replaces the Load More button */}
      <div ref={sentinelRef} />

      {/* Show loading message while fetching the next page */}
      {isFetchingNextPage && (
        <p className="loading-more">Loading more…</p>
      )}
    </div>
  );
}