// ============================================================
// Lankan Ads — Schema Markup Component (JSON-LD)
// ============================================================

interface SchemaMarkupProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any> | Record<string, any>[];
}

export default function SchemaMarkup({ data }: SchemaMarkupProps) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
