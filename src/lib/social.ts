import type { ComponentType, SVGProps } from "react";
import {
  FaInstagram,
  FaTiktok,
  FaFacebookF,
  FaTelegramPlane,
  FaWhatsapp,
  FaRegEnvelope,
} from "react-icons/fa";
import { useContactSettings } from "@/lib/data";

export type SocialLink = {
  key: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const DEFAULT_CONTACTS = {
  instagram: "https://instagram.com/rahiqparfums",
  tiktok: "https://tiktok.com/@rahiqparfums",
  facebook: "https://facebook.com/rahiqparfums",
  telegram: "https://t.me/rahiqparfums",
  whatsapp: "https://wa.me/213000000000",
  email: "contact@rahiqparfums.dz",
};

export function useSocialLinks(): SocialLink[] {
  const { data } = useContactSettings();
  const c = data ?? DEFAULT_CONTACTS;

  return [
    { key: "contact.instagram", href: c.instagram, Icon: FaInstagram },
    { key: "contact.tiktok", href: c.tiktok, Icon: FaTiktok },
    { key: "contact.facebook", href: c.facebook, Icon: FaFacebookF },
    { key: "contact.telegram", href: c.telegram, Icon: FaTelegramPlane },
    { key: "contact.whatsapp", href: c.whatsapp, Icon: FaWhatsapp },
    {
      key: "contact.email",
      href: c.email.startsWith("http") ? c.email : `mailto:${c.email}`,
      Icon: FaRegEnvelope,
    },
  ].filter((link) => link.href);
}
