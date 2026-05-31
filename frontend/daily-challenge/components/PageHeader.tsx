interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-10">
      <h2 className="font-serif text-4xl font-semibold tracking-tight text-[#1a1a1a]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-neutral-500">
          {description}
        </p>
      )}
    </header>
  );
}
