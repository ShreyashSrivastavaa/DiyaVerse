import React from "react";
import Link from "next/link";
import { ReportDialog } from "@/components/public/ReportDialog";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <ReportDialog diyaPublicId={id} onClose={() => {}} />
        <div className="text-center mt-4">
          <Link href={`/d/${id}`} className="text-xs text-flame-400 underline">
            ← Return to Diya
          </Link>
        </div>
      </div>
    </div>
  );
}
