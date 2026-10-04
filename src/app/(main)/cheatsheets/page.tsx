import type { Metadata } from 'next';
import Cheatsheets from '@/views/Cheatsheets';

export const metadata: Metadata = {
  title: 'CLI Cheatsheets | Useful Tools',
  description:
    'A visual command-line reference for GitHub CLI, Teamwork Graph CLI, and Git, with practical examples and official documentation.',
};

export default function CheatsheetsPage() {
  return <Cheatsheets />;
}
