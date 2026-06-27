export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-4 bg-meccha-dark">
      <div className="w-10 h-10 border-4 border-meccha-green/30 border-t-meccha-green rounded-full animate-spin" />
      {message && <p className="text-white/60 text-sm">{message}</p>}
    </div>
  );
}
