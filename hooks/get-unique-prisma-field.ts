export default function useGetUniquePrismaField({ text }: { text: string }) {
  const splitText = text.match(/\(`"?(\w+)"?`\)/);
  return splitText?.[1];
}
