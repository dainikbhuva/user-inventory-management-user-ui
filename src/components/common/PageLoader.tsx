export const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-muted">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-base border-t-primary" />
      <span className="text-sm">Loading page…</span>
    </div>
  </div>
);
