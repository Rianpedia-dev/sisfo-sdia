import { PageLoader } from "@/components/ui/page-loader";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <PageLoader fullScreen message="Menyiapkan akses..." />
    </div>
  );
}
