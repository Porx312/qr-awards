import { SaasHeader } from "./_components/Header/Header";

export default async function Layout({
  children,
}: { children: React.ReactNode }) {
 
  return (
    <div className="flex min-h-[100vh] w-full flex-col bg-secondary dark:bg-black">
      <SaasHeader/>
      {children}
    </div>
  );
}
