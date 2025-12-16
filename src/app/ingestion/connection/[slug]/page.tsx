// app/ingestion/space/[slug]/page.tsx

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function SpaceDetailPage({ params }: Props) {
  const { slug } = await params; // 👈 ต้อง await ก่อนถึงจะใช้ได้

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-slate-100">
        Space: {slug}
      </h1>
      {/* ตรงนี้ค่อยต่อ logic fetch backend ตาม slug */}
    </div>
  );
}
