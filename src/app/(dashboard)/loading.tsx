import { PageLoader } from "@/components/ui/page-loader";

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh] w-full">
      <PageLoader message="Memuat data..." />
    </div>
  );
}
