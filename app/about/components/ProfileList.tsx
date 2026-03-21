type ProfileListProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function ProfileList({ title, children, className }: ProfileListProps) {
  return (
    <div className={className}>
      <h2 className="text-(--color-accent) text-3xl font-bold tracking-wide mb-5">
        {title}
      </h2>
      <div className="text-(--color-text)/80 text-sm leading-loose">
        {children}
      </div>
    </div>
  );
}
