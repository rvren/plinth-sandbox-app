export interface LinkProps {
  /** Null means the URL was judged unsafe upstream: the label renders as inert text. */
  href: string | null;
  text: string;
}

export const Link = ({ href, text }: LinkProps) =>
  href ? (
    <a href={href} style={{ color: "var(--color-accent)" }} rel="noopener noreferrer">
      {text}
    </a>
  ) : (
    <span style={{ color: "var(--color-text-muted)" }}>{text}</span>
  );
