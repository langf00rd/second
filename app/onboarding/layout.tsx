export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-100">{children}</div>
    </div>
  );
}
