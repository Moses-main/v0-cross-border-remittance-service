import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transfer Funds',
  description: 'Send money to friends and family',
};

export default function TransferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
