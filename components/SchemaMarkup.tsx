



interface SchemaMarkupProps {
  
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
              .replace(/</g, "\\u003c")
              .replace(/>/g, "\\u003e"),
          }}
        />
      ))}
    </>
  );
}
