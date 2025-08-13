import Main from "./_components/Header/Main";

export default async function Layout({
  children,
}: { children: React.ReactNode }) {
 
  return (
    <div className="flex min-h-[100vh]  bg-slate-100 w-full flex-col ">
      <Main>
      {children}
      </Main>
    </div>
  );
}
