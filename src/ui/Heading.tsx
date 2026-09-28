export interface HeadingProps {
  level?: 1 | 2 | 3 | 4;
  text: string;
}

const SIZES = { 1: 22, 2: 18, 3: 15, 4: 13 } as const;

export const Heading = ({ level = 3, text }: HeadingProps) => {
  const Tag = `h${level}` as const;
  return <Tag style={{ margin: 0, fontSize: SIZES[level] }}>{text}</Tag>;
};
