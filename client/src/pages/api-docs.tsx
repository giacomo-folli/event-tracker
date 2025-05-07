import { Header } from "@/components/layout/Header";
import { ApiDocs } from "@/components/api/ApiDocs";

export default function ApiDocsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="API Documentation" />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
        <ApiDocs />
      </main>
    </div>
  );
}
