import Image from "next/image";
import { ActionButtons } from "./action-buttons";
import { Contributions } from "./contributions";
import { InlineLink } from "./inline-link";
import { Skills } from "./skills";
import { MusicGame } from "./music-game";

function CompanyLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-[5px] align-[-4px] font-serif text-[1.06em] font-medium tracking-tight text-foreground underline decoration-muted/50 underline-offset-[3px] transition-colors hover:decoration-foreground"
    >
      <Image
        src={icon}
        alt=""
        width={18}
        height={18}
        unoptimized
        className="size-[18px] rounded-[4px] object-contain"
      />
      {children}
    </a>
  );
}

const SOCIALS = [
  {
    name: "Instagram",
    icon: "/socials/instagram.svg",
    href: "https://www.instagram.com/s00laimang",
  },
  { name: "X", icon: "/socials/x.svg", href: "https://x.com/s00laimang" },
  {
    name: "Snapchat",
    icon: "/socials/snapchat.svg",
    href: "https://snapchat.com/t/e3byzu7q",
  },
];

function SocialLinks() {
  return (
    <div className="ml-auto flex items-center gap-4 self-start">
      {SOCIALS.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.name}
          className="text-muted transition-colors hover:text-foreground"
        >
          <span
            className="block size-[18px] bg-current"
            style={{
              mask: `url(${social.icon}) center / contain no-repeat`,
              WebkitMask: `url(${social.icon}) center / contain no-repeat`,
            }}
          />
        </a>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <section className="w-full max-w-xl">
        <header className="flex items-center gap-4">
          <Image
            src="/profile.jpg"
            alt="Portrait of Soolaiman"
            width={56}
            height={56}
            priority
            className="size-14 rounded-md object-cover"
          />
          <div>
            <h1 className="flex items-center gap-1.5 font-serif text-xl leading-tight tracking-tight">
              s00laimang
              <svg
                aria-label="Verified"
                viewBox="0 0 24 24"
                className="size-[18px] fill-sky-500"
              >
                <path d="M12 1.5l2.7 2.06 3.38-.44 1.32 3.15 3.1 1.4-.6 3.36L24 13.5l-2.1 2.47.6 3.36-3.1 1.4-1.32 3.15-3.38-.44L12 25.5l-2.7-2.06-3.38.44-1.32-3.15-3.1-1.4.6-3.36L0 13.5l2.1-2.47-.6-3.36 3.1-1.4L5.92 3.12l3.38.44L12 1.5z" transform="scale(1 .92)" />
                <path
                  d="M10.6 16.2l-3.1-3.1 1.4-1.4 1.7 1.7 4.5-4.5 1.4 1.4-5.9 5.9z"
                  className="fill-background"
                />
              </svg>
            </h1>
            <p className="text-[15px] text-muted">Full-stack Software Engineer</p>
          </div>
          <SocialLinks />
        </header>

        <div className="mt-8 space-y-6 text-[17px] leading-[1.85] text-muted">
          <p>
            I&apos;m a full-stack engineer. Right now I&apos;m building{" "}
            <CompanyLink href="https://askoga.vercel.app" icon="/logos/askoga.png">
              askOga
            </CompanyLink>
            , an AI director that tells you what to post today. It writes the
            script, the shots and the caption. You just hit record. Before
            that I was a frontend developer at{" "}
            <CompanyLink href="https://payfrica.xyz" icon="/logos/payfrica.png">
              Payfrica
            </CompanyLink>
            , an app for sending money across Africa.
          </p>
          <p>
            I created{" "}
            <CompanyLink href="https://kinta-sme.com" icon="/logos/kintasme.ico">
              Kinta SME
            </CompanyLink>
            , where thousands of people buy data and airtime, and{" "}
            <CompanyLink href="https://resellos.site" icon="/logos/resellos.svg">
              Resellos
            </CompanyLink>
            , which lets anyone spin up their own VTU website.{" "}
            I&apos;m also co-founding{" "}
            <CompanyLink href="https://loota.site" icon="/logos/loota.png">
              Loota
            </CompanyLink>
            , a WhatsApp marketplace that finds what you need from sellers
            near you and holds the money in escrow until the deal is done.
          </p>
          <p>
            I live in{" "}
            <span className="font-medium text-foreground">
              Nigeria{" "}
              <svg
                aria-label="Nigerian flag"
                viewBox="0 0 24 16"
                className="inline-block h-[13px] w-[20px] rounded-[3px] align-[-1px]"
              >
                <rect width="8" height="16" fill="#008751" />
                <rect x="8" width="8" height="16" fill="#f5f3ef" />
                <rect x="16" width="8" height="16" fill="#008751" />
              </svg>
            </span>
            . These days I&apos;m at{" "}
            <CompanyLink href="https://voultron.fun" icon="/logos/voultron.svg">
              Voultron
            </CompanyLink>
            , working on a play-and-earn blockchain gaming platform. If you
            want to talk,{" "}
            <InlineLink
              href="mailto:s00laimang@icloud.com"
              tooltip="s00laimang@icloud.com"
            >
              email me
            </InlineLink>
            , or see my code on{" "}
            <InlineLink href="https://github.com/SoolaimanG" tooltip="@SoolaimanG">
              GitHub
            </InlineLink>
            .
          </p>
        </div>

        <ActionButtons />

        <Contributions />

        <Skills />

        <MusicGame />
      </section>
    </main>
  );
}
