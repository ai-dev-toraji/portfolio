import SectionTitle from "@/components/ui/section-title";
import ProfileList from "./ProfileList";
import Image from "next/image";

export type ProfileGroup = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

type ProfileProps = {
  profileGroups: ProfileGroup[];
};

export default function Profile({ profileGroups }: ProfileProps) {
  return (
    <section className="bg-(--color-sub) py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <SectionTitle color="primary" as="h1">ABOUT</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 md:gap-16 items-start">
          {/* Image */}
          <div className="bg-[#C8C8C8]">
            <Image className="w-full h-full object-cover" src="/about/profile.png" alt="Profile" width={300} height={300} />
          </div>

          {/* Text Content */}
          <div>
            {profileGroups.map((group) => (
              <ProfileList key={group.title} title={group.title} className={group.className}>
                {group.children}
              </ProfileList>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
