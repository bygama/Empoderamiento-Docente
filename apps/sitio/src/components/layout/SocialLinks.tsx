import { siteConfig } from "@/config/site";
import { Instagram, Linkedin, Facebook } from "@/components/ui/icons";

// Redes que el sitio puede mostrar. El href sale de siteConfig.redes; mientras
// no haya handle oficial cae a "#" (config: no inventar URLs).
// (Portado fiel del navbar de la rama `nuevo-frontend`, íconos de ED.)
const SOCIALS = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "facebook", label: "Facebook", Icon: Facebook },
] as const;

interface SocialLinksProps {
  readonly className?: string;
  readonly iconClassName?: string;
}

export function SocialLinks({ className, iconClassName }: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {SOCIALS.map(({ key, label, Icon }) => {
        const url = siteConfig.redes[key];
        return (
          <a
            key={key}
            href={url ?? "#"}
            aria-label={label}
            {...(url ? { target: "_blank", rel: "noreferrer noopener" } : {})}
            className={`text-azul-principal/65 hover:text-azul-medio transition-colors ${iconClassName ?? ""}`}
          >
            <Icon className="h-[1.125rem] w-[1.125rem]" />
          </a>
        );
      })}
    </div>
  );
}
